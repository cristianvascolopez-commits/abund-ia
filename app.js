// ─── Perfil & Memoria ────────────────────────
const PROFILE_KEY  = 'abundia_profile';
const MEMORY_KEY   = 'abundia_memory';
const TTS_AUTO_KEY = 'abundia_tts_auto';
const UID_KEY      = 'abundia_uid';

function getOrCreateUid() {
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}
const USER_UID = getOrCreateUid();

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; }
  catch { return null; }
}
function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}
function loadMemory() {
  return localStorage.getItem(MEMORY_KEY) || '';
}
function saveMemory(text) {
  localStorage.setItem(MEMORY_KEY, text.slice(0, 500));
}
function loadTtsAuto() {
  return localStorage.getItem(TTS_AUTO_KEY) === 'true';
}
function saveTtsAuto(val) {
  localStorage.setItem(TTS_AUTO_KEY, String(val));
}

/* ==========================================
   AQUELARRE DIGITAL — Oráculo Egipcio
   ========================================== */

// ─── Particle Canvas ────────────────────────
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const SYMBOLS = ['☥', '𓂀', '✦', '☽', '△', '⊕', '✴', '𓆣', '᛫'];
const particles = [];
for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.8 + 0.4,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.4 + 0.1,
    baseOpacity: 0,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    isSymbol: Math.random() > 0.68,
    color: Math.random() > 0.55 ? '#39ff14' : (Math.random() > 0.5 ? '#9d00ff' : '#fff700'),
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinklePhase: Math.random() * Math.PI * 2,
  });
  particles[i].baseOpacity = particles[i].opacity;
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.twinklePhase += p.twinkleSpeed;
    const opacity = Math.max(0.05, p.baseOpacity + Math.sin(p.twinklePhase) * 0.25);
    ctx.save();
    ctx.globalAlpha = opacity;
    if (p.isSymbol) {
      ctx.font = `${p.size * 9}px serif`;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fillText(p.symbol, p.x, p.y);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.size * 4;
      ctx.fill();
    }
    ctx.restore();
    p.x += p.speedX; p.y += p.speedY;
    if (p.x < -20) p.x = canvas.width + 20;
    if (p.x > canvas.width + 20) p.x = -20;
    if (p.y < -20) p.y = canvas.height + 20;
    if (p.y > canvas.height + 20) p.y = -20;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── Zodiac Logic ────────────────────────────
const ZODIAC_DATA = [
  { sign: 'Capricornio', symbol: '♑', element: 'Tierra', planet: 'Saturno',  dates: [[12,22],[1,19]]  },
  { sign: 'Acuario',     symbol: '♒', element: 'Aire',   planet: 'Urano',    dates: [[1,20],[2,18]]   },
  { sign: 'Piscis',      symbol: '♓', element: 'Agua',   planet: 'Neptuno',  dates: [[2,19],[3,20]]   },
  { sign: 'Aries',       symbol: '♈', element: 'Fuego',  planet: 'Marte',    dates: [[3,21],[4,19]]   },
  { sign: 'Tauro',       symbol: '♉', element: 'Tierra', planet: 'Venus',    dates: [[4,20],[5,20]]   },
  { sign: 'Géminis',     symbol: '♊', element: 'Aire',   planet: 'Mercurio', dates: [[5,21],[6,20]]   },
  { sign: 'Cáncer',      symbol: '♋', element: 'Agua',   planet: 'Luna',     dates: [[6,21],[7,22]]   },
  { sign: 'Leo',         symbol: '♌', element: 'Fuego',  planet: 'Sol',      dates: [[7,23],[8,22]]   },
  { sign: 'Virgo',       symbol: '♍', element: 'Tierra', planet: 'Mercurio', dates: [[8,23],[9,22]]   },
  { sign: 'Libra',       symbol: '♎', element: 'Aire',   planet: 'Venus',    dates: [[9,23],[10,22]]  },
  { sign: 'Escorpio',    symbol: '♏', element: 'Agua',   planet: 'Plutón',   dates: [[10,23],[11,21]] },
  { sign: 'Sagitario',   symbol: '♐', element: 'Fuego',  planet: 'Júpiter',  dates: [[11,22],[12,21]] },
];

function getZodiacInfo(day, month) {
  for (const z of ZODIAC_DATA) {
    const [start, end] = z.dates;
    const afterStart = month > start[0] || (month === start[0] && day >= start[1]);
    const beforeEnd  = month < end[0]   || (month === end[0]   && day <= end[1]);
    if (afterStart && beforeEnd) return z;
  }
  return ZODIAC_DATA[0];
}

function extractDateFromText(text) {
  const months = {
    enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,
    julio:7,agosto:8,septiembre:9,octubre:10,noviembre:11,diciembre:12,
  };
  let m = text.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
  if (m) {
    const d = parseInt(m[1]), mo = parseInt(m[2]), y = parseInt(m[3]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) return { day: d, month: mo, year: y };
  }
  m = text.match(/\b(\d{1,2})\s+(?:de\s+)?([a-záéíóúü]+)(?:\s+(?:de\s+)?(\d{4}))?\b/i);
  if (m) {
    const d = parseInt(m[1]);
    const mo = months[m[2].toLowerCase()];
    const y = m[3] ? parseInt(m[3]) : null;
    if (d >= 1 && d <= 31 && mo) return { day: d, month: mo, year: y };
  }
  return null;
}

// ─── Deck selector ───────────────────────────
let activeDeck = 'egipcio'; // 'egipcio' | 'bruja'

// ─── Tarot Deck EGIPCIO — 78 cartas ─────────
const MAYOR_ARCANA = [
  { nombre: 'El Loco',               numero: '0',    palo: 'Mayor', img: 'cards/major_00.png' },
  { nombre: 'El Mago',               numero: 'I',    palo: 'Mayor', img: 'cards/major_01.png' },
  { nombre: 'La Suma Sacerdotisa',   numero: 'II',   palo: 'Mayor', img: 'cards/major_02.png' },
  { nombre: 'La Emperatriz',         numero: 'III',  palo: 'Mayor', img: 'cards/major_03.png' },
  { nombre: 'El Emperador',          numero: 'IV',   palo: 'Mayor', img: 'cards/major_04.png' },
  { nombre: 'El Hierofante',         numero: 'V',    palo: 'Mayor', img: 'cards/major_05.png' },
  { nombre: 'Los Amantes',           numero: 'VI',   palo: 'Mayor', img: 'cards/major_06.png' },
  { nombre: 'El Carro',              numero: 'VII',  palo: 'Mayor', img: 'cards/major_07.png' },
  { nombre: 'La Justicia',           numero: 'VIII', palo: 'Mayor', img: 'cards/major_08.png' },
  { nombre: 'El Ermitaño',           numero: 'IX',   palo: 'Mayor', img: 'cards/major_09.png' },
  { nombre: 'La Rueda de Fortuna',   numero: 'X',    palo: 'Mayor', img: 'cards/major_10.png' },
  { nombre: 'La Fuerza',             numero: 'XI',   palo: 'Mayor', img: 'cards/major_11.png' },
  { nombre: 'El Colgado',            numero: 'XII',  palo: 'Mayor', img: 'cards/major_12.png' },
  { nombre: 'La Muerte',             numero: 'XIII', palo: 'Mayor', img: 'cards/major_13.png' },
  { nombre: 'La Templanza',          numero: 'XIV',  palo: 'Mayor', img: 'cards/major_14.png' },
  { nombre: 'El Diablo',             numero: 'XV',   palo: 'Mayor', img: 'cards/major_15.png' },
  { nombre: 'La Torre',              numero: 'XVI',  palo: 'Mayor', img: 'cards/major_16.png' },
  { nombre: 'Las Estrellas',         numero: 'XVII', palo: 'Mayor', img: 'cards/major_17.png' },
  { nombre: 'La Luna',               numero: 'XVIII',palo: 'Mayor', img: 'cards/major_18.png' },
  { nombre: 'El Sol',                numero: 'XIX',  palo: 'Mayor', img: 'cards/major_19.png' },
  { nombre: 'El Juicio',             numero: 'XX',   palo: 'Mayor', img: 'cards/major_20.png' },
  { nombre: 'El Mundo',              numero: 'XXI',  palo: 'Mayor', img: 'cards/major_21.png' },
];

