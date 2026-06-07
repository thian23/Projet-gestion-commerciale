<?php

namespace App\Service;

use App\Entity\Orders;
use App\Enum\PaymentMethod;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class PaymentService
{
    public function process(Orders $order, PaymentMethod $method): array
    {
        if (!$method->isAvailable()) {
            throw new BadRequestHttpException(sprintf(
                'Le paiement %s sera disponible bientot.',
                $method->label()
            ));
        }

        return match ($method) {

            PaymentMethod::CashOnDelivery => [
                'success' => true,
                'orderId' => $order->getId(),
                'payment' => PaymentMethod::CashOnDelivery->value,
            ],
        };
    }
}
