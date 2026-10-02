<?php
// Formulaire « Démonstration privée » : envoie la demande par courriel à contact@lavoiemaher.ca,
// depuis le serveur WHC (Canada). Rien n'est enregistré sur le serveur, sauf un compteur anti-abus
// (adresse IP hachée, effacé après 10 minutes).
declare(strict_types=1);

const DEST = 'contact@lavoiemaher.ca';
const FROM = 'contact@lavoiemaher.ca';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $code, bool $ok): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, false);
}

// Seulement depuis le site lui-même
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? ''));
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== $host) {
    reply(403, false);
}

// Pot de miel : un robot remplit ce champ invisible; on répond « reçu » sans rien envoyer
if (trim((string)($_POST['_gotcha'] ?? '')) !== '') {
    reply(200, true);
}

function field(string $key, int $max, bool $oneLine = true): string {
    $v = (string)($_POST[$key] ?? '');
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    if ($oneLine) $v = str_replace("\n", ' ', $v);
    return mb_substr(trim($v), 0, $max);
}

$nom     = field('nom', 100);
$cabinet = field('cabinet', 150);
$courriel = field('courriel', 254);
$type    = field('type', 80);
$message = field('message', 2000, false);
$langue  = field('langue', 2) === 'en' ? 'anglais' : 'français';

if ($nom === '' || !filter_var($courriel, FILTER_VALIDATE_EMAIL)) {
    reply(422, false);
}

// Anti-abus : au plus 5 envois par 10 minutes par adresse IP
$dir = is_dir(dirname(__DIR__) . '/tmp') ? dirname(__DIR__) . '/tmp/lm-formulaire' : sys_get_temp_dir() . '/lm-formulaire';
@mkdir($dir, 0700, true);
$file = $dir . '/' . hash('sha256', 'lm|' . ($_SERVER['REMOTE_ADDR'] ?? ''));
$now = time();
$hits = [];
if (is_file($file)) {
    $hits = array_filter(array_map('intval', explode(',', (string)file_get_contents($file))), fn($t) => $t > $now - 600);
}
if (count($hits) >= 5) {
    reply(429, false);
}
$hits[] = $now;
@file_put_contents($file, implode(',', $hits), LOCK_EX);

$subject = 'Demande de démonstration : ' . $nom . ($cabinet !== '' ? ' (' . $cabinet . ')' : '');
$body = "Nouvelle demande de démonstration privée reçue par le site lavoiemaher.ca\n\n"
      . "Nom : $nom\n"
      . "Cabinet : " . ($cabinet !== '' ? $cabinet : '—') . "\n"
      . "Courriel : $courriel\n"
      . "Type de dossiers : " . ($type !== '' ? $type : '—') . "\n"
      . "Langue du site : $langue\n\n"
      . "Volume approximatif :\n" . ($message !== '' ? $message : '—') . "\n\n"
      . "Pour répondre, utilisez simplement « Répondre » : la réponse ira à $courriel.\n"
      . "Rappel Loi 25 : conserver cette demande au plus 24 mois après le dernier échange (voir la politique de confidentialité).\n";

$headers = implode("\r\n", [
    'From: Site Lavoie & Maher <' . FROM . '>',
    'Reply-To: ' . $courriel,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = mail(DEST, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . FROM);
reply($sent ? 200 : 500, $sent);
