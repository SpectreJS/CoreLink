# Modules API

`auth/` contient le début d’authentification session. Les autres modules demandés
(users, customers, parcels, tracking, shipments, invoices, payments et reports)
ne disposent pas encore de routes métier ni de tables. Ils ne doivent pas être
considérés comme opérationnels; les routes administratives répondent `501`.

Les contrôles d’accès doivent être appliqués côté serveur à chaque endpoint, en
plus des gardes de navigation du frontend.
