<?php

namespace App\Enum;

enum VendeurStatus: string
{
    case EnAttente = 'en_attente';
    case Valide = 'valide';
    case Bloque = 'bloque';
}
