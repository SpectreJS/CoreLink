# Backend CoreLink (préparation)

API REST indépendante en Node.js et Express 5, prévue pour MySQL. Elle n’est pas
encore reliée au frontend ou déployée. L’authentification initiale utilise une
session JWT stockée dans un cookie `HttpOnly`; les autres modules répondent
volontairement `501` tant que leur modèle métier et leurs endpoints n’existent pas.

## Initialisation locale

1. Utiliser Node.js 20 ou plus récent.
2. Copier `.env.example` vers `.env`, puis définir les valeurs MySQL et un
   `JWT_SECRET` aléatoire d’au moins 32 caractères. Ne jamais committer `.env`.
3. Créer la base MySQL et appliquer `src/database/schema.sql`.
4. Installer les dépendances dans ce dossier avec `npm install`.
5. Lancer `npm run dev`.

Le schéma ne crée qu’une table d’utilisateurs. Aucun utilisateur par défaut,
mot de passe de démonstration ou jeu de données métier n’est créé.

## Endpoints disponibles

- `GET /api/health` : état de disponibilité du processus HTTP.
- `POST /api/auth/login` : ouverture de session avec un compte présent en base.
- `GET /api/auth/me` : profil de l’utilisateur authentifié.
- `POST /api/auth/logout` : fermeture de session.
- `/api/admin/*` : nécessite une session et un rôle autorisé, puis répond `501`
  jusqu’à l’implémentation des endpoints métier.

Les mutations vérifient l’origine web configurée; les réponses utilisent des
cookies de session HTTP-only, CORS limité à `WEB_ORIGIN`, Helmet, validation des
entrées et limitation des tentatives de connexion. En production, utiliser HTTPS
et définir `COOKIE_SECURE=true`.

## À implémenter avant usage réel

- Insérer le premier administrateur par une procédure opérateur sécurisée.
- Implémenter les migrations et règles RBAC pour chaque module métier.
- Ajouter protections de révocation/rotation de session et audit opérationnel.
- Configurer TLS, sauvegardes, gestion de secrets et surveillance en déploiement.
