"use client";
// Adapted from @react-three/drei 10.7.9 core/MeshReflectorMaterial (MIT,
// Poimandres). One change: the reflection is only rendered while the floor is
// actually on screen. drei renders it every frame from useFrame whatever the
// mesh's visibility, so a hidden world's floor cost ~32 draw calls a frame.
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  DepthFormat,
  DepthTexture,
  HalfFloatType,
  LinearFilter,
  Matrix4,
  PerspectiveCamera,
  Plane,
  UnsignedShortType,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  type Object3D,
} from "three";
import { extend, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { BlurPass } from "@react-three/drei/materials/BlurPass";
import { MeshReflectorMaterial as MeshReflectorMaterialImpl } from "@react-three/drei/materials/MeshReflectorMaterial";

extend({ MeshReflectorMaterialImpl });

type ReflectorProps = Omit<ThreeElements["meshStandardMaterial"], "args"> & {
  resolution?: number;
  blur?: [number, number] | number;
  mixBlur?: number;
  mixStrength?: number;
  mirror?: number;
  minDepthThreshold?: number;
  maxDepthThreshold?: number;
  depthScale?: number;
  depthToBlurRatioBias?: number;
  distortion?: number;
  mixContrast?: number;
  reflectorOffset?: number;
  onBeforeCompile?: MeshReflectorMaterialImpl["onBeforeCompile"];
};

function shownInScene(object: Object3D) {
  for (let o: Object3D | null = object; o; o = o.parent) if (!o.visible) return false;
  return true;
}

export function Reflector({
  mixBlur = 0,
  mixStrength = 1,
  resolution = 256,
  blur = [0, 0],
  minDepthThreshold = 0.9,
  maxDepthThreshold = 1,
  depthScale = 0,
  depthToBlurRatioBias = 0.25,
  mirror = 0,
  distortion = 1,
  mixContrast = 1,
  reflectorOffset = 0,
  ...props
}: ReflectorProps) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const [blurX, blurY] = Array.isArray(blur) ? blur : [blur, blur];
  const hasBlur = blurX + blurY > 0;
  const materialRef = useRef<MeshReflectorMaterialImpl & { __r3f?: { parent?: { object?: Object3D } } }>(null);
  const [s] = useState(() => ({
    reflectorPlane: new Plane(),
    normal: new Vector3(),
    reflectorWorldPosition: new Vector3(),
    cameraWorldPosition: new Vector3(),
    rotationMatrix: new Matrix4(),
    lookAtPosition: new Vector3(0, 0, -1),
    clipPlane: new Vector4(),
    view: new Vector3(),
    target: new Vector3(),
    q: new Vector4(),
    textureMatrix: new Matrix4(),
    virtualCamera: new PerspectiveCamera(),
  }));

  const mesh = () => materialRef.current?.__r3f?.parent?.object ?? null;

  const beforeRender = useCallback(
    (parent: Object3D) => {
      const { reflectorPlane, normal, reflectorWorldPosition, cameraWorldPosition, rotationMatrix, lookAtPosition, clipPlane, view, target, q, textureMatrix, virtualCamera } = s;
      reflectorWorldPosition.setFromMatrixPosition(parent.matrixWorld);
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
      rotationMatrix.extractRotation(parent.matrixWorld);
      normal.set(0, 0, 1).applyMatrix4(rotationMatrix);
      reflectorWorldPosition.addScaledVector(normal, reflectorOffset);
      view.subVectors(reflectorWorldPosition, cameraWorldPosition);
      if (view.dot(normal) > 0) return false; // facing away
      view.reflect(normal).negate().add(reflectorWorldPosition);
      rotationMatrix.extractRotation(camera.matrixWorld);
      lookAtPosition.set(0, 0, -1).applyMatrix4(rotationMatrix).add(cameraWorldPosition);
      target.subVectors(reflectorWorldPosition, lookAtPosition).reflect(normal).negate().add(reflectorWorldPosition);
      virtualCamera.position.copy(view);
      virtualCamera.up.set(0, 1, 0).applyMatrix4(rotationMatrix).reflect(normal);
      virtualCamera.lookAt(target);
      virtualCamera.far = camera.far;
      virtualCamera.updateMatrixWorld();
      virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
      textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
      textureMatrix.multiply(virtualCamera.projectionMatrix).multiply(virtualCamera.matrixWorldInverse).multiply(parent.matrixWorld);
      // Oblique near-plane clipping (Lengyel).
      reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
      reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);
      clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);
      const e = virtualCamera.projectionMatrix.elements;
      q.x = (Math.sign(clipPlane.x) + e[8]) / e[0];
      q.y = (Math.sign(clipPlane.y) + e[9]) / e[5];
      q.z = -1;
      q.w = (1 + e[10]) / e[14];
      clipPlane.multiplyScalar(2 / clipPlane.dot(q));
      e[2] = clipPlane.x;
      e[6] = clipPlane.y;
      e[10] = clipPlane.z + 1;
      e[14] = clipPlane.w;
      return true;
    },
    [camera, reflectorOffset, s],
  );

  const [fbo1, fbo2, blurpass, reflectorProps] = useMemo(() => {
    const parameters = { minFilter: LinearFilter, magFilter: LinearFilter, type: HalfFloatType };
    const fbo1 = new WebGLRenderTarget(resolution, resolution, parameters);
    fbo1.depthBuffer = true;
    fbo1.depthTexture = new DepthTexture(resolution, resolution);
    fbo1.depthTexture.format = DepthFormat;
    fbo1.depthTexture.type = UnsignedShortType;
    const fbo2 = new WebGLRenderTarget(resolution, resolution, parameters);
    const blurpass = new BlurPass({ gl, resolution, width: blurX, height: blurY, minDepthThreshold, maxDepthThreshold, depthScale, depthToBlurRatioBias });
    const reflectorProps = {
      mirror,
      textureMatrix: s.textureMatrix,
      mixBlur,
      tDiffuse: fbo1.texture,
      tDepth: fbo1.depthTexture,
      tDiffuseBlur: fbo2.texture,
      hasBlur,
      mixStrength,
      minDepthThreshold,
      maxDepthThreshold,
      depthScale,
      depthToBlurRatioBias,
      distortion,
      mixContrast,
      "defines-USE_BLUR": hasBlur ? "" : undefined,
      "defines-USE_DEPTH": depthScale > 0 ? "" : undefined,
    };
    return [fbo1, fbo2, blurpass, reflectorProps] as const;
  }, [gl, blurX, blurY, s, resolution, mirror, hasBlur, mixBlur, mixStrength, minDepthThreshold, maxDepthThreshold, depthScale, depthToBlurRatioBias, distortion, mixContrast]);

  useFrame(() => {
    const parent = mesh();
    if (!parent || !shownInScene(parent)) return;
    if (!beforeRender(parent)) return;
    parent.visible = false;
    const xr = gl.xr.enabled;
    const shadowAuto = gl.shadowMap.autoUpdate;
    gl.xr.enabled = false;
    gl.shadowMap.autoUpdate = false;
    gl.setRenderTarget(fbo1);
    gl.state.buffers.depth.setMask(true);
    if (!gl.autoClear) gl.clear();
    gl.render(scene, s.virtualCamera);
    if (hasBlur) blurpass.render(gl, fbo1, fbo2);
    gl.xr.enabled = xr;
    gl.shadowMap.autoUpdate = shadowAuto;
    parent.visible = true;
    gl.setRenderTarget(null);
  });

  return (
    <meshReflectorMaterialImpl
      attach="material"
      key={"key" + reflectorProps["defines-USE_BLUR"] + reflectorProps["defines-USE_DEPTH"]}
      ref={materialRef as never}
      {...reflectorProps}
      {...props}
    />
  );
}
