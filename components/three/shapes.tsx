"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type Variant =
  | "crystal"
  | "skyline"
  | "gyro"
  | "prism"
  | "knot"
  | "helix"
  | "orbit"
  | "drift"
  | "galaxy"
  | "waves"
  | "embers"
  | "gems";

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

/** Deterministic random numbers, so the field is identical on every render. */
function seeded(start: number) {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** A field of small solids drifting upward and tumbling, deep behind a panel cover. */
function Drift() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 46;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => {
    const rand = seeded(4242);
    return Array.from({ length: N }, () => ({
      x: (rand() - 0.5) * 7,
      y: rand() * 6,
      z: (rand() - 0.5) * 3 - 1,
      s: 0.08 + rand() * 0.2,
      v: 0.15 + rand() * 0.35,
      r: rand() * Math.PI,
      c: Math.floor(rand() * 4),
    }));
  }, []);
  const colors = useMemo(
    () => ["#0b0b10", "#c6ff3d", "#ff3d9a", "#f4f0e6"].map((c) => new THREE.Color(c)),
    [],
  );
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    seeds.forEach((d, i) => m.setColorAt(i, colors[d.c]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [seeds, colors]);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const lift = scrollPhase() * 0.8;
    seeds.forEach((d, i) => {
      const y = ((d.y + t * d.v + lift) % 6) - 3;
      dummy.position.set(d.x + Math.sin(t * 0.5 + i) * 0.15 + pointer.x * 0.3, y, d.z);
      dummy.rotation.set(d.r + t * d.v, d.r * 2 + t * 0.4, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.4} flatShading />
    </instancedMesh>
  );
}

/** A spiral galaxy of coloured points that turns with the page. */
function Galaxy() {
  const g = useRef<THREE.Group>(null);
  const { positions, colors } = useMemo(() => {
    const rand = seeded(777);
    const N = 1700;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const palette = ["#c6ff3d", "#ff3d9a", "#8b5cf6", "#f4f0e6"].map(
      (c) => new THREE.Color(c),
    );
    for (let i = 0; i < N; i++) {
      const arm = i % 3;
      const r = Math.pow(rand(), 0.7) * 3.1;
      const a = r * 1.6 + (arm * Math.PI * 2) / 3 + (rand() - 0.5) * 0.5;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (rand() - 0.5) * 0.35 * (1 - r / 3.4);
      positions[i * 3 + 2] = Math.sin(a) * r;
      const c = palette[(arm + (rand() > 0.85 ? 1 : 0)) % palette.length];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    return { positions, colors };
  }, []);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y += dt * 0.12 + Math.abs(Math.sin(scrollPhase())) * dt * 0.3;
    g.current.rotation.x = 0.9 + pointer.y * 0.2;
    g.current.rotation.z = pointer.x * 0.15;
  });
  return (
    <group ref={g}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.075} vertexColors sizeAttenuation />
      </points>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#f4f0e6" />
      </mesh>
    </group>
  );
}

/** A rolling wireframe sea that swells with the scroll. */
function Waves() {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(14, 6, 48, 18);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const pos = (m.geometry as THREE.PlaneGeometry).attributes.position;
    const t = state.clock.elapsedTime;
    const amp = 0.9 + Math.abs(Math.sin(scrollPhase())) * 0.6;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(
        i,
        (Math.sin(x * 0.8 + t * 1.1) * 0.6 + Math.cos(z * 1.1 + t * 1.3) * 0.4) * amp,
      );
    }
    pos.needsUpdate = true;
    m.rotation.y = pointer.x * 0.15;
  });
  return (
    <mesh ref={mesh} geometry={geo} position={[0, -1.1, 1]} rotation={[0, 0, 0]}>
      <meshBasicMaterial color="#c6ff3d" wireframe transparent opacity={0.75} />
    </mesh>
  );
}

/** Glowing embers that rise across a wide canvas, flickering as they climb. */
function Embers() {
  const pts = useRef<THREE.Points>(null);
  const N = 420;
  const { positions, colors, base } = useMemo(() => {
    const rand = seeded(2024);
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const base = new Float32Array(N * 3);
    const palette = ["#c6ff3d", "#ff3d9a", "#ff5a36", "#f4f0e6"].map(
      (c) => new THREE.Color(c),
    );
    for (let i = 0; i < N; i++) {
      base[i * 3] = (rand() - 0.5) * 26;
      base[i * 3 + 1] = rand() * 5.2;
      base[i * 3 + 2] = (rand() - 0.5) * 2;
      const c = palette[Math.floor(rand() * palette.length)];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    positions.set(base);
    return { positions, colors, base };
  }, []);
  useFrame((state) => {
    const p = pts.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    const pos = (p.geometry as THREE.BufferGeometry).attributes.position;
    for (let i = 0; i < N; i++) {
      const speed = 0.25 + (i % 7) * 0.07;
      const y = ((base[i * 3 + 1] + t * speed) % 5.2) - 2.6;
      pos.setXYZ(
        i,
        base[i * 3] + Math.sin(t * 0.6 + i) * 0.25 + pointer.x * 0.6,
        y,
        base[i * 3 + 2],
      );
    }
    pos.needsUpdate = true;
    (p.material as THREE.PointsMaterial).opacity = 0.65 + Math.sin(t * 3) * 0.12;
  });
  return (
    <points ref={pts} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.7}
      />
    </points>
  );
}

/** Three faceted gems that turn slowly and drift against the cursor. */
function Gems() {
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const grp = g.current;
    if (!grp) return;
    const t = state.clock.elapsedTime;
    grp.children.forEach((m, i) => {
      m.rotation.y += dt * (0.4 + i * 0.25);
      m.rotation.x += dt * (0.25 + i * 0.1);
      m.position.x = (i - 1) * 2.3 + pointer.x * (0.2 + i * 0.1);
      m.position.y = Math.sin(t * 0.9 + i * 2) * 0.25 + pointer.y * 0.15;
    });
  });
  return (
    <group ref={g}>
      <mesh>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#c6ff3d" roughness={0.25} flatShading />
      </mesh>
      <mesh>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#ff3d9a" roughness={0.25} flatShading />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.25} flatShading />
      </mesh>
    </group>
  );
}

const SCENES = {
  embers: Embers,
  gems: Gems,
  galaxy: Galaxy,
  waves: Waves,
  drift: Drift,
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
