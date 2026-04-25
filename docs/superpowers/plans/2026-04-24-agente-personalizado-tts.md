# ABUND-IA: Agente Personalizado + Texto a Voz — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar ABUND-IA en un guía espiritual personalizado que recuerda al usuario entre sesiones, conversa de forma natural en múltiples idiomas, y puede leer sus respuestas en voz alta con una voz clonada de ElevenLabs.

**Architecture:** El perfil del usuario (nombre, signo, idioma) se guarda en `localStorage` y se inyecta en el system prompt de `api/oracle.js` en cada petición. La memoria conversacional se genera con Claude tras cada 10 mensajes y se acumula en `localStorage`. El audio TTS se genera bajo demanda vía un nuevo endpoint Vercel `api/tts.js` que proxea a ElevenLabs API.

**Tech Stack:** Vanilla JS (frontend), Node.js Vercel serverless functions (backend), Claude API (Anthropic), ElevenLabs API (TTS), localStorage (persistencia de perfil), Web Audio API (reproducción de audio).

---

## Mapa de Archivos

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `app.js` | Modificar | Módulo de perfil, modal de bienvenida, inyección de perfil en peticiones, controles TTS, botón ▶ por mensaje |
| `api/oracle.js` | Modificar | Aceptar `userProfile`/`userMemory` en body, inyectarlos en system prompt, modo `summarize` |
| `api/tts.js` | Crear | Endpoint ElevenLabs — recibe texto, devuelve MP3 |
| `index.html` | Modificar | Modal de bienvenida, botón TTS auto, selector de idioma en cabecera |
| `styles.css` | Modificar | Estilos para modal, botón TTS, selector idioma, botón ▶ en burbujas |
| `vercel.json` | Modificar | Añadir función `api/tts.js` con `maxDuration: 30` |

---

## Tarea 1: Módulo de Perfil en `localStorage`

**Archivos:**
- Modificar: `app.js` — añadir al inicio, antes de `// ─── Particle Canvas`

- [ ] **Paso 1.1: Añadir módulo de perfil al inicio de `app.js`**

Insertar este bloque ANTES de la línea `/* ==========================================` en `app.js`:

```js
// ─── Perfil & Memoria ────────────────────────
const PROFILE_KEY  = 'abundia_profile';
const MEMORY_KEY   = 'abundia_memory';
const TTS_AUTO_KEY = 'abundia_tts_auto';

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
```

- [ ] **Paso 1.2: Verificar que el módulo carga sin errores**

Abrir la app en el navegador, abrir DevTools (F12) → Console.
Esperado: sin errores de JS. Escribir `loadProfile()` en la consola → devuelve `null`.

- [ ] **Paso 1.3: Commit**

```bash
git add app.js
git commit -m "feat: add localStorage profile/memory module"
```

---

## Tarea 2: Modal de Bienvenida (Primera Visita)

**Archivos:**
- Modificar: `index.html` — añadir modal antes de `</body>`
- Modificar: `styles.css` — añadir estilos del modal
- Modificar: `app.js` — lógica de mostrar/ocultar modal y cargar perfil existente

- [ ] **Paso 2.1: Añadir HTML del modal en `index.html`**

Insertar ANTES de `<script src="app.js">` (o antes de `</body>`):

