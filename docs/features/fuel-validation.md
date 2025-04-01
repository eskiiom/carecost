# Validation des Carburants par Type de Véhicule

## Vue d'ensemble
Le système de validation des carburants assure que chaque véhicule ne peut utiliser que les carburants compatibles avec son type d'énergie. Cette validation est effectuée à la fois côté client et serveur pour garantir l'intégrité des données.

## Implémentation

### 1. Structure de la Base de Données
La validation est basée sur la table `FuelType` qui associe chaque carburant à un type d'énergie :

```prisma
model FuelType {
  id          String     @id @default(uuid())
  name        String     // Nom du carburant (ex: "Sans plomb 95 (E5)")
  energyType  EnergyType // Type d'énergie associé
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([name, energyType])
}
```

### 2. Carburants Disponibles par Type d'Énergie

#### Véhicules Essence (GASOLINE)
- Sans plomb 95 (E5)
- Sans plomb 98 (E5)
- Sans plomb 95-E10 (E10)
- Sans plomb 98-E10 (E10)
- Sans plomb 95-E85 (E85)

#### Véhicules Diesel (DIESEL)
- Diesel B7 (7% de biodiesel)
- Diesel B10 (10% de biodiesel)
- Diesel B30 (30% de biodiesel)
- Diesel XTL (synthétique)

#### Véhicules GPL (GPL)
- GPLc (GPL carburant)
- GPLc + Essence (bimodal)

#### Véhicules Hybrides Essence (HYBRID_GASOLINE)
- Sans plomb 95 (E5)
- Sans plomb 98 (E5)
- Sans plomb 95-E10 (E10)
- Sans plomb 98-E10 (E10)
- Sans plomb 95-E85 (E85)

#### Véhicules Hybrides Diesel (HYBRID_DIESEL)
- Diesel B7 (7% de biodiesel)
- Diesel B10 (10% de biodiesel)
- Diesel B30 (30% de biodiesel)
- Diesel XTL (synthétique)

#### Véhicules Électriques (ELECTRIC)
- Électricité domestique (AC)
- Électricité rapide (DC)
- Électricité super-rapide (DC)
- Électricité semi-rapide (AC)

#### Véhicules Hydrogène (HYDROGEN)
- Hydrogène comprimé (H2)
- Hydrogène liquide (LH2)

#### Véhicules Flex-Fuel (FLEX_FUEL)
- E85
- E100

#### Véhicules Biocarburants (BIOFUEL)
- B100 (100% biodiesel)
- E100 (100% bioéthanol)

### 3. Validation Côté Client
La validation est effectuée dans le formulaire d'ajout d'entrée de carburant :
1. Récupération du type d'énergie du véhicule
2. Filtrage des carburants disponibles pour ce type d'énergie
3. Affichage uniquement des carburants compatibles dans le menu déroulant
4. Validation du formulaire avant envoi

### 4. Validation Côté Serveur
Une double validation est effectuée côté serveur :
1. Vérification que le carburant sélectionné existe dans la base de données
2. Vérification que le carburant est compatible avec le type d'énergie du véhicule
3. Rejet de la requête si la validation échoue

## Avantages
1. **Prévention des Erreurs** : Les utilisateurs ne peuvent pas sélectionner de carburants incompatibles
2. **Intégrité des Données** : La double validation assure la cohérence des données
3. **Expérience Utilisateur** : Interface intuitive avec filtrage automatique des options

## Maintenance
- Les carburants sont centralisés dans la table `FuelType`
- L'ajout de nouveaux carburants se fait via des scripts SQL
- La validation est indépendante de la logique métier 