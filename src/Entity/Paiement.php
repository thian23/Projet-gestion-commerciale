<?php

namespace App\Entity;

use App\Enum\PaymentMethod;
use App\Enum\PaymentStatus;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Paiement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'paiement')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Orders $commande = null;

    #[ORM\Column]
    private ?float $montant = null;

    #[ORM\Column(length: 50, enumType: PaymentMethod::class)]
    private PaymentMethod $moyenPaiement = PaymentMethod::CashOnDelivery;

    #[ORM\Column(enumType: PaymentStatus::class)]
    private PaymentStatus $statut = PaymentStatus::EnAttente;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $datePaiement = null;

    #[ORM\Column(length: 120, nullable: true)]
    private ?string $identifiantTransaction = null;

    public function getId(): ?int { return $this->id; }

    public function getCommande(): ?Orders { return $this->commande; }
    public function setCommande(?Orders $commande): static { $this->commande = $commande; return $this; }

    public function getMontant(): ?float { return $this->montant; }
    public function setMontant(float $montant): static { $this->montant = $montant; return $this; }

    public function getMoyenPaiement(): PaymentMethod { return $this->moyenPaiement; }
    public function setMoyenPaiement(PaymentMethod $moyenPaiement): static { $this->moyenPaiement = $moyenPaiement; return $this; }

    public function getStatut(): PaymentStatus { return $this->statut; }
    public function setStatut(PaymentStatus $statut): static { $this->statut = $statut; return $this; }

    public function getDatePaiement(): ?\DateTimeImmutable { return $this->datePaiement; }
    public function setDatePaiement(?\DateTimeImmutable $datePaiement): static { $this->datePaiement = $datePaiement; return $this; }

    public function getIdentifiantTransaction(): ?string { return $this->identifiantTransaction; }
    public function setIdentifiantTransaction(?string $identifiantTransaction): static { $this->identifiantTransaction = $identifiantTransaction; return $this; }
}
