'use client';

import { Environment, Lightformer, MeshReflectorMaterial, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { colors } from '@/theme/tokens';
import type { QualitySettings } from './capabilities';
import { WineGlass, type PointerState } from './components/WineGlass';

interface InstallationCanvasProps {
  quality: QualitySettings;
  active: boolean;
  progress: RefObject<number>;
  pointer: RefObject<PointerState>;
  onReady: () => void;
  onFailure: (reason: 'context-lost' | 'performance') => void;
}

/** Where the camera looks: a little below the middle of the bowl. */
const TARGET = new THREE.Vector3(0, 1.42, 0);

/**
 * A glass of white wine on a lacquered table, after dark, with the dining room
 * melting into candle-light behind it. Lighting is a procedural studio
 * (Lightformers rendered once into the environment map), so no HDR files are
 * downloaded. Rendering stops entirely when the section is off-screen.
 */
export default function InstallationCanvas({
  quality,
  active,
  progress,
  pointer,
  onReady,
  onFailure,
}: InstallationCanvasProps) {
  const [dpr, setDpr] = useState<number>(quality.dpr[1]);
  const room = useRoomTexture();

  return (
    <Canvas
      aria-hidden
      dpr={dpr}
      // The capture render draws a fixed number of frames on demand: software rasterisers take seconds per frame.
      frameloop={quality.capture ? 'demand' : active ? 'always' : 'never'}
      camera={{ fov: 26, position: [0, 2.1, 11], near: 0.1, far: 60 }}
      gl={{
        antialias: quality.antialias,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: quality.capture,
      }}
      onCreated={(state) => {
        const { gl } = state;
        gl.localClippingEnabled = true;
        // No tone mapping: the room seen through the crystal must match the room seen beside it exactly.
        gl.toneMapping = THREE.NoToneMapping;

        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => {
            event.preventDefault();
            onFailure('context-lost');
          },
          { once: true },
        );
        // Two frames: the first compiles shaders, the second is the real image.
        if (!quality.capture) requestAnimationFrame(() => requestAnimationFrame(onReady));
      }}
    >
      <color attach="background" args={[colors.forest]} />
      <fog attach="fog" args={[colors.forest, 10, 21]} />
      {!quality.capture && (
        <PerformanceMonitor
          bounds={() => [42, 58]}
          flipflops={3}
          onDecline={() => setDpr((current) => Math.max(1, current - 0.5))}
          onIncline={() => setDpr((current) => Math.min(quality.dpr[1], current + 0.25))}
          onFallback={() => onFailure('performance')}
        />
      )}

      <Environment resolution={quality.envResolution} frames={1}>
        <color attach="background" args={['#0d0f0a']} />
        {/* A long overhead softbox draws the rim and the meniscus. */}
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#fff6e6"
          position={[0, 7, 1]}
          rotation-x={Math.PI / 2}
          scale={[6, 2.5, 1]}
        />
        {/* Two tall warm strips give the bowl its long vertical highlights. */}
        <Lightformer
          form="rect"
          intensity={5}
          color="#ffe9c7"
          position={[-4, 2, 3]}
          rotation-y={Math.PI / 3}
          scale={[0.5, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#fff3df"
          position={[4.5, 2, 2]}
          rotation-y={-Math.PI / 2.8}
          scale={[0.35, 8, 1]}
        />
        {/* The room itself, so the crystal reflects the same candle-light that is seen behind it. */}
        <mesh position={[0, 1.5, -7]}>
          <planeGeometry args={[22, 12]} />
          <meshBasicMaterial map={room} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.5, 9]} rotation-y={Math.PI}>
          <planeGeometry args={[22, 12]} />
          <meshBasicMaterial map={room} toneMapped={false} color="#8a8a8a" />
        </mesh>
      </Environment>

      {quality.capture && <CaptureFrames frames={6} onDone={onReady} />}
      <CameraRig progress={progress} pointer={pointer} still={quality.capture} />
      <Room texture={room} />
      <Table reflector={quality.reflector} />

      <WineGlass
        samples={quality.samples}
        resolution={quality.resolution}
        pointer={pointer}
        progress={progress}
        still={quality.capture}
      />
      <GlassShadow />
    </Canvas>
  );
}

/** Renders a fixed number of frames (environment, shadows and refraction settle), then reports ready. */
function CaptureFrames({ frames, onDone }: { frames: number; onDone: () => void }) {
  const invalidate = useThree((state) => state.invalidate);
  const count = useRef(0);
  useEffect(() => invalidate(), [invalidate]);
  useFrame(() => {
    count.current += 1;
    if (count.current < frames) invalidate();
    else if (count.current === frames) requestAnimationFrame(onDone);
  });
  return null;
}

/**
 * The camera drifts a few degrees around the glass as the section scrolls by and
 * leans towards the pointer; the environment turns with the pointer so the
 * highlights slide across the crystal. Framing adapts to the stage's aspect.
 */
