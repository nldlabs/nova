import type { ExhibitModule } from '../types';
import { FlowFields } from './FlowFields';

const exhibitModule: ExhibitModule = {
  Component: FlowFields,
  
  metadata: {
    id: 'flow-fields',
    title: 'Flow Fields',
    description: 'Particles dancing through invisible currents. Curl noise creates organic, ever-shifting patterns that respond to your presence.',
    date: '2025-11-30',
    tags: ['particles', 'noise', 'curl', '2d', 'shader', 'interactive'],
  },

  controls: [
    {
      key: 'density',
      label: 'Density',
      type: 'slider',
      defaultValue: 0.3,
      min: 0.2,
      max: 1.0,
      step: 0.1,
    },
    {
      key: 'turbulence',
      label: 'Turbulence',
      type: 'slider',
      defaultValue: 6.0,
      min: 1.0,
      max: 6.0,
      step: 0.5,
    },
    {
      key: 'speed',
      label: 'Speed',
      type: 'slider',
      defaultValue: 1.4,
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
