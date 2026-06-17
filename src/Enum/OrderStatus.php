<?php

namespace App\Enum;

enum OrderStatus: string
{
    case En_Attente = 'en_attente';
    case Payee = 'payee';
    case Expediee = 'expediee';
    case Livree = 'livree';
    case Annulee = 'annulee';
}
