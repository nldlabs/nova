import { type ReactNode, useState, useEffect } from 'react';
import type { ExhibitMetadata } from '../../exhibits/types';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  exhibitMetadata: ExhibitMetadata | null;
  showControls: boolean;
  showInfo: boolean;
  onToggleControls: () => void;
  onToggleInfo: () => void;
  onGoHome: () => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

export function Layout({
  children,
  exhibitMetadata,
  showControls,
  showInfo,
  onToggleControls,
  onToggleInfo,
  onGoHome,
}: LayoutProps) {
  const isMobile = useIsMobile();
  
  // On mobile, hide info when controls are open to prevent overlap
  const shouldShowInfo = showInfo && exhibitMetadata && !(isMobile && showControls);
  
  return (
    <>
      {children}
      
      <header className={styles.header}>
        <div className={styles.logo} onClick={onGoHome}>
          NOVA
        </div>
        
        <nav className={styles.nav}>
          <button
            className={`${styles.navButton} ${showInfo ? styles.active : ''}`}
            onClick={onToggleInfo}
            aria-label="Toggle Info"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
          <button
            className={`${styles.navButton} ${showControls ? styles.active : ''}`}
            onClick={onToggleControls}
            aria-label="Toggle Controls"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
            </svg>
          </button>
          <button
            className={styles.navButton}
            onClick={onGoHome}
            aria-label="Go Home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </nav>
      </header>
      
      {shouldShowInfo && (
        <div className={styles.exhibitInfo}>
          <h1 className={styles.exhibitTitle}>{exhibitMetadata.title}</h1>
          <p className={styles.exhibitDescription}>{exhibitMetadata.description}</p>
        </div>
      )}
      
      <div className={styles.hint}>
        <kbd>ESC</kbd> to return · <kbd>C</kbd> controls · <kbd>I</kbd> info
      </div>
    </>
  );
}