function buildSuit(palo, prefix) {
  const cartas = [];
  for (let i = 1; i <= 10; i++) {
    const n = String(i).padStart(2, '0');
    cartas.push({ nombre: `${i} de ${palo}`, numero: String(i), palo, img: `cards/${prefix}_${n}.png` });
  }
  const figuras = ['sota','caballo','reina','rey'];
  const nombres = ['Sota','Caballo','Reina','Rey'];
  figuras.forEach((f, fi) => {
    cartas.push({ nombre: `${nombres[fi]} de ${palo}`, numero: nombres[fi], palo, img: `cards/${prefix}_${f}.png` });
  });
  return cartas;
}

const DECK_EGIPCIO = [
  ...MAYOR_ARCANA,
  ...buildSuit('Oros',    'oros'),
  ...buildSuit('Espadas', 'espadas'),
  ...buildSuit('Copas',   'copas'),
  ...buildSuit('Bastos',  'bastos'),
];

// ─── Tarot Deck BRUJA VERDE — 22 Mayores + 56 menores ────
const GW_MAYOR = [
  { nombre: 'El Loco (The Greenman)', numero: '0',    palo: 'Mayor', img: 'cards-gw/gw_major_00.webp' },
  { nombre: 'La Bruja (The Witch)',   numero: 'I',    palo: 'Mayor', img: 'cards-gw/gw_major_01.webp' },
  { nombre: 'La Suma Sacerdotisa',    numero: 'II',   palo: 'Mayor', img: 'cards-gw/gw_major_02.webp' },
  { nombre: 'La Madre Tierra',        numero: 'III',  palo: 'Mayor', img: 'cards-gw/gw_major_03.webp' },
  { nombre: 'El Padre Astado',        numero: 'IV',   palo: 'Mayor', img: 'cards-gw/gw_major_04.webp' },
  { nombre: 'El Sumo Sacerdote',      numero: 'V',    palo: 'Mayor', img: 'cards-gw/gw_major_05.webp' },
  { nombre: 'Los Amantes',            numero: 'VI',   palo: 'Mayor', img: 'cards-gw/gw_major_06.webp' },
  { nombre: 'El Carro',               numero: 'VII',  palo: 'Mayor', img: 'cards-gw/gw_major_07.webp' },
  { nombre: 'La Fuerza',              numero: 'VIII', palo: 'Mayor', img: 'cards-gw/gw_major_08.webp' },
  { nombre: 'El Ermitaño',            numero: 'IX',   palo: 'Mayor', img: 'cards-gw/gw_major_09.webp' },
  { nombre: 'La Rueda del Año',       numero: 'X',    palo: 'Mayor', img: 'cards-gw/gw_major_10.webp' },
  { nombre: 'La Justicia',            numero: 'XI',   palo: 'Mayor', img: 'cards-gw/gw_major_11.webp' },
  { nombre: 'El Colgado',             numero: 'XII',  palo: 'Mayor', img: 'cards-gw/gw_major_12.webp' },
  { nombre: 'La Cosecha (Muerte)',     numero: 'XIII', palo: 'Mayor', img: 'cards-gw/gw_major_13.webp' },
  { nombre: 'La Templanza',           numero: 'XIV',  palo: 'Mayor', img: 'cards-gw/gw_major_14.webp' },
  { nombre: 'La Sombra (El Diablo)',  numero: 'XV',   palo: 'Mayor', img: 'cards-gw/gw_major_15.webp' },
  { nombre: 'La Torre',               numero: 'XVI',  palo: 'Mayor', img: 'cards-gw/gw_major_16.webp' },
  { nombre: 'La Estrella',            numero: 'XVII', palo: 'Mayor', img: 'cards-gw/gw_major_17.webp' },
  { nombre: 'La Luna',                numero: 'XVIII',palo: 'Mayor', img: 'cards-gw/gw_major_18.webp' },
  { nombre: 'El Sol',                 numero: 'XIX',  palo: 'Mayor', img: 'cards-gw/gw_major_19.webp' },
  { nombre: 'El Juicio (Renacimiento)',numero:'XX',   palo: 'Mayor', img: 'cards-gw/gw_major_20.webp' },
  { nombre: 'El Mundo',               numero: 'XXI',  palo: 'Mayor', img: 'cards-gw/gw_major_21.webp' },
];

function buildSuitGW(paloGW, prefixEgipcio) {
  const cartas = [];
  for (let i = 1; i <= 10; i++) {
    const n = String(i).padStart(2, '0');
    cartas.push({ nombre: `${i} de ${paloGW}`, numero: String(i), palo: paloGW, img: `cards/${prefixEgipcio}_${n}.png` });
  }
  ['Sota','Caballo','Reina','Rey'].forEach((fig, fi) => {
    const f = ['sota','caballo','reina','rey'][fi];
    cartas.push({ nombre: `${fig} de ${paloGW}`, numero: fig, palo: paloGW, img: `cards/${prefixEgipcio}_${f}.png` });
  });
  return cartas;
}

const DECK_BRUJA = [
  ...GW_MAYOR,
  ...buildSuitGW('Pentáculos (Tierra)', 'oros'),
  ...buildSuitGW('Cálices (Agua)',       'copas'),
  ...buildSuitGW('Athames (Aire)',       'espadas'),
  ...buildSuitGW('Varas (Fuego)',        'bastos'),
];

function getActiveDeck() {
  return activeDeck === 'bruja' ? DECK_BRUJA : DECK_EGIPCIO;
}

const DECK = DECK_EGIPCIO; // compatibilidad legacy

