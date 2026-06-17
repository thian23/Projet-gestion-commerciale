<?php

namespace App\Controller;

use App\Repository\CategoryRepository;
use App\Repository\ProductRepository;
use App\Service\AuthService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(
        CategoryRepository $categoryRepository,
        ProductRepository $productRepository,
        AuthService $authService
    ): Response {
        $categories = $categoryRepository->findAll();
        $lastProducts = $productRepository->findBy([], ['id' => 'DESC'], 3);
        $featuredProducts = $productRepository->findBy(['phares' => true], ['id' => 'DESC'], 6);
        $promoProducts = $productRepository->findBy(['promotion' => true], ['id' => 'DESC']);

        $homeProducts = $productRepository->findProductsByCategoryName('Maison');
        $techProducts = $productRepository->findProductsByCategoryName('Electronique');
        $sportProducts = $productRepository->findProductsByCategoryName('Sport et Fitness');

        return $this->render('index.html.twig', [
            'categories' => $categories,
            'lastProducts' => $lastProducts,
            'featuredProducts' => $featuredProducts,
            'homeProducts' => $homeProducts,
            'techProducts' => $techProducts,
            'sportProducts' => $sportProducts,
            'promoProducts' => $promoProducts,
        ]);
    }

    #[Route('/contact', name: 'app_contact')]
    public function contact(): Response
    {
        return $this->render('contact.html.twig');
    }
}
