# ABUND-IA: Agente Personalizado + Texto a Voz
**Fecha:** 2026-04-24  
**Estado:** Aprobado

---

## Resumen

Transformar ABUND-IA de un oráculo genérico a un **guía espiritual personalizado** que recuerda al usuario entre sesiones, conversa de forma natural y cálida, muestra las respuestas con efecto typewriter, y puede leer en voz alta con una voz clonada mediante ElevenLabs en 6 idiomas (ES, EN, PT, FR, DE, IT).

---

## 1. Perfil de Usuario y Memoria Personalizada

### Flujo de bienvenida
- Al abrir la app por primera vez (o si no existe `abundia_profile` en localStorage), aparece un **modal de bienvenida** que recoge:
  - Nombre o alias espiritual (texto libre)
  - Signo zodiacal (selector con los 12 signos)
  - Idioma preferido (selector: ES / EN / PT / FR / DE / IT)
- El modal no se puede cerrar sin completar los campos obligatorios (nombre + idioma mínimo)
- Los datos se guardan en `localStorage` bajo la clave `abundia_profile` como JSON

### Estructura del perfil
```json
{
  "name": "Marco",
  "zodiac": "Escorpio",
  "language": "es",
  "createdAt": "2026-04-24T10:00:00Z"
}
```

### Memoria conversacional acumulativa
- Clave en localStorage: `abundia_memory`
- Se genera un resumen de la sesión cada vez que la conversación supera 10 mensajes o al cerrar/refrescar la página
- El resumen se genera con una llamada adicional a Claude (prompt corto: "Resume en 3 frases los temas principales de esta conversación")
- Máximo 500 caracteres guardados para no saturar el system prompt
- Se inyecta al inicio del system prompt en cada nueva sesión

### Uso en el system prompt
```
[MEMORIA DEL USUARIO]
Nombre: Marco | Signo: Escorpio | Idioma: español
Sesiones anteriores: Ha consultado sobre relaciones amorosas, miedo al cambio
y una decisión laboral importante. Tiene interés en magia de protección.
```

### Configuración de perfil
- Icono de engranaje ⚙️ en la barra superior abre un panel para editar el perfil o resetear la memoria

---

## 2. Tono Conversacional y Efecto Typewriter

### Actualizaciones al system prompt (`api/oracle.js`)
Añadir directrices de personalidad al system prompt existente:

- Usar el nombre del usuario de forma natural (no en cada respuesta, solo cuando fluya orgánicamente)
- Hacer preguntas de retorno ocasionales ("¿Qué sientes tú al respecto?", "¿Esto resuena contigo?")
- Referenciar lo dicho antes en la sesión ("Como mencionaste antes sobre tu relación...")
- Tono íntimo, cálido, directo — como un guía espiritual de confianza
- Respuestas de máximo ~300 palabras por defecto; tiradas de tarot, rituales y análisis astrológico pueden ser más extensos
- Responder siempre en el idioma del perfil del usuario (inyectado en el prompt)
- Evitar lenguaje corporativo, saludos formales, o frases genéricas de IA

### Efecto typewriter
- Velocidad: 20ms por carácter (ajustable en constante `TYPEWRITER_SPEED`)
- Cursor parpadeante `|` mientras escribe
- El botón de enviar se desactiva durante la escritura para evitar interrupciones
- Al terminar de escribir: el cursor desaparece y aparece el botón de reproducción de audio junto al mensaje

---

## 3. Texto a Voz con ElevenLabs

### Backend: `api/tts.js` (nuevo endpoint Vercel)

**Entrada:** `{ text: string, language: string, voiceId: string }`  
**Salida:** Stream de audio MP3

```
POST /api/tts
→ Llama ElevenLabs API con voiceId configurado
→ Devuelve audio/mpeg al frontend
```

- Variable de entorno requerida: `ELEVENLABS_API_KEY`
- Variable de entorno requerida: `ELEVENLABS_VOICE_ID` (ID de la voz clonada)
- Timeout Vercel: 30s (suficiente para textos de hasta ~500 palabras)
- Si ElevenLabs falla: devuelve error 503, el frontend silencia el error sin romper la UI

### Configuración de voz en ElevenLabs
1. Crear cuenta en ElevenLabs
2. En "Voice Lab" → "Add Voice" → "Instant Voice Cloning"
3. Subir 1-2 minutos de audio de una voz grave/misteriosa/cálida
4. Obtener el `voiceId` generado y guardarlo como variable de entorno
5. La misma voz clonada funciona para los 6 idiomas automáticamente

### Frontend: controles de audio

**Barra superior:**
- Botón 🔊 (toggle) — activa/desactiva auto-lectura
- Estado guardado en `localStorage` bajo `abundia_tts_auto`
- Selector de idioma (cambia `abundia_profile.language` y actualiza el idioma del agente en tiempo real)

**Por mensaje del agente:**
- Botón ▶ aparece junto a cada burbuja del oráculo al terminar el typewriter
- Al hacer clic: llama `/api/tts` y reproduce el audio
- Mientras reproduce: botón cambia a ⏸ (pausa)
- Solo un audio puede reproducirse a la vez (nuevo click detiene el anterior)

### Flujo completo
```
Usuario envía mensaje
→ Claude responde (api/oracle.js)
→ Frontend muestra respuesta con typewriter
→ Typewriter termina → aparece botón ▶
→ Si auto-lectura ON: llama /api/tts automáticamente
→ Audio se reproduce
→ Botón manual ▶ disponible para repetir
```

---

## 4. Selector de Idioma

Los 6 idiomas soportados y sus códigos ElevenLabs:

| Idioma | Código | Nombre display |
|--------|--------|----------------|
| Español | `es` | Español |
| Inglés | `en` | English |
| Portugués | `pt` | Português |
| Francés | `fr` | Français |
| Alemán | `de` | Deutsch |
| Italiano | `it` | Italiano |

- El cambio de idioma actualiza el perfil en localStorage
- En la siguiente respuesta del agente, el system prompt incluye la instrucción de responder en ese idioma
- ElevenLabs recibe el parámetro `language_code` para optimizar la pronunciación

---

## 5. Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `api/oracle.js` | Añadir inyección de perfil/memoria al system prompt; actualizar directrices de tono |
| `api/tts.js` | **Nuevo** — endpoint ElevenLabs TTS |
| `app.js` | Modal de bienvenida, gestión localStorage, efecto typewriter, controles TTS, selector idioma |
| `index.html` | Botón de audio en barra superior, selector idioma, modal perfil |
| `styles.css` | Estilos para modal, botones audio, cursor typewriter, selector idioma |
| `vercel.json` | Añadir ruta para `api/tts.js` con `maxDuration: 30` |

---

## 6. Variables de Entorno Necesarias

```
ANTHROPIC_API_KEY=... (ya existe)
ELEVENLABS_API_KEY=... (nueva)
ELEVENLABS_VOICE_ID=... (nueva, tras crear la voz clonada)
```

---

## 7. Lo que NO incluye este diseño

- Sistema de login o base de datos de usuarios
- Historial de conversaciones entre sesiones (solo resumen comprimido)
- Voz diferente por idioma (una sola voz clonada para todos)
- Subtítulos sincronizados con el audio
