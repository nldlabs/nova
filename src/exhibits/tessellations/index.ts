import type { ExhibitModule } from '../types';
import { Tessellations } from './Tessellations';

const exhibitModule: ExhibitModule = {
  Component: Tessellations,
  
  metadata: {
    id: 'tessellations',
    title: 'Tessellations',
    description: 'Infinite geometric patterns folded through kaleidoscopic symmetry. Sacred geometry meets generative art in an ever-shifting mandala.',
    date: '2025-11-30',
    tags: ['geometry', 'kaleidoscope', 'symmetry', '2d', 'shader', 'interactive', 'mandala'],
  },

  controls: [
    {
      key: 'symmetry',
      label: 'Symmetry',
      type: 'slider',
      defaultValue: 0.5,
      min: 0.0,
      max: 1.0,
      step: 0.1,
    },
    {
      key: 'complexity',
      label: 'Complexity',
      type: 'slider',
      defaultValue: 0.5,
      min: 0.0,
      max: 1.0,
      step: 0.1,
    },
    {
      key: 'zoom',
      label: 'Zoom',
      type: 'slider',
      defaultValue: 3.0,
      min: 1.0,
      max: 8.0,
      step: 0.5,
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
