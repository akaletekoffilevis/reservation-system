# Booking - Système de Réservation en Ligne

## Objectif

Permettre aux professionnels (coiffeurs, kinés, coachs, médecins...) de gérer leurs rendez-vous en ligne.

## Fonctionnalités

### Côté Client (visiteur)

- Voir les disponibilités du professionnel
- Choisir un service (coupe, massage, consultation...)
- Sélectionner une date et un créneau horaire
- Réserver sans créer de compte (ou avec compte simple)
- Recevoir un email/SMS de confirmation
- Annuler/modifier un rendez-vous

### Côté Professionnel (admin)

- Dashboard avec calendrier des rendez-vous
- Gérer ses services (nom, durée, prix)
- Définir ses disponibilités (jours/horaires ouvrés)
- Bloquer des créneaux (pause, congés)
- Voir la liste des clients
- Confirmer/annuler un rendez-vous manuellement
- Recevoir des notifications

### Côté API (ASP.NET Core)

- CRUD rendez-vous
- CRUD services
- CRUD disponibilités
- Authentification JWT
- Envoi email (SendGrid / Mailtrap)

## Stack technique

- **Frontend**: React + Vite (Vercel)
- **Backend**: ASP.NET Core Web API (MonsterAsp)
- **Base de données**: PostgreSQL ou SQLite
- **Auth**: JWT

## Fonctionnalités manquantes et exigences détaillées

Les points ci-dessous complètent la spécification en couvrant les besoins fonctionnels et non-fonctionnels identifiés comme manquants.

### Intégrité des réservations et concurrence

- Contraintes DB: ajouter une contrainte d'unicité sur `(professional_id, start_datetime, duration)` ou un index unique sur le créneau pour éviter la double-réservation.
- Transactions & verrous: utiliser des transactions atomiques côté API pour créer/réserver des créneaux. Prévoir mécanisme d'optimistic locking (version/timestamp) ou pessimistic locking si nécessaire.

### Fuseaux horaires et affichage

- Stocker toutes les dates/heures en UTC dans la base de données.
- Conserver la timezone IANA (`Europe/Paris`...) pour chaque professionnel et client afin d'afficher les horaires localement.
- Gérer DST (heure d'été/hiver) au rendu et lors de la réservation.

### Synchronisation calendrier

- Option d'intégration OAuth pour synchroniser avec Google Calendar et Outlook (lecture/écriture, prévention des conflits).
- Webhooks ou push pour recevoir mises à jour externes (événements créés dans Google -> bloquer créneau localement).

### Traitement asynchrone et file d'attente

- Externaliser l'envoi d'email/SMS et les tâches longues (génération d'attachements, notifications récurrentes) vers un worker queue (ex: Hangfire, RabbitMQ, Azure Service Bus, ou BackgroundService + persisted queue).
- Retry et DLQ (dead-letter queue) pour les échecs d'envoi.

### Notifications et préférences

- Templates d'email/SMS paramétrables.
- Préférences utilisateur: email, SMS, push (si appli mobile ultérieurement).
- Rappels programmables (24h, 1h avant, etc.) configurables par professionnel.

### Authentification & autorisations

- JWT avec refresh tokens et mécanisme de révocation (blacklist ou token store).
- RBAC: rôles `admin` (application), `professional`, `client` avec permissions distinctes (CRUD rendez-vous, gérer services, accéder aux statistiques).
- Flow mot de passe oublié / réinitialisation par email.

### Paiement (optionnel) => v2

- Option pour paiement à la réservation via Stripe (Checkout / Payment Intents).
- Gestion des remboursements, reçus, et conformité PCI (utiliser hosted flows pour minimiser la portée PCI).

### Tests & qualité

- Couverture: tests unitaires côté backend (services, validation), tests d'intégration (routes API + DB test), et E2E pour scénarios critiques (réservation concurrente).
- Fixtures / bases de test: scripts pour remplir DB en dev.

### CI/CD & déploiement

- Pipeline CI: build backend + frontend, exécuter tests, générer artefacts, exécuter migrations.
- Docker: fournir `Dockerfile` pour backend et `docker-compose.yml` pour dev local.
- Migrations EF Core exécutées via step de déploiement.

### Observabilité & monitoring

- Logs structurés (Serilog) avec centralisation.
- Metrics (Prometheus) + tableaux Grafana.
- Error tracking (Sentry) et healthchecks exposés.

### Documentation API

- Exposer Swagger/OpenAPI pour toutes les routes, avec exemples d'utilisation et modèles de réponses.

### Stockage des secrets & configuration

- Utiliser un secret manager (MonsterAspenv vars chiffrées) pour API keys SendGrid/Twilio/Stripe.

### Conformité & protection des données

- GDPR: consentement email, export des données utilisateur (JSON), droit à l'effacement (soft-delete puis purge suivant politique), journalisation des suppressions.
- Rétention des logs et des données personnelles configurable.

### Sauvegardes & résilience

- Backup régulier de la base PostgreSQL (snapshots, dumps horaires/journaliers) et procédure de restore testée.

### Scalabilité

- Prévoir partitionnement horizontal à moyen terme: stateless API + base managée, workers scalables.

### Sécurité applicative

- Rate limiting par IP/API key pour prévenir abus.
- Validation approfondie côté serveur sur toutes les entrées (durées, tarifs, identifiants).

### Webhooks et intégrations tierces

- Exposer endpoints webhooks pour notifier systèmes externes (paiement confirmé, rendez-vous modifié).
- Support HMAC pour valider les webhooks entrants et sortants.

### Fonctionnalités UX avancées

- Réservations récurrentes (ex: chaque lundi 10h) et gestion des exceptions (vacances, annulations ponctuelles).
- Blocage manuel de créneaux (congés) avec interface calendrier.

### Accessibilité & i18n

- Internationalisation (i18n) des textes front, formatage local des montants et dates.
- Respect WCAG basique pour interface publique.

## Exemples d'implémentation technique recommandée

- Jobs asynchrones: `BackgroundService` + persisted queue ou Hangfire pour tâches récurrentes et génération d'emails/SMS.
- Contrainte DB: table `appointments` avec `professional_id, start_utc, end_utc, status` et index unique sur `(professional_id, start_utc)`.
- Logging: Serilog -> envoyée vers fichiers et/ou provider centralisé.

---
