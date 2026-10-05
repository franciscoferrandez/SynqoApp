<?php

declare(strict_types=1);

use App\Application\Consultation\ConsultationService;
use App\Application\Exception\ConsultationClosed;
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
$service = $container->get(ConsultationService::class);
try {
    if ($request['mode'] === 'vote') {
        $service->vote($request['token'], $request['consultationId'], $request['participantId'], $request['optionId'], true);
    } else {
        $service->resolve($request['token'], $request['consultationId'], $request['participantId'], 'resolved', [$request['optionId']]);
    }
    fwrite(STDOUT, "SAVED\n");
} catch (ConsultationClosed) {
    fwrite(STDOUT, "CLOSED\n");
}
$kernel->shutdown();
