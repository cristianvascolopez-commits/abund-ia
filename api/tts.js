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

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey  = process.env.ELEVENLABS_API_KEY;
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