// ─── Tiradas disponibles ─────────────────────
const SPREADS = [
  {
    id: 'one',
    label: '1 Carta',
    icon: '☥',
    desc: 'Respuesta directa',
    positions: ['Respuesta'],
    layout: 'row',
  },
  {
    id: 'three',
    label: '3 Cartas',
    icon: '△',
    desc: 'Pasado · Presente · Futuro',
    positions: ['Pasado', 'Presente', 'Futuro'],
    layout: 'row',
  },
  {
    id: 'seven',
    label: '7 Cartas',
    icon: '✦',
    desc: 'Herradura',
    positions: ['Pasado lejano', 'Pasado reciente', 'Presente', 'Futuro próximo', 'Influencias', 'Esperanzas', 'Resultado'],
    layout: 'row',
  },
  {
    id: 'cruz',
    label: 'La Cruz',
    icon: '✚',
    desc: 'Afirmación · Síntesis · Solución',
    positions: ['Afirmación', 'Negación', 'Discusión', 'Solución', 'Síntesis'],
    layout: 'cruz',
  },
  {
    id: 'arbol',
    label: 'Árbol de la Vida',
    icon: '𓆣',
    desc: '10 Sefirot · Kabbalah',
    positions: ['Corona', 'Sabiduría', 'Comprensión', 'Misericordia', 'Rigor', 'Belleza', 'Victoria', 'Esplendor', 'Fundamento', 'Reino'],
    layout: 'arbol',
  },
  {
    id: 'zodiaco',
    label: 'Rueda Zodiacal',
    icon: '⊚',
    desc: '12 Casas + Síntesis',
    positions: ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis','Síntesis'],
    layout: 'row',
  },
];

function drawCards(n) {
  const pool = activeDeck === 'bruja' ? GW_MAYOR : DECK_EGIPCIO;
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

// ─── Tarot Trigger Detection ─────────────────
const TAROT_TRIGGERS = ['tarot', 'tirada', 'lectura', 'cartas', 'leer las cartas', 'tirar las cartas', 'el mazo', 'arcano', 'hazme una', 'hacer una', 'puedes hacer', 'una tirada', 'mis cartas', 'el tarot', 'las cartas', 'baraja', 'carta del'];
function isTarotRequest(text) {
  const lower = text.toLowerCase();
  return TAROT_TRIGGERS.some(t => lower.includes(t));
}

// ─── Consciousness Test ───────────────────────
const CONSCIOUSNESS_TRIGGERS = ['nivel de conciencia', 'mi nivel', 'calibración', 'mi calibración', 'test de conciencia', 'calibrar', 'qué nivel tengo', 'dónde estoy', 'hawkins', 'mapa de conciencia', 'nivel energético', 'nivel espiritual'];
function isConsciousnessTest(text) {
  const lower = text.toLowerCase();
  return CONSCIOUSNESS_TRIGGERS.some(t => lower.includes(t));
}

const CTEST_QUESTIONS = [
  {
    q: '1 / 5 — ¿Cuál describe mejor tu estado emocional habitual?',
    opts: [
      { t: 'Desesperanza, apatía o tristeza crónica', s: 58 },
      { t: 'Ansiedad, miedo o preocupación constante', s: 108 },
      { t: 'Irritación, ira o resentimiento frecuente', s: 153 },
      { t: 'Orgullo y necesidad de reconocimiento', s: 177 },
      { t: 'Determinación para avanzar pese a todo', s: 204 },
      { t: 'Calma y flexibilidad sin dramatizar', s: 253 },
      { t: 'Optimismo y confianza en el proceso', s: 313 },
      { t: 'Gratitud y paz como estado habitual', s: 358 },
    ],
  },
  {
    q: '2 / 5 — Ante un problema serio, tu reacción inicial es:',
    opts: [
      { t: 'Rendirme o ignorarlo — me siento sin recursos', s: 55 },
      { t: 'Angustiarme y anticipar lo peor', s: 103 },
      { t: 'Enojarme y buscar culpables', s: 151 },
      { t: 'Defender mi postura y proteger mi imagen', s: 177 },
      { t: 'Buscar soluciones con determinación', s: 204 },
      { t: 'Adaptarme sin perder el centro', s: 253 },
      { t: 'Confiar en que tiene un propósito', s: 318 },
    ],
  },
  {
    q: '3 / 5 — ¿Qué te mueve principalmente en la vida?',
    opts: [
      { t: 'Sobrevivir el día a día', s: 55 },
      { t: 'Evitar el peligro y lo negativo', s: 103 },
      { t: 'Ganar o no quedar por debajo de otros', s: 153 },
      { t: 'Demostrar mi valía y conseguir éxito', s: 178 },
      { t: 'Crecer y superar mis propios límites', s: 204 },
      { t: 'Vivir en paz y disfrutar el camino', s: 258 },
      { t: 'Contribuir, servir o encontrar sentido', s: 358 },
    ],
  },
  {
    q: '4 / 5 — ¿Cómo gestionas las emociones difíciles?',
    opts: [
      { t: 'Las ignoro o me bloqueo', s: 55 },
      { t: 'Me desbordan o las evito con distracciones', s: 103 },
      { t: 'Las expreso de forma reactiva', s: 151 },
      { t: 'Las controlo para mantener mi imagen', s: 177 },
      { t: 'Las reconozco y trabajo con ellas', s: 204 },
      { t: 'Las acepto sin drama — fluyen solas', s: 258 },
      { t: 'Las observo con ecuanimidad total', s: 353 },
    ],
  },
  {
    q: '5 / 5 — ¿Cómo describes tu relación con los demás?',
    opts: [
      { t: 'Desconfianza general — el mundo es peligroso', s: 100 },
      { t: 'Competencia o resentimiento frecuente', s: 151 },
      { t: 'Me importa mucho lo que piensen de mí', s: 177 },
      { t: 'Respeto y honestidad, aunque cuesta', s: 204 },
      { t: 'Tolerancia sin juicio — cada quien en su proceso', s: 253 },
      { t: 'Compasión genuina, incluso hacia quienes me dañan', s: 353 },
    ],
  },
];

function scoreToLevel(avg) {
  if (avg < 80)  return { n: Math.round(avg), name: 'Vergüenza / Culpa / Apatía', range: '20–75', color: '#ff4444' };
  if (avg < 130) return { n: Math.round(avg), name: 'Miedo / Deseo',              range: '75–125', color: '#ff8800' };
  if (avg < 185) return { n: Math.round(avg), name: 'Ira / Orgullo',              range: '125–175', color: '#ffbb00' };
  if (avg < 230) return { n: Math.round(avg), name: 'Coraje',                     range: '200',     color: '#aadd00' };
  if (avg < 285) return { n: Math.round(avg), name: 'Neutralidad',                range: '250',     color: '#39ff14' };
  if (avg < 335) return { n: Math.round(avg), name: 'Voluntad',                   range: '310',     color: '#00ffcc' };
  if (avg < 385) return { n: Math.round(avg), name: 'Aceptación',                 range: '350',     color: '#00ccff' };
  if (avg < 450) return { n: Math.round(avg), name: 'Razón',                      range: '400',     color: '#aa88ff' };
  return           { n: Math.round(avg), name: 'Amor / Alegría / Paz',            range: '500+',    color: '#ff88ff' };
}

function appendCTestQuestion(qData, qIndex, answers, onComplete) {
  const msgEl = document.createElement('div');
  msgEl.className = 'msg oracle';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '𓂀';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble ctest-bubble';

  const qlabel = document.createElement('div');
  qlabel.className = 'ctest-question';
  qlabel.textContent = qData.q;
  bubble.appendChild(qlabel);

  const opts = document.createElement('div');
  opts.className = 'ctest-options';
  qData.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'ctest-opt-btn';
    btn.textContent = opt.t;
    btn.addEventListener('click', () => {
      msgEl.remove();
      answers.push(opt.s);
      if (qIndex + 1 < CTEST_QUESTIONS.length) {
        appendCTestQuestion(CTEST_QUESTIONS[qIndex + 1], qIndex + 1, answers, onComplete);
      } else {
        onComplete(answers);
      }
    });
    opts.appendChild(btn);
  });
  bubble.appendChild(opts);
  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function appendConsciousnessResult(level) {
  const msgEl = document.createElement('div');
  msgEl.className = 'msg oracle';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '𓂀';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble ctest-result-bubble';
  bubble.innerHTML = `
    <div class="ctest-result-label">Calibración estimada</div>
    <div class="ctest-result-score" style="color:${level.color};text-shadow:0 0 16px ${level.color}88">${level.n}</div>
    <div class="ctest-result-name" style="color:${level.color}">${level.name}</div>
    <div class="ctest-result-range">Rango Hawkins: ${level.range}</div>
  `;
  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handleConsciousnessTest(consulta) {
  isWaiting = true;
  sendBtn.disabled = true;
  oracleSay('Vamos a calibrar tu nivel de conciencia. Responde con honestidad — no hay respuestas correctas ni incorrectas.', () => {
    appendCTestQuestion(CTEST_QUESTIONS[0], 0, [], async (answers) => {
      const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
      const level = scoreToLevel(avg);
      appendConsciousnessResult(level);

      const zodiacCtx = buildZodiacContext();
      const prompt = `[TEST DE CONCIENCIA — HAWKINS] Calibración estimada: ${level.n} (${level.name}, rango ${level.range}). Consulta original: "${consulta}"${zodiacCtx}. Interpreta este nivel según el sistema de Hawkins: qué significa estar aquí, qué patrones predominan, y qué prácticas concretas ayudan a trascenderlo. Sin markdown. Sin asteriscos. Texto corrido.`;

      const typingEl = appendTyping();
      try {
        const res = await fetch('/api/oracle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...conversationHistory, { role: 'user', content: prompt }], userProfile: userProfile || null, userMemory: loadMemory() || null, uid: USER_UID }),
        });
        const data = await res.json();
        typingEl.remove();
        const reply = res.ok ? data.response : (data.error || 'El Oráculo guarda silencio...');
        conversationHistory.push({ role: 'user', content: prompt });
        conversationHistory.push({ role: 'assistant', content: reply });
        if (conversationHistory.length > MAX_HISTORY) conversationHistory = conversationHistory.slice(-MAX_HISTORY);
        appendMessageTyped('oracle', reply, () => {
          isWaiting = false;
          sendBtn.disabled = false;
        });
      } catch {
        typingEl.remove();
        appendMessageTyped('oracle', '✦ El velo se cerró. Intenta de nuevo...', () => {
          isWaiting = false;
          sendBtn.disabled = false;
        });
      }
    });
  });
}

