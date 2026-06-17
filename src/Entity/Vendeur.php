<?php

namespace App\Entity;

use App\Enum\VendeurStatus;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Vendeur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'vendeur')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 150)]
    private ?string $nomBoutique = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $logo = null;

    #[ORM\Column(enumType: VendeurStatus::class)]
    private VendeurStatus $statut = VendeurStatus::EnAttente;

    #[ORM\OneToMany(mappedBy: 'vendeur', targetEntity: Product::class)]
    private Collection $products;

    public function __construct()
    {
        $this->products = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getNomBoutique(): ?string { return $this->nomBoutique; }
    public function setNomBoutique(string $nomBoutique): static { $this->nomBoutique = $nomBoutique; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function getLogo(): ?string { return $this->logo; }
    public function setLogo(?string $logo): static { $this->logo = $logo; return $this; }

    public function getStatut(): VendeurStatus { return $this->statut; }
    public function setStatut(VendeurStatus $statut): static { $this->statut = $statut; return $this; }

    /** @return Collection<int, Product> */
    public function getProducts(): Collection { return $this->products; }
}
