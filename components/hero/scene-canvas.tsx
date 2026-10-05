"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useRole, useTheme } from "@/lib/prefs";
import type { Role } from "@/lib/types";
import { buildField } from "./network";
import { sceneState } from "./scene-state";
import { linesFragment, linesVertex, pointsFragment, pointsVertex } from "./shaders";

const POINTS = 5200;
const GROUP_X = 2.0;
const GROUP_Y = 0.25;

/** [primary, secondary] per theme/role, matching design/tokens.md. Built once, not per frame. */
const HEX: Record<"dark" | "light", Record<Role, [string, string]>> = {
  dark: {
    sde: ["#ff5a36", "#ece8e1"],
    data: ["#6ee7d8", "#ece8e1"],
    ai: ["#ffa17c", "#6ee7d8"],
  },
  light: {
    sde: ["#d93a17", "#101216"],
    data: ["#0b7a6f", "#101216"],
    ai: ["#a85a2e", "#0b7a6f"],
  },
};
const PALETTE = Object.fromEntries(
  Object.entries(HEX).map(([theme, roles]) => [
    theme,
    Object.fromEntries(
      Object.entries(roles).map(([role, [a, b]]) => [
        role,
        [new THREE.Color(a), new THREE.Color(b)],
      ]),
    ),
  ]),
) as Record<"dark" | "light", Record<Role, [THREE.Color, THREE.Color]>>;

const pointer = { x: 0, y: 0 };

function Field() {
  const [theme] = useTheme();
  const [role] = useRole();
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => buildField(POINTS), []);

  const pointsMat = useRef<THREE.ShaderMaterial>(null);
  const linesMat = useRef<THREE.ShaderMaterial>(null);

  // Initial uniform objects only; every later write goes through the material refs.
  const pointUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 22 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
    }),
    [],
  );
  const lineUniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uScroll: { value: 0 },
      uColor: { value: new THREE.Color() },
    }),
    [],
  );

  useFrame((state, delta) => {
    const pm = pointsMat.current;
    const lm = linesMat.current;
    if (!pm || !lm) return;
    const u = pm.uniforms;
    const { progress, scroll } = sceneState;

    u.uTime.value += delta;
    u.uProgress.value = THREE.MathUtils.damp(u.uProgress.value, progress, 4, delta);
    u.uScroll.value = THREE.MathUtils.damp(u.uScroll.value, scroll, 6, delta);
    u.uPixelRatio.value = state.gl.getPixelRatio();

    // Colour eases toward the active (or previewed) role instead of snapping.
    const [colA, colB] = PALETTE[theme][sceneState.role ?? role];
    const k = 1 - Math.exp(-6 * delta);
    u.uColorA.value.lerp(colA, k);
    u.uColorB.value.lerp(colB, k);
    lm.uniforms.uColor.value.copy(u.uColorA.value);
    lm.uniforms.uProgress.value = u.uProgress.value;
    lm.uniforms.uScroll.value = u.uScroll.value;

    // Pointer in the field's local plane (viewport is world size at z = 0).
    u.uMouse.value.set(
      pointer.x * (state.viewport.width / 2) - GROUP_X,
      pointer.y * (state.viewport.height / 2) - GROUP_Y,
    );

    const g = group.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.18, 3, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.1, 3, delta);
    }
  });

  const additive = theme === "dark";

  return (
    <group ref={group} position={[GROUP_X, GROUP_Y, 0]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[geo.scattered, 3]} />
          <bufferAttribute attach="attributes-aTarget" args={[geo.targets, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[geo.seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={pointsMat}
          vertexShader={pointsVertex}
          fragmentShader={pointsFragment}
          uniforms={pointUniforms}
          transparent
          depthWrite={false}
          blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[geo.lines, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={linesMat}
          vertexShader={linesVertex}
          fragmentShader={linesFragment}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/** Renders only while on screen and the tab is visible. */
export default function SceneCanvas() {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0,
    });
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
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={onScreen && tabVisible ? "always" : "never"}
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      >
        <Field />
      </Canvas>
    </div>
  );
}