// ─── Skip triggers ───────────────────────────
const SKIP_WORDS = ['no', 'omitir', 'saltar', 'skip', 'continuar', 'no sé', 'no se', 'no quiero', 'sí', 'si'];
function isSkip(text) {
  const lower = text.toLowerCase().trim();
  return SKIP_WORDS.some(w => lower === w || lower.startsWith(w + ' '));
}

// ─── Modal de Bienvenida ─────────────────────
let userProfile = loadProfile();

function initProfileFromStorage() {
  if (!userProfile) return;
  userName   = userProfile.name  || null;
  userZodiac = userProfile.zodiac
    ? ZODIAC_DATA.find(z => z.sign === userProfile.zodiac) || null
    : null;
  introState = 'done';

  if (userZodiac) showZodiacBadge(userZodiac, userProfile.zodiac);

  const staticMsg = chatMessages.querySelector('.msg.oracle');
  if (staticMsg) {
    const greet = userProfile.name
      ? `${userProfile.name}, el Oráculo te recibe. ¿Qué consultas hoy?`
      : 'El Oráculo te recibe. ¿Qué consultas hoy?';
    staticMsg.querySelector('.msg-bubble').textContent = greet;
  }
}

function showWelcomeModal() {
  document.getElementById('welcomeModal').classList.remove('hidden');
}

function hideWelcomeModal() {
  document.getElementById('welcomeModal').classList.add('hidden');
}

function submitWelcomeModal() {
  const name   = document.getElementById('wName').value.trim();
  const zodiac = document.getElementById('wZodiac').value;
  const lang   = document.getElementById('wLang').value || 'es';

  const profile = {
    name:      name ? (name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()) : null,
    zodiac:    zodiac || null,
    language:  lang,
    createdAt: new Date().toISOString(),
  };
  saveProfile(profile);
  userProfile = profile;

  hideWelcomeModal();
  initProfileFromStorage();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('wSubmit').addEventListener('click', submitWelcomeModal);
  document.getElementById('wSkip').addEventListener('click', () => {
    saveProfile({ name: null, zodiac: null, language: 'es', createdAt: new Date().toISOString() });
    userProfile = loadProfile();
    hideWelcomeModal();
    introState = 'done';
    const staticMsg = chatMessages.querySelector('.msg.oracle');
    if (staticMsg) staticMsg.querySelector('.msg-bubble').textContent = '¿Qué consultas?';
  });

  if (!loadProfile()) {
    showWelcomeModal();
  } else {
    initProfileFromStorage();
  }

  // Cargar memoria del servidor en segundo plano
  loadRemoteMemory();

  const ttsBtn = document.getElementById('ttsAutoBtn');
  if (ttsBtn) {
    let ttsAuto = loadTtsAuto();
    ttsBtn.classList.toggle('active', ttsAuto);
    ttsBtn.addEventListener('click', () => {
      ttsAuto = !ttsAuto;
      saveTtsAuto(ttsAuto);
      ttsBtn.classList.toggle('active', ttsAuto);
      ttsBtn.title = ttsAuto ? 'Desactivar voz automática' : 'Activar voz automática';
    });
  }

  const langSel = document.getElementById('headerLang');
  if (langSel) {
    langSel.value = userProfile?.language || 'es';
    langSel.addEventListener('change', () => {
      if (userProfile) {
        userProfile.language = langSel.value;
        saveProfile(userProfile);
      }
    });
  }
});

// ─── TTS (Texto a Voz) ────────────────────────
let currentAudio    = null;
let currentPlaylist = null;

