<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); exit; }

$configFile = dirname(__DIR__, 2) . '/config.php';
if (file_exists($configFile)) require_once $configFile;

$azureKey    = defined('AZURE_SPEECH_KEY')    ? AZURE_SPEECH_KEY    : (getenv('AZURE_SPEECH_KEY')    ?: '');
$azureRegion = defined('AZURE_SPEECH_REGION') ? AZURE_SPEECH_REGION : (getenv('AZURE_SPEECH_REGION') ?: 'eastus');

if (!$azureKey) {
    http_response_code(503);
    echo json_encode(['error' => 'Azure TTS no configurado']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$text = trim($body['text'] ?? '');
$lang = $body['language'] ?? 'es';

if (!$text) { http_response_code(400); echo json_encode(['error' => 'Se requiere texto']); exit; }

// Limpiar markdown y símbolos antes de enviar a TTS
$text = preg_replace('/\*\*(.*?)\*\*/u', '$1', $text);
$text = preg_replace('/\*(.*?)\*/u', '$1', $text);
$text = preg_replace('/#{1,6}\s/u', '', $text);
$text = preg_replace('/[☥𓂀𓇳✦•·─]/u', '', $text);
$text = preg_replace('/\s{2,}/', ' ', $text);
$text = mb_substr(trim($text), 0, 5000);

$voices = [
    'es' => ['name' => 'es-ES-ElviraNeural',      'lang' => 'es-ES'],
    'en' => ['name' => 'en-US-AriaNeural',         'lang' => 'en-US'],
    'pt' => ['name' => 'pt-BR-FranciscaNeural',    'lang' => 'pt-BR'],
    'fr' => ['name' => 'fr-FR-DeniseNeural',        'lang' => 'fr-FR'],
    'de' => ['name' => 'de-DE-KatjaNeural',         'lang' => 'de-DE'],
    'it' => ['name' => 'it-IT-ElsaNeural',          'lang' => 'it-IT'],
];
$voice   = $voices[$lang] ?? $voices['es'];
$escaped = htmlspecialchars($text, ENT_XML1, 'UTF-8');

$ssml = '<?xml version="1.0" encoding="UTF-8"?>'
      . '<speak version="1.0" xml:lang="' . $voice['lang'] . '">'
      . '<voice name="' . $voice['name'] . '">'
      . '<prosody rate="-5%">' . $escaped . '</prosody>'
      . '</voice></speak>';

$url = "https://{$azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $ssml,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_HTTPHEADER     => [
        'Ocp-Apim-Subscription-Key: ' . $azureKey,
        'Content-Type: application/ssml+xml',
        'X-Microsoft-OutputFormat: audio-24khz-96kbitrate-mono-mp3',
        'User-Agent: ABUND-IA-Oracle',
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
    echo json_encode(['error' => 'Azure error ' . $httpCode, 'detail' => substr($audio, 0, 300)]);
    exit;
}

header('Content-Type: audio/mpeg');
header('Cache-Control: no-store');
echo $audio;
