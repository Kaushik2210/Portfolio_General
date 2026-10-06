"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const pointer = { x: 0, y: 0 };

function Knot() {
  const group = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.x += dt * 0.35;
    g.rotation.y += dt * 0.5;
    g.position.x += (pointer.x * 0.6 - g.position.x) * 0.06;
    g.position.y += (pointer.y * 0.4 - g.position.y) * 0.06;
    g.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.03);
  });
  return (
    <group ref={group}>
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
        <meshBasicMaterial color="#0b0b10" wireframe />
      </mesh>
    </group>
  );
}

/** A lime torus knot that turns and leans toward the cursor. Decorative, desktop WebGL only. */
export default function KnotScene() {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    io.observe(el);
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div ref={box} aria-hidden="true" className="pointer-events-none size-full">
      <Canvas
        frameloop={live ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 40 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <Knot />
      </Canvas>
    </div>
  );
}
