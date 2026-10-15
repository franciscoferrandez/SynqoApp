<?php

declare(strict_types=1);

$testUrl = $_SERVER['DATABASE_URL_TEST'] ?? $_ENV['DATABASE_URL_TEST'] ?? getenv('DATABASE_URL_TEST');
if (!is_string($testUrl) || $testUrl === '') {
    throw new \RuntimeException('DATABASE_URL_TEST es obligatoria para ejecutar pruebas o reconstruir su base.');
}
$testName = parse_url($testUrl, PHP_URL_PATH);
$testName = is_string($testName) ? ltrim($testName, '/') : '';
if ($testName === '' || str_contains($testName, '/')) {
    throw new \RuntimeException('DATABASE_URL_TEST no identifica una base de pruebas válida.');
}
$expectedTestName = $_SERVER['POSTGRES_TEST_DB'] ?? $_ENV['POSTGRES_TEST_DB'] ?? getenv('POSTGRES_TEST_DB');
if (is_string($expectedTestName) && $expectedTestName !== '') {
    if ($testName !== $expectedTestName) {
        throw new \RuntimeException('DATABASE_URL_TEST no coincide con POSTGRES_TEST_DB.');
    }
} elseif (!str_ends_with($testName, '_test')) {
    throw new \RuntimeException('La base de PHPUnit debe tener un nombre de pruebas terminado en _test.');
}
$developmentName = $_SERVER['POSTGRES_DB'] ?? $_ENV['POSTGRES_DB'] ?? getenv('POSTGRES_DB');
if (is_string($developmentName) && $developmentName !== '' && $testName === $developmentName) {
    throw new \RuntimeException('La base de pruebas debe ser distinta de la base de desarrollo.');
}
$developmentUrl = $_SERVER['DATABASE_URL'] ?? $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
if (is_string($developmentUrl) && $developmentUrl !== '' && $testName === ltrim((string) parse_url($developmentUrl, PHP_URL_PATH), '/')) {
    throw new \RuntimeException('DATABASE_URL_TEST apunta a la misma base que DATABASE_URL.');
}
