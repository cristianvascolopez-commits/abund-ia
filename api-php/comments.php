<?php
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://abund-ia.es', 'https://www.abund-ia.es'];
if (in_array($origin, $allowed)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$dataFile = dirname(__DIR__, 2) . '/comments.json';

// ── GET — devuelve comentarios ──────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $comments = [];
    if (file_exists($dataFile)) {
        $raw = file_get_contents($dataFile);
        $comments = json_decode($raw, true) ?: [];
    }
    // Solo los últimos 50, más recientes primero
    $comments = array_slice(array_reverse($comments), 0, 50);
    echo json_encode($comments);
    exit;
}

// ── POST — guarda un comentario ─────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $name   = trim(strip_tags($body['name']   ?? ''));
    $text   = trim(strip_tags($body['text']   ?? ''));
    $rating = intval($body['rating'] ?? 0);

    if (!$name || !$text || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        exit;
    }

    // Límites básicos
    if (mb_strlen($name) > 60 || mb_strlen($text) > 600) {
        http_response_code(400);
        echo json_encode(['error' => 'Texto demasiado largo']);
        exit;
    }

    $comments = [];
    if (file_exists($dataFile)) {
        $comments = json_decode(file_get_contents($dataFile), true) ?: [];
    }

    $new = [
        'name'   => $name,
        'text'   => $text,
        'rating' => $rating,
        'date'   => date('Y-m-d'),
    ];

    $comments[] = $new;

    // Guardar (máx 200 entradas)
    if (count($comments) > 200) {
        $comments = array_slice($comments, -200);
    }

    file_put_contents($dataFile, json_encode($comments, JSON_UNESCAPED_UNICODE));
    echo json_encode(['ok' => true, 'comment' => $new]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
