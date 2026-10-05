<?php

declare(strict_types=1);

use App\Application\Availability\AvailabilityService;
use App\Kernel;
use Doctrine\DBAL\Connection;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

$kernel = new Kernel('test', true);
$kernel->boot();
$container = $kernel->getContainer()->get('test.service_container');
$container->get(Connection::class)->executeStatement('SET application_name TO ' . $container->get(Connection::class)->quote((string) getmypid()));
fwrite(STDOUT, "READY\n");
$input = fgets(STDIN);
if ($input === false) {
    exit(2);
}
$request = json_decode($input, true, flags: JSON_THROW_ON_ERROR);
$availability = $container->get(AvailabilityService::class);
$availability->write($request['token'], $request['date'], $request['participantId'], $request['state'], 'UTC');
fwrite(STDOUT, "SAVED\n");
$kernel->shutdown();
