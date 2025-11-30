import type { ExhibitModule } from './types';

// Lazy load exhibits for code splitting
const exhibitLoaders: Record<string, () => Promise<ExhibitModule>> = {
  'flow-fields': () => import('./flow-fields').then(m => m.default),
  'tessellations': () => import('./tessellations').then(m => m.default),
  'emergence': () => import('./emergence').then(m => m.default),
};

export const exhibitIds = Object.keys(exhibitLoaders);

export async function loadExhibit(id: string): Promise<ExhibitModule | null> {
  const loader = exhibitLoaders[id];
  if (!loader) return null;
  return loader();
}

// Preload metadata for gallery view (without loading full components)
export const exhibitPreviews: Record<string, { title: string; description: string; comingSoon?: boolean }> = {
  'flow-fields': {
    title: 'Flow Fields',
    description: 'Particles dancing through invisible currents of curl noise',
  },
  'tessellations': {
    title: 'Tessellations',
    description: 'Kaleidoscopic geometry folding through infinite symmetry',
  },
  'emergence': {
    title: 'Emergence',
    description: 'Life-like agents swarm through noise fields, order from chaos',
  },
};