function splitTtsChunks(text, maxLen = 2000) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let rest = text;
  while (rest.length > maxLen) {
    let cut = maxLen;
    for (const sep of ['. ', '.\n', '! ', '? ', '\n', ', ', ' ']) {
      const idx = rest.lastIndexOf(sep, maxLen);
      if (idx > maxLen * 0.5) { cut = idx + sep.length; break; }
    }
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

async function fetchTtsUrls(text) {
  const lang   = userProfile?.language || 'es';
  const chunks = splitTtsChunks(text);
  const urls   = [];
  for (const chunk of chunks) {
    try {
      const res = await fetch('/api/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: chunk, language: lang }),
      });
      if (!res.ok) {
        console.warn('[TTS] Error del servidor:', res.status);
        continue;
      }
      const blob = await res.blob();
      if (blob.size < 100) { console.warn('[TTS] Blob vacío'); continue; }
      urls.push(URL.createObjectURL(blob));
    } catch (err) {
      console.warn('[TTS] Fetch fallido:', err);
    }
  }
  return urls;
}

function stopAll() {
  if (currentAudio)    { currentAudio.pause(); currentAudio = null; }
  if (currentPlaylist) { currentPlaylist.dead = true; currentPlaylist = null; }
  document.querySelectorAll('.msg-play-btn.playing').forEach(b => {
    b.textContent = '▶ escuchar';
    b.classList.remove('playing');
    delete b._pl;
  });
}

function runPlaylist(urls, btnEl) {
  stopAll();
  const pl = { urls, index: 0, dead: false, audio: null };
  currentPlaylist   = pl;
  btnEl._pl         = pl;
  btnEl.textContent = '⏸ pausar';
  btnEl.classList.add('playing');
  btnEl.disabled    = false;

  const next = () => {
    if (pl.dead || pl.index >= pl.urls.length) {
      if (!pl.dead) {
        btnEl.textContent = '▶ escuchar';
        btnEl.classList.remove('playing');
        delete btnEl._pl;
        if (currentPlaylist === pl) currentPlaylist = null;
        pl.urls.forEach(u => URL.revokeObjectURL(u));
      }
      currentAudio = null;
      return;
    }
    const audio = new Audio(pl.urls[pl.index]);
    currentAudio = audio;
    pl.audio     = audio;
    audio.onended = () => { pl.index++; next(); };
    audio.play().catch(() => {
      // Autoplay bloqueado por el navegador — reset silencioso, URLs intactas
      btnEl.textContent = '▶ escuchar';
      btnEl.classList.remove('playing');
      delete btnEl._pl;
      if (currentPlaylist === pl) currentPlaylist = null;
      currentAudio = null;
      pl.dead = true;
      // NO se revocan las URLs para que el clic manual las pueda usar
    });
  };
  next();
}

function addPlayButton(bubble, text) {
  const btn = document.createElement('button');
  btn.className   = 'msg-play-btn';
  btn.textContent = '▶ escuchar';

  // Pre-cargar siempre en segundo plano para que el click sea instantáneo
  let cachedUrls = null;
  let fetchDone  = false;
  fetchTtsUrls(text).then(urls => {
    fetchDone = true;
    if (!urls.length) { btn.title = 'Audio no disponible'; return; }
    cachedUrls = urls;
    // Auto-reproducir solo si TTS automático está activo
    if (loadTtsAuto()) runPlaylist([...urls], btn);
  }).catch(() => { fetchDone = true; });

  btn.addEventListener('click', async () => {
    // Pausar / reanudar si hay playlist activa en este botón
    if (btn._pl?.audio) {
      const a = btn._pl.audio;
      if (!a.paused) {
        a.pause();
        btn.textContent = '▶ escuchar';
        btn.classList.remove('playing');
      } else {
        a.play().catch(() => {});
        btn.textContent = '⏸ pausar';
        btn.classList.add('playing');
      }
      return;
    }

    // Si la pre-carga ya terminó y hay URLs, usarlas
    if (fetchDone && cachedUrls?.length) {
      runPlaylist([...cachedUrls], btn);
      return;
    }

    // Fetch aún en curso o falló — obtener fresh
    btn.textContent = '⏳';
    btn.disabled    = true;
    const urls = cachedUrls?.length ? [...cachedUrls] : await fetchTtsUrls(text);
    btn.disabled = false;

    if (urls.length) {
      cachedUrls = urls;
      runPlaylist(urls, btn);
    } else {
      btn.textContent = '⚠ sin audio';
      setTimeout(() => { btn.textContent = '▶ escuchar'; }, 3000);
    }
  });

  bubble.appendChild(btn);
}

// ─── Oracle State ────────────────────────────
const chatMessages    = document.getElementById('chatMessages');
const messageInput    = document.getElementById('messageInput');
const sendBtn         = document.getElementById('sendBtn');
const imageUpload     = document.getElementById('imageUpload');
const imagePreviewArea = document.getElementById('imagePreviewArea');
const previewImg      = document.getElementById('previewImg');
const removeImgBtn    = document.getElementById('removeImgBtn');

let pendingImage     = null;
let pendingImageType = null;
let isWaiting        = false;

// Estado del usuario
let userName       = null;
let userZodiac     = null;
let userBirth      = null;
let introState     = 'name'; // 'name' | 'birth' | 'done'
let introFormActive = false;

// Historial de conversación para la API
let conversationHistory = [];
const MAX_HISTORY = 30; // 15 turnos completos

// ─── Auto-resize textarea ────────────────────
messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
});

// ─── Image upload ────────────────────────────
imageUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen no puede superar 5 MB.');
    imageUpload.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    pendingImage = ev.target.result.split(',')[1];
    pendingImageType = file.type;
    previewImg.src = ev.target.result;
    imagePreviewArea.classList.add('active');
  };
  reader.readAsDataURL(file);
  imageUpload.value = '';
});

removeImgBtn.addEventListener('click', () => {
  pendingImage = null; pendingImageType = null;
  previewImg.src = '';
  imagePreviewArea.classList.remove('active');
});

// ─── Send on Enter ───────────────────────────
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
sendBtn.addEventListener('click', sendMessage);

// ─── Message rendering ───────────────────────
function appendMessage(role, html, useHtml = false) {
  const msgEl = document.createElement('div');
  msgEl.className = `msg ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'oracle' ? '𓂀' : '☽';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  if (useHtml) {
    bubble.innerHTML = html;
  } else {
    bubble.textContent = html;
  }

  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgEl;
}

function appendTyping() {
  const msgEl = document.createElement('div');
  msgEl.className = 'msg oracle';
  msgEl.id = 'typingIndicator';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '𓂀';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgEl;
}

// ─── Typewriter effect ───────────────────────
function appendMessageTyped(role, text, onComplete) {
  const msgEl = document.createElement('div');
  msgEl.className = `msg ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'oracle' ? '𓂀' : '☽';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (role !== 'oracle') {
    bubble.textContent = text;
    if (onComplete) onComplete();
    return msgEl;
  }

  // Speed adapts to length: fast for long texts, slow for short
  const speed = text.length < 200 ? 22 : text.length < 600 ? 12 : 6;
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.textContent = '▌';
  bubble.appendChild(cursor);

  let i = 0;
  function typeNext() {
    if (i < text.length) {
      cursor.before(document.createTextNode(text[i]));
      i++;
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(typeNext, speed);
    } else {
      cursor.remove();
      addPlayButton(bubble, text);
      if (onComplete) onComplete();
    }
  }
  typeNext();
  return msgEl;
}

