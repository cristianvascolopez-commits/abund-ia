<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Método no permitido']); exit; }

$configFile = dirname(__DIR__, 2) . '/config.php';
if (file_exists($configFile)) require_once $configFile;
$elevenKey     = defined('ELEVENLABS_API_KEY')  ? ELEVENLABS_API_KEY  : (getenv('ELEVENLABS_API_KEY')  ?: '');
$elevenVoiceId = defined('ELEVENLABS_VOICE_ID') ? ELEVENLABS_VOICE_ID : (getenv('ELEVENLABS_VOICE_ID') ?: '');

if (!$elevenKey || !$elevenVoiceId) {
    http_response_code(500);
    echo json_encode(['error' => 'TTS no configurado']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { http_response_code(400); echo json_encode(['error' => 'JSON inválido']); exit; }

$text     = $body['text']     ?? '';
$language = $body['language'] ?? 'es';

if (!$text) { http_response_code(400); echo json_encode(['error' => 'Se requiere campo text']); exit; }

$langCodes = ['es'=>'es','en'=>'en','pt'=>'pt','fr'=>'fr','de'=>'de','it'=>'it'];
$langCode  = $langCodes[$language] ?? 'es';

$text = mb_substr($text, 0, 2200);

$payload = json_encode([
    'text'           => $text,
    'model_id'       => 'eleven_multilingual_v2',
    'language_code'  => $langCode,
    'voice_settings' => [
        'stability'        => 0.55,
        'similarity_boost' => 0.75,
        'style'            => 0.2,
        'use_speaker_boost'=> true,
    ],
], JSON_UNESCAPED_UNICODE);

$url = 'https://api.elevenlabs.io/v1/text-to-speech/' . $elevenVoiceId;

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_HTTPHEADER     => [
        'xi-api-key: ' . $elevenKey,
        'Content-Type: application/json',
        'Accept: audio/mpeg',
    ],
]);

$audio    = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(503);
    echo json_encode(['error' => 'cURL: ' . $curlErr]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code(503);
    echo json_encode(['error' => 'ElevenLabs error ' . $httpCode]);
    exit;
}

header('Content-Type: audio/mpeg');
header('Cache-Control: no-store');
echo $audio;
