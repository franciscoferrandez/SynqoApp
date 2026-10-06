<?php

declare(strict_types=1);

namespace App\Infrastructure\Console;

use App\Application\Mail\MailAttemptProcessor;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:mail:process', description: 'Procesar los envíos pendientes del enlace del equipo (un intento por evento).')]
final class ProcessMailAttemptsCommand extends Command
{
    public function __construct(private readonly MailAttemptProcessor $processor)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('once', null, InputOption::VALUE_NONE, 'Procesar lo disponible y terminar.');
        $this->addOption('interval', null, InputOption::VALUE_REQUIRED, 'Segundos de espera sin trabajo en modo continuo.', '2');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $interval = max(1, (int) $input->getOption('interval'));
        do {
            $expired = $this->processor->expireOverdue();
            $processed = 0;
            while ($this->processor->processNext()) {
                ++$processed;
            }
            if ($input->getOption('once')) {
                $output->writeln(sprintf('Intentos procesados: %d. Vencidos cerrados: %d.', $processed, $expired));

                return Command::SUCCESS;
            }
            sleep($interval);
        } while (true);
    }
}
