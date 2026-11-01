# CoreLink — structure et contexte du projet

Ce document donne à ChatGPT et aux contributeurs une vue d’ensemble du projet
pour faciliter les futures modifications. Il décrit l’état actuel du code : les
fonctionnalités marquées « préparatoires » ou « démo » ne doivent pas être
présentées comme connectées à une base de données.

## Présentation

CoreLink Sourcing & Logistics est un projet composé de deux parties :

- `frontend/` : site public React et espace d’administration dans la même
  application Vite.
- `backend/` : API Express/MySQL indépendante, encore préparatoire.

Le site public existant doit rester fonctionnel et visuellement inchangé lors
des travaux sur l’administration. Les styles admin sont isolés sous des classes
spécifiques. Ne pas déplacer ni recréer l’application React.

## Arborescence

```text
CoreLink/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── database.js
│       │   └── env.js
│       ├── database/
│       │   └── schema.sql
│       ├── middlewares/
│       │   ├── asyncHandler.js
│       │   ├── authenticate.js
│       │   ├── browserOrigin.js
│       │   └── httpError.js
│       ├── modules/
│       │   ├── README.md
│       │   └── auth/
│       │       └── auth.routes.js
│       └── routes/
│           ├── admin.routes.js
│           └── index.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.mjs
    ├── tailwind.config.mjs
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── admin/
        │   ├── components/
        │   │   ├── common/AdminUI.jsx
        │   │   └── layout/
        │   ├── contexts/AdminAuthContext.jsx
        │   ├── data/demoData.js
        │   ├── pages/
        │   │   ├── AdminLoginPage.jsx
        │   │   └── AdminModulePages.jsx
        │   ├── routes/
        │   │   ├── AdminProtectedRoute.jsx
        │   │   ├── AdminRoutes.jsx
        │   │   └── permissions.js
        │   ├── services/
        │   │   ├── adminApi.js
        │   │   ├── authService.js
        │   │   ├── customerService.js
        │   │   ├── parcelService.js
        │   │   └── trackingService.js
        │   └── styles/
        │       ├── admin-global.scss
        │       ├── admin-main.scss
        │       └── admin-variables.scss
        ├── assets/images/logo.png
        ├── components/
        │   ├── Advantages.jsx
        │   ├── Contact.jsx
        │   ├── ExchangeRate.jsx
        │   ├── Globe.jsx
        │   ├── Hero.jsx
        │   ├── ScrollReveal.jsx
        │   ├── ShippingRates.jsx
        │   └── TransportSolutions.jsx
        ├── data/trackingRecords.js
        ├── layout/
        │   ├── Footer.jsx
        │   └── Header.jsx
        ├── pages/DetailsPage.jsx
        ├── services/tracking.js
        └── styles/main.scss
```

## Technologies

### Frontend

- React 19 et React DOM.
- Vite pour le serveur de développement et le build.
- React Router DOM pour les routes publiques et admin.
- Sass/SCSS et Tailwind CSS.
- Three.js pour le globe animé.

