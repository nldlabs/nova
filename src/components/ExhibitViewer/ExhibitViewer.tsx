import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ExhibitModule, QualityTier } from '../../exhibits/types';
import { loadExhibit } from '../../exhibits/registry';
import styles from './ExhibitViewer.module.css';

interface ExhibitViewerProps {
  exhibitId: string;
  quality: QualityTier;
  parameters: Record<string, number | boolean | string>;
  onMetadataLoaded: (metadata: ExhibitModule['metadata'], controls: ExhibitModule['controls']) => void;
}

function LoadingIndicator() {
  return (
    <div className={styles.loading}>
      LOADING
      <span className={styles.loadingDot}>.</span>
      <span className={styles.loadingDot}>.</span>
      <span className={styles.loadingDot}>.</span>
    </div>
  );
}

export function ExhibitViewer({ exhibitId, quality, parameters, onMetadataLoaded }: ExhibitViewerProps) {
  const [exhibit, setExhibit] = useState<ExhibitModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadExhibit(exhibitId).then((mod) => {
      if (mod) {
        setExhibit(mod);
        onMetadataLoaded(mod.metadata, mod.controls);
      }
      setLoading(false);
    });
  }, [exhibitId, onMetadataLoaded]);

  if (loading || !exhibit) {
    return <LoadingIndicator />;
  }

  const { Component } = exhibit;

  return (
    <div className={styles.viewer}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ 
          antialias: quality === 'high',
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={quality === 'low' ? 1 : quality === 'medium' ? 1.5 : window.devicePixelRatio}
      >
        <Suspense fallback={null}>
          <Component 
            isActive={true} 
            quality={quality} 
            parameters={parameters}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
