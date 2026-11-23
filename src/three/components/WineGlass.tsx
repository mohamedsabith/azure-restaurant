'use client';

import { MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

export interface PointerState {
  x: number;
  y: number;
}

interface WineGlassProps {
  samples: number;
  resolution: number;
  pointer: RefObject<PointerState>;
  /** How far the section has scrolled through the viewport (0–1): the glass fills as it arrives. */
  progress: RefObject<number>;
  /** Fixed pose, no motion: used for the static fallback render. */
  still: boolean;
}

/* Profile of a universal crystal wine glass, in metres-ish scene units (height 3). */
const FOOT: [number, number][] = [
  [0, 0],
  [0.9, 0],
  [0.935, 0.012],
  [0.93, 0.03],
  [0.6, 0.052],
  [0.24, 0.088],
  [0.085, 0.135],
  [0.05, 0.23],
  [0.041, 0.7],
  [0.043, 1.1],
  [0.058, 1.235],
];
const BOWL_OUT: [number, number][] = [
  [0.058, 1.235],
  [0.2, 1.3],
  [0.45, 1.405],
  [0.665, 1.585],
  [0.8, 1.85],
  [0.848, 2.15],
  [0.83, 2.45],
  [0.762, 2.75],
  [0.684, 3.0],
];
const BOWL_IN: [number, number][] = [
  [0.662, 3.0],
  [0.74, 2.75],
  [0.808, 2.45],
  [0.826, 2.15],
  [0.778, 1.85],
  [0.642, 1.6],
  [0.43, 1.43],
  [0.18, 1.345],
  [0.0, 1.33],
];
export const FILL_HEIGHT = 1.98;
const WINE_PIVOT = 1.66;
const BUFFER_BACKGROUND = new THREE.Color('#141810');

const spline = (pts: [number, number][], n: number) =>
  new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(n);

const EMPTY_HEIGHT = 1.336;
/** The bowl's inner radius at a height, for the wine's surface while it is being poured. */
const INNER = spline(BOWL_IN, 240);
function innerRadius(y: number): number {
  for (let i = 1; i < INNER.length; i += 1) {
    const a = INNER[i - 1]!;
    const b = INNER[i]!;
    if ((a.y - y) * (b.y - y) <= 0) {
      const t = a.y === b.y ? 0 : (y - a.y) / (b.y - a.y);
      return a.x + (b.x - a.x) * t;
    }
  }
  return 0;
}

function glassProfile() {
  const foot = FOOT.map(([x, y]) => new THREE.Vector2(x, y));
  const outer = spline(BOWL_OUT, 90).slice(1);
  // A fine rounded rim joins the outer and inner walls.
  const rim = [
    new THREE.Vector2(0.682, 3.007),
    new THREE.Vector2(0.673, 3.011),
    new THREE.Vector2(0.664, 3.006),
  ];
  const inner = spline(BOWL_IN, 90);
  return [...foot, ...outer, ...rim, ...inner];
}

/** The wine fills the bowl's inside up to FILL_HEIGHT, set a hair inside the glass wall. */
function wineProfile() {
  const inner = spline(BOWL_IN, 240).slice().reverse(); // bottom → top
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 1.334)];
  for (const p of inner) {
    if (p.y <= 1.334) continue;
    if (p.y >= FILL_HEIGHT) break;
    pts.push(new THREE.Vector2(Math.max(0, p.x - 0.006), p.y));
  }
  const last = pts[pts.length - 1] ?? new THREE.Vector2(0.7, FILL_HEIGHT);
  pts.push(new THREE.Vector2(last.x, FILL_HEIGHT), new THREE.Vector2(0, FILL_HEIGHT));
  return pts;
}

/**
 * A crystal wine glass of white wine. The glass is a lathe-turned solid (foot,
 * stem, bowl and a rounded rim, with real wall thickness) in a transmission
 * material that refracts what is behind it, including the wine; the wine is
 * its own lathe volume with a level surface that sways a fraction as the
 * pointer moves.
 */
