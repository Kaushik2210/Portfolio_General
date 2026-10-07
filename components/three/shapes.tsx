"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type Variant =
  "crystal" | "skyline" | "gyro" | "prism" | "knot" | "helix" | "orbit";

const pointer = { x: 0, y: 0 };

/** Scroll position as a slow, always-moving phase so shapes react to the page, not just time. */
const scrollPhase = () => (typeof window === "undefined" ? 0 : window.scrollY * 0.0016);

const INK = "#0b0b10";

function Crystal() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y += dt * 0.4;
    g.current.rotation.x = Math.sin(scrollPhase()) * 0.6 + pointer.y * 0.4;
    g.current.rotation.z = pointer.x * 0.3;
  });
  return (
    <group ref={g}>
      <mesh>
        <dodecahedronGeometry args={[1.25, 0]} />
        <meshStandardMaterial color="#ff3d9a" roughness={0.3} flatShading />
      </mesh>
      <mesh scale={1.35}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={INK} wireframe />
      </mesh>
      <mesh scale={0.5}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#c6ff3d" flatShading />
      </mesh>
    </group>
  );
}

/** A grid of columns that rise and fall in a travelling wave, like a contribution skyline. */
function Skyline() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 9;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime * 1.2 + scrollPhase() * 4;
    let i = 0;
    for (let x = 0; x < N; x++) {
      for (let z = 0; z < N; z++) {
        const h = 0.25 + (Math.sin(t + x * 0.7) + Math.cos(t * 0.8 + z * 0.9) + 2) * 0.35;
        dummy.position.set((x - N / 2) * 0.42, h / 2 - 0.5, (z - N / 2) * 0.42);
        dummy.scale.set(0.32, h, 0.32);
        dummy.updateMatrix();
        m.setMatrixAt(i++, dummy.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  });
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y += dt * 0.25;
    g.current.rotation.x = 0.55 + pointer.y * 0.15;
  });
  return (
    <group ref={g}>
      <instancedMesh ref={ref} args={[undefined, undefined, N * N]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c8320f" roughness={0.4} />
      </instancedMesh>
    </group>
  );
}

/** Three nested rings turning on different axes, a gyroscope. */
function Gyro() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const c = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const s = 1 + Math.abs(Math.sin(scrollPhase())) * 1.5;
    if (a.current) a.current.rotation.x += dt * 0.7 * s;
    if (b.current) b.current.rotation.y += dt * 0.9 * s;
    if (c.current) c.current.rotation.z += dt * 1.1 * s;
  });
  return (
    <group rotation={[pointer.y * 0.4, pointer.x * 0.4, 0]}>
      <mesh ref={a}>
        <torusGeometry args={[1.5, 0.07, 16, 80]} />
        <meshStandardMaterial color="#c6ff3d" />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[1.15, 0.07, 16, 80]} />
        <meshStandardMaterial color="#ff3d9a" />
      </mesh>
      <mesh ref={c}>
        <torusGeometry args={[0.8, 0.07, 16, 80]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#f4f0e6" />
      </mesh>
    </group>
  );
}

/** A tumbling twisted prism with a hard ink outline. */
function Prism() {
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!g.current) return;
    g.current.rotation.x += dt * 0.5;
    g.current.rotation.y += dt * 0.35 + pointer.x * dt;
    g.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
  });
  return (
    <group ref={g}>
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.35} />
      </mesh>
      <mesh scale={1.02}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial color={INK} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]} scale={0.95}>
        <torusGeometry args={[1.3, 0.1, 12, 60]} />
        <meshStandardMaterial color="#c6ff3d" />
      </mesh>
    </group>
  );
}

/** A lime torus knot with an ink wireframe shell. */
function Knot() {
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!g.current) return;
    g.current.rotation.x += dt * 0.35;
    g.current.rotation.y += dt * 0.5;
    g.current.position.x += (pointer.x * 0.6 - g.current.position.x) * 0.06;
    g.current.position.y += (pointer.y * 0.4 - g.current.position.y) * 0.06;
    g.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.03);
  });
  return (
    <group ref={g} scale={0.9}>
      <mesh>
        <torusKnotGeometry args={[1, 0.34, 220, 24, 2, 3]} />
        <meshStandardMaterial
          color="#c6ff3d"
          roughness={0.25}
          metalness={0.2}
          flatShading
        />
      </mesh>
      <mesh scale={1.06}>
        <torusKnotGeometry args={[1, 0.34, 90, 10, 2, 3]} />
        <meshBasicMaterial color={INK} wireframe />
      </mesh>
    </group>
  );
}

/** A double helix of beads that twists further the more the page has scrolled. */
function Helix() {
  const g = useRef<THREE.Group>(null);
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 28;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m || !g.current) return;
    g.current.rotation.y += dt * 0.5;
    g.current.rotation.z = 0.35 + pointer.x * 0.2;
    const twist = 0.5 + Math.sin(scrollPhase() * 0.7) * 0.25;
    let i = 0;
    for (let k = 0; k < N; k++) {
      const y = (k / (N - 1) - 0.5) * 3.6;
      const a = k * twist + state.clock.elapsedTime * 0.8;
      for (const side of [0, Math.PI]) {
        dummy.position.set(Math.cos(a + side) * 0.9, y, Math.sin(a + side) * 0.9);
        dummy.scale.setScalar(0.17 + 0.05 * Math.sin(a * 2));
        dummy.updateMatrix();
        m.setMatrixAt(i++, dummy.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={g}>
      <instancedMesh ref={ref} args={[undefined, undefined, N * 2]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial color="#ff3d9a" roughness={0.3} />
      </instancedMesh>
    </group>
  );
}

/** A planet with a ring and three moons on different orbits. */
function Orbit() {
  const moons = useRef<THREE.Group>(null);
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + scrollPhase() * 2;
    moons.current?.children.forEach((m, i) => {
      const a = t * (0.9 + i * 0.5) + i * 2.1;
      const R = 1.5 + i * 0.35;
      m.position.set(Math.cos(a) * R, Math.sin(a * 0.7 + i) * 0.5, Math.sin(a) * R);
    });
    if (g.current) {
      g.current.rotation.x = 0.4 + pointer.y * 0.3;
      g.current.rotation.y = pointer.x * 0.4;
    }
  });
  return (
    <group ref={g}>
      <mesh>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshStandardMaterial color="#6ee7d8" roughness={0.35} flatShading />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.35, 0.035, 12, 90]} />
        <meshBasicMaterial color={INK} />
      </mesh>
      <group ref={moons}>
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#c6ff3d" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.19, 16, 16]} />
          <meshStandardMaterial color="#ff3d9a" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </group>
    </group>
  );
}

const SCENES = {
  helix: Helix,
  orbit: Orbit,
  knot: Knot,
  crystal: Crystal,
  skyline: Skyline,
  gyro: Gyro,
  prism: Prism,
} as const;

/** One lightweight canvas per section. Renders only while visible, DPR capped. */
export default function Shape({
  variant,
  active = true,
}: {
  variant: Variant;
  active?: boolean;
}) {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
    };
  }, []);

  const Scene = SCENES[variant];
  return (
    <div aria-hidden="true" className="pointer-events-none size-full">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.5], fov: 40 }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <Scene />
      </Canvas>
    </div>
  );
}
