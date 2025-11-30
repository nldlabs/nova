import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { QualityTier, ControlDefinition } from '../exhibits/types';

interface AppState {
  currentExhibit: string | null;
  quality: QualityTier;
  parameters: Record<string, number | boolean | string>;
  showControls: boolean;
  showInfo: boolean;
}

interface AppContextType extends AppState {
  setCurrentExhibit: (id: string | null) => void;
  setQuality: (quality: QualityTier) => void;
  setParameter: (key: string, value: number | boolean | string) => void;
  resetParameters: (controls: ControlDefinition[]) => void;
  toggleControls: () => void;
  toggleInfo: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentExhibit: null,
    quality: 'high',
    parameters: {},
    showControls: false,
    showInfo: false,
  });

  const setCurrentExhibit = useCallback((id: string | null) => {
    setState(s => ({ ...s, currentExhibit: id }));
  }, []);

  const setQuality = useCallback((quality: QualityTier) => {
    setState(s => ({ ...s, quality }));
  }, []);

  const setParameter = useCallback((key: string, value: number | boolean | string) => {
    setState(s => ({
      ...s,
      parameters: { ...s.parameters, [key]: value },
    }));
  }, []);

  const resetParameters = useCallback((controls: ControlDefinition[]) => {
    const defaults: Record<string, number | boolean | string> = {};
    controls.forEach(c => {
      defaults[c.key] = c.defaultValue;
    });
    setState(s => ({ ...s, parameters: defaults }));
  }, []);

  const toggleControls = useCallback(() => {
    setState(s => ({ ...s, showControls: !s.showControls }));
  }, []);

  const toggleInfo = useCallback(() => {
    setState(s => ({ ...s, showInfo: !s.showInfo }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentExhibit,
      setQuality,
      setParameter,
      resetParameters,
      toggleControls,
      toggleInfo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