function oracleSay(text, onComplete) {
  isWaiting = true;
  sendBtn.disabled = true;
  return appendMessageTyped('oracle', text, () => {
    isWaiting = false;
    sendBtn.disabled = false;
    if (onComplete) onComplete();
  });
}

// ─── Zodiac Badge ────────────────────────────
function showZodiacBadge(zodiac, birthStr) {
  const existing = document.getElementById('zodiacBadge');
  if (existing) existing.remove();
  const badge = document.createElement('div');
  badge.id = 'zodiacBadge';
  badge.className = 'zodiac-badge';
  badge.innerHTML = `<span class="zb-symbol">${zodiac.symbol}</span><span class="zb-info"><strong>${zodiac.sign}</strong><small>${zodiac.element} · ${zodiac.planet} · ${birthStr}</small></span>`;
  chatMessages.parentNode.insertBefore(badge, chatMessages);
}

// ─── Intro flow ──────────────────────────────
function buildZodiacContext() {
  if (!userZodiac) return '';
  return ` [${userZodiac.sign} ${userZodiac.symbol} · ${userZodiac.element} · ${userZodiac.planet}${userName ? ' · ' + userName : ''}]`;
}

function handleIntro(text) {
  if (introState === 'name') {
    if (isSkip(text)) {
      introState = 'done';
      oracleSay('Perfecto. ¿Qué quieres consultar?');
      return true;
    }
    const cleaned = text.trim().split(/\s+/)[0];
    userName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    introState = 'birth';
    appendDateForm();
    return true;
  }
  return false;
}

function appendDateForm() {
  introFormActive = true;
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const label = userName ? `${userName}, ¿cuál es tu fecha de nacimiento?` : '¿Cuál es tu fecha de nacimiento?';

  const msgEl = document.createElement('div');
  msgEl.className = 'msg oracle';
  msgEl.id = 'dateFormMsg';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '𓂀';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = `
    <div class="date-form-label">${label}</div>
    <div class="date-form-fields">
      <input type="number" id="bDay" placeholder="Día" min="1" max="31" class="date-input">
      <select id="bMonth" class="date-input date-select">
        <option value="">Mes</option>
        ${MONTHS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}
      </select>
      <input type="number" id="bYear" placeholder="Año" min="1920" max="2015" class="date-input">
    </div>
    <div class="date-form-actions">
      <button id="bSubmit" class="date-submit-btn">Confirmar ☥</button>
      <button id="bSkip" class="date-skip-btn">omitir</button>
    </div>
  `;

  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  document.getElementById('bSubmit').addEventListener('click', () => {
    const day   = parseInt(document.getElementById('bDay').value);
    const month = parseInt(document.getElementById('bMonth').value);
    const year  = parseInt(document.getElementById('bYear').value) || null;
    const dayInput = document.getElementById('bDay');
    const monthInput = document.getElementById('bMonth');

    dayInput.style.borderColor = '';
    monthInput.style.borderColor = '';

    if (!day || day < 1 || day > 31) { dayInput.style.borderColor = '#ff5555'; return; }
    if (!month) { monthInput.style.borderColor = '#ff5555'; return; }

    submitBirthDate(day, month, year, msgEl);
  });

  document.getElementById('bSkip').addEventListener('click', () => {
    msgEl.remove();
    introFormActive = false;
    introState = 'done';
    oracleSay(userName ? `Bien, ${userName}. ¿Qué quieres consultar?` : '¿Qué quieres consultar?');
  });
}

function submitBirthDate(day, month, year, formEl) {
  const zodiac = getZodiacInfo(day, month);
  userZodiac = zodiac;
  userBirth  = `${day}/${month}${year ? '/' + year : ''}`;
  introState = 'done';
  introFormActive = false;
  formEl.remove();

  const intro = userName
    ? `${zodiac.symbol} ${userName} es ${zodiac.sign}, ${zodiac.element.toLowerCase()}, bajo ${zodiac.planet}. ¿Qué consultas?`
    : `${zodiac.symbol} ${zodiac.sign}, ${zodiac.element.toLowerCase()}, bajo ${zodiac.planet}. ¿Qué consultas?`;
  oracleSay(intro);
  showZodiacBadge(zodiac, userBirth);
}

// ─── Spread selector ─────────────────────────
function appendSpreadSelector(consulta, onSelect) {
  const msgEl = document.createElement('div');
  msgEl.className = 'msg oracle';
  msgEl.id = 'spreadSelectorMsg';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '𓂀';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble spread-selector-bubble';

  const label = document.createElement('div');
  label.className = 'spread-selector-label';
  label.textContent = '¿Qué tirada quieres?';
  bubble.appendChild(label);

  const grid = document.createElement('div');
  grid.className = 'spread-selector-grid';

  SPREADS.forEach(spread => {
    const btn = document.createElement('button');
    btn.className = 'spread-option-btn';
    btn.innerHTML = `<span class="spread-opt-icon">${spread.icon}</span><span class="spread-opt-label">${spread.label}</span><span class="spread-opt-desc">${spread.desc}</span>`;
    btn.addEventListener('click', () => {
      msgEl.remove();
      onSelect(spread);
    });
    grid.appendChild(btn);
  });

  bubble.appendChild(grid);
  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgEl;
}

// ─── Tarot Spread ────────────────────────────
function buildCardEl(card, delayMs) {
  const cardEl = document.createElement('div');
  cardEl.className = 'tarot-card';
  cardEl.innerHTML = `
    <div class="tarot-card-inner">
      <div class="tarot-card-back">☥</div>
      <div class="tarot-card-front">
        <img src="${card.img}" alt="${card.nombre}" class="card-photo">
        <div class="card-name-overlay">${card.nombre}</div>
      </div>
    </div>`;
  setTimeout(() => cardEl.classList.add('revealed'), delayMs);
  return cardEl;
}

function buildPosition(card, label, delay) {
  const pos = document.createElement('div');
  pos.className = 'tarot-position';
  const lbl = document.createElement('div');
  lbl.className = 'tarot-pos-label';
  lbl.textContent = label;
  pos.appendChild(lbl);
  pos.appendChild(buildCardEl(card, delay));
  return pos;
}

function revealDelay(n) {
  if (n <= 3) return 1400;
  if (n <= 7) return 800;
  return 450;
}

function appendTarotSpread(cards, positions, layout) {
  const msgEl = document.createElement('div');
  msgEl.className = 'msg oracle';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '𓂀';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble tarot-bubble';

  const step = revealDelay(cards.length);
  let spreadEl;

  if (layout === 'cruz') {
    spreadEl = document.createElement('div');
    spreadEl.className = 'tarot-spread spread-cruz';
    // Orden visual: Solución(3) arriba, Afirmación(0) izq, Síntesis(4) centro, Discusión(2) der, Negación(1) abajo
    const order = [3, 0, 4, 2, 1];
    order.forEach((cardIdx, displayIdx) => {
      spreadEl.appendChild(buildPosition(cards[cardIdx], positions[cardIdx], 600 + displayIdx * step));
    });

  } else if (layout === 'arbol') {
    spreadEl = document.createElement('div');
    spreadEl.className = 'tarot-spread spread-arbol';
    cards.forEach((card, i) => {
      spreadEl.appendChild(buildPosition(card, positions[i], 600 + i * step));
    });

  } else {
    const sizeClass = cards.length === 1 ? 'spread-1' : cards.length <= 3 ? 'spread-3' : cards.length <= 7 ? 'spread-7' : 'spread-big';
    spreadEl = document.createElement('div');
    spreadEl.className = `tarot-spread ${sizeClass}`;
    cards.forEach((card, i) => {
      spreadEl.appendChild(buildPosition(card, positions[i], 600 + i * step));
    });
  }

  bubble.appendChild(spreadEl);
  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Devuelve el tiempo total de revelado para que el caller espere
  return 600 + cards.length * step + 800;
}

