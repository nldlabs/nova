import type { ControlDefinition } from '../../exhibits/types';
import styles from './Controls.module.css';

interface ControlsProps {
  controls: ControlDefinition[];
  values: Record<string, number | boolean | string>;
  onChange: (key: string, value: number | boolean | string) => void;
}

export function Controls({ controls, values, onChange }: ControlsProps) {
  return (
    <div className={styles.controlsPanel}>
      <div className={styles.title}>Parameters</div>
      {controls.map(control => (
        <div key={control.key} className={styles.control}>
          {control.type === 'slider' && (
            <>
              <div className={styles.label}>
                <span>{control.label}</span>
                <span className={styles.value}>
                  {typeof values[control.key] === 'number' 
                    ? (values[control.key] as number).toFixed(control.step && control.step >= 1 ? 0 : 1)
                    : values[control.key]}
                </span>
              </div>
              <input
                type="range"
                className={styles.slider}
                min={control.min}
                max={control.max}
                step={control.step}
                value={values[control.key] as number}
                onChange={(e) => onChange(control.key, parseFloat(e.target.value))}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
