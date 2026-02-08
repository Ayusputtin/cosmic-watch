import * as THREE from "three";







export function mountDashboardScene(container) {



  const scene = new THREE.Scene();



  scene.fog = new THREE.FogExp2(0x050712, 0.055);







  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);



  camera.position.set(0, 0.2, 8.8);







  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });



  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));



  renderer.setSize(container.clientWidth, container.clientHeight);



  renderer.outputColorSpace = THREE.SRGBColorSpace;



  renderer.toneMapping = THREE.ACESFilmicToneMapping;



  renderer.toneMappingExposure = 1.10;



  container.appendChild(renderer.domElement);







  const ambient = new THREE.AmbientLight(0x2a3a55, 0.48);



  scene.add(ambient);







  const key = new THREE.DirectionalLight(0xffffff, 1.25);



  key.position.set(4.2, 1.8, 3.2);



  scene.add(key);







  const rim = new THREE.DirectionalLight(0x57b9ff, 0.34);

  rim.position.set(-4.0, 1.0, -2.5);

  scene.add(rim);

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

  const hudLines = new THREE.Group();



  scene.add(hudLines);







  const makeOrbit = (r, color, opacity) => {



    const geo = new THREE.RingGeometry(r - 0.01, r + 0.01, 160);



    const mat = new THREE.MeshBasicMaterial({



      color,



      transparent: true,



      opacity,



      side: THREE.DoubleSide,



      depthWrite: false,



      blending: THREE.AdditiveBlending,



    });



    const m = new THREE.Mesh(geo, mat);



    m.rotation.x = Math.PI / 2;



    hudLines.add(m);



    return { geo, mat, mesh: m };



  };







  const orbits = [



    makeOrbit(2.3, 0x57b9ff, 0.09),



    makeOrbit(3.2, 0x2ff0c6, 0.06),



    makeOrbit(4.2, 0x57b9ff, 0.05),



  ];







  // Central Earth (Textured)
  const earth = new THREE.Group();
  earth.position.set(0, -0.06, -2.15);
  scene.add(earth);

  const texLoader = new THREE.TextureLoader();
  const earthGeo = new THREE.SphereGeometry(2.22, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    map: texLoader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"),
    specularMap: texLoader.load("https://threejs.org/examples/textures/planets/earth_lights_2048.png"),
    specular: new THREE.Color(0x333333),
    shininess: 15,
  });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earth.add(earthMesh);

  const cloudsGeo = new THREE.SphereGeometry(2.26, 64, 64);
  const cloudsMat = new THREE.MeshLambertMaterial({
    map: texLoader.load("https://threejs.org/examples/textures/planets/earth_clouds_1024.png"),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
  earth.add(clouds);







  const atmoGeo = new THREE.SphereGeometry(2.34, 64, 64);



  const atmoMat = new THREE.ShaderMaterial({



    uniforms: {



      uColor: { value: new THREE.Color(0x57b9ff) },



      uIntensity: { value: 0.70 },



      uPower: { value: 3.2 },



      uOpacity: { value: 0.22 },



    },



    transparent: true,



    blending: THREE.AdditiveBlending,



    depthWrite: false,



    side: THREE.BackSide,



    vertexShader: `



      varying vec3 vNormal;



      varying vec3 vWorldPos;



      void main() {



        vNormal = normalize(normalMatrix * normal);



        vec4 wp = modelMatrix * vec4(position, 1.0);



        vWorldPos = wp.xyz;



        gl_Position = projectionMatrix * viewMatrix * wp;



      }



    `,



    fragmentShader: `



      uniform vec3 uColor;



      uniform float uIntensity;



      uniform float uPower;



      uniform float uOpacity;



      varying vec3 vNormal;



      varying vec3 vWorldPos;



      void main() {



        vec3 viewDir = normalize(cameraPosition - vWorldPos);



        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), uPower);



        float a = fresnel * uIntensity;



        gl_FragColor = vec4(uColor, a * uOpacity);



      }



    `,



  });



  const atmo = new THREE.Mesh(atmoGeo, atmoMat);



  atmo.position.copy(earth.position);



  scene.add(atmo);







  const gridGeo = new THREE.PlaneGeometry(40, 26, 40, 26);



  const gridMat = new THREE.MeshBasicMaterial({



    color: 0x57b9ff,



    transparent: true,



    opacity: 0.035,



    wireframe: true,



    depthWrite: false,



  });



  const grid = new THREE.Mesh(gridGeo, gridMat);



  grid.position.set(0, 0, -12);



  scene.add(grid);







  const dustCount = 1100;



  const dustPositions = new Float32Array(dustCount * 3);



  const dustSpeeds = new Float32Array(dustCount);



  for (let i = 0; i < dustCount; i++) {



    const i3 = i * 3;



    dustPositions[i3 + 0] = (Math.random() - 0.5) * 24;



    dustPositions[i3 + 1] = (Math.random() - 0.5) * 14;



    dustPositions[i3 + 2] = -1 - Math.random() * 60;



    dustSpeeds[i] = 0.3 + Math.random() * 0.9;



  }



  const dustGeo = new THREE.BufferGeometry();



  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));



  const dustMat = new THREE.PointsMaterial({



    color: 0xbfd7ff,



    size: 0.03,



    transparent: true,



    opacity: 0.22,



    depthWrite: false,



    blending: THREE.AdditiveBlending,



  });



  const dust = new THREE.Points(dustGeo, dustMat);



  scene.add(dust);







  // Calm asteroid motion system (spawn from random screen edges)



  const astMax = 14;



  const astGeo = new THREE.IcosahedronGeometry(0.14, 0);



  const astMat = new THREE.MeshStandardMaterial({



    color: 0x9aa4b6,



    roughness: 1,



    metalness: 0,



  });



  const asteroids = [];







  const spawnFromEdge = () => {



    if (asteroids.length >= astMax) return;







    const edge = Math.floor(Math.random() * 8);



    const w = 7.4;



    const h = 4.2;



    const z = -1.2 - Math.random() * 5.5;







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



      (Math.random() - 0.5) * 2.2,



      (Math.random() - 0.5) * 1.4,



      z



    );



    const pos = new THREE.Vector3(x, y, z);



    const dir = target.clone().sub(pos).normalize();



    const speed = 0.25 + Math.random() * 0.55;







    const m = new THREE.Mesh(astGeo, astMat);



    const s = 0.55 + Math.random() * 1.65;



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







  let nextSpawn = 0.8 + Math.random() * 1.8;







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







    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.14 + Math.sin(t * 0.08) * 0.04, 0.03);



    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointer.y * 0.10 + Math.cos(t * 0.07) * 0.03, 0.03);



    camera.lookAt(0, 0, 0);

    // Update stars
    starsNear.mat.uniforms.uTime.value = t;
    starsMid.mat.uniforms.uTime.value = t;
    starsFar.mat.uniforms.uTime.value = t;







    earth.rotation.y += dt * 0.07;
    clouds.rotation.y += dt * 0.035;
    atmo.rotation.y += dt * 0.05;







    hudLines.rotation.z = Math.sin(t * 0.12) * 0.05;







    const posAttr = dustGeo.getAttribute("position");



    for (let i = 0; i < dustCount; i++) {



      const i3 = i * 3;



      const z = posAttr.array[i3 + 2] + dustSpeeds[i] * dt * 2.0;



      posAttr.array[i3 + 2] = z > -1 ? -62 - Math.random() * 10 : z;



    }



    posAttr.needsUpdate = true;







    // Asteroid spawner



    nextSpawn -= dt;



    if (nextSpawn <= 0) {



      spawnFromEdge();



      nextSpawn = 0.9 + Math.random() * 2.4;



    }







    for (let i = asteroids.length - 1; i >= 0; i--) {



      const a = asteroids[i];



      a.userData.life += dt;



      a.position.addScaledVector(a.userData.v, dt * 2.2);



      a.rotation.x += a.userData.spin.x * dt;



      a.rotation.y += a.userData.spin.y * dt;



      a.rotation.z += a.userData.spin.z * dt;







      const out = Math.abs(a.position.x) > 9.2 || Math.abs(a.position.y) > 6.0 || a.userData.life > 24;



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







    orbits.forEach((o) => {



      o.geo.dispose();



      o.mat.dispose();



    });







    earthGeo.dispose();



    cloudsGeo.dispose();



    atmoGeo.dispose();



    earthMat.dispose();



    cloudsMat.dispose();



    atmoMat.dispose();



    if (earthDay) earthDay.dispose();



    if (earthNight) earthNight.dispose();



    if (earthClouds) earthClouds.dispose();



    gridGeo.dispose();



    gridMat.dispose();



    dustGeo.dispose();



    dustMat.dispose();







    astGeo.dispose();



    astMat.dispose();



    asteroids.forEach((a) => scene.remove(a));







    renderer.dispose();



    if (renderer.domElement && renderer.domElement.parentNode) {



      renderer.domElement.parentNode.removeChild(renderer.domElement);



    }



  };



}



