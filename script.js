
"use strict";

// ==========================================
// 1. РАССКАЗ ОТ ЛИЦА ПУШКИНА
// ==========================================

const chapters = [
  {
    title: "Детство",
    text: "Здравствуйте! Меня зовут Александр Сергеевич Пушкин. Я родился 6 июня 1799 года в Москве. Моя семья была дворянской. С детства я интересовался книгами и литературой. Большое влияние на меня оказали рассказы моей няни Арины Родионовны."
  },
  {
    title: "Царскосельский лицей",
    text: "В 1811 году я поступил в Императорский Царскосельский лицей. Там я учился, писал стихи и нашёл верных друзей. В 1815 году мои стихи получили признание на экзамене. Именно лицей стал важной частью моей жизни."
  },
  {
    title: "Первые успехи и ссылка",
    text: "После лицея я жил в Петербурге и продолжал писать. Мои свободолюбивые стихи вызвали недовольство властей, и в 1820 году меня отправили из столицы на юг. Позднее я жил в Михайловском, где продолжал создавать произведения."
  },
  {
    title: "Творчество и семья",
    text: "Я написал роман в стихах Евгений Онегин, поэму Руслан и Людмила, повесть Капитанская дочка и многие другие произведения. В 1831 году я женился на Наталье Гончаровой. История России, человеческие чувства и судьбы людей вдохновляли меня."
  },
  {
    title: "Последние годы и наследие",
    text: "В январе 1837 года я был смертельно ранен на дуэли с Жоржем Дантесом. Я умер 29 января по старому стилю, или 10 февраля по новому стилю, в Санкт-Петербурге. Мне было 37 лет. Но мои стихи и книги продолжают жить, объединяя поколения читателей."
  }
];

let currentChapter = 0;
let speechEnabled = true;
let currentUtterance = null;
let voices = [];

// ==========================================
// 2. ЭЛЕМЕНТЫ СТРАНИЦЫ
// ==========================================

const speechText = document.getElementById("speechText");
const voiceStatus = document.getElementById("voiceStatus");
const chapterCounter = document.getElementById("chapterCounter");
const speakButton = document.getElementById("speakButton");
const pauseButton = document.getElementById("pauseButton");

function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  stopMouthAnimation();
}

function renderChapter(index) {
  currentChapter = (index + chapters.length) % chapters.length;

  speechText.textContent = chapters[currentChapter].text;
  chapterCounter.textContent =
    `Глава ${currentChapter + 1} из ${chapters.length}`;

  voiceStatus.textContent = "Нажмите «Слушать рассказ», чтобы услышать голос.";

  stopSpeech();
}

function loadVoices() {
  if ("speechSynthesis" in window) {
    voices = window.speechSynthesis.getVoices();
  }
}

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function chooseRussianVoice() {
  return voices.find(v => /^ru(-|$)/i.test(v.lang) && /google|microsoft/i.test(v.name))
    || voices.find(v => /^ru(-|$)/i.test(v.lang))
    || null;
}

function speakCurrentChapter() {
  if (!("speechSynthesis" in window)) {
    voiceStatus.textContent =
      "Этот браузер не поддерживает голосовую озвучку.";
    return;
  }

  if (!speechEnabled) {
    voiceStatus.textContent = "Звук выключен. Нажмите ♫ вверху страницы.";
    return;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(
    chapters[currentChapter].text
  );

  utterance.lang = "ru-RU";
  utterance.rate = 0.88;
  utterance.pitch = 0.88;
  utterance.volume = 1;

  const russianVoice = chooseRussianVoice();
  if (russianVoice) {
    utterance.voice = russianVoice;
  }

  currentUtterance = utterance;

  utterance.onstart = () => {
    voiceStatus.textContent = "Пушкин рассказывает…";
    startMouthAnimation();
  };

  utterance.onend = () => {
    voiceStatus.textContent = "Глава завершена.";
    currentUtterance = null;
    stopMouthAnimation();
  };

  utterance.onerror = (event) => {
    if (event.error !== "canceled" && event.error !== "interrupted") {
      voiceStatus.textContent =
        "Не удалось запустить голос. Проверьте настройки звука устройства.";
    }
    currentUtterance = null;
    stopMouthAnimation();
  };

  window.speechSynthesis.speak(utterance);
}

speakButton.addEventListener("click", speakCurrentChapter);

pauseButton.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) return;

  if (window.speechSynthesis.speaking &&
      !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    stopMouthAnimation();
    pauseButton.textContent = "▶ Продолжить";
    voiceStatus.textContent = "Рассказ на паузе.";
  } else if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    startMouthAnimation();
    pauseButton.textContent = "Ⅱ Пауза";
    voiceStatus.textContent = "Пушкин продолжает рассказ…";
  } else {
    speakCurrentChapter();
    pauseButton.textContent = "Ⅱ Пауза";
  }
});

