<?php

declare(strict_types=1);

use App\Application\Exception\DuplicateParticipant;
use App\Application\Team\TeamService;
use App\Kernel;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

$kernel = new Kernel('test', true);
$kernel->boot();
fwrite(STDOUT, "READY\n");
$input = fgets(STDIN);
if ($input === false) {
    exit(2);
}
$request = json_decode($input, true, flags: JSON_THROW_ON_ERROR);
$teams = $kernel->getContainer()->get('test.service_container')->get(TeamService::class);
try {
    $teams->addParticipant($request['token'], $request['name']);
    fwrite(STDOUT, "CREATED\n");
} catch (DuplicateParticipant) {
    fwrite(STDOUT, "DUPLICATE\n");
}
$kernel->shutdown();
