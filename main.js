
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const $ = (id) => document.getElementById(id);

const planets = [
  {
    name: "Mercury", number: "01", kicker: "THE SWIFT PLANET",
    summary: "A small, cratered world racing around the Sun with almost no atmosphere to retain heat.",
    radius: "2,440", distance: "57.9", period: "88", moons: "0",
    color: 0x9b928a, size: 0.35, orbit: 4.2, speed: 0.95, texture: "rocky"
  },
  {
    name: "Venus", number: "02", kicker: "THE VEILED PLANET",
    summary: "A volcanic world wrapped in thick clouds, with a surface hot enough to melt lead.",
    radius: "6,052", distance: "108.2", period: "224.7", moons: "0",
    color: 0xd5a56c, size: 0.52, orbit: 6.2, speed: 0.72, texture: "venus"
  },
  {
    name: "Earth", number: "03", kicker: "THE BLUE MARBLE",
    summary: "Our pale blue home, the only known world to harbour life.",
    radius: "6,371", distance: "149.6", period: "365.25", moons: "1",
    color: 0x347fd4, size: 0.57, orbit: 8.4, speed: 0.52, texture: "earth"
  },
  {
    name: "Mars", number: "04", kicker: "THE RED PLANET",
    summary: "A cold desert world shaped by ancient rivers, immense volcanoes, and dusty storms.",
    radius: "3,390", distance: "227.9", period: "687", moons: "2",
    color: 0xc7664d, size: 0.44, orbit: 10.8, speed: 0.39, texture: "mars"
  },
  {
    name: "Jupiter", number: "05", kicker: "KING OF THE PLANETS",
    summary: "A gas giant with colossal storms, powerful magnetic fields, and a family of icy moons.",
    radius: "69,911", distance: "778.6", period: "11.86 years", moons: "95*",
    color: 0xc99e7b, size: 1.15, orbit: 14.1, speed: 0.24, texture: "jupiter"
  },
  {
    name: "Saturn", number: "06", kicker: "THE RINGED GIANT",
    summary: "A low-density gas giant surrounded by a brilliant system of icy rings.",
    radius: "58,232", distance: "1,433.5", period: "29.45 years", moons: "146*",
    color: 0xd8bd88, size: 0.96, orbit: 17.8, speed: 0.17, texture: "saturn"
  },
  {
    name: "Uranus", number: "07", kicker: "THE ICE GIANT",
    summary: "A pale-blue ice giant that rotates on its side in the distant outer solar system.",
    radius: "25,362", distance: "2,872.5", period: "84 years", moons: "28*",
    color: 0x83d9df, size: 0.73, orbit: 21.0, speed: 0.12, texture: "uranus"
  },
  {
    name: "Neptune", number: "08", kicker: "THE WINDY GIANT",
    summary: "A distant blue world known for its powerful winds and extremely cold atmosphere.",
    radius: "24,622", distance: "4,495.1", period: "165 years", moons: "16*",
    color: 0x4776ec, size: 0.71, orbit: 24.2, speed: 0.095, texture: "neptune"
  }
];

let scene;
let camera;
let renderer;
let controls;
let sun;
let sunGlow;
let starField;
let planetObjects = [];
let orbitObjects = [];
let labelObjects = [];
let selectedPlanet = "Earth";
let isPaused = false;
let showOrbits = true;
let showLabels = true;
let animationFrame = 0;
let clock;

const sceneElement = $("scene");
const loadingElement = $("loading");

