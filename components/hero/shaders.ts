export const pointsVertex = /* glsl */ `
  uniform float uTime;
  uniform float uProgress; // 0 = noise, 1 = structure
  uniform float uScroll;   // 0 = in view, 1 = scrolled away
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;     // world-space pointer in the field's local plane
  uniform float uBurst;    // 1 right after a click, decays to 0
  uniform vec2 uBurstPos;  // where the click landed
  attribute vec3 aTarget;
  attribute float aSeed;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    float t = uTime;
    vec3 drift = vec3(
      sin(t * 0.30 + aSeed * 40.0),
      cos(t * 0.25 + aSeed * 27.0),
      sin(t * 0.20 + aSeed * 13.0)
    ) * 0.18;

    // Structure forms with a per-point delay so the lattice resolves, not snaps.
    float k = smoothstep(aSeed * 0.35, 0.65 + aSeed * 0.35, uProgress);
    vec3 p = mix(position + drift, aTarget + drift * 0.08, k);

    // Scrolling away dissolves the structure back into noise.
    p += normalize(position + 0.001) * uScroll * (1.2 + aSeed);

    // Cursor pushes nearby points away and lifts them toward the camera.
    vec2 d = p.xy - uMouse;
    float f = exp(-dot(d, d) * 2.2);
    p.xy += normalize(d + vec2(0.0001)) * f * 0.42;
    p.z += f * 0.5;

    // Click shockwave: a ring that expands outward and throws points off the lattice.
    vec2 bd = p.xy - uBurstPos;
    float ring = exp(-pow(length(bd) - (1.0 - uBurst) * 5.5, 2.0) * 2.2) * uBurst;
    p.xy += normalize(bd + vec2(0.0001)) * ring * 0.9;
    p.z += ring * 0.9;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + f * 1.6 + ring * 2.2) * (1.0 + k * 0.25) / -mv.z;

    vSeed = aSeed;
    vAlpha = (0.35 + 0.65 * k) * (1.0 - uScroll) * (0.55 + 0.45 * f + 0.45 * aSeed + ring * 0.9);
  }
`;

export const pointsFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.0, r);
    vec3 col = mix(uColorA, uColorB, step(0.72, vSeed));
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

export const linesVertex = /* glsl */ `
  uniform float uProgress;
  uniform float uScroll;
  varying float vAlpha;

  void main() {
    vAlpha = smoothstep(0.55, 1.0, uProgress) * (1.0 - uScroll) * 0.22;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const linesFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;
