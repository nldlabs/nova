import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import fragmentShader from './background.frag?raw';
import vertexShader from './background.vert?raw';

function BackgroundMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
  }), []);

  useFrame((state) => {
    uniforms.u_time.value = state.clock.getElapsedTime();
    uniforms.u_resolution.value.set(
      size.width * (window.devicePixelRatio || 1),
      size.height * (window.devicePixelRatio || 1)
    );
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

export function GalleryBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas 
        camera={{ position: [0, 0, 1] }} 
        gl={{ antialias: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <BackgroundMesh />
      </Canvas>
    </div>
  );
}