document.getElementById("prevChapter").addEventListener("click", () => {
  renderChapter(currentChapter - 1);
});

document.getElementById("nextChapter").addEventListener("click", () => {
  renderChapter(currentChapter + 1);
});

document.getElementById("beginButton").addEventListener("click", () => {
  document.getElementById("biography").scrollIntoView({
    behavior: "smooth"
  });

  // Запуск речи происходит непосредственно после нажатия.
  speakCurrentChapter();
});

document.getElementById("restartButton").addEventListener("click", () => {
  renderChapter(0);
  document.getElementById("home").scrollIntoView({
    behavior: "smooth"
  });
});

document.getElementById("soundToggle").addEventListener("click", (event) => {
  speechEnabled = !speechEnabled;
  event.currentTarget.textContent = speechEnabled ? "♫" : "×";
  event.currentTarget.setAttribute(
    "aria-label",
    speechEnabled ? "Выключить звук" : "Включить звук"
  );

  if (!speechEnabled) {
    stopSpeech();
    voiceStatus.textContent = "Звук выключен.";
  } else {
    voiceStatus.textContent = "Звук включён. Нажмите «Слушать рассказ».";
  }
});

// ==========================================
// 3. ИНТЕРАКТИВНАЯ ВРЕМЕННАЯ ЛИНИЯ
// ==========================================

const dates = [
  {
    year: "1799",
    title: "1799 — Рождение",
    text: "6 июня 1799 года в Москве родился Александр Сергеевич Пушкин. Его детство прошло в дворянской семье, где он рано познакомился с литературой."
  },
  {
    year: "1811",
    title: "1811 — Начало учёбы в лицее",
    text: "Пушкин поступил в Императорский Царскосельский лицей. Здесь он начал серьёзно заниматься поэзией и обрёл друзей на всю жизнь."
  },
  {
    year: "1820",
    title: "1820 — Южная ссылка",
    text: "За вольнолюбивые стихи Пушкина отправили из Петербурга на юг России. Этот период стал важным этапом его литературного развития."
  },
  {
    year: "1831",
    title: "1831 — Семья",
    text: "18 февраля 1831 года по старому стилю Пушкин обвенчался с Натальей Гончаровой в Москве. Он продолжал работать над своими произведениями."
  },
  {
    year: "1837",
    title: "1837 — Последний год",
    text: "После дуэли с Жоржем Дантесом поэт умер в Санкт-Петербурге. Его литературное наследие сохранило огромное значение для культуры."
  }
];

const timelineItems = document.querySelectorAll(".timeline-item");

timelineItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    timelineItems.forEach(el => el.classList.remove("active"));
    item.classList.add("active");

    document.getElementById("dateNumber").textContent =
      dates[index].title;

    document.getElementById("dateDescription").textContent =
      dates[index].text;
  });
});

// ==========================================
// 4. ТРЁХМЕРНЫЙ ПЕРСОНАЖ НА THREE.JS
// ==========================================

const sceneContainer = document.getElementById("scene3d");

let scene, camera, renderer;
let headGroup, mouth, upperBody;
let isTalking = false;
let mouthClock = 0;
let targetRotation = 0;
let targetTilt = 0;
let dragStartX = null;
let dragStartY = null;
let startRotation = 0;
let animationFrame = null;

function startMouthAnimation() {
  isTalking = true;
}

function stopMouthAnimation() {
  isTalking = false;
  if (mouth) mouth.scale.y = 1;
}

function createMaterial(color, roughness = 0.8, metalness = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });
}

