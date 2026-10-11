'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Precompiles all shaders and materials asynchronously on load (BRIEF.md Part 5.1).
 * Ensures zero shader compilation hitches occur during scroll interaction.
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;

    // Run compileAsync once mounted
    if (gl && scene && camera && typeof gl.compileAsync === 'function') {
      gl.compileAsync(scene, camera)
        .then(() => {
          if (!cancelled) {
            // Precompile complete
          }
        })
        .catch(() => {
          // Fallback gracefully if compileAsync is unsupported
        });
    }

    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);

  return null;
}
