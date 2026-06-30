'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame }            from '@react-three/fiber'
import * as THREE                       from 'three'

// ─── Shaders ─────────────────────────────────────────────────────────────────

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = (position.xy + 1.0) * 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const frag = /* glsl */ `
varying vec2 vUv;
uniform float uTime;

const vec3 cDeep = vec3(0.031, 0.082, 0.176);  // #08152C — derin kraliyet laciverd
const vec3 cNavy = vec3(0.059, 0.141, 0.310);  // #0F244F — zengin kraliyet laciverd
const vec3 cWisp = vec3(0.157, 0.294, 0.580);  // #284B94 — safir mavi duman
const vec3 cGold = vec3(0.784, 0.576, 0.208);  // #C89235 — çok ince altın kıvılcım

// ── Noise ─────────────────────────────────────────────────────────────────────
float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 17.5);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),             hash(i + vec2(1,0)), u.x),
    mix(hash(i+vec2(0,1)),   hash(i + vec2(1,1)), u.x),
    u.y
  );
}

// ── FBM — 5 oktav, hafif rotasyonla desen tekrarını kırar ────────────────────
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2  rot = mat2(0.8660, 0.5, -0.5, 0.8660); // 30° rotasyon
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p  = rot * p * 2.1 + vec2(1.7, 9.2);
    a *= 0.48;
  }
  return v;
}

void main() {
  float t = uTime * 0.07;            // çok yavaş, ağır duman
  vec2  p = vUv * vec2(2.2, 1.8);

  // Yavaş sürüklenme — sağa ve hafifçe yukarı
  p += vec2(t * 0.18, -t * 0.25);

  // Domain warp 1. tur — büyük duman kıvrımları
  vec2 q = vec2(
    fbm(p               + t * 0.10),
    fbm(p + vec2(5.2, 1.3) + t * 0.08)
  );

  // Domain warp 2. tur — daha ince organik bükülme
  vec2 r = vec2(
    fbm(p + 3.0*q + vec2(1.7, 9.2) + t * 0.06),
    fbm(p + 3.0*q + vec2(8.3, 2.8) + t * 0.05)
  );

  float f = fbm(p + 2.8 * r);

  // Renk haritası
  float n   = smoothstep(0.28, 0.82, f);
  vec3  col = mix(cDeep, cNavy, n);

  // Safir duman kıvrımları — geniş, yumuşak geçişli
  float wisp = smoothstep(0.60, 1.0, f) * 0.50;
  col = mix(col, cWisp, wisp);

  // Altın kıvılcım — sadece en parlak tepe noktalarda, çok ince
  float gold = smoothstep(0.84, 1.0, f) * 0.22;
  col = mix(col, cGold, gold);

  // Kenar vignette
  float vig = 1.0 - smoothstep(0.40, 1.30, length((vUv - 0.5) * vec2(1.5, 1.7)));
  col *= 0.42 + 0.58 * vig;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

// ─── Inner mesh ───────────────────────────────────────────────────────────────

function SmokePane() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  useFrame(({ clock }) => {
    matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function HeroWebGL() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 1] }}
      >
        <SmokePane />
      </Canvas>
    </div>
  )
}