function addMesh(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function buildCharacter() {
  const skin = createMaterial(0xd8aa83);
  const skinShadow = createMaterial(0xb77e5b);
  const hair = createMaterial(0x211713);
  const hairLight = createMaterial(0x38241c);
  const coat = createMaterial(0x171a20);
  const coatLight = createMaterial(0x292a30);
  const shirt = createMaterial(0xe5ddc9);
  const cravat = createMaterial(0x111116);
  const gold = createMaterial(0xc6a05d, 0.35, 0.5);
  const eyeWhite = createMaterial(0xf0e8d9);
  const iris = createMaterial(0x654a32);
  const black = createMaterial(0x100d0b);

  // Торс и плечи.
  upperBody = new THREE.Group();
  scene.add(upperBody);

  addMesh(
    upperBody,
    new THREE.SphereGeometry(1, 40, 32),
    coat,
    0, -0.7, 0
  ).scale.set(1.15, 1.2, 0.66);

  // Белая рубашка.
  const shirtFront = addMesh(
    upperBody,
    new THREE.ConeGeometry(0.4, 1.15, 4),
    shirt,
    0, -0.36, 0.57
  );
  shirtFront.rotation.z = Math.PI;
  shirtFront.rotation.y = Math.PI / 4;
  shirtFront.scale.set(0.75, 1, 0.35);

  // Высокий воротник и галстук.
  addMesh(
    upperBody,
    new THREE.BoxGeometry(0.56, 0.3, 0.24),
    shirt,
    0, 0.05, 0.53
  );

  const tie = addMesh(
    upperBody,
    new THREE.SphereGeometry(0.23, 24, 20),
    cravat,
    0, -0.22, 0.68
  );
  tie.scale.set(0.68, 1.3, 0.35);

  // Декоративная застёжка.
  for (let i = 0; i < 3; i++) {
    addMesh(
      upperBody,
      new THREE.SphereGeometry(0.035, 12, 12),
      gold,
      0, -0.58 - i * 0.22, 0.61
    );
  }

  // Голова: отдельная группа для поворотов.
  headGroup = new THREE.Group();
  headGroup.position.set(0, 0.72, 0);
  scene.add(headGroup);

  addMesh(
    headGroup,
    new THREE.SphereGeometry(0.76, 48, 40),
    skin,
    0, 0.48, 0
  ).scale.set(0.82, 1.12, 0.78);

  // Уши.
  for (const side of [-1, 1]) {
    const ear = addMesh(
      headGroup,
      new THREE.SphereGeometry(0.16, 24, 20),
      skinShadow,
      side * 0.61, 0.43, 0
    );
    ear.scale.set(0.62, 1.15, 0.45);
  }

  // Тёмные кудри по краям головы.
  for (let side of [-1, 1]) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const curl = addMesh(
          headGroup,
          new THREE.SphereGeometry(0.17, 18, 16),
          (row + col) % 2 ? hair : hairLight,
          side * (0.56 + col * 0.035),
          0.1 + row * 0.23,
          -0.01 + col * 0.045
        );
        curl.scale.set(0.85, 1, 0.82);
      }
    }
  }

  // Кудрявые волосы на макушке.
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const curl = addMesh(
      headGroup,
      new THREE.SphereGeometry(0.16, 18, 16),
      i % 2 ? hair : hairLight,
      Math.cos(angle) * 0.39,
      1.2 + Math.sin(angle) * 0.1,
      Math.sin(angle) * 0.32 - 0.02
    );
    curl.scale.set(1, 0.82, 0.85);
  }

  // Брови и глаза.
  for (const side of [-1, 1]) {
    const eyeX = side * 0.26;

    const brow = addMesh(
      headGroup,
      new THREE.SphereGeometry(0.14, 20, 12),
      hair,
      eyeX, 0.64, 0.56
    );
    brow.scale.set(1.3, 0.25, 0.25);
    brow.rotation.z = side * 0.08;

    addMesh(
      headGroup,
      new THREE.SphereGeometry(0.12, 24, 20),
      eyeWhite,
      eyeX, 0.49, 0.59
    ).scale.set(1.15, 0.7, 0.5);

    addMesh(
      headGroup,
      new THREE.SphereGeometry(0.065, 20, 16),
      iris,
      eyeX, 0.49, 0.64
    );

    addMesh(
      headGroup,
      new THREE.SphereGeometry(0.032, 16, 12),
      black,
      eyeX, 0.49, 0.666
    );
  }

  // Нос.
  const nose = addMesh(
    headGroup,
    new THREE.SphereGeometry(0.14, 24, 20),
    skin,
    0, 0.31, 0.65
  );
  nose.scale.set(0.72, 1.4, 0.8);

  // Усы: две изогнутые половины.
  for (const side of [-1, 1]) {
    const moustache = addMesh(
      headGroup,
      new THREE.SphereGeometry(0.19, 24, 16),
      hair,
      side * 0.13, 0.16, 0.65
    );
    moustache.scale.set(1.1, 0.35, 0.45);
    moustache.rotation.z = side * -0.22;
  }

  // Подбородок и бакенбарды.
  addMesh(
    headGroup,
    new THREE.SphereGeometry(0.2, 24, 18),
    hair,
    0, -0.05, 0.53
  ).scale.set(0.8, 0.35, 0.4);

  // Рот: изменяем высоту при речи.
  mouth = addMesh(
    headGroup,
    new THREE.SphereGeometry(0.075, 24, 18),
    black,
    0, 0.075, 0.69
  );
  mouth.scale.set(1.05, 0.5, 0.28);

  // Небольшой воротник сюртука.
  for (const side of [-1, 1]) {
    const lapel = addMesh(
      upperBody,
      new THREE.BoxGeometry(0.24, 0.75, 0.08),
      coatLight,
      side * 0.3, -0.15, 0.66
    );
    lapel.rotation.z = side * -0.2;
  }
}

