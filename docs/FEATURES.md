# Fonctionnalités — Booking SaaS

## Légende

- ✅ Implémenté
- 🔜 Incoming (planifié)
- 💡 Idée (futur lointain)

---

## 🔜 INCOMING — par ordre de priorité

### P1 — Chat client-pro (messagerie temps réel)

**#16** — Messagerie intégrée client ↔ professionnel avec historique, notifications push, et fichiers joints.

### P2 — Planning en temps réel

**#9** — Mise à jour live des créneaux via SignalR/WebSockets. Quand un client réserve, le créneau disparaît instantanément pour tous les autres.

### P3 — Rappels SMS

**#8** — Notification SMS via Twilio pour les clients sans email : confirmation, rappel J-1, annulation.

### P4 — Catalogue pros enrichi

**#7** — Catégories de services, filtres multi-critères (ville, prix, disponibilité), photos, avis/notes clients, badge "vérifié".

### P5 — Back-office admin

**#6** — Dashboard super-admin : stats globales (CA, réservations, pros actifs), gestion de tous les pros (activer/suspendre), modération avis.

### P6 — Horaires complexes

**#4** — Plages tournantes (1 semaine sur 2), périodes de congés annuels, jours fériés, horaires spéciaux (vacances scolaires).

### P7 — Notifications email réelles

**#2** — Emails transactionnels via SendGrid/Mailtrap : confirmation, rappel, annulation, récapitulatif mensuel pro.

---

## ✅ IMPLÉMENTÉ

| #   | Fonctionnalité                                    | Statut |
| --- | ------------------------------------------------- | ------ |
| 1   | Stack React + Vite + Tailwind                     | ✅     |
| 2   | API ASP.NET Core 9 Clean Architecture             | ✅     |
| 3   | Auth JWT + refresh tokens                         | ✅     |
| 4   | Rôles (Admin / Professional / Client)             | ✅     |
| 5   | CRUD pros publics                                 | ✅     |
| 6   | Réservation sans compte (token)                   | ✅     |
| 7   | Booking flow 3 étapes (service → créneau → infos) | ✅     |
| 8   | Dashboard professionnel                           | ✅     |
| 9   | Gestion des services (pro)                        | ✅     |
| 10  | Gestion des disponibilités (pro)                  | ✅     |
| 11  | Gestion des rendez-vous (pro)                     | ✅     |
| 12  | App mobile React Native Expo                      | ✅     |
| 13  | Base SQLite avec EF Core                          | ✅     |
| 14  | Seed data (5 pros + services)                     | ✅     |
| 15  | Scalar API Reference                              | ✅     |

---

## 💡 IDÉES FUTURES

| #   | Idée                                               |
| --- | -------------------------------------------------- |
| 11  | Paiement Stripe à la réservation                   |
| 12  | Sync Google Calendar / Outlook                     |
| 13  | Multi-langues (i18n)                               |
| 14  | Application mobile pro (dashboard + notifications) |
| 15  | Réservation récurrente / abonnement                |
| 16  | Marque blanche (sous-domaine par pro)              |
| 17  | IA recommandation de services                      |
| 18  | Intégration CRM (HubSpot, Salesforce)              |
| 19  | Marketplace avec commission Booking                |
| 20  | Chatbot automatique de réservation                 |
