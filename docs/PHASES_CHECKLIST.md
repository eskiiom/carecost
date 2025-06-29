# CareCost – Checklist de Développement par Phases

## Phase 1 – Socle technique, Refactoring & Sécurité

- [x] Structure du backend en modules (auth, users, vehicles, costs, etc.)
- [ ] Séparation claire des routes, contrôleurs, services, middlewares
- [ ] Nettoyage du code (suppression duplications, noms explicites)
- [ ] Mise en place d'un linter (ESLint) et d'un formatter (Prettier)
- [ ] Ajout d'un fichier README technique de base
- [ ] Hashage et salage sécurisé des mots de passe (bcrypt ou argon2)
- [ ] Authentification par JWT (ou sessions) opérationnelle
- [ ] Middleware de protection des routes sensibles
- [ ] Gestion des variables d'environnement (.env, dotenv)
- [ ] Désactivation des logs sensibles en production
- [ ] Configuration de Prisma (ou ORM choisi) et connexion PostgreSQL
- [ ] Scripts de migration de la base de données fonctionnels
- [ ] Script de seed pour créer des utilisateurs et données de test
- [ ] Vérification du schéma de la base (cohérence, relations)
- [ ] Installation des dépendances backend et frontend
- [ ] Configuration du proxy ou CORS pour le dialogue front/back
- [ ] Tests unitaires de base (ex : hash mot de passe, validation email)
- [ ] Tests d'intégration sur les endpoints principaux (login, CRUD véhicule)
- [ ] Script ou commande pour vérifier l'état des serveurs (backend, frontend, base)
- [ ] Vérification manuelle du login et de l'affichage des données de test
- [ ] Documentation de l'architecture (schéma, modules, flux)
- [ ] Documentation des endpoints principaux (auth, véhicules, etc.)
- [ ] Documentation des scripts d'installation, migration, seed
- [ ] Liste des conventions de code et bonnes pratiques

---

## Phase 2 – Fonctionnalités cœur

- [ ] Gestion multi-véhicules (CRUD complet)
- [ ] Gestion des pleins/carburant (CRUD, calculs conso)
- [ ] Gestion des coûts (entretien, réparations, taxes, assurance, etc.)
- [ ] Gestion des documents (upload, expiration, rappels)
- [ ] Statistiques de base (conso, coûts, répartition)
- [ ] Gestion multi-utilisateurs (création, rôles, partage de véhicules)
- [ ] Sécurité avancée (rate limiting, logs, audit)
- [ ] Tests d'intégration sur toutes les fonctionnalités cœur
- [ ] Documentation utilisateur de base

---

## Phase 3 – Fonctionnalités avancées & Intégrations

- [ ] Notifications (emails, rappels échéances, push)
- [ ] Intégration API externes (carburant, météo, etc.)
- [ ] Statistiques avancées (rapports, exports, graphiques)
- [ ] Gestion fine des droits/rôles
- [ ] Interface d'administration
- [ ] Optimisation des performances
- [ ] Accessibilité et responsive design
- [ ] Tests end-to-end (E2E)
- [ ] Documentation complète (technique et utilisateur)

---

## Phase 4 – Déploiement & Maintenance

- [ ] Scripts de déploiement (CI/CD)
- [ ] Monitoring, alerting
- [ ] Sauvegarde et restauration de la base
- [ ] Mise à jour de la documentation
- [ ] Plan de maintenance et roadmap évolutive 