```html
<!-- ── MODAL BIENVENIDA ─────────────────────── -->
<div id="welcomeModal" class="welcome-modal hidden">
  <div class="welcome-modal-inner">
    <div class="welcome-modal-glyph">𓂀</div>
    <h2 class="welcome-modal-title">Bienvenido al Oráculo</h2>
    <p class="welcome-modal-sub">Para personalizar tu experiencia, cuéntame algo sobre ti.</p>

    <div class="welcome-field">
      <label class="welcome-label">Nombre o alias espiritual</label>
      <input type="text" id="wName" class="welcome-input" placeholder="Tu nombre..." maxlength="40" autocomplete="off">
    </div>

    <div class="welcome-field">
      <label class="welcome-label">Tu signo zodiacal</label>
      <select id="wZodiac" class="welcome-input welcome-select">
        <option value="">— Selecciona —</option>
        <option value="Aries">♈ Aries</option>
        <option value="Tauro">♉ Tauro</option>
        <option value="Géminis">♊ Géminis</option>
        <option value="Cáncer">♋ Cáncer</option>
        <option value="Leo">♌ Leo</option>
        <option value="Virgo">♍ Virgo</option>
        <option value="Libra">♎ Libra</option>
        <option value="Escorpio">♏ Escorpio</option>
        <option value="Sagitario">♐ Sagitario</option>
        <option value="Capricornio">♑ Capricornio</option>
        <option value="Acuario">♒ Acuario</option>
        <option value="Piscis">♓ Piscis</option>
      </select>
    </div>

    <div class="welcome-field">
      <label class="welcome-label">Idioma preferido</label>
      <select id="wLang" class="welcome-input welcome-select">
        <option value="es">🇪🇸 Español</option>
        <option value="en">🇬🇧 English</option>
        <option value="pt">🇧🇷 Português</option>
        <option value="fr">🇫🇷 Français</option>
        <option value="de">🇩🇪 Deutsch</option>
        <option value="it">🇮🇹 Italiano</option>
      </select>
    </div>

    <button id="wSubmit" class="welcome-submit">☥ Entrar al Oráculo</button>
    <button id="wSkip" class="welcome-skip">omitir</button>
  </div>
</div>
```

- [ ] **Paso 2.2: Añadir estilos del modal en `styles.css`**

Añadir al final de `styles.css`:

```css
/* ── Modal de Bienvenida ───────────────────── */
.welcome-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
  animation: fadeIn .4s ease-out;
}
.welcome-modal.hidden { display: none; }

.welcome-modal-inner {
  background: #0a0a0a;
  border: 1px solid rgba(57,255,20,.3);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  max-width: 400px;
  width: 92%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  box-shadow: 0 0 40px rgba(57,255,20,.1);
  animation: msgAppear .4s ease-out;
}

.welcome-modal-glyph {
  font-size: 2.5rem;
  text-align: center;
  color: var(--green);
  text-shadow: 0 0 20px rgba(57,255,20,.6);
}

.welcome-modal-title {
  font-family: 'Space Mono', monospace;
  color: var(--green);
  font-size: 1.1rem;
  text-align: center;
  letter-spacing: .1em;
  margin: 0;
}

.welcome-modal-sub {
  color: var(--text-dim);
  font-size: .82rem;
  text-align: center;
  margin: -.4rem 0 0;
  line-height: 1.5;
}

.welcome-field {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.welcome-label {
  font-family: 'Space Mono', monospace;
  font-size: .7rem;
  color: var(--text-dim);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.welcome-input {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(57,255,20,.2);
  border-radius: 6px;
  padding: .6rem .9rem;
  color: var(--text);
  font-family: 'Space Mono', monospace;
  font-size: .85rem;
  outline: none;
  transition: border-color .2s;
  width: 100%;
  box-sizing: border-box;
}
.welcome-input:focus { border-color: var(--green); }
.welcome-select option { background: #111; }

.welcome-submit {
  background: rgba(57,255,20,.1);
  border: 1px solid var(--green);
  color: var(--green);
  font-family: 'Space Mono', monospace;
  font-size: .85rem;
  padding: .75rem;
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: .08em;
  transition: background .2s, box-shadow .2s;
  width: 100%;
}
.welcome-submit:hover {
  background: rgba(57,255,20,.2);
  box-shadow: 0 0 12px rgba(57,255,20,.3);
}

.welcome-skip {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-family: 'Space Mono', monospace;
  font-size: .72rem;
  cursor: pointer;
  text-align: center;
  padding: .2rem;
  letter-spacing: .06em;
  text-decoration: underline;
}
.welcome-skip:hover { color: var(--text); }

/* ── Selector de idioma en cabecera ─────────── */
.lang-selector {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(57,255,20,.2);
  border-radius: 6px;
  padding: .25rem .5rem;
  color: var(--text-dim);
  font-family: 'Space Mono', monospace;
  font-size: .72rem;
  cursor: pointer;
  outline: none;
}
.lang-selector:focus { border-color: var(--green); }
.lang-selector option { background: #111; }

/* ── Botón TTS auto ─────────────────────────── */
.tts-toggle-btn {
  background: transparent;
  border: 1px solid rgba(57,255,20,.2);
  border-radius: 6px;
  color: var(--text-dim);
  font-size: .85rem;
  padding: .25rem .55rem;
  cursor: pointer;
  transition: color .2s, border-color .2s;
  line-height: 1;
}
.tts-toggle-btn.active {
  color: var(--green);
  border-color: var(--green);
  box-shadow: 0 0 8px rgba(57,255,20,.2);
}

/* ── Botón ▶ por mensaje ────────────────────── */
.msg-play-btn {
  background: transparent;
  border: none;
  color: rgba(57,255,20,.4);
  font-size: .8rem;
  cursor: pointer;
  padding: .15rem .3rem;
  margin-top: .4rem;
  display: block;
  transition: color .2s;
  font-family: 'Space Mono', monospace;
  letter-spacing: .04em;
}
.msg-play-btn:hover { color: var(--green); }
.msg-play-btn.playing { color: var(--green); }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

- [ ] **Paso 2.3: Añadir lógica del modal en `app.js`**

Añadir este bloque ANTES de `// ─── Oracle State` (línea ~473) en `app.js`:

