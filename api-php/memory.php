<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://abund-ia.es', 'https://www.abund-ia.es'];
if (in_array($origin, $allowed)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
unset($origin, $allowed);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Directorio de memorias: fuera de public_html
$memDir = dirname(__DIR__, 2) . '/memories';
if (!is_dir($memDir)) {
    mkdir($memDir, 0750, true);
}

// ── GET: recuperar memoria de un usuario ────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $uid = preg_replace('/[^a-zA-Z0-9\-]/', '', $_GET['uid'] ?? '');
    if (!$uid) { http_response_code(400); echo json_encode(['error' => 'uid requerido']); exit; }

    $file = $memDir . '/' . $uid . '.json';
    if (!file_exists($file)) { echo json_encode(['memory' => null]); exit; }

    $data = json_decode(file_get_contents($file), true);
    echo json_encode(['memory' => $data]);
    exit;
}

// ── POST: guardar / actualizar memoria ──────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) { http_response_code(400); echo json_encode(['error' => 'JSON inválido']); exit; }

    $uid = preg_replace('/[^a-zA-Z0-9\-]/', '', $body['uid'] ?? '');
    if (!$uid || strlen($uid) < 8) { http_response_code(400); echo json_encode(['error' => 'uid inválido']); exit; }

    $file = $memDir . '/' . $uid . '.json';

    // Cargar memoria previa si existe
    $existing = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

    // Fusionar con los nuevos datos
    $updated = [
        'uid'       => $uid,
        'updatedAt' => date('c'),
        'sessions'  => ($existing['sessions'] ?? 0) + 1,
        'profile'   => $body['profile']   ?? $existing['profile']   ?? null,
        'summary'   => $body['summary']   ?? $existing['summary']   ?? '',
        'topics'    => array_values(array_unique(array_merge(
                            $existing['topics'] ?? [],
                            $body['topics']     ?? []
                       ))),
        'insights'  => $body['insights']  ?? $existing['insights']  ?? '',
    ];

    // Limitar topics a los 20 más recientes
    if (count($updated['topics']) > 20) {
        $updated['topics'] = array_slice($updated['topics'], -20);
    }

    file_put_contents($file, json_encode($updated, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo json_encode(['ok' => true, 'sessions' => $updated['sessions']]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
