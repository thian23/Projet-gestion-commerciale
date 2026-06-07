<?php

namespace App\Controller;

use App\Entity\Orders;
use App\Entity\User;
use App\Enum\OrderStatus;
use App\Enum\PaymentMethod;
use App\Repository\OrdersRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use App\Service\OrderService;
use App\Service\PaymentService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/commande')]
class OrderController extends AbstractController
{
    public function __construct(
        private OrderService $orderService,
        private PaymentService $paymentService,
        private LoggerInterface $logger
    ) {}

    #[Route('/checkout', name: 'checkout_page', methods: ['GET'])]
    public function checkoutPage(): Response
    {
        return $this->render('checkout.html.twig');
    }

    #[Route('/checkout', methods: ['POST'])]
    public function checkout(Request $request): JsonResponse
    {
        if (!$this->isCsrfTokenValid('checkout', (string) $request->headers->get('X-CSRF-Token'))) {
            return $this->json(['success' => false, 'message' => 'Session expiree. Rechargez la page.'], Response::HTTP_FORBIDDEN);
        }

        try {
            $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            $payment = PaymentMethod::tryFrom((string) ($data['payment'] ?? '')) ?? PaymentMethod::CashOnDelivery;
            $items = isset($data['items']) && is_array($data['items']) ? $data['items'] : [];
            $guestData = isset($data['user']) && is_array($data['user']) ? $data['user'] : null;

            if (!$payment->isAvailable()) {
                return $this->json([
                    'success' => false,
                    'message' => 'Ce mode de paiement sera bientot disponible.',
                ], Response::HTTP_BAD_REQUEST);
            }

            $order = $this->orderService->checkout(
                $this->currentUser(),
                $items,
                $payment,
                $guestData
            );

            return $this->json($this->paymentService->process($order, $payment));
        } catch (\JsonException) {
            return $this->json(['success' => false, 'message' => 'Requete invalide.'], Response::HTTP_BAD_REQUEST);
        } catch (\InvalidArgumentException $exception) {
            return $this->json(['success' => false, 'message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (\Throwable $exception) {
            $this->logger->error('Checkout failed', [
                'exception' => $exception,
                'user_id' => $this->getUser()?->getUserIdentifier(),
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Impossible de valider la commande pour le moment.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/my', methods: ['GET'])]
    public function myOrders(OrdersRepository $repo): JsonResponse
    {
        return $this->json($repo->findByUserWithItems($this->currentUser()));
    }

    #[Route('/my/{id}', name: 'me', methods: ['GET'])]
    public function myOrderDetail(OrdersRepository $repo, int $id): JsonResponse
    {
        $user = $this->currentUser();
        $order = $repo->find($id);

        if (!$order || $order->getUser() !== $user) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        return $this->json($order);
    }

    #[Route('/admin', methods: ['GET'])]
    public function allOrders(OrdersRepository $repo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        return $this->json($repo->findAll());
    }

    #[Route('/admin/{id}/cancel', methods: ['POST'])]
    public function cancel(Orders $order, OrderService $service): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $service->cancelOrder($order);

        return $this->json(['message' => 'order cancelled']);
    }

    #[Route('/admin/{id}/status', name: 'admin_order_status', methods: ['POST', 'PATCH'])]
    public function changeStatus(Orders $order, Request $request, EntityManagerInterface $em): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $status = $request->request->get('status');
        $orderStatus = is_string($status) ? OrderStatus::tryFrom($status) : null;

        if (!$orderStatus) {
            throw $this->createNotFoundException('Status invalide.');
        }

        $order->setStatus($orderStatus);
        $em->flush();

        return $this->redirectToRoute('admin_dashboard');
    }

    #[Route('/api/admin/dashboard', methods: ['GET'])]
    public function dashboard(
        OrdersRepository $ordersRepo,
        UserRepository $userRepo,
        ProductRepository $productRepo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        return $this->json([
            'total_users' => $userRepo->countUsers(),
            'total_orders' => $ordersRepo->countOrders(),
            'total_sales' => $ordersRepo->totalSales(),
            'best_sellers' => $productRepo->bestSellingProducts(),
        ]);
    }

    private function currentUser(): ?User
    {
        $user = $this->getUser();

        return $user instanceof User ? $user : null;
    }
}
