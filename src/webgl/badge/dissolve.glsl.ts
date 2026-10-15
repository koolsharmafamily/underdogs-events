/**
 * Dissolve shader chunk per BRIEF.md Part 5.2
 *
 * Implements 3D simplex noise in badge-root space (so the pattern sticks to the badge
 * and stays continuous across its meshes, whatever their node transforms or Meshopt
 * quantisation),
 * discard logic based on uRole (0: outgoing, 1: incoming), and glowing edge emission.
 */

import * as THREE from "three";

export interface DissolveUniforms {
  /** Inverse world matrix of the badge root, shared by every skin and updated each frame. */
  uBadgeInverse: { value: THREE.Matrix4 };
  uDissolve: { value: number };
  uRole: { value: number };
  uEdgeColor: { value: THREE.Color };
  uEdgeIntensity: { value: number };
  uEdgeWidth: { value: number };
}

export const NOISE_3D_GLSL = `
// Simplex 3D noise generator
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
`;

/**
 * Injects dissolve logic into any standard Three.js material.
 */
export function injectDissolve(
  material: THREE.Material,
  uniforms: DissolveUniforms,
) {
  material.customProgramCacheKey = function () {
    // All skins use identical shader source; uniforms carry skin differences.
    return "underdogs_dissolve_v3";
  };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBadgeInverse = uniforms.uBadgeInverse;
    shader.uniforms.uDissolve = uniforms.uDissolve;
    shader.uniforms.uRole = uniforms.uRole;
    shader.uniforms.uEdgeColor = uniforms.uEdgeColor;
    shader.uniforms.uEdgeIntensity = uniforms.uEdgeIntensity;
    shader.uniforms.uEdgeWidth = uniforms.uEdgeWidth;

    // Vertex shader injection: pass the badge-root space position
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
       uniform mat4 uBadgeInverse;
       varying vec3 vObjPos;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
       vec4 dissolvePosition = vec4(transformed, 1.0);
       #ifdef USE_BATCHING
         dissolvePosition = batchingMatrix * dissolvePosition;
       #endif
       #ifdef USE_INSTANCING
         dissolvePosition = instanceMatrix * dissolvePosition;
       #endif
       vObjPos = (uBadgeInverse * modelMatrix * dissolvePosition).xyz;`,
    );

    // Fragment shader injection: noise sampling & discard & edge glow
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
       varying vec3 vObjPos;
       uniform float uDissolve;
       uniform float uRole;
       uniform vec3 uEdgeColor;
       uniform float uEdgeIntensity;
       uniform float uEdgeWidth;
       ${NOISE_3D_GLSL}`,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
       if (uDissolve >= -0.05 && uDissolve <= 1.05) {
         float n = snoise(vObjPos * 3.5) * 0.5 + 0.5;
         float d = n - uDissolve;
         if (uRole < 0.5) {
           if (d < 0.0) discard;
         } else {
           if (d > 0.0) discard;
         }
         float edge = 1.0 - smoothstep(0.0, uEdgeWidth, abs(d));
         gl_FragColor.rgb += uEdgeColor * edge * uEdgeIntensity;
       }`,
    );
  };
}
