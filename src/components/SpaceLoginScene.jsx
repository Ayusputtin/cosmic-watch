import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SpaceLoginScene() {
  const mountRef = useRef(null);
  const rafRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // Lights: build a terminator line by using a strong directional light + faint ambient
    const ambient = new THREE.AmbientLight(0x223355, 0.25);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(4.5, 1.0, 3.0);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x66ccff, 0.35);
    rim.position.set(-4.0, 1.5, -2.0);
    scene.add(rim);

    // Nebula fog + subtle motion via layered sprites
    scene.fog = new THREE.FogExp2(0x05060f, 0.06);

    const loader = new THREE.TextureLoader();

    const makeNebulaSprite = (color, opacity, scale, z) => {
      const tex = loader.load("/textures/universe/nebula.jpg", undefined, undefined, () => {
        // if missing, keep sprite but without map
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const spr = new THREE.Sprite(mat);
      spr.scale.set(scale, scale, 1);
      spr.position.set(0, 0, z);
      scene.add(spr);
      return spr;
    };

    const nebulaA = makeNebulaSprite(0x2244ff, 0.14, 28, -30);
    const nebulaB = makeNebulaSprite(0x00ffcc, 0.09, 36, -45);

    // Volumetric-ish dust field (lightweight Points)
    const dustCount = 1400;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSpeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      dustPositions[i3 + 0] = (Math.random() - 0.5) * 26;
      dustPositions[i3 + 1] = (Math.random() - 0.5) * 16;
      dustPositions[i3 + 2] = -2 - Math.random() * 70;
      dustSpeeds[i] = 0.25 + Math.random() * 0.85;
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xbfd7ff,
      size: 0.03,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Earth
    const earthGeo = new THREE.SphereGeometry(2.15, 64, 64);

    const earthMap = loader.load("/textures/planets/earth_daymap.jpg", undefined, undefined, () => {
      // fallback: keep untextured
    });
    earthMap.colorSpace = THREE.SRGBColorSpace;

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 1,
      metalness: 0,
    });

    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(-0.6, -0.25, 0);
    scene.add(earth);

    // Atmospheric glow
    const atmoGeo = new THREE.SphereGeometry(2.22, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    atmo.position.copy(earth.position);
    scene.add(atmo);

    // Asteroid belt (slow orbit)
    const asteroidCount = 180;
    const astGeo = new THREE.IcosahedronGeometry(0.06, 0);
    const astMat = new THREE.MeshStandardMaterial({
      color: 0x8b94a7,
      roughness: 1,
      metalness: 0,
    });
    const asteroids = new THREE.InstancedMesh(astGeo, astMat, asteroidCount);
    asteroids.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(asteroids);

    const dummy = new THREE.Object3D();
    const belt = new Array(asteroidCount).fill(0).map((_, i) => {
      const a = (i / asteroidCount) * Math.PI * 2;
      const radius = 3.2 + Math.random() * 1.2;
      const y = (Math.random() - 0.5) * 0.65;
      const s = 0.7 + Math.random() * 1.8;
      return { a, radius, y, s, spin: (Math.random() - 0.5) * 0.03 };
    });

    const updateBelt = (t) => {
      for (let i = 0; i < asteroidCount; i++) {
        const b = belt[i];
        const ang = b.a + t * 0.05;
        dummy.position.set(
          earth.position.x + Math.cos(ang) * b.radius,
          earth.position.y + b.y,
          -0.8 + Math.sin(ang) * 0.4
        );
        dummy.rotation.set(ang * 0.3, ang * 0.5, ang * 0.2);
        dummy.scale.setScalar(0.06 * b.s);
        dummy.updateMatrix();
        asteroids.setMatrixAt(i, dummy.matrix);
      }
      asteroids.instanceMatrix.needsUpdate = true;
    };

    // Fast diagonal asteroids (spawn occasionally)
    const fastMax = 10;
    const fastGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const fastMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const streakMat = new THREE.MeshBasicMaterial({
      color: 0x9be7ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fast = [];

    const spawnFast = () => {
      if (fast.length >= fastMax) return;
      const head = new THREE.Mesh(fastGeo, fastMat);
      head.position.set(6 + Math.random() * 2, -3 + Math.random() * 6, -2.5);
      const speed = 9.0 + Math.random() * 8.0;
      const dir = new THREE.Vector3(-1, 0.55 + Math.random() * 0.55, 0).normalize();

      const streakLen = 0.9 + Math.random() * 1.4;
      const streakGeo = new THREE.CylinderGeometry(0.02, 0.06, streakLen, 8, 1, true);
      const streak = new THREE.Mesh(streakGeo, streakMat);
      streak.rotation.z = Math.atan2(dir.y, dir.x) + Math.PI / 2;

      const group = new THREE.Group();
      group.add(streak);
      group.add(head);
      group.position.copy(head.position);

      group.userData.dir = dir;
      group.userData.speed = speed;
      group.userData.life = 0;
      group.userData.streak = streak;
      group.userData.streakGeo = streakGeo;
      scene.add(group);
      fast.push(group);
    };

    const clock = new THREE.Clock();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(mount);
    onResize();

    const onPointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      pointerRef.current.x = (x - 0.5) * 2;
      pointerRef.current.y = (y - 0.5) * 2;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.033);
      const t = clock.elapsedTime;

      // Subtle camera drift + gentle parallax from pointer
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, px * 0.25 + Math.sin(t * 0.12) * 0.12, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -py * 0.18 + Math.cos(t * 0.10) * 0.10, 0.04);
      camera.lookAt(0, 0, 0);

      // Earth rotation
      earth.rotation.y += dt * 0.08;
      atmo.rotation.y += dt * 0.05;

      // Nebula drift
      nebulaA.material.rotation = t * 0.015;
      nebulaB.material.rotation = -t * 0.01;

      // Dust drift toward camera (wrap)
      const posAttr = dustGeo.getAttribute("position");
      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        const z = posAttr.array[i3 + 2] + dustSpeeds[i] * dt * 2.2;
        posAttr.array[i3 + 2] = z > -2 ? -72 - Math.random() * 10 : z;
        posAttr.array[i3 + 0] += Math.sin((t + i) * 0.03) * dt * 0.04;
        posAttr.array[i3 + 1] += Math.cos((t + i) * 0.035) * dt * 0.03;
      }
      posAttr.needsUpdate = true;

      updateBelt(t);

      // Random spawn (not too frequent)
      if (Math.random() < 0.020) spawnFast();

      for (let i = fast.length - 1; i >= 0; i--) {
        const g = fast[i];
        g.userData.life += dt;
        const dir = g.userData.dir;
        const sp = g.userData.speed;
        g.position.x += dir.x * sp * dt;
        g.position.y += dir.y * sp * dt;

        const fade = Math.max(0, 1 - g.userData.life * 0.75);
        g.children.forEach((c) => {
          if (c.material) c.material.opacity = c === g.userData.streak ? 0.22 * fade : 0.7 * fade;
        });

        if (g.position.x < -9 || g.position.y > 8 || g.userData.life > 1.8) {
          scene.remove(g);
          if (g.userData.streakGeo) g.userData.streakGeo.dispose();
          fast.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);

      renderer.dispose();

      // dispose scene assets
      earthGeo.dispose();
      atmoGeo.dispose();
      astGeo.dispose();
      fastGeo.dispose();
      dustGeo.dispose();

      if (earthMat.map) earthMat.map.dispose();
      earthMat.dispose();
      atmoMat.dispose();
      astMat.dispose();
      fastMat.dispose();
      streakMat.dispose();
      dustMat.dispose();

      // nebula textures/materials
      if (nebulaA.material.map) nebulaA.material.map.dispose();
      nebulaA.material.dispose();
      if (nebulaB.material.map) nebulaB.material.map.dispose();
      nebulaB.material.dispose();

      // remove canvas
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      // cleanup stray fast asteroids
      fast.forEach((g) => {
        scene.remove(g);
        if (g.userData && g.userData.streakGeo) g.userData.streakGeo.dispose();
      });
    };
  }, []);

  return <div className="cw-loginScene" ref={mountRef} aria-hidden="true" />;
}