function init3D() {
  if (!window.THREE) {
    sceneContainer.innerHTML =
      '<p style="padding:30px;color:#f1d7a0">Для 3D необходим доступ к Three.js. Проверьте подключение к интернету.</p>';
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11100e);

  camera = new THREE.PerspectiveCamera(
    36,
    sceneContainer.clientWidth / sceneContainer.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.9, 7.2);
  camera.lookAt(0, 0.6, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(
    sceneContainer.clientWidth,
    sceneContainer.clientHeight
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  sceneContainer.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xe9d7bd, 0x21150f, 2.0));

  const keyLight = new THREE.PointLight(0xffd29a, 65, 12);
  keyLight.position.set(-3, 3.5, 4);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x7890a8, 30, 12);
  fillLight.position.set(3, 1, 2);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xffa34a, 45, 10);
  rimLight.position.set(0, 2, -3);
  scene.add(rimLight);

  // Фоновые золотые частицы.
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = [];

  for (let i = 0; i < 100; i++) {
    particlePositions.push(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 2 - 1
    );
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(particlePositions, 3)
  );

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0xd6b16f,
      size: 0.025,
      transparent: true,
      opacity: 0.55
    })
  );

  scene.add(particles);

  buildCharacter();

  // Перетаскивание мышью или пальцем для поворота головы.
  sceneContainer.addEventListener("pointerdown", (event) => {
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    startRotation = targetRotation;
    sceneContainer.setPointerCapture?.(event.pointerId);
  });

  sceneContainer.addEventListener("pointermove", (event) => {
    if (dragStartX === null) return;

    targetRotation = startRotation +
      (event.clientX - dragStartX) * 0.008;

    targetTilt = Math.max(-0.15, Math.min(
      0.15,
      (event.clientY - dragStartY) * 0.002
    ));
  });

  function endDrag() {
    dragStartX = null;
    dragStartY = null;
  }

  sceneContainer.addEventListener("pointerup", endDrag);
  sceneContainer.addEventListener("pointercancel", endDrag);
  sceneContainer.addEventListener("pointerleave", endDrag);

  window.addEventListener("resize", resize3D);

  animate3D();
}

function resize3D() {
  if (!renderer || !camera) return;

  const width = sceneContainer.clientWidth;
  const height = sceneContainer.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate3D() {
  animationFrame = requestAnimationFrame(animate3D);

  const time = performance.now() * 0.001;

  if (headGroup) {
    headGroup.rotation.y +=
      (targetRotation - headGroup.rotation.y) * 0.06;

    headGroup.rotation.x +=
      (targetTilt - headGroup.rotation.x) * 0.06;

    // Естественное небольшое движение головы.
    headGroup.position.y = 0.72 + Math.sin(time * 1.2) * 0.025;
  }

  if (upperBody) {
    upperBody.rotation.y = Math.sin(time * 0.6) * 0.025;
  }

  if (mouth) {
    if (isTalking) {
      mouthClock += 0.23;
      mouth.scale.y = 0.5 + Math.abs(Math.sin(mouthClock)) * 3;
    } else {
      mouth.scale.y += (0.5 - mouth.scale.y) * 0.2;
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

try {
  init3D();
} catch (error) {
  console.error("Не удалось создать 3D-персонажа:", error);
  sceneContainer.innerHTML =
    '<p style="padding:30px;color:#f1d7a0">Не удалось загрузить 3D-сцену. Откройте сайт в современном браузере.</p>';
}

// Первоначальная глава.
renderChapter(0);
