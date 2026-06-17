<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\OrderItem;
use App\Entity\Orders;
use App\Entity\Paiement;
use App\Entity\Product;
use App\Entity\ProductLot;
use App\Entity\User;
use App\Entity\Vendeur;
use App\Enum\OrderStatus;
use App\Enum\PaymentMethod;
use App\Enum\PaymentStatus;
use App\Enum\VendeurStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private const PRODUCT_IMAGES = [
        '6a0aeedf48fb8.jpg',
        '6a01e50c5186e.jpg',
        '6a01d9a47f607.jpg',
        '6a01d498ea693.jpg',
        '6a01d15a635e4.png',
        '6a01cd449c120.png',
    ];

    public function __construct(
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        $admin = (new User())
            ->setEmail('admin@senbazar.sn')
            ->setNom('Diop')
            ->setPrenom('Aminata')
            ->setRoles(['ROLE_ADMIN'])
            ->setTelephone('771234567')
            ->setAdresse('Dakar');
        $admin->setPassword($this->hasher->hashPassword($admin, 'admin1234'));
        $manager->persist($admin);

        $clients = [];
        foreach ([
            ['client1@senbazar.sn', 'Fall', 'Moussa', '780001001', 'Dakar'],
            ['client2@senbazar.sn', 'Ndiaye', 'Fatou', '780001002', 'Dakar'],
            ['client3@senbazar.sn', 'Sarr', 'Ibrahima', '780001003', 'Dakar'],
            ['client4@senbazar.sn', 'Ba', 'Marieme', '780001004', 'Dakar'],
            ['client5@senbazar.sn', 'Gueye', 'Cheikh', '780001005', 'Dakar'],
        ] as [$email, $nom, $prenom, $telephone, $adresse]) {
            $client = (new User())
                ->setEmail($email)
                ->setNom($nom)
                ->setPrenom($prenom)
                ->setRoles(['ROLE_USER'])
                ->setTelephone($telephone)
                ->setAdresse($adresse);
            $client->setPassword($this->hasher->hashPassword($client, 'client123'));

            $manager->persist($client);
            $clients[] = $client;
        }

        $vendeurs = [];
        foreach ([
            ['vendeur1@senbazar.sn', 'Kane', 'Oumar', '780002001', 'Dakar Fashion Store'],
            ['vendeur2@senbazar.sn', 'Sy', 'Awa', '780002002', 'Tech House Senegal'],
            ['vendeur3@senbazar.sn', 'Faye', 'Mamadou', '780002003', 'Fit Market Dakar'],
            ['vendeur4@senbazar.sn', 'Diallo', 'Astou', '780002004', 'Maison & Beaute SN'],
        ] as [$email, $nom, $prenom, $telephone, $boutique]) {
            $user = (new User())
                ->setEmail($email)
                ->setNom($nom)
                ->setPrenom($prenom)
                ->setRoles(['ROLE_USER', 'ROLE_VENDEUR'])
                ->setTelephone($telephone)
                ->setAdresse('Dakar');
            $user->setPassword($this->hasher->hashPassword($user, 'vendeur123'));

            $vendeur = (new Vendeur())
                ->setUser($user)
                ->setNomBoutique($boutique)
                ->setDescription('Boutique partenaire SenBazar proposant des produits fiables avec livraison au Senegal.')
                ->setLogo($this->pick(self::PRODUCT_IMAGES))
                ->setStatut(VendeurStatus::Valide);

            $user->setVendeur($vendeur);
            $manager->persist($user);
            $manager->persist($vendeur);
            $vendeurs[] = $vendeur;
        }

        $categoryData = [
            ['Vetements', 'Tenues homme, femme et enfant adaptees au quotidien.', '6a0aeedf48fb8.jpg'],
            ['Chaussures', 'Sneakers, sandales, chaussures de ville et sport.', '6a01e50c5186e.jpg'],
            ['Accessoires de mode', 'Sacs, montres, lunettes, bijoux et articles tendance.', '6a01d9a47f607.jpg'],
            ['Beaute', 'Parfums, soins, maquillage et produits capillaires.', '6a01d498ea693.jpg'],
            ['Informatique', 'Ordinateurs, claviers, souris, imprimantes et accessoires.', '6a01d15a635e4.png'],
            ['Maison', 'Equipements, decoration et accessoires utiles pour la maison.', '6a01cd449c120.png'],
            ['Electronique', 'Telephones, ecouteurs, chargeurs, enceintes et gadgets.', '6a0aeedf48fb8.jpg'],
            ['Sport et Fitness', 'Gants, haltères, accessoires de musculation et fitness.', '6a01e50c5186e.jpg'],
            ['Complements alimentaires', 'Proteines, creatine, vitamines et nutrition sportive.', '6a01d9a47f607.jpg'],
        ];

        $categories = [];
        foreach ($categoryData as [$nom, $description, $image]) {
            $category = (new Category())
                ->setNom($nom)
                ->setDescription($description)
                ->setImage($image);

            $manager->persist($category);
            $categories[$nom] = $category;
        }

        $products = [];
        foreach ($categories as $categoryName => $category) {
            foreach ($this->productsForCategory($categoryName) as $index => $productData) {
                [$title, $price] = $productData;

                $product = (new Product())
                    ->setTitre($title)
                    ->setDescription($this->buildDescription($categoryName))
                    ->setPrix((float) $price)
                    ->setStock(random_int(8, 90))
                    ->setImage($this->pick(self::PRODUCT_IMAGES))
                    ->setCategory($category)
                    ->setVendeur($this->pick($vendeurs))
                    ->setNouveaute($index < 2)
                    ->setPhares($index % 3 === 0)
                    ->setPromotion($index % 4 === 0)
                    ->setBestSeller($index === 0)
                    ->setNoteMoyenne(random_int(36, 50) / 10)
                    ->setCreatedAt(new \DateTimeImmutable(sprintf('-%d days', random_int(1, 45))));

                foreach ([2, 4, 6] as $quantity) {
                    $lot = (new ProductLot())
                        ->setNom('Pack de ' . $quantity)
                        ->setQuantite($quantity)
                        ->setPrix((float) $price * $quantity * (1 - ($quantity / 100)));
                    $product->addLot($lot);
                }

                $manager->persist($product);
                $products[] = $product;
            }
        }

        foreach (range(1, 15) as $index) {
            $client = $this->pick($clients);
            $paymentMethod = $this->pick([
                PaymentMethod::CashOnDelivery,
                PaymentMethod::Wave,
                PaymentMethod::OrangeMoney,
                PaymentMethod::Card,
            ]);

            $order = (new Orders())
                ->setUser($client)
                ->setCreatedAt(new \DateTimeImmutable(sprintf('-%d days', random_int(0, 30))))
                ->setStatus($this->pick(OrderStatus::cases()))
                ->setPaymentMethod($paymentMethod)
                ->setGuestName($client->getPrenom() . ' ' . $client->getNom())
                ->setGuestPhone($client->getTelephone())
                ->setGuestAddress($client->getAdresse())
                ->setTrackingNumber(sprintf('SBZ-%s-%03d', date('Ymd'), $index));

            $total = 0.0;
            foreach ($this->pickMany($products, random_int(1, 4)) as $product) {
                $quantity = random_int(1, 3);
                $item = (new OrderItem())
                    ->setOrder($order)
                    ->setProduct($product)
                    ->setQuantity($quantity)
                    ->setPrice($product->getPrix())
                    ->setProductName($product->getTitre());

                $total += $item->getPrice() * $item->getQuantity();
                $manager->persist($item);
            }

            $order->setTotal($total);

            $paymentStatus = $order->getStatus() === OrderStatus::Annulee
                ? PaymentStatus::Echoue
                : ($order->getStatus() === OrderStatus::En_Attente ? PaymentStatus::EnAttente : PaymentStatus::Paye);

            $paiement = (new Paiement())
                ->setCommande($order)
                ->setMontant($total)
                ->setMoyenPaiement($paymentMethod)
                ->setStatut($paymentStatus)
                ->setDatePaiement($paymentStatus === PaymentStatus::Paye ? new \DateTimeImmutable() : null)
                ->setIdentifiantTransaction($paymentStatus === PaymentStatus::Paye ? 'SBZ-' . strtoupper(bin2hex(random_bytes(4))) : null);

            $order->setPaiement($paiement);
            $manager->persist($order);
            $manager->persist($paiement);
        }

        $manager->flush();
    }

    /**
     * @return array<int, array{0: string, 1: int}>
     */
    private function productsForCategory(string $categoryName): array
    {
        return match ($categoryName) {
            'Vetements' => [
                ['T-shirt coton premium', 7500],
                ['Robe longue elegante', 18500],
                ['Jean slim homme', 15000],
                ['Chemise bazin moderne', 22000],
                ['Ensemble enfant casual', 12000],
                ['Veste legere urbaine', 25000],
            ],
            'Chaussures' => [
                ['Sneakers blanches confort', 28000],
                ['Sandales cuir femme', 16000],
                ['Chaussures ville homme', 32000],
                ['Baskets sport running', 35000],
                ['Mules maison antiderapantes', 8500],
                ['Chaussures enfant solides', 14500],
            ],
            'Accessoires de mode' => [
                ['Montre acier elegante', 21000],
                ['Sac a main compact', 24000],
                ['Lunettes soleil UV', 9500],
                ['Ceinture cuir noire', 8500],
                ['Bracelet fashion', 6000],
                ['Portefeuille minimaliste', 7000],
            ],
            'Beaute' => [
                ['Parfum homme intense', 18000],
                ['Parfum femme floral', 19000],
                ['Kit soin visage', 15500],
                ['Huile capillaire nourrissante', 6500],
                ['Palette maquillage', 12500],
                ['Creme hydratante corps', 8000],
            ],
            'Informatique' => [
                ['Ordinateur portable bureautique', 295000],
                ['Clavier sans fil', 14500],
                ['Souris ergonomique', 8500],
                ['Disque SSD 512 Go', 38000],
                ['Imprimante multifonction', 85000],
                ['Sacoche ordinateur 15 pouces', 13500],
            ],
            'Maison' => [
                ['Mixeur electrique 2L', 28000],
                ['Set casseroles inox', 36000],
                ['Lampe de chevet moderne', 12000],
                ['Tapis salon doux', 45000],
                ['Organisateur cuisine', 9500],
                ['Ventilateur silencieux', 30000],
            ],
            'Electronique' => [
                ['Smartphone 128 Go', 135000],
                ['Ecouteurs Bluetooth', 18000],
                ['Power bank 20000 mAh', 16000],
                ['Chargeur rapide USB-C', 7500],
                ['Enceinte portable', 22000],
                ['Montre connectee sport', 28000],
            ],
            'Sport et Fitness' => [
                ['Gants de musculation', 9000],
                ['Tapis yoga antiderapant', 14000],
                ['Corde a sauter pro', 6500],
                ['Halteres reglables', 42000],
                ['Ceinture lombaire sport', 12500],
                ['Shaker fitness 700 ml', 5000],
            ],
            'Complements alimentaires' => [
                ['Proteine whey chocolat 1 kg', 32000],
                ['Creatine monohydrate 300 g', 18000],
                ['BCAA fruits rouges', 21000],
                ['Multivitamines sport', 14500],
                ['Omega 3 premium', 13000],
                ['Pre-workout energie', 24000],
            ],
            default => [
                [$categoryName . ' produit standard', 10000],
            ],
        };
    }

    /**
     * @template T
     * @param array<int, T> $items
     * @return T
     */
    private function pick(array $items): mixed
    {
        return $items[array_rand($items)];
    }

    /**
     * @template T
     * @param array<int, T> $items
     * @return array<int, T>
     */
    private function pickMany(array $items, int $count): array
    {
        $keys = (array) array_rand($items, min($count, count($items)));

        return array_map(fn (int $key): mixed => $items[$key], $keys);
    }

    private function buildDescription(string $categoryName): string
    {
        return match ($categoryName) {
            'Complements alimentaires' => 'Produit de nutrition sportive pour accompagner les entrainements et la recuperation.',
            'Sport et Fitness' => 'Article pratique pour le sport, la musculation, le fitness et les seances a domicile.',
            'Informatique', 'Electronique' => 'Produit technologique fiable, selectionne pour le travail, les loisirs et le quotidien.',
            'Maison' => 'Equipement utile pour ameliorer le confort, l organisation et la decoration de la maison.',
            'Beaute' => 'Produit de soin et de beaute adapte aux besoins du quotidien.',
            default => 'Produit disponible sur SenBazar avec un bon rapport qualite-prix et livraison au Senegal.',
        };
    }
}

