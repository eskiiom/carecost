# Code Couleur des Types d'Énergie

## Vue d'ensemble
Le système de code couleur pour les types d'énergie permet une identification visuelle rapide des différents types de carburant dans l'application. Chaque type d'énergie est associé à une couleur spécifique qui est utilisée de manière cohérente dans toute l'interface utilisateur.

## Implémentation

### 1. Définition des Couleurs
Les couleurs sont définies dans le fichier `client/src/constants/energyColors.ts` :

```typescript
export const ENERGY_COLORS: Record<EnergyType, string> = {
  [EnergyType.DIESEL]: '#FF0000',      // Rouge
  [EnergyType.GASOLINE]: '#FFD700',    // Jaune
  [EnergyType.GPL]: '#000080',         // Bleu foncé
  [EnergyType.HYBRID_DIESEL]: '#8B4513', // Marron
  [EnergyType.HYBRID_GASOLINE]: '#800080', // Violet
  [EnergyType.ELECTRIC]: '#008000',    // Vert
  [EnergyType.HYDROGEN]: '#00FFFF',    // Cyan
};
```

### 2. Utilisation dans les Composants
Les couleurs sont utilisées dans deux composants principaux :

#### VehicleList.tsx
- Affichage en mode grille : Les types d'énergie sont affichés en gras avec leur couleur respective
- Affichage en mode liste : Les types d'énergie sont intégrés dans la ligne d'information avec leur couleur respective

#### VehicleDetails.tsx
- En-tête : Le type d'énergie est affiché avec sa couleur dans la barre d'informations principales
- Onglet Informations : Le type d'énergie est affiché avec sa couleur dans la section des informations générales

### 3. Fonctions Utilitaires
Deux fonctions utilitaires sont utilisées pour gérer l'affichage :

```typescript
// Conversion du type d'énergie en label lisible
const getEnergyTypeLabel = (type: EnergyType) => {
  const types: Record<EnergyType, string> = {
    GASOLINE: 'Essence',
    DIESEL: 'Diesel',
    GPL: 'GPL',
    HYBRID_GASOLINE: 'Hybride Essence',
    HYBRID_DIESEL: 'Hybride Diesel',
    ELECTRIC: 'Électrique',
    HYDROGEN: 'Hydrogène'
  };
  return types[type] || type;
};

// Application du style avec la couleur correspondante
const getEnergyTypeStyle = (type: EnergyType) => {
  return {
    color: ENERGY_COLORS[type],
    fontWeight: 'bold'
  };
};
```

## Avantages
1. **Identification Rapide** : Les utilisateurs peuvent rapidement identifier le type d'énergie d'un véhicule
2. **Cohérence Visuelle** : L'utilisation des mêmes couleurs dans toute l'application renforce la cohérence de l'interface
3. **Accessibilité** : Les couleurs sont choisies pour assurer un bon contraste et une bonne lisibilité

## Maintenance
- Les couleurs sont centralisées dans un seul fichier, facilitant leur modification
- L'utilisation de TypeScript assure la cohérence des types d'énergie
- Les modifications de couleurs peuvent être effectuées sans toucher à la logique des composants 