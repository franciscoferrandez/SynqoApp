<?php

declare(strict_types=1);

use App\Application\Consultation\ConsultationService;
use App\Application\Event\EventService;
use App\Application\Exception\ConsultationClosed;
use App\Application\Exception\EventConflict;
use App\Application\Exception\InvalidConsultationInput;
use App\Application\Exception\InvalidEventInput;
use App\Kernel;
use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

$kernel = new Kernel('test', true);
$kernel->boot();
$container = $kernel->getContainer()->get('test.service_container');
$container->set('clock', new MockClock('2026-10-18T12:00:00+00:00'));
$connection = $container->get(Connection::class);
$connection->executeStatement('SET application_name TO ' . $connection->quote((string) getmypid()));
fwrite(STDOUT, "READY\n");
$input = fgets(STDIN);
if ($input === false) {
    exit(2);
}
$request = json_decode($input, true, flags: JSON_THROW_ON_ERROR);

try {
    if ($request['mode'] === 'set_event') {
        $container->get(ConsultationService::class)->setEvent($request['token'], $request['consultationId'], $request['eventId']);
    } elseif ($request['mode'] === 'resolve') {
        $container->get(ConsultationService::class)->resolve(
            $request['token'],
            $request['consultationId'],
            $request['participantId'],
            $request['status'],
            $request['optionIds'],
            $request['changeEvent'] ?? false,
            $request['eventId'] ?? null,
            $request['expectedEventVersion'] ?? null,
        );
    } elseif ($request['mode'] === 'reject_event') {
        $container->get(EventService::class)->reject($request['token'], $request['eventId'], $request['participantId'], $request['disposition'] ?? null);
    } else {
        throw new InvalidArgumentException('Unknown operation mode.');
    }
    fwrite(STDOUT, "SAVED\n");
} catch (ConsultationClosed) {
    fwrite(STDOUT, "CLOSED\n");
} catch (EventConflict) {
    fwrite(STDOUT, "CONFLICT\n");
} catch (InvalidConsultationInput|InvalidEventInput) {
    fwrite(STDOUT, "INVALID\n");
}

$kernel->shutdown();