```js
// ─── Modal de Bienvenida ─────────────────────
let userProfile = loadProfile(); // null si primera visita

function initProfileFromStorage() {
  if (!userProfile) return;
  // Aplicar datos del perfil al estado existente de la app
  userName   = userProfile.name  || null;
  userZodiac = userProfile.zodiac
    ? ZODIAC_DATA.find(z => z.sign === userProfile.zodiac) || null
    : null;
  introState = 'done'; // Saltar intro

  if (userZodiac) showZodiacBadge(userZodiac, userProfile.zodiac);

  // Reemplazar mensaje estático del chat con saludo personalizado
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
  // Botón enviar modal
  document.getElementById('wSubmit').addEventListener('click', submitWelcomeModal);
  // Botón omitir
  document.getElementById('wSkip').addEventListener('click', () => {
    saveProfile({ name: null, zodiac: null, language: 'es', createdAt: new Date().toISOString() });
    userProfile = loadProfile();
    hideWelcomeModal();
    introState = 'done';
    const staticMsg = chatMessages.querySelector('.msg.oracle');
    if (staticMsg) staticMsg.querySelector('.msg-bubble').textContent = '¿Qué consultas?';
  });
  // Mostrar modal solo si no hay perfil
  if (!loadProfile()) {
    showWelcomeModal();
  } else {
    initProfileFromStorage();
  }
  // Botón TTS toggle
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
  // Selector de idioma en cabecera
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
```

- [ ] **Paso 2.4: Verificar modal en navegador**

1. Abrir la app con DevTools abierto
2. En Console ejecutar: `localStorage.clear()` y refrescar
3. Esperado: aparece el modal de bienvenida superpuesto
4. Rellenar nombre "Marco", seleccionar "Escorpio", idioma "Español" → pulsar "Entrar"
5. Esperado: modal desaparece, chat muestra "Marco, el Oráculo te recibe..."
6. Refrescar página
7. Esperado: modal NO aparece, saludo personalizado aparece directamente

- [ ] **Paso 2.5: Commit**

```bash
git add app.js index.html styles.css
git commit -m "feat: welcome modal with profile persistence in localStorage"
```

---

## Tarea 3: Selector de Idioma y Botón TTS en Cabecera del Chat

**Archivos:**
- Modificar: `index.html` — añadir controles en `oraculo-header`

- [ ] **Paso 3.1: Actualizar cabecera del oráculo en `index.html`**

Reemplazar el bloque `<div class="oraculo-header">`:

