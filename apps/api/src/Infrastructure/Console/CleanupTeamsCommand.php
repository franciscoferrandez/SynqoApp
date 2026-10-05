<?php

declare(strict_types=1);

namespace App\Infrastructure\Console;

use App\Application\Team\TeamCleanupService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:teams:cleanup', description: 'Eliminar de la base activa los equipos cuyo plazo de borrado ha vencido.')]
final class CleanupTeamsCommand extends Command
{
    public function __construct(private readonly TeamCleanupService $cleanup)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln(sprintf('Equipos eliminados de la base activa: %d.', $this->cleanup->clean()));
        return Command::SUCCESS;
    }
}
