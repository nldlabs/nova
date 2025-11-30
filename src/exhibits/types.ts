import type { ComponentType } from 'react';

export type QualityTier = 'low' | 'medium' | 'high';

export interface ExhibitProps {
  isActive: boolean;
  quality: QualityTier;
  parameters: Record<string, number | boolean | string>;
}

export interface ControlDefinition {
  key: string;
  label: string;
  type: 'slider' | 'toggle' | 'select';
  defaultValue: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
}

export interface ExhibitMetadata {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export interface ExhibitModule {
  Component: ComponentType<ExhibitProps>;
  metadata: ExhibitMetadata;
  controls?: ControlDefinition[];
}
