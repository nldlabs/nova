import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ExhibitProps } from '../types';

import fragmentShader from './shader.frag?raw';
import vertexShader from './shader.vert?raw';

export function FlowFields({ isActive, parameters }: ExhibitProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, pointer, viewport, gl } = useThree();
  
  // Track smooth mouse for ethereal lag
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const touchPos = useRef(new THREE.Vector2(0.5, 0.5));

  // Handle touch events manually for iOS
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchPos.current.x = (touch.clientX - rect.left) / rect.width;
        touchPos.current.y = 1 - (touch.clientY - rect.top) / rect.height;
      }
    };
    
    canvas.addEventListener('touchstart', handleTouch, { passive: true });
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, [gl]);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_speed: { value: parameters.speed ?? 1.0 },
    u_density: { value: parameters.density ?? 0.5 },
    u_turbulence: { value: parameters.turbulence ?? 3.0 },
    u_colorShift: { value: parameters.colorShift ?? 0.0 },
  }), []);

  useFrame((state) => {
    if (!isActive) return;

    const { clock } = state;
    
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_resolution.value.set(
      size.width * (window.devicePixelRatio || 1), 
      size.height * (window.devicePixelRatio || 1)
    );
    
    // Use pointer for mouse, touchPos for touch (iOS)
    // Check if pointer has moved from origin (0,0) - if not, use touch
    const isTouchDevice = 'ontouchstart' in window;
    let targetX: number, targetY: number;
    
    if (isTouchDevice) {
      targetX = touchPos.current.x;
      targetY = touchPos.current.y;
    } else {
      targetX = (pointer.x + 1) / 2;
      targetY = (pointer.y + 1) / 2;
    }
    
    // Very slow, ethereal mouse follow
    smoothMouse.current.x += (targetX - smoothMouse.current.x) * 0.008;
    smoothMouse.current.y += (targetY - smoothMouse.current.y) * 0.008;
    uniforms.u_mouse.value.copy(smoothMouse.current);

    // Update parameters
    uniforms.u_speed.value = parameters.speed ?? 1.0;
    uniforms.u_density.value = parameters.density ?? 0.5;
    uniforms.u_turbulence.value = parameters.turbulence ?? 3.0;
    uniforms.u_colorShift.value = parameters.colorShift ?? 0.0;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default FlowFields;