function makePlanetTexture(type, baseColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  const base = new THREE.Color(baseColor);

  const rgb = {
    r: Math.round(base.r * 255),
    g: Math.round(base.g * 255),
    b: Math.round(base.b * 255)
  };

  ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === "earth") {
    ctx.fillStyle = "#173f38";

    for (let i = 0; i < 75; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const w = 12 + Math.random() * 65;
      const h = 6 + Math.random() * 35;

      ctx.beginPath();
      ctx.ellipse(x, y, w, h, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(105, 180, 111, .75)";

    for (let i = 0; i < 55; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        Math.random() * 256,
        5 + Math.random() * 28,
        3 + Math.random() * 12,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "rgba(240, 248, 255, .85)";
    ctx.fillRect(0, 0, 512, 14);
    ctx.fillRect(0, 242, 512, 14);
  } else if (["jupiter", "saturn", "venus"].includes(type)) {
    const colors = type === "jupiter"
      ? ["#b98762", "#e4c6a1", "#8b604c", "#f0ddbd", "#9f7258"]
      : type === "saturn"
        ? ["#d7bd91", "#f0dfb9", "#ad9167", "#e8d3a7"]
        : ["#d8ae6f", "#f0d6a1", "#b77e4c", "#e8c28a"];

    for (let y = 0; y < 256; y += 9 + Math.random() * 17) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.45 + Math.random() * 0.45;
      ctx.fillRect(0, y, 512, 6 + Math.random() * 17);
    }

    ctx.globalAlpha = 1;

    if (type === "jupiter") {
      ctx.fillStyle = "#a9513d";
      ctx.beginPath();
      ctx.ellipse(350, 155, 32, 15, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 230, 196, .6)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  } else if (type === "neptune" || type === "uranus") {
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = type === "neptune"
        ? "rgba(160, 195, 255, .14)"
        : "rgba(220, 255, 255, .2)";
      ctx.fillRect(0, Math.random() * 256, 512, 1 + Math.random() * 4);
    }
  } else {
    for (let i = 0; i < 1600; i++) {
      const shade = Math.floor(90 + Math.random() * 120);
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, .25)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 256, 1 + Math.random() * 4, 1 + Math.random() * 4);
    }

    if (type === "mars") {
      ctx.fillStyle = "rgba(75, 32, 25, .45)";

      for (let i = 0; i < 35; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStars() {
  const count = 3200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 180;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xc8ddff,
    size: 0.11,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  starField = new THREE.Points(geometry, material);
  scene.add(starField);
}

function createSun() {
  const geometry = new THREE.SphereGeometry(1.65, 48, 48);

  const material = new THREE.MeshBasicMaterial({
    color: 0xffc36b
  });

  sun = new THREE.Mesh(geometry, material);
  scene.add(sun);

  const glowMaterial = new THREE.SpriteMaterial({
    map: createGlowTexture(),
    color: 0xffa54c,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  sunGlow = new THREE.Sprite(glowMaterial);
  sunGlow.scale.set(8, 8, 1);
  scene.add(sunGlow);

  const sunLight = new THREE.PointLight(0xffd5a0, 240, 110);
  scene.add(sunLight);

  scene.add(new THREE.AmbientLight(0x8294c8, 1.5));
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);

  gradient.addColorStop(0, "rgba(255, 220, 150, 0.9)");
  gradient.addColorStop(0.25, "rgba(255, 165, 75, 0.35)");
  gradient.addColorStop(1, "rgba(255, 120, 40, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

function createOrbit(radius) {
  const points = [];
  const segments = 180;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x41577d,
    transparent: true,
    opacity: 0.48
  });

  const orbit = new THREE.LineLoop(geometry, material);
  scene.add(orbit);
  orbitObjects.push(orbit);
}

function createPlanetLabel(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;

  const ctx = canvas.getContext("2d");
  ctx.font = "24px monospace";
  ctx.fillStyle = "#d9e8ff";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase(), 128, 38);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });

  const label = new THREE.Sprite(material);
  label.scale.set(2.4, 0.6, 1);
  label.visible = showLabels;

  scene.add(label);
  labelObjects.push(label);

  return label;
}

function createSaturnRings(planet) {
  const geometry = new THREE.RingGeometry(
    planet.size * 1.25,
    planet.size * 2.05,
    80
  );

  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const radius = Math.sqrt(x * x + y * y);

    uvs.setXY(i, radius / (planet.size * 2.05), 0.5);
  }

  const material = new THREE.MeshBasicMaterial({
    color: 0xcdb58c,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });

  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = -Math.PI / 2.35;
  return ring;
}

