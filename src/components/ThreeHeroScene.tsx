import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function createEarthTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#081326";
  ctx.fillRect(0, 0, size, size);

  const noise = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < noise.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    noise.data[i + 0] = v;
    noise.data[i + 1] = v;
    noise.data[i + 2] = v;
    noise.data[i + 3] = 255;
  }
  ctx.putImageData(noise, 0, 0);

  ctx.globalCompositeOperation = "multiply";
  const oceanGrad = ctx.createRadialGradient(size * 0.3, size * 0.3, 40, size * 0.5, size * 0.5, size * 0.75);
  oceanGrad.addColorStop(0, "#0f2c5c");
  oceanGrad.addColorStop(1, "#051022");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 20 + Math.random() * 120;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();

    const land = ctx.createRadialGradient(x, y, 0, x, y, r);
    land.addColorStop(0, "rgba(90, 200, 120, 0.65)");
    land.addColorStop(1, "rgba(30, 90, 60, 0)");
    ctx.fillStyle = land;
    ctx.fill();
  }

  for (let i = 0; i < 140; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 20 + Math.random() * 90;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();

    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    cloud.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = cloud;
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function Rings() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.1;
    group.current.rotation.x += delta * 0.02;
  });

  return (
    <group ref={group}>
      {[1.65, 2.1, 2.6].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2, 0, i * 0.4]}>
          <torusGeometry args={[r, 0.012, 12, 220]} />
          <meshStandardMaterial
            color={i === 0 ? "#00d5ff" : i === 1 ? "#9b4dff" : "#00d5ff"}
            emissive={i === 1 ? "#9b4dff" : "#00d5ff"}
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function Asteroids({ count = 10 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);

  const asteroids = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const radius = 2.0 + Math.random() * 2.2;
      const speed = 0.15 + Math.random() * 0.25;
      const phase = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const tilt = (Math.random() - 0.5) * 0.6;
      const size = 0.03 + Math.random() * 0.09;
      const hue = 25 + Math.random() * 20;
      return { radius, speed, phase, tilt, size, hue };
    });
  }, [count]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();

    group.current.children.forEach((child, idx) => {
      const a = asteroids[idx];
      if (!a) return;
      const angle = t * a.speed + a.phase;
      const x = Math.cos(angle) * a.radius;
      const z = Math.sin(angle) * a.radius;
      const y = Math.sin(angle * 0.7) * a.tilt;

      child.position.set(x, y, z);
      child.rotation.x = angle * 1.4;
      child.rotation.y = angle * 1.7;
    });
  });

  return (
    <group ref={group}>
      {asteroids.map((a, idx) => (
        <mesh key={idx}>
          <icosahedronGeometry args={[a.size, 1]} />
          <meshStandardMaterial
            color={new THREE.Color(`hsl(${a.hue} 35% 55%)`)}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createEarthTexture(), []);

  useFrame((_, delta) => {
    if (!earthRef.current) return;
    earthRef.current.rotation.y += delta * 0.12;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.12, 64, 64]} />
        <meshStandardMaterial map={texture ?? undefined} roughness={0.95} metalness={0.05} />
      </mesh>

      <mesh scale={1.04}>
        <sphereGeometry args={[1.12, 64, 64]} />
        <meshStandardMaterial
          color="#2aa6ff"
          transparent
          opacity={0.08}
          emissive="#2aa6ff"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>

      <mesh scale={1.18}>
        <sphereGeometry args={[1.12, 64, 64]} />
        <meshStandardMaterial
          color="#00d5ff"
          transparent
          opacity={0.05}
          emissive="#00d5ff"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <hemisphereLight intensity={0.75} color="#bfe8ff" groundColor="#12091f" />
      <directionalLight position={[5, 2, 3]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#7b61ff" />

      <Earth />
      <Rings />
      <Asteroids count={12} />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2.2}
        maxDistance={8.0}
        rotateSpeed={0.7}
        zoomSpeed={0.75}
      />
    </>
  );
}

export function ThreeHeroScene() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
