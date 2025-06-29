# CareCost – Checklist de Développement par Phases

## Phase 1 – Socle technique, Refactoring & Sécurité

- [x] Structure du backend en modules (auth, users, vehicles, costs, etc.)
- [x] Séparation claire des routes, contrôleurs, services, middlewares
- [ ] Nettoyage du code (suppression duplications, noms explicites) - **Reporté à plus tard**
- [x] Mise en place d'un linter (ESLint) et d'un formatter (Prettier)
- [x] Ajout d'un fichier README technique de base
- [x] Hashage et salage sécurisé des mots de passe (bcrypt ou argon2)
- [x] Authentification par JWT (ou sessions) opérationnelle
- [x] Middleware de protection des routes sensibles
- [x] Gestion des variables d'environnement (.env, dotenv)
- [x] Désactivation des logs sensibles en production
- [x] Configuration de Prisma (ou ORM choisi) et connexion PostgreSQL
- [x] Scripts de migration de la base de données fonctionnels
- [x] Script de seed pour créer des utilisateurs et données de test
- [x] Vérification du schéma de la base (cohérence, relations)
- [x] Installation des dépendances backend et frontend
- [x] Configuration du proxy ou CORS pour le dialogue front/back
- [x] Tests unitaires de base (ex : hash mot de passe, validation email)
- [x] Tests d'intégration sur les endpoints principaux (login, CRUD véhicule)
- [x] Script ou commande pour vérifier l'état des serveurs (backend, frontend, base)
- [x] Vérification manuelle du login et de l'affichage des données de test
- [x] Documentation de l'architecture (schéma, modules, flux)
- [x] Documentation des endpoints principaux (auth, véhicules, etc.)
- [x] Documentation des scripts d'installation, migration, seed
- [x] Liste des conventions de code et bonnes pratiques

**🎉 PHASE 1 TERMINÉE !**

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