```html
<div class="oraculo-header">
  <div class="oraculo-status">
    <div class="status-dot"></div>
    <span>Oráculo activo</span>
  </div>
  <span class="oraculo-title-bar">☥ Tarot Egipcio ☥</span>
  <div class="oraculo-header-controls">
    <select id="headerLang" class="lang-selector" title="Idioma">
      <option value="es">ES</option>
      <option value="en">EN</option>
      <option value="pt">PT</option>
      <option value="fr">FR</option>
      <option value="de">DE</option>
      <option value="it">IT</option>
    </select>
    <button id="ttsAutoBtn" class="tts-toggle-btn" title="Activar voz automática">🔊</button>
  </div>
</div>
```

- [ ] **Paso 3.2: Añadir flex al header para alinear controles en `styles.css`**

Buscar el selector `.oraculo-header` en `styles.css` y añadir (o asegurarse de que tenga):

```css
.oraculo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* resto de propiedades existentes... */
}
.oraculo-header-controls {
  display: flex;
  align-items: center;
  gap: .5rem;
}
```

**Nota:** Solo añadir las propiedades que no existan ya. No duplicar reglas CSS existentes.

- [ ] **Paso 3.3: Verificar en navegador**

Abrir la app. En la cabecera del chat debe verse: estado activo | título | selector ES/EN/… | botón 🔊.
Al pulsar 🔊 debe cambiar de color (clase `active`).

- [ ] **Paso 3.4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add language selector and TTS toggle to oracle header"
```

---

## Tarea 4: Inyección de Perfil en `api/oracle.js`

**Archivos:**
- Modificar: `api/oracle.js` — aceptar `userProfile`, `userMemory`, `summarize` en body

- [ ] **Paso 4.1: Modificar `api/oracle.js` para inyectar perfil y soportar modo summarize**

Reemplazar la función `handler` completa (líneas 219–284) con:

```js
const LANGUAGE_NAMES = { es:'español', en:'inglés', pt:'portugués', fr:'francés', de:'alemán', it:'italiano' };

