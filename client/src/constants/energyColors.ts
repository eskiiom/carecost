import { EnergyType } from '../types/vehicle.types';

export const ENERGY_COLORS: Record<EnergyType, string> = {
  [EnergyType.DIESEL]: '#FF0000', // Rouge
  [EnergyType.GASOLINE]: '#FFD700', // Jaune
  [EnergyType.GPL]: '#000080', // Bleu foncé
  [EnergyType.HYBRID_DIESEL]: '#8B4513', // Marron
  [EnergyType.HYBRID_GASOLINE]: '#800080', // Violet
  [EnergyType.ELECTRIC]: '#008000', // Vert
  [EnergyType.HYDROGEN]: '#00FFFF', // Cyan
}; 