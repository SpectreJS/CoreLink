# Structure du projet CoreLink

## Vue d’ensemble

CoreLink est une application frontend monopage construite avec React et Vite. Elle présente les services logistiques, les tarifs et le suivi de colis, et inclut un espace d’administration isolé. Le routage est géré par React Router et les animations 3D du globe utilisent Three.js. Un backend Express/MySQL préparatoire séparé se trouve dans `../backend/`.

```text
CoreLink/
├── .vscode/
│   └── settings.json
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
    │   ├── contexts/
    │   ├── data/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   └── styles/
    ├── assets/
    │   └── images/
    │       └── logo.png
    ├── components/
    │   ├── Advantages.jsx
    │   ├── Contact.jsx
    │   ├── ExchangeRate.jsx
    │   ├── Globe.jsx
    │   ├── Hero.jsx
    │   ├── ScrollReveal.jsx
    │   ├── ShippingRates.jsx
    │   └── TransportSolutions.jsx
    ├── data/
    │   └── trackingRecords.js
    ├── layout/
    │   ├── Footer.jsx
    │   └── Header.jsx
    ├── pages/
    │   └── DetailsPage.jsx
    ├── services/
    │   └── tracking.js
    └── styles/
        └── main.scss
```

## Rôle des fichiers principaux

### Démarrage et navigation

- `index.html` fournit le document HTML et le point de montage React.
- `src/main.jsx` démarre React, charge les styles globaux et entoure l’application avec `BrowserRouter`.
- `src/App.jsx` définit les routes, les pages et le layout commun avec l’en-tête et le pied de page.

Routes principales :

- `/` : page d’accueil et sections de présentation.
- `/tracking/details/:trackingNumber` : page de détails d’un colis.
- `/details` et `/details.html` : anciennes routes de suivi conservées pour compatibilité.
- `/admin/login` : connexion administrateur.
- `/admin/dashboard`, `/admin/parcels`, `/admin/customers`, `/admin/tracking`, `/admin/shipments`, `/admin/invoices`, `/admin/payments`, `/admin/reports`, `/admin/users` et `/admin/settings` : espace d’administration protégé.

### Composants d’interface

- `src/components/` contient les sections de la page d’accueil : introduction, globe, taux de change, tarifs, solutions de transport, avantages et contact.
- `src/components/ScrollReveal.jsx` applique les apparitions progressives au défilement et respecte la préférence système de réduction des animations.
- `src/layout/Header.jsx` et `src/layout/Footer.jsx` contiennent les éléments communs aux pages, dont le logo.
- `src/pages/DetailsPage.jsx` présente la recherche, le résumé, les étapes et l’historique de suivi.

### Données et suivi

- `src/data/trackingRecords.js` contient les colis statiques utilisés pour la démonstration.
- `src/services/tracking.js` normalise les codes de suivi et recherche les colis dans ces données.

Le suivi actuel fonctionne en mode démonstration, sans backend ni base de données. Les colis et événements d’exemple ne sont pas des données réelles.

### Espace d’administration

- `src/admin/routes/` déclare les routes admin, protège les pages et applique les permissions d’interface.
- `src/admin/components/` contient le layout, la navigation et les composants d’interface réutilisables.
- `src/admin/contexts/` gère l’état de session de l’interface.
- `src/admin/services/` regroupe le client HTTP et les appels d’authentification, colis, clients et suivi.
- `src/admin/pages/` contient le tableau de bord, les écrans de gestion et les pages de modules.
- `src/admin/styles/` isole les styles administratifs des pages publiques.

Les données visibles dans le tableau de bord et les pages de démonstration sont des exemples explicitement non connectés à une base. La connexion de démonstration est limitée au mode de développement; l’interface ne remplace jamais l’autorisation côté serveur.

### Backend préparatoire

`../backend/` contient l’API Express, la configuration MySQL, le schéma initial des utilisateurs et les points d’entrée de session. Seule l’authentification initiale est préparée; les routes des modules métier répondent `501` tant qu’elles ne sont pas implémentées. Consulter `../backend/README.md` pour la configuration et les tâches restantes.

### Styles et configuration

- `src/styles/main.scss` regroupe les styles globaux, les styles spécifiques et les directives Tailwind CSS.
- `tailwind.config.mjs` configure les fichiers analysés, la palette, les polices et les plugins Tailwind.
- `postcss.config.mjs` connecte Tailwind CSS et Autoprefixer au traitement des styles.
- `vite.config.js` configure Vite et son plugin React.
- `.vscode/settings.json` définit les préférences d’indentation de l’espace de travail.
- `package.json` décrit les scripts et dépendances; `package-lock.json` verrouille leurs versions.

## Commandes utiles

```bash
npm run dev
npm run build
npm run preview
```