// ─── Main send ───────────────────────────────
async function sendMessage() {
  if (isWaiting || introFormActive) return;

  const text = messageInput.value.trim();
  if (!text && !pendingImage) return;

  const imgSrc    = pendingImage ? previewImg.src : null;
  const imgBase64 = pendingImage;
  const imgType   = pendingImageType;

  appendMessage('user', text || '[ imagen ]');

  messageInput.value = '';
  messageInput.style.height = 'auto';
  pendingImage = null; pendingImageType = null;
  previewImg.src = '';
  imagePreviewArea.classList.remove('active');

  // Flujo intro
  if (introState !== 'done' && !imgBase64) {
    if (handleIntro(text)) return;
  }

  if (isTarotRequest(text) && !imgBase64) {
    await handleTarotReading(text);
    return;
  }

  if (isConsciousnessTest(text) && !imgBase64) {
    await handleConsciousnessTest(text);
    return;
  }

  await callOracle(text, imgBase64, imgType);
}

function appendDeckSelector(onSelect) {
  const msgEl = document.createElement('div');
  msgEl.className = 'msg oracle';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '𓂀';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble deck-selector-bubble';
  bubble.innerHTML = `
    <div class="deck-selector-label">☥ Elige tu baraja ☥</div>
    <div class="deck-selector-grid">
      <button class="deck-opt-btn" data-deck="egipcio">
        <span class="deck-opt-icon">𓂀</span>
        <span class="deck-opt-name">Tarot Egipcio</span>
        <span class="deck-opt-desc">78 arcanos del panteón egipcio</span>
      </button>
      <button class="deck-opt-btn" data-deck="bruja">
        <span class="deck-opt-icon">🌿</span>
        <span class="deck-opt-name">Bruja Verde</span>
        <span class="deck-opt-desc">Green Witch Tarot — naturaleza y magia</span>
      </button>
    </div>
  `;
  msgEl.appendChild(avatar);
  msgEl.appendChild(bubble);
  chatMessages.appendChild(msgEl);
  msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  bubble.querySelectorAll('.deck-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDeck = btn.dataset.deck;
      msgEl.remove();
      onSelect(activeDeck);
    });
  });
}

async function handleTarotReading(consulta) {
  isWaiting = true;
  sendBtn.disabled = true;

  appendDeckSelector(async (deck) => {
    const deckLabel = deck === 'bruja' ? 'Green Witch Tarot' : 'Tarot Egipcio';
    appendSpreadSelector(consulta, async (spread) => {
      const shuffleEl = appendMessage('oracle', '☥ Las cartas se mueven...');
      await new Promise(r => setTimeout(r, 1000));

      const cards = drawCards(spread.positions.length);
      shuffleEl.remove();
      const totalReveal = appendTarotSpread(cards, spread.positions, spread.layout);
      await new Promise(r => setTimeout(r, totalReveal));

      const zodiacCtx = buildZodiacContext();
      const cardList = cards.map((c, i) => `Pos${i + 1} (${spread.positions[i]}): ${c.nombre}`).join(' | ');
      const prompt = `[TIRADA — BARAJA: ${deckLabel} — ${spread.label}: ${spread.desc}] ${cardList} | Consulta: ${consulta}${zodiacCtx}`;

      const typingEl = appendTyping();
      const apiMessages = [...conversationHistory, { role: 'user', content: prompt }];

      try {
        const res = await fetch('/api/oracle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, userProfile: userProfile || null, userMemory: loadMemory() || null, uid: USER_UID }),
        });
        const data = await res.json();
        typingEl.remove();
        const reply = res.ok ? data.response : (data.error || 'El Oráculo guarda silencio...');

        conversationHistory.push({ role: 'user', content: prompt });
        conversationHistory.push({ role: 'assistant', content: reply });
        if (conversationHistory.length > MAX_HISTORY) conversationHistory = conversationHistory.slice(-MAX_HISTORY);
        if (conversationHistory.length % 6 === 0) generateMemory();

        appendMessageTyped('oracle', reply, () => {
          isWaiting = false;
          sendBtn.disabled = false;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
      } catch {
        typingEl.remove();
        appendMessageTyped('oracle', '✦ El velo se cerró. Intenta de nuevo...', () => {
          isWaiting = false;
          sendBtn.disabled = false;
        });
      }
    });
  });
}

async function callOracle(text, imgBase64, imgType) {
  isWaiting = true;
  sendBtn.disabled = true;
  const typingEl = appendTyping();

  const zodiacCtx = buildZodiacContext();
  const userText = text ? (text + zodiacCtx) : null;

  // Build current user turn content (may include image)
  const currentContent = [];
  if (imgBase64) {
    currentContent.push({
      type: 'image',
      source: { type: 'base64', media_type: imgType || 'image/jpeg', data: imgBase64 },
    });
  }
  currentContent.push({
    type: 'text',
    text: userText || 'Analiza esta imagen aplicando el protocolo de velomancia: describe lo que ves, identifica los parámetros según el diccionario de interpretación y entrega una lectura completa.',
  });

  // Full messages array: history + current turn
  const apiMessages = [
    ...conversationHistory,
    { role: 'user', content: imgBase64 ? currentContent : (userText || '') },
  ];

  try {
    const res = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages, userProfile: userProfile || null, userMemory: loadMemory() || null, uid: USER_UID }),
    });
    const data = await res.json();
    typingEl.remove();
    const reply = res.ok ? data.response : (data.error || 'El Oráculo guarda silencio...');

    // Save to history (text only — no base64 in stored history)
    conversationHistory.push({ role: 'user', content: userText || '[ imagen ]' });
    conversationHistory.push({ role: 'assistant', content: reply });
    if (conversationHistory.length > MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }
    if (conversationHistory.length % 6 === 0) generateMemory();

    appendMessageTyped('oracle', reply, () => {
      isWaiting = false;
      sendBtn.disabled = false;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  } catch {
    typingEl.remove();
    appendMessageTyped('oracle', '✦ El velo se cerró. Intenta de nuevo...', () => {
      isWaiting = false;
      sendBtn.disabled = false;
    });
  }
}

// ─── Generación y persistencia de memoria ────
async function generateMemory() {
  if (conversationHistory.length < 6) return;
  try {
    const res = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summarize: true, messages: conversationHistory }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.summary) saveMemory(data.summary);

    // Guardar memoria estructurada en el servidor
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid:      USER_UID,
        profile:  userProfile || null,
        summary:  data.summary  || '',
        topics:   data.topics   || [],
        insights: data.insights || '',
      }),
    });
  } catch { /* silencioso */ }
}