Les scripts frontend sont définis dans `frontend/package.json` :

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run preview
```

### Backend

- Node.js 20 ou plus récent, Express 5, MySQL via `mysql2`.
- Validation de configuration et d’entrées avec Zod.
- Authentification préparatoire par JWT dans un cookie HTTP-only.

Consulter `backend/README.md` pour configurer `.env`, MySQL et les commandes
backend. Ne jamais enregistrer les secrets dans le dépôt.

## Frontend : points d’entrée et routes

- `src/main.jsx` démarre React et place l’application dans `BrowserRouter`.
- `src/App.jsx` définit les routes, les layouts publics et le point de montage
  `/admin/*`.
- `src/styles/main.scss` regroupe les styles du site public et les directives
  Tailwind.
- `src/components/` contient les sections de la page d’accueil.
- `src/layout/` contient le header et le footer communs au site public.
- `src/pages/DetailsPage.jsx` présente la recherche et le détail du suivi.

Routes publiques existantes :

| Route | Usage |
|---|---|
| `/` | Page d’accueil |
| `/tracking/details/:trackingNumber` | Détail du code de suivi |
| `/details` | Route historique, code lu depuis `?tracking=` |
| `/details.html` | Alias historique de la page de détail |

Ne pas changer ces URL ni leur comportement sans demande explicite.

### Suivi public

- `src/data/trackingRecords.js` contient des données de suivi de démonstration.
- `src/services/tracking.js` normalise les codes, recherche les données locales
  et ne renvoie que les colis déclarés publics.
- Le suivi public n’est actuellement pas connecté à l’API ni à MySQL. Les
  données présentes dans le dépôt ne sont pas des données réelles.

### Espace d’administration

Les routes admin sont déclarées dans `src/admin/routes/AdminRoutes.jsx` :

| Route | Usage |
|---|---|
| `/admin/login` | Connexion |
| `/admin/dashboard` | Tableau de bord |
| `/admin/parcels`, `/admin/parcels/new`, `/admin/parcels/:id`, `/admin/parcels/:id/edit` | Gestion des colis |
| `/admin/customers`, `/admin/customers/new`, `/admin/customers/:id` | Gestion des clients |
| `/admin/tracking` | Gestion du suivi |
| `/admin/shipments`, `/admin/shipments/:id` | Expéditions |
| `/admin/payments` | Paiements |
| `/admin/reports` | Rapports |
| `/admin/users` | Utilisateurs |
| `/admin/settings` | Paramètres |

`AdminProtectedRoute.jsx` protège l’accès selon la session; `permissions.js`
filtre la navigation admin selon le rôle. Ce contrôle frontend sert à l’UX et ne
remplace pas les autorisations obligatoires de l’API.

`AdminAuthContext.jsx` gère l’état de session. `authService.js` appelle
`adminApi.js`, dont la base d’API par défaut est `/api`; elle peut être remplacée
par `VITE_ADMIN_API_URL`. Les pages et données de démonstration sont sous
`pages/` et `data/demoData.js`.

La connexion `demo@corelink.local` / `demo-only` est réservée au mode
développement frontend (`import.meta.env.DEV`). Ce n’est pas un compte backend.
Les styles d’administration sont définis dans `src/admin/styles/` et doivent
rester isolés du site public.

## Backend : état actuel

Le backend est un squelette fonctionnel d’infrastructure, pas encore un système
métier complet :

- `src/app.js` configure Express, Helmet, CORS, cookies, JSON et routes API.
- `src/server.js` vérifie la connexion MySQL avant de démarrer le serveur.
- `src/config/env.js` valide les variables d’environnement.
- `src/config/database.js` configure le pool MySQL.
- `src/middlewares/` contient la gestion d’erreur, l’origine navigateur et les
  gardes de session/rôle.
- `src/modules/auth/auth.routes.js` contient les premières routes de connexion,
  profil et déconnexion.
- `src/database/schema.sql` crée seulement la table `admin_users`.
- Les routes `/api/admin/*` répondent `501` tant que les modules métier ne sont
  pas implémentés.

Endpoints actuellement prévus :

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `/api/admin/*` : protégé, mais non implémenté (`501`)

Aucun compte admin initial, endpoint métier colis/client, migration métier ni
connexion frontend-backend déployée n’est fourni pour le moment. Les accès et
données affichés dans les écrans de démonstration ne doivent pas être considérés
comme persistés.

## Consignes utiles pour les futures modifications

1. Examiner les fichiers existants avant de changer l’architecture ou les
   dépendances.
2. Préserver le site public et ses routes; limiter les changements admin à
   `src/admin/` et aux points d’intégration strictement nécessaires.
3. Garder les styles admin sous `.admin-shell` / `.admin-login-screen`; éviter
   les styles globaux génériques susceptibles d’affecter le public.
4. Réutiliser React Router, les services existants et les conventions déjà
   présentes au lieu d’ajouter une seconde application.
5. Ne pas prétendre qu’une page démo utilise la base de données.
6. Vérifier les changements frontend avec `npm --prefix frontend run build`.
7. Ne jamais exposer les détails privés d’un colis; toute autorisation réelle
   doit également être vérifiée côté serveur.


accès admin ==> http://localhost:5173/admin/
demo@corelink.local
Tsjl206206*-