function createPlanet(planet) {
  createOrbit(planet.orbit);

  const geometry = new THREE.SphereGeometry(planet.size, 40, 40);
  const texture = makePlanetTexture(planet.texture, planet.color);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.88,
    metalness: 0.02
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.planetName = planet.name;
  scene.add(mesh);

  if (planet.name === "Saturn") {
    mesh.add(createSaturnRings(planet));
  }

  const label = createPlanetLabel(planet.name);

  const object = {
    data: planet,
    mesh,
    label,
    angle: Math.random() * Math.PI * 2
  };

  planetObjects.push(object);
  return object;
}

function buildPlanetList() {
  const list = $("planetList");
  list.innerHTML = "";

  planets.forEach((planet) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "planet-choice";
    button.dataset.planet = planet.name;

    const dot = document.createElement("span");
    dot.className = "planet-dot";
    dot.style.background = `#${planet.color.toString(16).padStart(6, "0")}`;

    const name = document.createElement("span");
    name.className = "planet-choice-name";
    name.textContent = planet.name;

    const number = document.createElement("span");
    number.className = "planet-choice-number";
    number.textContent = planet.number;

    button.append(dot, name, number);
    button.addEventListener("click", () => selectPlanet(planet.name, true));
    list.appendChild(button);
  });
}

function selectPlanet(name, focus) {
  const planet = planets.find((item) => item.name === name);
  if (!planet) return;

  selectedPlanet = name;

  document.querySelectorAll(".planet-choice").forEach((button) => {
    button.classList.toggle("active", button.dataset.planet === name);
  });

  $("planetNumber").textContent = planet.number;
  $("planetKicker").textContent = planet.kicker;
  $("planetName").textContent = planet.name;
  $("planetSummary").textContent = planet.summary;
  $("planetRadius").innerHTML = `${planet.radius} <small>KM</small>`;
  $("planetDistance").innerHTML = `${planet.distance} <small>M KM</small>`;
  $("planetPeriod").textContent = planet.period;
  $("planetMoons").textContent = planet.moons;

  const visual = $("planetVisual");
  const sphere = visual.querySelector(".visual-sphere");
  const color = `#${planet.color.toString(16).padStart(6, "0")}`;

  sphere.style.background = `radial-gradient(circle at 30% 25%, #ffffff, ${color} 42%, #10172b 85%)`;
  sphere.style.boxShadow = `inset -10px -6px 15px rgba(0,0,0,.5), 0 0 30px ${color}33`;

  if (focus) focusOnPlanet(name);
}

function focusOnPlanet(name) {
  const object = planetObjects.find((item) => item.data.name === name);
  if (!object) return;

  const position = object.mesh.position.clone();
  const direction = new THREE.Vector3(1, 0.65, 1).normalize();

  controls.target.copy(position);
  camera.position.copy(position.clone().add(direction.multiplyScalar(6)));
  controls.update();
}

function resetView() {
  camera.position.set(0, 31, 38);
  controls.target.set(0, 0, 0);
  controls.update();
}

function togglePause() {
  isPaused = !isPaused;
  $("togglePause").textContent = isPaused ? "RESUME" : "PAUSE";
}

function setOrbitsVisibility() {
  orbitObjects.forEach((orbit) => {
    orbit.visible = showOrbits;
  });

  $("toggleOrbits").classList.toggle("selected", showOrbits);
}

function setLabelsVisibility() {
  labelObjects.forEach((label) => {
    label.visible = showLabels;
  });

  $("toggleLabels").classList.toggle("selected", showLabels);
}

