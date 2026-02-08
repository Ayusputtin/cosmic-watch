import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export function ThreeStarfield() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.7} />
        <Stars
          radius={120}
          depth={60}
          count={4000}
          factor={3}
          saturation={0}
          fade
          speed={0.3}
        />
      </Canvas>
    </div>
  );
}
