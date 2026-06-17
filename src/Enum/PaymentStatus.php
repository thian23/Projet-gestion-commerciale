<?php

namespace App\Enum;

enum PaymentStatus: string
{
    case EnAttente = 'en_attente';
    case Paye = 'paye';
    case Echoue = 'echoue';
}