function CameraRig({
  progress,
  pointer,
  still,
}: {
  progress: RefObject<number>;
  pointer: RefObject<PointerState>;
  still: boolean;
}) {
  const { camera, size } = useThree();
  const look = useMemo(() => TARGET.clone(), []);

  useFrame(({ scene }, delta) => {
    const aspect = size.width / Math.max(1, size.height);
    // The glass (3 units tall) takes a little over half the frame's height, with room to breathe across.
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const fitHeight = 5.4 / (2 * Math.tan(fov / 2));
    const fitWidth = 3.4 / (2 * Math.tan(fov / 2) * aspect);
    const distance = Math.max(fitHeight, fitWidth);

    const p = still ? 0.5 : (progress.current ?? 0.5);
    const ptr = still ? { x: 0, y: 0 } : (pointer.current ?? { x: 0, y: 0 });
    const angle = (p - 0.5) * 0.7 + ptr.x * 0.12;
    const height = 2.05 - (p - 0.5) * 0.5 - ptr.y * 0.12;
    const target = new THREE.Vector3(Math.sin(angle) * distance, height, Math.cos(angle) * distance);

    if (still) camera.position.copy(target);
    else camera.position.lerp(target, 1 - Math.exp(-3 * Math.min(delta, 0.05)));
    camera.lookAt(look);

    const envTarget = -0.35 + ptr.x * 0.9;
    scene.environmentRotation.y = still
      ? -0.35
      : THREE.MathUtils.damp(scene.environmentRotation.y, envTarget, 2, Math.min(delta, 0.05));
  });
  return null;
}

/**
 * The dining room behind the glass, out of focus: warm pools of candle and
 * lamp light on deep green, painted once into a texture.
 */
function useRoomTexture() {
  const texture = useMemo(() => paintRoom(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function paintRoom() {
  const w = 1600;
  const h = 900;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, colors.forest);
    base.addColorStop(0.5, '#22281b');
    base.addColorStop(1, colors.forest);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // A broad warm glow from the open kitchen, behind and above the glass.
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.36);
    glow.addColorStop(0, 'rgba(214,160,92,0.2)');
    glow.addColorStop(0.5, 'rgba(150,110,60,0.07)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Bokeh: candles and table lamps across the room, a seeded layout so every render matches.
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.filter = 'blur(2px)';
    for (let i = 0; i < 46; i += 1) {
      const x = w * (0.1 + rand() * 0.8);
      // A band of light at the glass's height, so the wine and the bowl both refract it.
      const y = h * (0.34 + rand() * 0.3);
      const r = 6 + rand() * rand() * 30;
      const warm = rand();
      const tint = warm > 0.7 ? '255,226,170' : warm > 0.3 ? '240,176,98' : '214,140,70';
      const alpha = 0.12 + rand() * 0.32;
      const disc = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
      disc.addColorStop(0, `rgba(${tint},${alpha})`);
      disc.addColorStop(0.82, `rgba(${tint},${alpha * 0.8})`);
      disc.addColorStop(1, `rgba(${tint},0)`);
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = 'none';

    // Fade the bottom edge into the table's horizon.
    const floor = ctx.createLinearGradient(0, h * 0.6, 0, h * 0.71);
    floor.addColorStop(0, 'rgba(29,34,24,0)');
    floor.addColorStop(1, colors.forest);
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
    // And the top and sides into the section's ground, so the stage has no visible frame.
    const top = ctx.createLinearGradient(0, 0, 0, h * 0.34);
    top.addColorStop(0, colors.forest);
    top.addColorStop(1, 'rgba(29,34,24,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, h * 0.34);
    for (const [x0, x1] of [
      [0, w * 0.16],
      [w, w * 0.84],
    ] as const) {
      const side = ctx.createLinearGradient(x0, 0, x1, 0);
      side.addColorStop(0, colors.forest);
      side.addColorStop(1, 'rgba(29,34,24,0)');
      ctx.fillStyle = side;
      ctx.fillRect(Math.min(x0, x1), 0, w * 0.16, h);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function Room({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh position={[0, 3.4, -11]}>
      <planeGeometry args={[26, 14.6]} />
      <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
    </mesh>
  );
}

/** Dark lacquered oak: a blurred mirror on capable devices, a satin surface otherwise. */
function Table({ reflector }: { reflector: boolean }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      {reflector ? (
        <MeshReflectorMaterial
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={2.2}
          mixContrast={1}
          mirror={0.6}
          roughness={0.85}
          metalness={0.2}
          depthScale={0.6}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.6}
          color="#1a1d14"
        />
      ) : (
        <meshStandardMaterial color="#1a1d14" roughness={0.45} metalness={0.15} />
      )}
    </mesh>
  );
}

/**
 * What a glass actually leaves on a table under a low lamp: a faint, soft
 * shadow and a thin crescent of focused light (the caustic) thrown forward by
 * the bowl. Painted once; cheaper and steadier than a shadow pass.
 */
function GlassShadow() {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const c = size / 2;
      const shadow = ctx.createRadialGradient(c, c * 0.92, 0, c, c * 0.92, c * 0.62);
      shadow.addColorStop(0, 'rgba(0,0,0,0.55)');
      shadow.addColorStop(0.55, 'rgba(0,0,0,0.25)');
      shadow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, size, size);
      ctx.save();
      ctx.filter = 'blur(6px)';
      ctx.translate(c, c * 1.22);
      ctx.scale(1, 0.42);
      ctx.strokeStyle = 'rgba(255,214,150,0.5)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(0, 0, c * 0.36, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.restore();
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0.25]} renderOrder={-1}>
      <planeGeometry args={[3.4, 3.4]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
