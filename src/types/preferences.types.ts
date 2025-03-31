export interface UserPreferences {
  vehicleViewMode: 'grid' | 'list';
  // Possibilité d'ajouter d'autres préférences à l'avenir
}

export interface UpdatePreferencesDTO {
  preferences: Partial<UserPreferences>;
} 