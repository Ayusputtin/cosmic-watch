import * as THREE from "three";



export function mountWatchlistScene(container) {

  const scene = new THREE.Scene();

  scene.fog = new THREE.FogExp2(0x04060f, 0.075);



  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

  camera.position.set(0, 0.1, 9.2);



  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  renderer.setSize(container.clientWidth, container.clientHeight);

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 0.95;

  container.appendChild(renderer.domElement);



  const ambient = new THREE.AmbientLight(0x223355, 0.32);

  scene.add(ambient);



  const key = new THREE.DirectionalLight(0x2ff0c6, 0.55);

  key.position.set(3.0, 1.0, 2.0);

  scene.add(key);



  // Deep-space parallax background (White, Medium, Blinking)
  const makeStars = (count, spreadX, spreadY, zMin, zMax, sizeBase) => {
    const pos = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3 + 0] = (Math.random() - 0.5) * spreadX;
      pos[i3 + 1] = (Math.random() - 0.5) * spreadY;
      pos[i3 + 2] = -(zMin + Math.random() * (zMax - zMin));
      
      scales[i] = sizeBase * (0.8 + Math.random() * 0.4); // Medium variation
      speeds[i] = 1.0 + Math.random() * 3.0; // Blink speed
      offsets[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffffff) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aScale;
        attribute float aSpeed;
        attribute float aOffset;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float blink = 0.6 + 0.4 * sin(uTime * aSpeed + aOffset);
          vAlpha = blink;
          gl_PointSize = aScale * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          float glow = 1.0 - (dist * 2.0);
          glow = pow(glow, 1.5);
          gl_FragColor = vec4(uColor, vAlpha * glow);
        }
      `
    });

    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return { geo, mat, pts };
  };

  // Completely cover the screen: increased count and spread
  const starsNear = makeStars(1500, 180, 100, 10, 40, 1.0); 
  const starsMid = makeStars(2500, 220, 120, 40, 80, 0.8);
  const starsFar = makeStars(3500, 250, 150, 80, 160, 0.6);



  // Subtle Milky Way band (dust)

  const bandCount = 980;

  const bandPos = new Float32Array(bandCount * 3);

  const bandA = new Float32Array(bandCount);

  for (let i = 0; i < bandCount; i++) {

    const i3 = i * 3;

    const x = (Math.random() - 0.5) * 62;

    const y = (Math.random() - 0.5) * 8;

    const z = -(22 + Math.random() * 55);

    bandPos[i3 + 0] = x;

    bandPos[i3 + 1] = y;

    bandPos[i3 + 2] = z;

    bandA[i] = Math.random();

  }

  const bandGeo = new THREE.BufferGeometry();

  bandGeo.setAttribute("position", new THREE.BufferAttribute(bandPos, 3));

  bandGeo.setAttribute("a", new THREE.BufferAttribute(bandA, 1));

  const bandMat = new THREE.ShaderMaterial({

    uniforms: {

      uTime: { value: 0 },

      uColorA: { value: new THREE.Color(0x7ad7ff) },

      uColorB: { value: new THREE.Color(0x2ff0c6) },

      uOpacity: { value: 0.20 },

    },

    transparent: true,

    depthWrite: false,

    blending: THREE.AdditiveBlending,

    vertexShader: `

      attribute float a;

      varying float vA;

      void main() {

        vA = a;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        gl_PointSize = (1.4 + a * 2.6) * (300.0 / -mvPosition.z);

        gl_Position = projectionMatrix * mvPosition;

      }

    `,

    fragmentShader: `

      uniform float uTime;

      uniform vec3 uColorA;

      uniform vec3 uColorB;

      uniform float uOpacity;

      varying float vA;

      void main() {

        vec2 p = gl_PointCoord - vec2(0.5);

        float d = dot(p, p);

        float falloff = smoothstep(0.25, 0.0, d);

        float pulse = 0.55 + 0.45 * sin(uTime * 0.08 + vA * 12.0);

        vec3 col = mix(uColorA, uColorB, vA);

        gl_FragColor = vec4(col, falloff * pulse * uOpacity);

      }

    `,

  });

  const band = new THREE.Points(bandGeo, bandMat);

  band.rotation.z = -0.62;

  band.position.set(-1.6, 1.55, -24);

  scene.add(band);



  // Blinking stars around the Milky Way band

  const blinkCount = 520;

  const blinkPos = new Float32Array(blinkCount * 3);

  const blinkPhase = new Float32Array(blinkCount);

  const blinkAmp = new Float32Array(blinkCount);

  for (let i = 0; i < blinkCount; i++) {

    const i3 = i * 3;

    blinkPos[i3 + 0] = -1.6 + (Math.random() - 0.5) * 18;

    blinkPos[i3 + 1] = 1.55 + (Math.random() - 0.5) * 8.2;

    blinkPos[i3 + 2] = -(18 + Math.random() * 46);

    blinkPhase[i] = Math.random() * Math.PI * 2;

    blinkAmp[i] = 0.25 + Math.random() * 0.75;

  }

  const blinkGeo = new THREE.BufferGeometry();

  blinkGeo.setAttribute("position", new THREE.BufferAttribute(blinkPos, 3));

  blinkGeo.setAttribute("p", new THREE.BufferAttribute(blinkPhase, 1));

  blinkGeo.setAttribute("a", new THREE.BufferAttribute(blinkAmp, 1));

  const blinkMat = new THREE.ShaderMaterial({

    uniforms: {

      uTime: { value: 0 },

      uColor: { value: new THREE.Color(0xe6f6ff) },

      uOpacity: { value: 0.35 },

    },

    transparent: true,

    depthWrite: false,

    blending: THREE.AdditiveBlending,

    vertexShader: `

      attribute float p;

      attribute float a;

      uniform float uTime;

      varying float vTw;

      void main() {

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        float tw = 0.55 + 0.45 * sin(uTime * (0.45 + a * 0.55) + p);

        vTw = tw;

        gl_PointSize = (1.1 + a * 1.8) * tw * (280.0 / -mvPosition.z);

        gl_Position = projectionMatrix * mvPosition;

      }

    `,

    fragmentShader: `

      uniform vec3 uColor;

      uniform float uOpacity;

      varying float vTw;

      void main() {

        vec2 q = gl_PointCoord - vec2(0.5);

        float d = dot(q, q);

        float core = smoothstep(0.22, 0.0, d);

        gl_FragColor = vec4(uColor, core * uOpacity * vTw);

      }

    `,

  });

  const blinkStars = new THREE.Points(blinkGeo, blinkMat);

  blinkStars.rotation.z = band.rotation.z;

  scene.add(blinkStars);



  const orbits = new THREE.Group();

  scene.add(orbits);



  const makePath = (r, tilt, opacity) => {

    const curve = new THREE.EllipseCurve(0, 0, r, r * (0.9 + Math.random() * 0.2), 0, Math.PI * 2);

    const pts = curve.getPoints(220).map((p) => new THREE.Vector3(p.x, 0, p.y));

    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    const mat = new THREE.LineBasicMaterial({

      color: 0x57b9ff,

      transparent: true,

      opacity,

      blending: THREE.AdditiveBlending,

    });

    const line = new THREE.LineLoop(geo, mat);

    line.rotation.x = Math.PI / 2 + tilt;

    line.rotation.z = tilt * 0.6;

    orbits.add(line);

    return { geo, mat, line };

  };



  const paths = [

    makePath(2.2, 0.24, 0.10),

    makePath(3.3, -0.18, 0.07),

    makePath(4.6, 0.12, 0.05),

  ];



  const markerGeo = new THREE.SphereGeometry(0.08, 16, 16);

  const markerMat = new THREE.MeshBasicMaterial({

    color: 0x2ff0c6,

    transparent: true,

    opacity: 0.75,

    depthWrite: false,

    blending: THREE.AdditiveBlending,

  });



  const markers = new Array(9).fill(0).map(() => {

    const m = new THREE.Mesh(markerGeo, markerMat);

    m.userData.r = 2.2 + Math.random() * 2.6;

    m.userData.a = Math.random() * Math.PI * 2;

    m.userData.s = 0.06 + Math.random() * 0.14;

    m.scale.setScalar(m.userData.s);

    scene.add(m);

    return m;

  });



  // Calm asteroid motion system (Slow, steady, non-linear drift)
  const astMax = 16;
  const astGeo = new THREE.IcosahedronGeometry(0.13, 0);
  const astMat = new THREE.MeshStandardMaterial({
    color: 0x9aa4b6,
    roughness: 1,
    metalness: 0,
  });

  const asteroids = [];

  const spawnAsteroid = () => {
    if (asteroids.length >= astMax) return;

    // Spawn anywhere in a wide volume, not just edges
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 12;
    const z = -2 - Math.random() * 8;

    const m = new THREE.Mesh(astGeo, astMat);
    const s = 0.50 + Math.random() * 1.55;
    m.scale.setScalar(s);
    
    m.position.set(x, y, z);
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    // Random slow velocity
    const speed = 0.05 + Math.random() * 0.15;
    const angle = Math.random() * Math.PI * 2;
    m.userData.v = new THREE.Vector3(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      0 // mostly 2D plane movement for visibility
    );
    
    // Add some "drift" parameters for non-linear motion
    m.userData.driftOffset = Math.random() * 100;
    m.userData.driftSpeed = 0.2 + Math.random() * 0.4;
    m.userData.driftAmp = 0.02 + Math.random() * 0.05;

    m.userData.spin = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.1
    );

    m.userData.life = 0;
    scene.add(m);
    asteroids.push(m);
  };

  // Initial spawn
  for(let i=0; i<8; i++) spawnAsteroid();

  let nextSpawn = 0.0;



  const pointer = { x: 0, y: 0 };

  const onPointer = (e) => {

    const rect = container.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;

    const y = (e.clientY - rect.top) / rect.height;

    pointer.x = (x - 0.5) * 2;

    pointer.y = (y - 0.5) * 2;

  };

  window.addEventListener("pointermove", onPointer, { passive: true });



  const clock = new THREE.Clock();

  let raf = 0;



  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(container);

  // Force initial resize check with retries
  setTimeout(resize, 0);
  setTimeout(resize, 100);
  setTimeout(resize, 300);

  resize();

  const tick = () => {
    // Safety check for resize
    if (container.clientWidth > 0 && container.clientHeight > 0 && 
       (renderer.domElement.width === 0 || renderer.domElement.height === 0)) {
      resize();
    }

    const dt = Math.min(clock.getDelta(), 0.033);

    const t = clock.elapsedTime;



    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.20 + Math.sin(t * 0.09) * 0.09, 0.03);

    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointer.y * 0.12 + Math.cos(t * 0.08) * 0.08, 0.03);

    camera.lookAt(0, 0, 0);

    orbits.rotation.y += dt * 0.03;

    // Update stars
    starsNear.mat.uniforms.uTime.value = t;
    starsMid.mat.uniforms.uTime.value = t;
    starsFar.mat.uniforms.uTime.value = t;

    // Background drift + very subtle parallax

    starsNear.pts.position.x = pointer.x * 0.22;

    starsNear.pts.position.y = -pointer.y * 0.16;

    starsMid.pts.position.x = pointer.x * 0.14;

    starsMid.pts.position.y = -pointer.y * 0.10;

    starsFar.pts.position.x = pointer.x * 0.08;

    starsFar.pts.position.y = -pointer.y * 0.06;



    bandMat.uniforms.uTime.value = t;

    band.rotation.z = -0.62 + Math.sin(t * 0.030) * 0.01;

    band.position.x = -1.6 + Math.sin(t * 0.03) * 0.18;

    band.position.y = 1.55 + Math.cos(t * 0.025) * 0.12;



    blinkMat.uniforms.uTime.value = t;

    blinkStars.position.copy(band.position);

    blinkStars.rotation.z = band.rotation.z;



    markers.forEach((m, i) => {

      m.userData.a += dt * (0.22 + i * 0.01);

      m.position.set(Math.cos(m.userData.a) * m.userData.r, (Math.sin((t + i) * 0.7) * 0.18), Math.sin(m.userData.a) * m.userData.r);

      m.material.opacity = 0.55 + Math.sin(t * 1.2 + i) * 0.2;

    });



    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      spawnAsteroid();
      nextSpawn = 2.0 + Math.random() * 4.0;
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.userData.life += dt;
      
      // Add non-linear drift
      const driftX = Math.sin(t * a.userData.driftSpeed + a.userData.driftOffset) * a.userData.driftAmp;
      const driftY = Math.cos(t * a.userData.driftSpeed + a.userData.driftOffset) * a.userData.driftAmp;
      
      a.position.x += a.userData.v.x * dt + driftX;
      a.position.y += a.userData.v.y * dt + driftY;
      a.position.z += a.userData.v.z * dt;

      a.rotation.x += a.userData.spin.x * dt;
      a.rotation.y += a.userData.spin.y * dt;
      a.rotation.z += a.userData.spin.z * dt;

      const out = Math.abs(a.position.x) > 11.0 || Math.abs(a.position.y) > 7.0 || a.userData.life > 60;
      if (out) {
        scene.remove(a);
        asteroids.splice(i, 1);
      }
    }



    renderer.render(scene, camera);

    raf = requestAnimationFrame(tick);

  };



  raf = requestAnimationFrame(tick);



  return () => {

    cancelAnimationFrame(raf);

    ro.disconnect();

    window.removeEventListener("pointermove", onPointer);



    starsNear.geo.dispose();

    starsNear.mat.dispose();

    starsMid.geo.dispose();

    starsMid.mat.dispose();

    starsFar.geo.dispose();

    starsFar.mat.dispose();

    bandGeo.dispose();

    bandMat.dispose();

    blinkGeo.dispose();

    blinkMat.dispose();



    paths.forEach((p) => {

      p.geo.dispose();

      p.mat.dispose();

    });

    markerGeo.dispose();

    markerMat.dispose();



    astGeo.dispose();

    astMat.dispose();

    asteroids.forEach((a) => scene.remove(a));



    renderer.dispose();

    if (renderer.domElement && renderer.domElement.parentNode) {

      renderer.domElement.parentNode.removeChild(renderer.domElement);

    }

  };

}

