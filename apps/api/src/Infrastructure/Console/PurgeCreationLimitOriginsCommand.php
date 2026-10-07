<?php

declare(strict_types=1);

namespace App\Infrastructure\Console;

use App\Application\Team\CreationLimitPurger;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:creation-limits:purge', description: 'Delete expired team-creation origin signals.')]
final class PurgeCreationLimitOriginsCommand extends Command
{
    public function __construct(private readonly CreationLimitPurger $purger)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $deleted = $this->purger->purgeExpired();
        $output->writeln(sprintf('Deleted %d expired creation-origin events.', $deleted));

        return Command::SUCCESS;
    }
}
