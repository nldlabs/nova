import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ExhibitProps } from '../types';

import fragmentShader from './shader.frag?raw';
import vertexShader from './shader.vert?raw';

export function Tessellations({ isActive, parameters }: ExhibitProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, pointer, viewport } = useThree();
  
  // Smooth mouse tracking
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_speed: { value: parameters.speed ?? 1.0 },
    u_symmetry: { value: parameters.symmetry ?? 0.5 },
    u_zoom: { value: parameters.zoom ?? 3.0 },
    u_colorShift: { value: parameters.colorShift ?? 0.0 },
    u_complexity: { value: parameters.complexity ?? 0.5 },
  }), []);

  useFrame((state) => {
    if (!isActive) return;

    const { clock } = state;
    
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_resolution.value.set(
      size.width * (window.devicePixelRatio || 1), 
      size.height * (window.devicePixelRatio || 1)
    );
    
    // Smooth mouse follow
    const targetX = (pointer.x + 1) / 2;
    const targetY = (pointer.y + 1) / 2;
    smoothMouse.current.x += (targetX - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (targetY - smoothMouse.current.y) * 0.05;
    uniforms.u_mouse.value.copy(smoothMouse.current);

    // Update parameters
    uniforms.u_speed.value = parameters.speed ?? 1.0;
    uniforms.u_symmetry.value = parameters.symmetry ?? 0.5;
    uniforms.u_zoom.value = parameters.zoom ?? 3.0;
    uniforms.u_colorShift.value = parameters.colorShift ?? 0.0;
    uniforms.u_complexity.value = parameters.complexity ?? 0.5;
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

export default Tessellations;
