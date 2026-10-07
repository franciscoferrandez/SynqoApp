<?php

declare(strict_types=1);

use App\Application\Exception\CreationLimitExceeded;
use App\Application\Mail\PayloadCipher;
use App\Application\Team\CreationLimitPolicy;
use App\Application\Team\TeamRepository;
use App\Application\Team\TeamService;
use App\Domain\Team\ExpiryCalculator;
use App\Infrastructure\Identity\CryptographicAccessTokenGenerator;
use App\Infrastructure\Identity\UuidGenerator;
use App\Kernel;
use Symfony\Component\Clock\NativeClock;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

$kernel = new Kernel('test', true);
$kernel->boot();
$container = $kernel->getContainer()->get('test.service_container');
$policy = new CreationLimitPolicy('test', '1', '60');
$teams = new TeamService(
    $container->get(TeamRepository::class),
    new NativeClock(),
    new ExpiryCalculator(),
    new UuidGenerator(),
    new CryptographicAccessTokenGenerator(),
    $container->get(PayloadCipher::class),
    'http://localhost:4200',
    1800,
    true,
    $policy,
    $_SERVER['APP_SECRET'] ?? 'local-test-secret',
);
fwrite(STDOUT, "READY\n");
$input = fgets(STDIN);
if ($input === false) {
    exit(2);
}
$request = json_decode($input, true, flags: JSON_THROW_ON_ERROR);
try {
    $teams->create('Concurrente ' . $request['sequence'], 'Participante', 'UTC', null, null, $request['device']);
    fwrite(STDOUT, "CREATED\n");
} catch (CreationLimitExceeded) {
    fwrite(STDOUT, "LIMITED\n");
}
$kernel->shutdown();
