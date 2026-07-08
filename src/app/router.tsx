import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./root-layout";
import { HomePage } from "@/pages/HomePage";
import { CataloguePage } from "@/pages/CataloguePage";
import { ProductPage, ProductNotFound, productLoader } from "@/pages/ProductPage";
import { PanierPage } from "@/pages/PanierPage";
import { ValidationPage } from "@/pages/ValidationPage";
import { PaiementPage } from "@/pages/PaiementPage";
import { ComptePage } from "@/pages/ComptePage";
import { VendeurPage } from "@/pages/VendeurPage";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import { NotFoundPage, RouteErrorPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalogue", element: <CataloguePage /> },
      { path: "produit/:id", element: <ProductPage />, loader: productLoader, errorElement: <ProductNotFound /> },
      { path: "panier", element: <PanierPage /> },
      { path: "validation", element: <ValidationPage /> },
      { path: "paiement", element: <PaiementPage /> },
      { path: "compte", element: <ComptePage /> },
      { path: "vendeur", element: <VendeurPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "connexion", element: <AuthPage mode="login" /> },
      { path: "inscription", element: <AuthPage mode="register" /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
