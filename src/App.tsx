import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { Gallery } from './components/Gallery';
import { ExhibitViewer } from './components/ExhibitViewer';
import { Controls } from './components/Controls';
import type { ExhibitMetadata, ControlDefinition, QualityTier } from './exhibits/types';

function App() {
  const [currentExhibit, setCurrentExhibit] = useState<string | null>(null);
  const [exhibitMetadata, setExhibitMetadata] = useState<ExhibitMetadata | null>(null);
  const [exhibitControls, setExhibitControls] = useState<ControlDefinition[]>([]);
  const [parameters, setParameters] = useState<Record<string, number | boolean | string>>({});
  const [showControls, setShowControls] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [quality] = useState<QualityTier>('high');

  const handleSelectExhibit = useCallback((id: string) => {
    setCurrentExhibit(id);
    setShowInfo(true);
  }, []);

  const handleGoHome = useCallback(() => {
    setCurrentExhibit(null);
    setExhibitMetadata(null);
    setExhibitControls([]);
    setParameters({});
  }, []);

  const handleMetadataLoaded = useCallback((metadata: ExhibitMetadata, controls?: ControlDefinition[]) => {
    setExhibitMetadata(metadata);
    if (controls) {
      setExhibitControls(controls);
      // Initialize parameters with defaults
      const defaults: Record<string, number | boolean | string> = {};
      controls.forEach(c => {
        defaults[c.key] = c.defaultValue;
      });
      setParameters(defaults);
    }
  }, []);

  const handleParameterChange = useCallback((key: string, value: number | boolean | string) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        setShowControls(prev => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo(prev => !prev);
      } else if (e.key === 'Escape' && currentExhibit) {
        handleGoHome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentExhibit, handleGoHome]);

  return (
    <AnimatePresence mode="wait">
      {currentExhibit ? (
        <motion.div
          key="exhibit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'fixed', inset: 0 }}
        >
          <Layout
            exhibitMetadata={exhibitMetadata}
            showControls={showControls}
            showInfo={showInfo}
            onToggleControls={() => setShowControls(prev => !prev)}
            onToggleInfo={() => setShowInfo(prev => !prev)}
            onGoHome={handleGoHome}
          >
            <ExhibitViewer
              exhibitId={currentExhibit}
              quality={quality}
              parameters={parameters}
              onMetadataLoaded={handleMetadataLoaded}
            />
            {showControls && exhibitControls.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Controls
                  controls={exhibitControls}
                  values={parameters}
                  onChange={handleParameterChange}
                />
              </motion.div>
            )}
          </Layout>
        </motion.div>
      ) : (
        <motion.div
          key="gallery"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'fixed', inset: 0 }}
        >
          <Gallery onSelectExhibit={handleSelectExhibit} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
