<?php

declare(strict_types=1);

use App\Application\Mail\MailAttemptProcessor;
use App\Application\Mail\TeamLinkMailer;
use App\Infrastructure\Mail\SodiumPayloadCipher;
use App\Infrastructure\Persistence\OrmMailAttemptRepository;
use App\Kernel;
use Symfony\Component\Clock\NativeClock;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

$kernel = new Kernel('test', true);
$kernel->boot();
fwrite(STDOUT, "READY\n");
if (fgets(STDIN) === false) {
    exit(2);
}
$log = $argv[1];
$mailer = new class ($log) implements TeamLinkMailer {
    public function __construct(private string $log) {}

    public function send(string $recipient, string $teamName, string $accessUrl): void
    {
        usleep(100_000);
        file_put_contents($this->log, $recipient . "\n", FILE_APPEND | LOCK_EX);
    }
};
$processor = new MailAttemptProcessor(
    new OrmMailAttemptRepository($kernel->getContainer()->get('doctrine')),
    new SodiumPayloadCipher($_SERVER['MAIL_EVENT_KEY']),
    $mailer,
    new NativeClock(),
    'http://localhost:4200',
    true,
);
$count = 0;
while ($processor->processNext()) {
    ++$count;
}
fwrite(STDOUT, "DONE $count\n");
$kernel->shutdown();