function onResize() {
  if (!renderer || !camera) return;

  const width = sceneElement.clientWidth;
  const height = sceneElement.clientHeight;

  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  animationFrame = requestAnimationFrame(animate);

  if (!isPaused) {
    const delta = Math.min(clock.getDelta(), 0.05);

    planetObjects.forEach((object) => {
      const { data, mesh, label } = object;

      object.angle += data.speed * delta * 0.25;

      mesh.position.x = Math.cos(object.angle) * data.orbit;
      mesh.position.z = Math.sin(object.angle) * data.orbit;

      mesh.rotation.y += delta * 0.22;

      label.position.set(
        mesh.position.x,
        mesh.position.y + data.size + 0.65,
        mesh.position.z
      );
    });

    sun.rotation.y += delta * 0.12;
    sunGlow.material.rotation += delta * 0.015;
    starField.rotation.y += delta * 0.002;
  }

  controls.update();
  renderer.render(scene, camera);
}

function init() {
  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b18);

    camera = new THREE.PerspectiveCamera(
      48,
      sceneElement.clientWidth / sceneElement.clientHeight,
      0.1,
      250
    );

    camera.position.set(0, 31, 38);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(sceneElement.clientWidth, sceneElement.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    sceneElement.prepend(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 8;
    controls.maxDistance = 85;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0, 0);

    createStars();
    createSun();

    planets.forEach(createPlanet);

    const earthObject = planetObjects.find((item) => item.data.name === "Earth");
    if (earthObject) {
      const moonGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const moonMaterial = new THREE.MeshStandardMaterial({
        color: 0xc9d0dc,
        roughness: 1
      });

      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      scene.add(moon);
      earthObject.moon = moon;
    }

    buildPlanetList();
    selectPlanet("Earth", false);

    $("sceneStatus").textContent = "SYSTEM READY";
    loadingElement.classList.add("hidden");

    window.addEventListener("resize", onResize);

    $("zoomIn").addEventListener("click", () => {
      camera.position.multiplyScalar(0.82);
      controls.update();
    });

    $("zoomOut").addEventListener("click", () => {
      camera.position.multiplyScalar(1.2);
      controls.update();
    });

    $("resetView").addEventListener("click", resetView);
    $("togglePause").addEventListener("click", togglePause);

    $("toggleOrbits").addEventListener("click", () => {
      showOrbits = !showOrbits;
      setOrbitsVisibility();
    });

    $("toggleLabels").addEventListener("click", () => {
      showLabels = !showLabels;
      setLabelsVisibility();
    });

    $("focusPlanet").addEventListener("click", () => {
      focusOnPlanet(selectedPlanet);
    });

    clock = new THREE.Clock();

    const originalAnimate = animate;

    function animateWithMoon() {
      animationFrame = requestAnimationFrame(animateWithMoon);

      if (!isPaused) {
        const delta = Math.min(clock.getDelta(), 0.05);

        planetObjects.forEach((object) => {
          const { data, mesh, label } = object;

          object.angle += data.speed * delta * 0.25;

          mesh.position.x = Math.cos(object.angle) * data.orbit;
          mesh.position.z = Math.sin(object.angle) * data.orbit;

          mesh.rotation.y += delta * 0.22;

          label.position.set(
            mesh.position.x,
            mesh.position.y + data.size + 0.65,
            mesh.position.z
          );

          if (object.moon) {
            const moonAngle = object.angle * 2.5 + clock.elapsedTime;
            object.moon.position.set(
              mesh.position.x + Math.cos(moonAngle) * 0.9,
              0.1,
              mesh.position.z + Math.sin(moonAngle) * 0.9
            );
          }
        });

        sun.rotation.y += delta * 0.12;
        sunGlow.material.rotation += delta * 0.015;
        starField.rotation.y += delta * 0.002;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    // Use one animation loop.
    cancelAnimationFrame(animationFrame);
    animate = animateWithMoon;
    animate();
  } catch (error) {
    console.error("ORBITAL initialisation error:", error);

    $("sceneStatus").textContent = "INITIALISATION FAILED";
    loadingElement.classList.remove("hidden");
    loadingElement.innerHTML =
      "<span>3D COULD NOT START</span><span>Check your internet connection and reload.</span>";
  }
}

init();

/* ORBITAL — Navigation fix */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      const target = document.querySelector(id);

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", id);
    });
  });
});

