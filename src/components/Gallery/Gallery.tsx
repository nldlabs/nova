import { useState, useEffect, useMemo, useCallback } from 'react';
import { exhibitPreviews } from '../../exhibits/registry';
import { GalleryBackground } from './GalleryBackground';
import styles from './Gallery.module.css';

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

interface GalleryProps {
  onSelectExhibit: (id: string) => void;
}

// Generate random particles
function useParticles(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const duration = 15 + Math.random() * 10;
      return {
        id: i,
        left: Math.random() * 100,
        // Negative delay starts particles mid-animation (already on screen)
        delay: -Math.random() * duration,
        duration,
        size: 1 + Math.random() * 1.5,
        opacity: 0.4 + Math.random() * 0.4,
      };
    });
  }, [count]);
}

export function Gallery({ onSelectExhibit }: GalleryProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [tappedCard, setTappedCard] = useState<string | null>(null);
  const particles = useParticles(15);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleCardClick = useCallback((id: string) => {
    if (isMobile) {
      // On mobile, show animation first then navigate
      setTappedCard(id);
      setTimeout(() => {
        onSelectExhibit(id);
      }, 400); // Delay to let animation play
    } else {
      onSelectExhibit(id);
    }
  }, [isMobile, onSelectExhibit]);
  
  // Get all previews including coming soon ones
  const allPreviews = Object.entries(exhibitPreviews);
  const availableExhibits = allPreviews.filter(([_, p]) => !p.comingSoon);
  const comingSoonExhibits = allPreviews.filter(([_, p]) => p.comingSoon);
  
  return (
    <>
      <GalleryBackground />
      
      {/* Floating ambient particles */}
      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>
      
      <div className={styles.gallery}>
        <div className={styles.content}>
          <div className={`${styles.header} ${isLoaded ? styles.headerVisible : ''}`}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>NOVA</h1>
            </div>
            <div className={styles.divider} />
            <p className={styles.subtitle}>A GENERATIVE ART GALLERY</p>
          </div>
          
          <div className={styles.exhibits}>
            {availableExhibits.map(([id, preview], index) => (
              <div
                key={id}
                className={`${styles.exhibitCard} ${isLoaded ? styles.cardVisible : ''} ${tappedCard === id ? styles.tapped : ''}`}
                style={{ 
                  transitionDelay: `${index * 100 + 300}ms`,
                  animationDelay: `${index * 0.5}s`
                }}
                onClick={() => handleCardClick(id)}
              >
                <div className={styles.cardGlow} />
                <div className={styles.cardShimmer} />
                <div className={styles.cardContent}>
                  <div className={styles.exhibitNumber}>0{index + 1}</div>
                  <h2 className={styles.exhibitTitle}>{preview.title}</h2>
                  <p className={styles.exhibitDescription}>{preview.description}</p>
                  <div className={styles.enterPrompt}>
                    <span>Enter</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            
            {comingSoonExhibits.map(([id, preview], index) => (
              <div
                key={id}
                className={`${styles.exhibitCard} ${styles.comingSoon} ${isLoaded ? styles.cardVisible : ''}`}
                style={{ transitionDelay: `${(availableExhibits.length + index) * 100 + 300}ms` }}
              >
                <div className={styles.cardContent}>
                  <div className={styles.exhibitNumber}>0{availableExhibits.length + index + 1}</div>
                  <h2 className={styles.exhibitTitle}>{preview.title}</h2>
                  <p className={styles.exhibitDescription}>{preview.description}</p>
                  <span className={styles.comingSoonBadge}>Coming Soon</span>
                </div>
              </div>
            ))}
          </div>
          
          <footer className={`${styles.footer} ${isLoaded ? styles.footerVisible : ''}`}>
            <p>Built with code & curiosity</p>
          </footer>
        </div>
      </div>
    </>
  );
}
