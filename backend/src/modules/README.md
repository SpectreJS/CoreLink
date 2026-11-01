# Modules API

`auth/` contient l’authentification session. `parcels/` implémente les opérations
de lecture, création, modification et suppression des colis. Les autres modules
(users, customers, tracking, shipments, invoices, payments et reports) ne
disposent pas encore de routes métier ni de tables et répondent `501`.

Les contrôles d’accès doivent être appliqués côté serveur à chaque endpoint, en
plus des gardes de navigation du frontend.