module.exports = async function handler(req, res) {
  const allowed = ['https://abund-ia.es', 'https://www.abund-ia.es'];
  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { message, image, imageType, messages, userProfile, userMemory, summarize } = req.body;

    // ── Modo resumen de memoria ──────────────────
    if (summarize && messages && messages.length > 0) {
      const summaryPrompt = 'Resume en máximo 3 frases cortas los temas, preguntas y patrones principales de esta conversación. Solo el resumen, sin introducción ni cierre.';
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: 'Eres un asistente que resume conversaciones en pocas frases.',
          messages: [...messages, { role: 'user', content: summaryPrompt }],
        }),
      });
      if (!apiRes.ok) return res.status(500).json({ error: 'Error generando resumen' });
      const data = await apiRes.json();
      return res.status(200).json({ summary: data.content[0].text });
    }

    if (!message && !image && (!messages || !messages.length)) {
      return res.status(400).json({ error: 'Se requiere mensaje o imagen.' });
    }

    // ── Construir system prompt personalizado ────
    let systemPrompt = SYSTEM_PROMPT;

    if (userProfile) {
      const langName = LANGUAGE_NAMES[userProfile.language] || 'español';
      const profileBlock = [
        '\n[PERFIL DEL USUARIO]',
        userProfile.name   ? `Nombre: ${userProfile.name}`  : null,
        userProfile.zodiac ? `Signo: ${userProfile.zodiac}` : null,
        `Idioma preferido: ${langName}`,
        userMemory ? `Sesiones anteriores: ${userMemory}` : null,
        `IMPORTANTE: Responde SIEMPRE en ${langName}. Usa el nombre del usuario de forma natural cuando fluya, no en cada respuesta.`,
      ].filter(Boolean).join('\n');
      systemPrompt = SYSTEM_PROMPT + profileBlock;
    }

    // ── Construir mensajes ───────────────────────
    let apiMessages;
    if (messages && messages.length > 0) {
      apiMessages = messages;
    } else {
      const content = [];
      if (image) {
        content.push({ type: 'image', source: { type: 'base64', media_type: imageType || 'image/jpeg', data: image } });
      }
      content.push({
        type: 'text',
        text: message || 'Analiza esta imagen aplicando el protocolo de velomancia: describe lo que ves, identifica los parámetros según el diccionario de interpretación y entrega una lectura completa.',
      });
      apiMessages = [{ role: 'user', content }];
    }

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1800,
        system: systemPrompt,
        messages: apiMessages,
      }),
    });

    if (!apiRes.ok) {
      const err = await apiRes.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: `API error ${apiRes.status}: ${err}` });
    }

    const data = await apiRes.json();
    res.status(200).json({ response: data.content[0].text });

  } catch (error) {
    console.error('Error del Oráculo:', error?.message || error);
    res.status(500).json({ error: `Error: ${error?.message || 'Fallo desconocido'}` });
  }
};
```

- [ ] **Paso 4.2: Modificar `callOracle` en `app.js` para enviar el perfil**

Buscar la función `callOracle` en `app.js` (~línea 991). Reemplazar el cuerpo del `fetch` para incluir `userProfile` y `userMemory`:

```js
// En callOracle, reemplazar el objeto body del fetch:
body: JSON.stringify({
  messages: apiMessages,
  userProfile: userProfile || null,
  userMemory: loadMemory() || null,
}),
```

Hacer el mismo cambio en `handleTarotReading` (~línea 962):

```js
body: JSON.stringify({
  messages: apiMessages,
  userProfile: userProfile || null,
  userMemory: loadMemory() || null,
}),
```

Y en `handleConsciousnessTest` (~línea 451, buscar el fetch a `/api/oracle`):

```js
body: JSON.stringify({
  messages: apiMessages,
  userProfile: userProfile || null,
  userMemory: loadMemory() || null,
}),
```

- [ ] **Paso 4.3: Verificar inyección de perfil**

1. En DevTools Console: `localStorage.setItem('abundia_profile', JSON.stringify({name:'Marco',zodiac:'Escorpio',language:'en',createdAt:'2026-04-24'}))`
2. Refrescar y enviar un mensaje cualquiera
3. Esperado: el oráculo responde en inglés y puede usar el nombre Marco

- [ ] **Paso 4.4: Commit**

```bash
git add api/oracle.js app.js
git commit -m "feat: inject user profile and memory into oracle system prompt"
```

---

## Tarea 5: Generación de Memoria Conversacional

**Archivos:**
- Modificar: `app.js` — llamar al endpoint `/api/oracle` en modo `summarize`

- [ ] **Paso 5.1: Añadir función `generateMemory` en `app.js`**

Añadir justo después de la función `callOracle` (~línea 1047):

```js
// ─── Generación de memoria ───────────────────
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
  } catch { /* silencioso — no interrumpir la UI */ }
}
```

- [ ] **Paso 5.2: Llamar a `generateMemory` cada 10 mensajes**

En `callOracle`, tras la línea `if (conversationHistory.length > MAX_HISTORY)` (dentro del try, después del push al historial):

```js
// Generar memoria cada 10 mensajes (en background, no bloquea UI)
if (conversationHistory.length % 10 === 0) generateMemory();
```

Añadir el mismo trigger en `handleTarotReading` (en el mismo lugar dentro del try).

- [ ] **Paso 5.3: Llamar a `generateMemory` al salir de la página**

Añadir al final de `app.js`, antes del cierre del archivo:

```js
// Guardar memoria al salir
window.addEventListener('beforeunload', () => {
  if (conversationHistory.length >= 6) generateMemory();
});
```

- [ ] **Paso 5.4: Verificar generación de memoria**

1. Enviar 10+ mensajes al oráculo en una sesión
2. En DevTools Console: `localStorage.getItem('abundia_memory')`
3. Esperado: devuelve un resumen de 2-3 frases de la conversación

- [ ] **Paso 5.5: Commit**

```bash
git add app.js
git commit -m "feat: generate conversational memory summary and persist to localStorage"
```

---

## Tarea 6: Endpoint TTS con ElevenLabs (`api/tts.js`)

**Archivos:**
- Crear: `api/tts.js`
- Modificar: `vercel.json`

- [ ] **Paso 6.1: Crear `api/tts.js`**

```js
const ELEVENLABS_API = 'https://api.elevenlabs.io/v1/text-to-speech';

