import * as THREE from "three";



export function mountAlertsScene(container) {

  const scene = new THREE.Scene();

  scene.fog = new THREE.FogExp2(0x07040a, 0.085);



  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

  camera.position.set(0, 0.15, 9.4);



  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  renderer.setSize(container.clientWidth, container.clientHeight);

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 0.95;

  container.appendChild(renderer.domElement);



  const ambient = new THREE.AmbientLight(0x332244, 0.30);

  scene.add(ambient);



  const key = new THREE.DirectionalLight(0xff5068, 0.55);

  key.position.set(3.0, 1.4, 2.0);

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



  // Subtle Milky Way band (dust) tuned to Alerts palette

  const bandCount = 940;

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

      uColorA: { value: new THREE.Color(0xff5f86) },

      uColorB: { value: new THREE.Color(0x8c6bff) },

      uOpacity: { value: 0.16 },

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

        float pulse = 0.55 + 0.45 * sin(uTime * 0.07 + vA * 12.0);

        vec3 col = mix(uColorA, uColorB, vA);

        gl_FragColor = vec4(col, falloff * pulse * uOpacity);

      }

    `,

  });

  const band = new THREE.Points(bandGeo, bandMat);

  band.rotation.z = -0.58;

  band.position.set(-1.8, 1.55, -24);

  scene.add(band);



  // Blinking stars around the Milky Way band

  const blinkCount = 520;

  const blinkPos = new Float32Array(blinkCount * 3);

  const blinkPhase = new Float32Array(blinkCount);

  const blinkAmp = new Float32Array(blinkCount);

  for (let i = 0; i < blinkCount; i++) {

    const i3 = i * 3;

    blinkPos[i3 + 0] = -1.8 + (Math.random() - 0.5) * 18;

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

      uColor: { value: new THREE.Color(0xffe7ef) },

      uOpacity: { value: 0.30 },

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



  const gridGeo = new THREE.PlaneGeometry(44, 30, 44, 30);

  const gridMat = new THREE.MeshBasicMaterial({

    color: 0xff5068,

    transparent: true,

    opacity: 0.03,

    wireframe: true,

    depthWrite: false,

  });

  const grid = new THREE.Mesh(gridGeo, gridMat);

  grid.position.set(0, 0, -12);

  scene.add(grid);



  const radarGeo = new THREE.RingGeometry(1.2, 4.9, 220);

  const radarMat = new THREE.MeshBasicMaterial({

    color: 0xff5068,

    transparent: true,

    opacity: 0.07,

    side: THREE.DoubleSide,

    depthWrite: false,

    blending: THREE.AdditiveBlending,

  });

  const radar = new THREE.Mesh(radarGeo, radarMat);

  radar.rotation.x = Math.PI / 2;

  radar.position.set(0.8, -0.9, -1.2);

  scene.add(radar);



  const sweepGeo = new THREE.CircleGeometry(4.9, 64, 0, Math.PI / 20);

  const sweepMat = new THREE.MeshBasicMaterial({

    color: 0xff5068,

    transparent: true,

    opacity: 0.12,

    side: THREE.DoubleSide,

    depthWrite: false,

    blending: THREE.AdditiveBlending,

  });

  const sweep = new THREE.Mesh(sweepGeo, sweepMat);

  sweep.rotation.x = Math.PI / 2;

  sweep.position.copy(radar.position);

  scene.add(sweep);



  // Calm asteroid motion system (spawn from random screen edges)

  const astMax = 12;

  const astGeo = new THREE.IcosahedronGeometry(0.13, 0);

  const astMat = new THREE.MeshStandardMaterial({

    color: 0x9aa4b6,

    roughness: 1,

    metalness: 0,

  });

  const asteroids = [];



  const spawnFromEdge = () => {

    if (asteroids.length >= astMax) return;



    const edge = Math.floor(Math.random() * 8);

    const w = 7.8;

    const h = 4.6;

    const z = -1.2 - Math.random() * 6.0;



    let x = 0;

    let y = 0;

    if (edge === 0) {

      x = -w;

      y = (Math.random() - 0.5) * h * 2;

    } else if (edge === 1) {

      x = w;

      y = (Math.random() - 0.5) * h * 2;

    } else if (edge === 2) {

      x = (Math.random() - 0.5) * w * 2;

      y = -h;

    } else if (edge === 3) {

      x = (Math.random() - 0.5) * w * 2;

      y = h;

    } else if (edge === 4) {

      x = -w;

      y = -h;

    } else if (edge === 5) {

      x = w;

      y = -h;

    } else if (edge === 6) {

      x = -w;

      y = h;

    } else {

      x = w;

      y = h;

    }



    const target = new THREE.Vector3(

      (Math.random() - 0.5) * 2.4,

      (Math.random() - 0.5) * 1.6,

      z

    );

    const pos = new THREE.Vector3(x, y, z);

    const dir = target.clone().sub(pos).normalize();

    const speed = 0.22 + Math.random() * 0.52;



    const m = new THREE.Mesh(astGeo, astMat);

    const s = 0.45 + Math.random() * 1.55;

    m.scale.setScalar(s);

    m.position.copy(pos);

    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    m.userData.v = dir.multiplyScalar(speed);

    m.userData.spin = new THREE.Vector3(

      (Math.random() - 0.5) * 0.5,

      (Math.random() - 0.5) * 0.6,

      (Math.random() - 0.5) * 0.4

    );

    m.userData.life = 0;

    scene.add(m);

    asteroids.push(m);

  };



  let nextSpawn = 0.8 + Math.random() * 2.3;



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

  setTimeout(resize, 0);
  setTimeout(resize, 100);
  resize();

  const tick = () => {
    if (container.clientWidth > 0 && container.clientHeight > 0 && 
       (renderer.domElement.width === 0 || renderer.domElement.height === 0)) {
      resize();
    }
    const dt = Math.min(clock.getDelta(), 0.033);

    const t = clock.elapsedTime;



    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.18 + Math.sin(t * 0.08) * 0.08, 0.03);

    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointer.y * 0.12 + Math.cos(t * 0.07) * 0.07, 0.03);

    camera.lookAt(0, 0, 0);



    starsNear.mat.uniforms.uTime.value = t;
    starsMid.mat.uniforms.uTime.value = t;
    starsFar.mat.uniforms.uTime.value = t;

    starsNear.pts.position.x = pointer.x * 0.22;

    starsNear.pts.position.y = -pointer.y * 0.14;

    starsMid.pts.position.x = pointer.x * 0.13;

    starsMid.pts.position.y = -pointer.y * 0.09;

    starsFar.pts.position.x = pointer.x * 0.08;

    starsFar.pts.position.y = -pointer.y * 0.06;



    bandMat.uniforms.uTime.value = t;

    band.rotation.z = -0.58 + Math.sin(t * 0.030) * 0.01;

    band.position.x = -1.8 + Math.sin(t * 0.03) * 0.16;

    band.position.y = 1.55 + Math.cos(t * 0.024) * 0.10;



    blinkMat.uniforms.uTime.value = t;

    blinkStars.position.copy(band.position);

    blinkStars.rotation.z = band.rotation.z;



    radar.rotation.z += dt * 0.05;

    sweep.rotation.z += dt * 0.9;

    sweep.material.opacity = 0.08 + Math.sin(t * 2.0) * 0.03;



    nextSpawn -= dt;

    if (nextSpawn <= 0) {

      spawnFromEdge();

      nextSpawn = 1.0 + Math.random() * 2.6;

    }



    for (let i = asteroids.length - 1; i >= 0; i--) {

      const a = asteroids[i];

      a.userData.life += dt;

      a.position.addScaledVector(a.userData.v, dt * 2.0);

      a.rotation.x += a.userData.spin.x * dt;

      a.rotation.y += a.userData.spin.y * dt;

      a.rotation.z += a.userData.spin.z * dt;



      const out = Math.abs(a.position.x) > 9.3 || Math.abs(a.position.y) > 6.2 || a.userData.life > 26;

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



    gridGeo.dispose();

    gridMat.dispose();

    radarGeo.dispose();

    radarMat.dispose();

    sweepGeo.dispose();

    sweepMat.dispose();



    astGeo.dispose();

    astMat.dispose();

    asteroids.forEach((a) => scene.remove(a));



    renderer.dispose();

    if (renderer.domElement && renderer.domElement.parentNode) {

      renderer.domElement.parentNode.removeChild(renderer.domElement);

    }

  };

}