async function loadRemoteMemory() {
  try {
    const res = await fetch('/api/memory?uid=' + USER_UID);
    if (!res.ok) return;
    const data = await res.json();
    if (data.memory?.summary) {
      // Fusionar con la memoria local si la remota es más rica
      const local = loadMemory();
      if (!local || data.memory.summary.length > local.length) {
        saveMemory(data.memory.summary);
      }
    }
  } catch { /* silencioso */ }
}

// Guardar memoria y liberar recursos de audio al salir
window.addEventListener('beforeunload', () => {
  stopAll();
  if (conversationHistory.length >= 6) generateMemory();
});

// ─── Reconocimiento de voz (STT) ─────────────
{
  const micBtn = document.getElementById('micBtn');
  const SR     = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!micBtn || !SR) {
    if (micBtn) {
      micBtn.title         = 'Voz no disponible — usa Chrome o Edge';
      micBtn.style.opacity = '0.35';
      micBtn.style.cursor  = 'default';
    }
  } else {
    const LANG_MAP = { es:'es-ES', en:'en-US', pt:'pt-BR', fr:'fr-FR', de:'de-DE', it:'it-IT' };

    let isListening  = false;   // el usuario activó el mic
    let activeRec    = null;
    let silenceTimer = null;
    let accumulated  = '';      // texto final acumulado entre reinicios
    let shouldSend   = false;   // solo enviar si el silencio lo disparó

    function stopListening(send) {
      isListening = false;
      shouldSend  = send;
      clearTimeout(silenceTimer);
      if (activeRec) { try { activeRec.stop(); } catch (_) {} }
      micBtn.classList.remove('listening');
      micBtn.textContent = '🎤';
    }

    function startRec() {
      const rec = new SR();
      rec.lang           = LANG_MAP[userProfile?.language || 'es'] || 'es-ES';
      rec.continuous     = false;  // más estable cross-browser
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      activeRec = rec;

      rec.onresult = (e) => {
        let interim = '';
        for (const r of e.results) {
          if (r.isFinal) accumulated += r[0].transcript + ' ';
          else           interim      = r[0].transcript;
        }
        const display = (accumulated + interim).trim();
        messageInput.value = display;
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';

        // Reiniciar timer de silencio en cada palabra detectada
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (isListening) stopListening(true);
        }, 2800);
      };

      rec.onend = () => {
        activeRec = null;
        if (!isListening) {
          // El usuario detuvo manualmente o el silencio disparó el envío
          if (shouldSend) {
            shouldSend = false;
            const texto = messageInput.value.trim();
            if (texto) sendMessage();
          }
          accumulated = '';
          return;
        }
        // El navegador detuvo la sesión por sí solo (límite de tiempo, pausa)
        // → reiniciar automáticamente si el usuario no pulsó stop
        try { startRec(); } catch (_) { stopListening(false); }
      };

      rec.onerror = (ev) => {
        activeRec = null;
        if (ev.error === 'not-allowed') {
          stopListening(false);
          accumulated = '';
          messageInput.placeholder = '⚠ Permite el micrófono en la barra del navegador';
          setTimeout(() => { messageInput.placeholder = 'Consulta al Oráculo... (Enter para enviar)'; }, 4000);
        } else if (ev.error === 'no-speech') {
          // sin voz detectada — reiniciar si sigue escuchando
          if (isListening) { try { startRec(); } catch (_) { stopListening(false); } }
        } else {
          if (isListening) { try { startRec(); } catch (_) { stopListening(false); } }
        }
      };

      try { rec.start(); } catch (_) { stopListening(false); }
    }

    micBtn.addEventListener('click', () => {
      if (isListening) {
        // El usuario pulsa stop manualmente — enviar lo que hay
        stopListening(!!messageInput.value.trim());
        return;
      }
      // Iniciar escucha
      isListening = true;
      shouldSend  = false;
      accumulated = '';
      messageInput.value = '';
      micBtn.classList.add('listening');
      micBtn.textContent = '⏹';
      startRec();
    });
  }
}

// ─── Reviews ─────────────────────────────────
(function initReviews() {
  const starSelector   = document.getElementById('starSelector');
  const reviewName     = document.getElementById('reviewName');
  const reviewText     = document.getElementById('reviewText');
  const reviewSubmit   = document.getElementById('reviewSubmitBtn');
  const reviewMsg      = document.getElementById('reviewMsg');
  const reviewsList    = document.getElementById('reviewsList');

  if (!starSelector) return;

  let selectedRating = 0;

  // Estrellas interactivas
  const stars = starSelector.querySelectorAll('.star-opt');
  stars.forEach(s => {
    s.addEventListener('mouseover', () => highlightStars(+s.dataset.v));
    s.addEventListener('mouseout',  () => highlightStars(selectedRating));
    s.addEventListener('click', () => {
      selectedRating = +s.dataset.v;
      highlightStars(selectedRating);
    });
  });

  function highlightStars(n) {
    stars.forEach(s => s.classList.toggle('active', +s.dataset.v <= n));
  }

  // Enviar reseña
  reviewSubmit.addEventListener('click', async () => {
    const name   = reviewName.value.trim();
    const text   = reviewText.value.trim();
    const rating = selectedRating;

    if (!name || !text || rating === 0) {
      showMsg('Completa tu nombre, estrellas y comentario.', 'error');
      return;
    }

    reviewSubmit.disabled = true;
    showMsg('Enviando...', '');

    try {
      const res  = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text, rating }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showMsg('✦ Tu experiencia fue publicada. Gracias.', 'ok');
        reviewName.value = '';
        reviewText.value = '';
        selectedRating = 0;
        highlightStars(0);
        prependReview(data.comment);
      } else {
        showMsg(data.error || 'Error al publicar.', 'error');
      }
    } catch {
      showMsg('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      reviewSubmit.disabled = false;
    }
  });

  function showMsg(msg, type) {
    reviewMsg.textContent = msg;
    reviewMsg.className   = 'review-msg ' + type;
  }

  // Cargar reseñas existentes
  async function loadReviews() {
    try {
      const res  = await fetch('/api/comments');
      const data = await res.json();
      reviewsList.innerHTML = '';
      if (!data.length) {
        reviewsList.innerHTML = '<div class="reviews-loading">Sé el primero en compartir tu experiencia.</div>';
        return;
      }
      data.forEach(prependReview);
    } catch {
      reviewsList.innerHTML = '<div class="reviews-loading">No se pudieron cargar las reseñas.</div>';
    }
  }

  function prependReview(r) {
    const card = document.createElement('div');
    card.className = 'review-card';
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    card.innerHTML = `
      <div class="review-card-header">
        <span class="review-card-name">${escHtml(r.name)}</span>
        <span class="review-card-stars">${stars}</span>
        <span class="review-card-date">${r.date || ''}</span>
      </div>
      <div class="review-card-text">${escHtml(r.text)}</div>
    `;
    reviewsList.prepend(card);
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  loadReviews();
})();

