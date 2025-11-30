import type { ExhibitModule } from '../types';
import { Emergence } from './Emergence';

const exhibitModule: ExhibitModule = {
  Component: Emergence,
  
  metadata: {
    id: 'emergence',
    title: 'Emergence',
    description: 'Life-like agents swarm and flock through noise fields. Simple rules create complex, organic behavior - order arising from chaos.',
    date: '2025-11-30',
    tags: ['agents', 'flocking', 'emergence', 'life', 'swarm', 'interactive', 'simulation'],
  },

  controls: [
    {
      key: 'population',
      label: 'Population',
      type: 'slider',
      defaultValue: 0.5,
      min: 0.1,
      max: 1.0,
      step: 0.1,
    },
    {
      key: 'cohesion',
      label: 'Cohesion',
      type: 'slider',
      defaultValue: 1.0,
      min: 0.0,
      max: 2.0,
      step: 0.1,
    },
    {
      key: 'trailLength',
      label: 'Trail Length',
      type: 'slider',
      defaultValue: 0.5,
      min: 0.0,
      max: 1.0,
      step: 0.1,
    },
    {
      key: 'speed',
      label: 'Speed',
      type: 'slider',
      defaultValue: 1.0,
      min: 0.2,
      max: 2.0,
      step: 0.1,
    },
    {
      key: 'colorShift',
      label: 'Color Shift',
      type: 'slider',
      defaultValue: 0.0,
      min: 0.0,
      max: 1.0,
      step: 0.05,
    },
  ],
};

export default exhibitModule;
