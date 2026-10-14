<?php

declare(strict_types=1);

namespace App\Infrastructure\Console;

use App\Application\Demo\DemoResetService;
use App\Application\Demo\DemoResetException;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsCommand(name: 'app:demo:reset', description: 'Restaurar únicamente los dos equipos demo configurados del entorno.')]
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
        $this->addOption('force', null, InputOption::VALUE_NONE, 'Confirmar la restauración del perfil autorizado; no omite las guardas.');
        $this->addOption('initialize', null, InputOption::VALUE_NONE, 'Crear los equipos demo sin borrar equipos existentes.');
        $this->addOption('allow-non-empty', null, InputOption::VALUE_NONE, 'Permitir la inicialización si la base ya contiene equipos; solo tiene efecto con --initialize.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        try {
            $initialize = (bool) $input->getOption('initialize');
            $allowNonEmpty = (bool) $input->getOption('allow-non-empty');
            if ($allowNonEmpty && !$initialize) {
                throw new DemoResetException('--allow-non-empty requiere --initialize.');
            }
            if ($this->appEnvironment === 'dev') {
                $this->reset->assertLocalProfile($this->appEnvironment, $this->deploymentEnvironment);
            } elseif ($this->deploymentEnvironment === 'production') {
                $this->reset->assertProductionProfile(
                    $this->appEnvironment,
                    $this->deploymentEnvironment,
                    $this->demoResetEnabled,
                    $this->demoDatabaseHost,
                );
            } else {
                $this->reset->assertPreproductionProfile(
                    $this->appEnvironment,
                    $this->deploymentEnvironment,
                    $this->demoResetEnabled,
                    $this->demoDatabaseHost,
                    $this->railwayEnvironmentName,
                );
            }
            $environment = $this->deploymentEnvironment ?? 'desconocido';
            $color = match ($environment) {
                'preproduction' => '#ff8800',
                'production' => 'red',
                default => 'green',
            };
            $io->writeln(sprintf('<fg=%s>Entorno de destino: %s. Solo se restauran los equipos demo configurados.</>', $color, $environment));
            if ($input->isInteractive()) {
                $confirmation = $initialize
                    ? 'Se crearán los equipos demo sin borrar equipos existentes. ¿Continuar?'
                    : 'Se restaurarán solo los datos de los dos equipos demo configurados, conservando sus UUID. ¿Continuar?';
                if (!$io->confirm($confirmation, false)) {
                    $io->text('Reset cancelado; no se ha modificado ningún dato.');
                    return Command::SUCCESS;
                }
            } elseif (!$input->getOption('force') || !$input->hasParameterOption('--no-interaction', true)) {
                $io->error('En modo no interactivo debes pasar --force --no-interaction.');
                return Command::FAILURE;
            }
            $teams = $initialize ? $this->reset->initialize($allowNonEmpty) : $this->reset->reset();
            if ($teams === []) {
                $io->success('DEMO_TEAM_IDS está vacía; no se ha modificado ni cargado ningún dato.');
                return Command::SUCCESS;
            }
            $io->success('Juego demo restaurado correctamente: dos equipos.');
            $teamIds = array_column($teams, 'id');
            $io->text('DEMO_TEAM_IDS=' . implode(',', $teamIds));
            // Tokens are deliberately omitted from automation/non-interactive output.
            if ($input->isInteractive()) {
                foreach ($teams as $team) {
                    $io->text($team['name'] . ': ' . rtrim($this->publicUrl, '/') . '/e#t=' . $team['token']);
                }
            }
            return Command::SUCCESS;
        } catch (DemoResetException $error) {
            $io->error($error->getMessage());
            return Command::FAILURE;
        } catch (\Throwable) {
            // Never print driver errors or connection URLs, which can contain credentials.
            $io->error('No se ha realizado el reset demo. Comprueba el perfil autorizado, la conexión y que no haya otro reset activo.');
            return Command::FAILURE;
        }
    }
}
