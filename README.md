# Backend e-commerce

API REST Spring Boot 4 / Java 17 / JPA / MySQL. Le projet est organisé par couches :

```text
uvs.ecommerce
├── config              CORS et beans techniques
├── controller          endpoints REST et contrôleur CRUD générique
├── dto
│   ├── request         payloads entrants et validations
│   └── response        objets JSON retournés au front
├── entity              entités JPA
├── enums               rôles et statuts
├── exception           erreurs métier et réponses JSON uniformes
├── repository          accès MySQL via Spring Data JPA
└── service
    ├── interfaces      contrats métier injectés dans les contrôleurs
    └── impl            implémentations métier et CRUD générique
```

## Démarrage

```bash
docker compose up -d
mvn spring-boot:run
```

Copiez le fichier .env.example vers .env et adaptez les valeurs si nécessaire.
Spring charge ce fichier en local et Docker Compose réutilise les mêmes variables.

L'API écoute sur `http://localhost:8080`. Hibernate crée/met à jour les tables au démarrage.
Les paramètres peuvent être remplacés avec `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
`SERVER_PORT`, `DDL_AUTO` et `CORS_ALLOWED_ORIGINS`.

## Endpoints

Chaque ressource expose `GET /`, `GET /{id}`, `POST /`, `PUT /{id}` et `DELETE /{id}`.

| Ressource | URL |
|---|---|
| Utilisateurs | `/api/users` |
| Vendeurs | `/api/sellers` |
| Catégories | `/api/categories` |
| Produits | `/api/products` |
| Panier | `/api/carts` |
| Commandes | `/api/orders` |
| Détails de commande | `/api/order-details` |
| Paiements | `/api/payments` |

Filtres simples disponibles :

- `GET /api/products/category/{categoryId}`
- `GET /api/products/seller/{sellerId}`
- `GET /api/products/search?name=telephone`
- `GET /api/carts/user/{userId}`
- `DELETE /api/carts/user/{userId}`
- `GET /api/orders/user/{userId}`
- `GET /api/order-details/order/{orderId}`
- `GET /api/payments/order/{orderId}`

## Exemple de création d'un utilisateur

```http
POST /api/users
Content-Type: application/json

{
  "nom": "Awa Diop",
  "email": "awa@example.com",
  "motDePasse": "secret123",
  "role": "ACHETEUR",
  "telephone": "+221770000000",
  "adresse": "Dakar"
}
```

Valeurs des enums :

- rôle : `ACHETEUR`, `VENDEUR`, `ADMIN`
- vendeur : `EN_ATTENTE`, `VALIDE`, `BLOQUE`
- commande : `EN_ATTENTE`, `PAYEE`, `EXPEDIEE`, `LIVREE`, `ANNULEE`
- paiement : `EN_ATTENTE`, `PAYE`, `ECHOUE`

Les mots de passe sont stockés avec BCrypt et ne sont jamais présents dans les réponses API.
