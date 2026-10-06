"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { crystalFragment, crystalVertex } from "./blob-shaders";
import { sceneState } from "./scene-state";

const pointer = { x: 0, y: 0 };

/** Star dust: a thin shell of points around the crystal. */
function dust(count: number) {
  // Seeded so the shell is identical on every load and render stays pure.
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.4 + rand() * 2.2;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    a[i * 3] = r * Math.sin(ph) * Math.cos(th);
    a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    a[i * 3 + 2] = r * Math.cos(ph);
  }
  return a;
}

function Crystal() {
  const group = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const stars = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const starPos = useMemo(() => dust(700), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uMouse: { value: new THREE.Vector3(0, 0, 1) },
      uA: { value: new THREE.Color("#c6ff3d") },
      uB: { value: new THREE.Color("#ff3d9a") },
      uC: { value: new THREE.Color("#8b5cf6") },
    }),
    [],
  );

  useFrame((_, delta) => {
    const m = mat.current;
    const g = group.current;
    if (!m || !g) return;
    const s = sceneState.scroll;

    m.uniforms.uTime.value += delta;
    // Louder and bigger as the visitor scrolls the pinned hero.
    m.uniforms.uAmp.value = THREE.MathUtils.damp(
      m.uniforms.uAmp.value,
      0.22 + s * 0.55,
      4,
      delta,
    );
    (m.uniforms.uMouse.value as THREE.Vector3)
      .set(pointer.x * 1.1, pointer.y * 1.1, 0.8)
      .normalize();

    const targetScale = 1 + s * 2.6;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetScale, 5, delta));
    g.rotation.y += delta * 0.18 + s * 0.02;
    g.rotation.x = THREE.MathUtils.damp(
      g.rotation.x,
      -pointer.y * 0.25 + s * 0.9,
      3,
      delta,
    );

    if (ringA.current) ringA.current.rotation.z += delta * 0.35;
    if (ringB.current) ringB.current.rotation.x += delta * 0.28;
    if (stars.current) stars.current.rotation.y -= delta * 0.03;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.45, 28]} />
        <shaderMaterial
          ref={mat}
          vertexShader={crystalVertex}
          fragmentShader={crystalFragment}
          uniforms={uniforms}
        />
      </mesh>
      <mesh ref={ringA} rotation={[1.2, 0.2, 0]}>
        <torusGeometry args={[2.35, 0.012, 8, 160]} />
        <meshBasicMaterial color="#c6ff3d" />
      </mesh>
      <mesh ref={ringB} rotation={[0.3, 1.1, 0.4]}>
        <torusGeometry args={[2.85, 0.01, 8, 160]} />
        <meshBasicMaterial color="#ff3d9a" />
      </mesh>
      <points ref={stars} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color="#f4f0e6"
          sizeAttenuation
          transparent
          opacity={0.75}
        />
      </points>
    </group>
  );
}

/** Renders only while on screen and the tab is visible. */
export default function Blob() {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onVis = () => setTabVisible(!document.hidden);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={onScreen && tabVisible ? "always" : "never"}
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      >
        <Crystal />
      </Canvas>
    </div>
  );
}
