export type ViewMode = 'grid' | 'list';

export interface UserPreferences {
  vehicleViewMode: ViewMode;
}

export interface PreferencesResponse {
  preferences: UserPreferences;
} 