const LANG_CODES = {
  es: 'es', en: 'en', pt: 'pt', fr: 'fr', de: 'de', it: 'it',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { text, language } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Se requiere campo "text"' });
  }

  const voiceId  = process.env.ELEVENLABS_VOICE_ID;
  const apiKey   = process.env.ELEVENLABS_API_KEY;
  if (!voiceId || !apiKey) {
    return res.status(500).json({ error: 'TTS no configurado' });
  }

  const langCode = LANG_CODES[language] || 'es';

  try {
    const elevenRes = await fetch(`${ELEVENLABS_API}/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.slice(0, 2500),
        model_id: 'eleven_multilingual_v2',
        language_code: langCode,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error('ElevenLabs error:', errText);
      return res.status(503).json({ error: 'Error en servicio TTS' });
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('TTS error:', error?.message);
    res.status(503).json({ error: 'Servicio TTS no disponible' });
  }
};
```

- [ ] **Paso 6.2: Actualizar `vercel.json`**

Reemplazar el contenido de `vercel.json`:

```json
{
  "version": 2,
  "functions": {
    "api/oracle.js": { "maxDuration": 30 },
    "api/tts.js":    { "maxDuration": 30 }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin",  "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

- [ ] **Paso 6.3: Configurar variables de entorno en Vercel**

En el dashboard de Vercel → Settings → Environment Variables, añadir:
- `ELEVENLABS_API_KEY` — clave API de ElevenLabs (se obtiene en elevenlabs.io → Profile → API Keys)
- `ELEVENLABS_VOICE_ID` — ID de la voz clonada (en ElevenLabs → Voices → tu voz → Voice ID)

Para test local: crear archivo `.env` en la raíz (NO commitear):
```
ELEVENLABS_API_KEY=tu_clave_aqui
ELEVENLABS_VOICE_ID=tu_voice_id_aqui
```

- [ ] **Paso 6.4: Verificar endpoint TTS tras deploy**

```bash
curl -X POST https://abund-ia.es/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"El Oráculo habla.","language":"es"}' \
  --output test.mp3
```

Esperado: archivo `test.mp3` descargado y reproducible.

- [ ] **Paso 6.5: Commit**

```bash
git add api/tts.js vercel.json
git commit -m "feat: add ElevenLabs TTS endpoint with multilingual support"
```

---

## Tarea 7: Controles TTS en Frontend (Botón ▶ por Mensaje y Auto-Lectura)

**Archivos:**
- Modificar: `app.js` — función TTS, botón ▶ en `appendMessageTyped`

- [ ] **Paso 7.1: Añadir módulo TTS en `app.js`**

Añadir JUSTO ANTES de `// ─── Oracle State` (antes de `const chatMessages = ...`):

```js
// ─── TTS (Texto a Voz) ────────────────────────
let currentAudio = null;

async function speakText(text, btnEl) {
  // Detener audio anterior
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    // Resetear botones activos
    document.querySelectorAll('.msg-play-btn.playing').forEach(b => {
      b.textContent = '▶ escuchar';
      b.classList.remove('playing');
    });
  }

  if (!btnEl) return; // Solo parar si no hay botón nuevo

  const lang = userProfile?.language || 'es';
  btnEl.textContent = '⏳';
  btnEl.disabled = true;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang }),
    });
    if (!res.ok) throw new Error('TTS error');

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;

    btnEl.textContent = '⏸ pausar';
    btnEl.classList.add('playing');
    btnEl.disabled = false;

    audio.play();
    audio.onended = () => {
      btnEl.textContent = '▶ escuchar';
      btnEl.classList.remove('playing');
      URL.revokeObjectURL(url);
      currentAudio = null;
    };

    btnEl.onclick = () => {
      if (audio.paused) {
        audio.play();
        btnEl.textContent = '⏸ pausar';
        btnEl.classList.add('playing');
      } else {
        audio.pause();
        btnEl.textContent = '▶ escuchar';
        btnEl.classList.remove('playing');
      }
    };

  } catch {
    btnEl.textContent = '▶ escuchar';
    btnEl.disabled = false;
  }
}

function addPlayButton(bubble, text) {
  const btn = document.createElement('button');
  btn.className = 'msg-play-btn';
  btn.textContent = '▶ escuchar';
  btn.addEventListener('click', () => speakText(text, btn));
  bubble.appendChild(btn);

  // Auto-lectura si está activada
  if (loadTtsAuto()) {
    speakText(text, btn);
  }
}
```

- [ ] **Paso 7.2: Conectar `addPlayButton` en `appendMessageTyped`**

En `app.js`, en la función `appendMessageTyped`, buscar el bloque donde se elimina el cursor y se llama `onComplete` (líneas ~614–617):

```js
    } else {
      cursor.remove();
      if (onComplete) onComplete();
    }
```

Reemplazar con:

```js
    } else {
      cursor.remove();
      addPlayButton(bubble, text);
      if (onComplete) onComplete();
    }
```

- [ ] **Paso 7.3: Verificar flujo TTS completo**

1. Deploy la aplicación (o probar con `vercel dev` en local)
2. Asegurarse de tener las variables `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` configuradas
3. Enviar un mensaje al oráculo
4. Esperado: tras el efecto typewriter aparece botón "▶ escuchar" debajo de la burbuja del oráculo
5. Pulsar el botón → debe cargar brevemente (⏳) y luego reproducir audio en la voz clonada
6. Pulsar "⏸ pausar" → pausa el audio
7. Activar el toggle 🔊 en la cabecera, enviar otro mensaje
8. Esperado: el audio se reproduce automáticamente al terminar el typewriter

- [ ] **Paso 7.4: Commit**

```bash
git add app.js
git commit -m "feat: add per-message TTS play button and auto-speech toggle"
```

---

## Tarea 8: Deploy y Verificación Final

- [ ] **Paso 8.1: Verificar variables de entorno en Vercel**

En Vercel Dashboard confirmar que existen:
- `ANTHROPIC_API_KEY` (ya existente)
- `ELEVENLABS_API_KEY` (nueva)
- `ELEVENLABS_VOICE_ID` (nueva)

- [ ] **Paso 8.2: Deploy a producción**

```bash
vercel --prod
```

- [ ] **Paso 8.3: Test de regresión en producción**

Verificar que los flujos existentes siguen funcionando:
1. Primera visita (limpiar localStorage) → aparece modal → completar perfil → chat funciona
2. Tirada de tarot: pedir "tirada de 3 cartas" → funciona con el perfil inyectado
3. Velomancia: subir imagen de vela → interpretación funciona
4. TTS: respuesta del oráculo → botón ▶ aparece → audio se reproduce
5. Cambiar idioma a EN → respuesta siguiente en inglés
6. Auto-lectura: activar 🔊 → siguiente respuesta se lee automáticamente
7. Segunda visita (refrescar sin limpiar localStorage) → saludo personalizado, sin modal

- [ ] **Paso 8.4: Commit final**

```bash
git add .
git commit -m "feat: complete personalized agent with TTS — profile, memory, ElevenLabs voice"
```

---

## Pasos Previos al Código: Crear Voz en ElevenLabs

Antes de ejecutar la Tarea 6, completar estos pasos en elevenlabs.io:

1. Crear cuenta en [elevenlabs.io](https://elevenlabs.io)
2. Ir a **Voices** → **Add Voice** → **Instant Voice Cloning**
3. Subir 1-2 minutos de audio de una voz grave, misteriosa, cálida (MP3 o WAV, buena calidad)
4. Nombrar la voz "ABUND-IA Oracle"
5. Copiar el **Voice ID** generado (lo necesitarás como variable de entorno)
6. Ir a **Profile** → **API Keys** → copiar la clave API

**Sin estos pasos la Tarea 6 no puede completarse.**
