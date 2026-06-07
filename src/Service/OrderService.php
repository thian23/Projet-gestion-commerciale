<?php

namespace App\Service;

use App\Entity\OrderItem;
use App\Entity\Orders;
use App\Entity\Product;
use App\Entity\User;
use App\Enum\OrderStatus;
use App\Enum\PaymentMethod;
use App\Repository\CartRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class OrderService
{
    private const SHIPPING_COST = 2000;
    private const MAX_ITEMS_PER_ORDER = 50;
    private const MAX_QUANTITY_PER_ITEM = 100;

    public function __construct(
        private EntityManagerInterface $em,
        private CartRepository $cartRepo,
        private RequestStack $requestStack
    ) {}

    private function getUser(): ?User
    {
        $session = $this->requestStack->getSession();
        $userId = $session->get('user_id');

        if (!$userId) {
            return null;
        }

        return $this->em->getRepository(User::class)->find($userId);
    }

    public function checkout(?User $user, array $items, PaymentMethod $payment = PaymentMethod::CashOnDelivery, ?array $guestData = null): Orders
    {
        $this->assertCheckoutData($user, $items, $guestData);

        return $this->em->wrapInTransaction(function () use ($user, $items, $payment, $guestData): Orders {
            $order = new Orders();
            $order->setUser($user);

            if ($user === null && $guestData) {
                $order->setGuestName($this->cleanText($guestData['name'] ?? null, 100));
                $order->setGuestPhone($this->cleanText($guestData['phone'] ?? null, 30));
                $order->setGuestAddress($this->cleanText($guestData['address'] ?? null, 255));
            }

            $order->setCreatedAt(new \DateTimeImmutable());
            $order->setStatus(OrderStatus::En_Attente);
            $order->setPaymentMethod($payment);

            $subtotal = 0.0;

            foreach ($items as $itemData) {
                if (!is_array($itemData)) {
                    throw new \InvalidArgumentException('Produit invalide.');
                }

                $productId = filter_var($itemData['id'] ?? null, FILTER_VALIDATE_INT);

                if (!$productId) {
                    throw new \InvalidArgumentException('Produit invalide.');
                }

                $product = $this->em->getRepository(Product::class)->find($productId);

                if (!$product) {
                    throw new \InvalidArgumentException('Produit introuvable.');
                }

                $qty = filter_var($itemData['qty'] ?? 1, FILTER_VALIDATE_INT);
                $qty = max(1, min((int) $qty, self::MAX_QUANTITY_PER_ITEM));

                if ($product->getStock() < $qty) {
                    throw new \InvalidArgumentException('Stock insuffisant pour ' . $product->getTitre() . '.');
                }

                $product->setStock($product->getStock() - $qty);

                $item = new OrderItem();
                $item->setOrder($order);
                $item->setProductName($product->getTitre());
                $item->setProduct($product);
                $item->setQuantity($qty);

                $unitPrice = $this->getUnitPrice($product, $qty);
                $item->setPrice($unitPrice);
                $subtotal += $unitPrice * $qty;

                $this->em->persist($item);
            }

            $order->setTotal($subtotal + self::SHIPPING_COST);

            $this->em->persist($order);
            $this->em->flush();

            return $order;
        });
    }

    public function cancelOrder(Orders $order): void
    {
        if ($order->getStatus() === OrderStatus::Annuler) {
            throw new \InvalidArgumentException('Commande deja annulee.');
        }

        foreach ($order->getItems() as $item) {
            $product = $item->getProduct();

            if ($product) {
                $product->setStock($product->getStock() + $item->getQuantity());
            }
        }

        $order->setStatus(OrderStatus::Annuler);

        $this->em->flush();
    }

    private function getUnitPrice(Product $product, int $qty): float
    {
        $bestPrice = $product->getPrix();

        foreach ($product->getLots() as $lot) {
            if ($qty >= $lot->getQuantite()) {
                $bestPrice = $lot->getPrix();
            }
        }

        return $bestPrice;
    }

    private function assertCheckoutData(?User $user, array $items, ?array $guestData): void
    {
        if ($items === [] || count($items) > self::MAX_ITEMS_PER_ORDER) {
            throw new \InvalidArgumentException('Votre panier est invalide.');
        }

        if ($user !== null) {
            return;
        }

        $name = $this->cleanText($guestData['name'] ?? null, 100);
        $phone = $this->cleanText($guestData['phone'] ?? null, 30);
        $address = $this->cleanText($guestData['address'] ?? null, 255);

        if ($name === '' || $phone === '' || $address === '') {
            throw new \InvalidArgumentException('Nom, telephone et adresse sont obligatoires.');
        }

        if (!preg_match('/^[0-9 +().-]{7,30}$/', $phone)) {
            throw new \InvalidArgumentException('Numero de telephone invalide.');
        }
    }

    private function cleanText(mixed $value, int $maxLength): string
    {
        $value = trim((string) $value);
        $value = preg_replace('/\s+/', ' ', $value) ?? '';

        return substr($value, 0, $maxLength);
    }
}
