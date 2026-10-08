<?php

declare(strict_types=1);

namespace App\Infrastructure\Console;

use App\Application\Demo\DemoResetService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsCommand(name: 'app:demo:reset', description: 'Reemplazar los equipos locales por el juego demo de Synqo.')]
final class ResetDemoCommand extends Command
{
    public function __construct(
        private readonly DemoResetService $reset,
        #[Autowire('%kernel.environment%')]
        private readonly string $appEnvironment,
        #[Autowire(env: 'default::SYNQO_DEPLOYMENT_ENV')]
        private readonly ?string $deploymentEnvironment,
        #[Autowire(env: 'APP_PUBLIC_URL')]
        private readonly string $publicUrl,
        #[Autowire(env: 'bool:DEMO_RESET_ENABLED')]
        private readonly bool $demoResetEnabled,
        #[Autowire(env: 'DEMO_DATABASE_HOST')]
        private readonly string $demoDatabaseHost,
        #[Autowire(env: 'RAILWAY_ENVIRONMENT_NAME')]
        private readonly ?string $railwayEnvironmentName,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('force', null, InputOption::VALUE_NONE, 'Confirmar el reemplazo de todos los equipos locales; no omite las guardas.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        try {
            if ($this->appEnvironment === 'dev' && $this->deploymentEnvironment === 'development') {
                $this->reset->assertLocalProfile($this->appEnvironment, $this->deploymentEnvironment);
            } else {
                $this->reset->assertPreproductionProfile(
                    $this->appEnvironment,
                    $this->deploymentEnvironment,
                    $this->demoResetEnabled,
                    $this->demoDatabaseHost,
                    $this->railwayEnvironmentName,
                );
            }
            if (!$input->getOption('force')) {
                if (!$input->isInteractive()) {
                    $io->error('En modo no interactivo debes confirmar el reemplazo con --force.');
                    return Command::FAILURE;
                }
                if (!$io->confirm('Se borrarán todos los equipos de la base de datos permitida para este entorno y se cargará el juego demo. ¿Continuar?', false)) {
                    $io->text('Reset cancelado; no se ha modificado ningún dato.');
                    return Command::SUCCESS;
                }
            }
            $teams = $this->reset->reset();
            $io->success('Juego demo restaurado correctamente: dos equipos.');
            // Tokens are deliberately omitted from automation/non-interactive output.
            if ($input->isInteractive()) {
                foreach ($teams as $team) {
                    $io->text($team['name'] . ': ' . rtrim($this->publicUrl, '/') . '/e#t=' . $team['token']);
                }
            }
            return Command::SUCCESS;
        } catch (\Throwable) {
            // Never print driver errors or connection URLs, which can contain credentials.
            $io->error('No se ha realizado el reset demo. Comprueba el perfil autorizado, la conexión y que no haya otro reset activo.');
            return Command::FAILURE;
        }
    }
}
