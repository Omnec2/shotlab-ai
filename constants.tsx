
import { DirectorStyle } from './types';

export const STYLES_LIST: DirectorStyle[] = [
  { id: 'Standard', label: 'Standard', desc: 'Classique & Efficace' },
  { id: 'Kryss Omnec', label: 'Kryss Omnec', desc: 'Mix Nolan & Snyder' },
  { id: 'Wes Anderson', label: 'Wes Anderson', desc: 'Symétrique & Pastel' },
  { id: 'Christopher Nolan', label: 'Chris Nolan', desc: 'Réaliste & Grandiose' },
  { id: 'Quentin Tarantino', label: 'Tarantino', desc: 'Contre-plongée & Intense' },
  { id: 'Zack Snyder', label: 'Zack Snyder', desc: 'Ralentis & Contraste' },
  { id: 'James Cameron', label: 'James Cameron', desc: 'Épique & Technique' },
  { id: 'Denis Villeneuve', label: 'Denis Villeneuve', desc: 'Atmosphérique & Minimaliste' },
  { id: 'Cyberpunk', label: 'Cyberpunk', desc: 'Néons & High Tech' },
  { id: 'Film Noir', label: 'Film Noir', desc: 'Ombres & Lumières dramatiques' },
  { id: 'Custom', label: 'Personnalisé', desc: 'Votre vision unique' },
];

export const SHOT_TYPES = [
  "Plan Général (PG)",
  "Plan d'Ensemble (PE)",
  "Plan Moyen (PM) - Tête aux pieds",
  "Plan Américain (PA) - Mi-cuisses",
  "Plan Taille (PT) - Tête à la taille",
  "Plan Rapproché Poitrine (PRP)",
  "Gros Plan (GP) - Épaules",
  "Très Gros Plan (TGP) - Détail"
];

export const ANGLES = [
  "Niveau regard",
  "Plongée",
  "Contre-plongée",
  "Plongée totale (Zénithal)",
  "Contre-plongée totale (Nadir)",
  "Dutch Angle (Cantu)"
];

export const AXES = [
  "Face",
  "Profil",
  "Dos",
  "3/4 Face",
  "3/4 Dos"
];

export const MOVEMENTS = [
  "Fixe",
  "Panoramique (Pan)",
  "Bascule (Tilt)",
  "Travelling",
  "Travelling Circulaire",
  "Travelling Optique (Zoom)",
  "Dolly Zoom",
  "Steadicam",
  "Caméra à l'épaule",
  "Grue / Jib",
  "Drone"
];