export function WineGlass({ samples, resolution, pointer, progress, still }: WineGlassProps) {
  const wine = useRef<THREE.Group>(null);
  const glassGroup = useRef<THREE.Group>(null);

  const geometries = useMemo(() => {
    const glass = new THREE.LatheGeometry(glassProfile(), 160);
    const liquid = new THREE.LatheGeometry(wineProfile(), 160);
    return { glass, liquid };
  }, []);

  // White wine has no diffuse colour of its own: it tints what is seen through it
  // (deeper gold where the light crosses more wine, at the edges) and reflects
  // the room off its surface. Two cheap passes: a multiply tint and an additive sheen.
  const pour = useRef(still ? 1 : 0);
  const surface = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Mesh>(null);
  const discGeometry = useMemo(() => new THREE.CircleGeometry(1, 96).rotateX(-Math.PI / 2), []);
  const streamGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.014, 0.02, 1, 16, 1, true).translate(0, 0.5, 0),
    [],
  );

  const wineMaterials = useMemo(() => {
    const tint = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      // Pale straw where the eye looks straight through, deeper gold towards the
      // edges where it crosses more wine; mostly see-through either way.
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float facing = abs(dot(normalize(vNormal), normalize(vView)));
          float depth = pow(1.0 - facing, 1.5);
          vec3 straw = vec3(0.55, 0.4, 0.12);
          vec3 gold = vec3(0.34, 0.19, 0.035);
          gl_FragColor = vec4(mix(straw, gold, depth), mix(0.3, 0.7, depth));
        }`,
    });
    const sheen = new THREE.MeshPhysicalMaterial({
      color: '#000000',
      emissive: new THREE.Color('#d9a441'),
      emissiveIntensity: 0,
      roughness: 0.04,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      envMapIntensity: 0.22,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    // The wine's level while it is poured: everything above it is clipped away.
    const level = new THREE.Plane(new THREE.Vector3(0, -1, 0), FILL_HEIGHT);
    tint.clippingPlanes = [level];
    sheen.clippingPlanes = [level];
    // The crystal's own reflections, redrawn over the wine (which sits on top of
    // the bowl) in the band the wine fills, so the highlights run unbroken.
    const glint = new THREE.MeshPhysicalMaterial({
      color: '#000000',
      roughness: 0,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 1.1,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      clippingPlanes: [
        new THREE.Plane(new THREE.Vector3(0, -1, 0), FILL_HEIGHT + 0.01),
        new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.3),
      ],
    });
    // The surface while pouring (not clipped) and the stream itself.
    const surfaceTint = tint.clone();
    surfaceTint.clippingPlanes = [];
    surfaceTint.side = THREE.DoubleSide;
    const surfaceSheen = sheen.clone();
    surfaceSheen.clippingPlanes = [];
    const stream = new THREE.MeshPhysicalMaterial({
      color: '#d9b45a',
      emissive: new THREE.Color('#b8862c'),
      emissiveIntensity: 0.35,
      roughness: 0.08,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      depthTest: false,
    });
    return { tint, sheen, glint, surfaceTint, surfaceSheen, stream };
  }, []);

  useEffect(
    () => () => {
      geometries.glass.dispose();
      geometries.liquid.dispose();
      discGeometry.dispose();
      streamGeometry.dispose();
      wineMaterials.tint.dispose();
      wineMaterials.sheen.dispose();
      wineMaterials.glint.dispose();
      wineMaterials.surfaceTint.dispose();
      wineMaterials.surfaceSheen.dispose();
      wineMaterials.stream.dispose();
    },
    [geometries, wineMaterials, discGeometry, streamGeometry],
  );

  useFrame((state, delta) => {
    // Pour: the glass fills as the section arrives, a slow stream from above while it does.
    const target = still ? 1 : THREE.MathUtils.clamp(((progress.current ?? 0) - 0.12) / 0.32, 0, 1);
    pour.current = still ? 1 : THREE.MathUtils.damp(pour.current, target, 3, Math.min(delta, 0.05));
    const eased = 1 - (1 - pour.current) ** 2;
    const y = EMPTY_HEIGHT + (FILL_HEIGHT - EMPTY_HEIGHT) * eased;
    const full = pour.current > 0.995;
    // Planes are reached through the scene graph (materials are owned by the meshes).
    const planeOf = (name: string) =>
      ((state.scene.getObjectByName(name) as THREE.Mesh | undefined)?.material as THREE.Material | undefined)
        ?.clippingPlanes?.[0];
    const wineLevel = planeOf('wine-tint');
    if (wineLevel) wineLevel.constant = full ? FILL_HEIGHT + 0.01 : y;
    const glintTop = planeOf('wine-glint');
    if (glintTop) glintTop.constant = (full ? FILL_HEIGHT : y) + 0.01;
    if (surface.current) {
      surface.current.visible = !full && pour.current > 0.01;
      surface.current.position.y = y;
      const r = Math.max(0.001, innerRadius(y) - 0.006);
      surface.current.scale.set(r, 1, r);
    }
    if (stream.current) {
      const pouring = !still && Math.abs(target - pour.current) > 0.004 && pour.current < 0.995;
      stream.current.visible = pouring;
      stream.current.position.y = y;
      stream.current.scale.y = 6 - y;
    }
    if (still) return;
    const ptr = pointer.current ?? { x: 0, y: 0 };
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    // The glass leans a breath towards the pointer; the wine stays almost level.
    const g = glassGroup.current;
    if (g) {
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -ptr.x * 0.035, 2.5, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, ptr.y * 0.02, 2.5, dt);
    }
    const w = wine.current;
    if (w && g) {
      w.rotation.z = -g.rotation.z * 0.85 + Math.sin(t * 1.3) * 0.0035;
      w.rotation.x = -g.rotation.x * 0.85 + Math.cos(t * 1.1) * 0.003;
    }
  });

  return (
    <group ref={glassGroup} scale={[0.86, 1, 0.86]}>
      {/* The wine is kept out of the crystal's refraction buffers (they render the
          scene without blending-friendly ordering) and drawn over the bowl instead. */}
      <WineVisibility name="wine" visible={false} />
      <WineVisibility name="wine-glint" visible={false} />
      <mesh geometry={geometries.glass}>
        <MeshTransmissionMaterial
          samples={samples}
          resolution={resolution}
          transmission={1}
          thickness={0.07}
          roughness={0}
          ior={1.5}
          chromaticAberration={0.03}
          anisotropicBlur={0.02}
          distortion={0}
          backside
          backsideThickness={0.08}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={1.25}
          color="#ffffff"
          background={BUFFER_BACKGROUND}
        />
      </mesh>
      <WineVisibility name="wine" visible />
      <WineVisibility name="wine-glint" visible />
      <mesh name="wine-glint" geometry={geometries.glass} material={wineMaterials.glint} renderOrder={3} />
      <group ref={wine} name="wine" position={[0, WINE_PIVOT, 0]}>
        <group position={[0, -WINE_PIVOT, 0]}>
          <mesh name="wine-tint" geometry={geometries.liquid} material={wineMaterials.tint} renderOrder={1} />
          <mesh geometry={geometries.liquid} material={wineMaterials.sheen} renderOrder={2} />
          <group ref={surface} visible={false}>
            <mesh geometry={discGeometry} material={wineMaterials.surfaceTint} renderOrder={1} />
            <mesh geometry={discGeometry} material={wineMaterials.surfaceSheen} renderOrder={2} />
          </group>
          <mesh
            ref={stream}
            visible={false}
            geometry={streamGeometry}
            material={wineMaterials.stream}
            renderOrder={2}
          />
        </group>
      </group>
    </group>
  );
}

/**
 * useFrame callbacks run in mount order: one instance before the glass's
 * transmission material hides the wine while that material renders its
 * buffers, one after shows it again for the main render.
 */
function WineVisibility({ name, visible }: { name: string; visible: boolean }) {
  useFrame(({ scene }) => {
    const object = scene.getObjectByName(name);
    if (object) object.visible = visible;
  });
  return null;
}
