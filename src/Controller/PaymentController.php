<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PaymentController extends AbstractController
{
    #[Route('/paiement/wave', name: 'payment_wave', methods: ['GET'])]
    public function wave(): Response
    {
        return $this->unavailable('Wave');
    }

    #[Route('/paiement/orange-money', name: 'payment_orange_money', methods: ['GET'])]
    public function orangeMoney(): Response
    {
        return $this->unavailable('Orange Money');
    }

    #[Route('/paiement/carte-bancaire', name: 'payment_card', methods: ['GET'])]
    public function card(): Response
    {
        return $this->unavailable('Carte bancaire');
    }

    private function unavailable(string $paymentName): Response
    {
        return $this->render('payment/redirect.html.twig', [
            'orderId' => null,
            'paymentName' => $paymentName,
            'message' => 'Ce mode de paiement sera bientot disponible.',
        ], new Response('', Response::HTTP_SERVICE_UNAVAILABLE));
    }
}
