<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Team\CreationLimitPolicy;
use App\Application\Demo\DemoAccessTokenDeriver;
use App\Application\Demo\DemoFixture;
use App\Application\Team\TeamRepository;
use DateTimeZone;
use Psr\Clock\ClockInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

final readonly class PublicConfigurationController
{
    public function __construct(
        private bool $teamCreationEmailEnabled,
        private CreationLimitPolicy $creationLimitPolicy,
        private string $deploymentEnvironment,
        private DemoAccessTokenDeriver $demoTokens,
        private DemoFixture $demoFixture,
        private TeamRepository $teams,
        private ClockInterface $clock,
        private string $publicUrl,
    ) {}

    public function __invoke(): JsonResponse
    {
        $configuration = [
            'teamCreationEmailEnabled' => $this->teamCreationEmailEnabled,
            'teamCreationMaxTeams' => $this->creationLimitPolicy->maxTeams,
            'teamCreationWindowMinutes' => $this->creationLimitPolicy->windowMinutes,
        ];
        if ($this->deploymentEnvironment === 'preproduction') {
            $configuration['demo'] = $this->demoMetadata();
        }
        $response = new JsonResponse($configuration);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }

    /** @return array{nextResetAt: string, teams: list<array{name: string, accessUrl: string}>} */
    private function demoMetadata(): array
    {
        $now = $this->clock->now()->setTimezone(new DateTimeZone('UTC'));
        $nextReset = $now->setTime((int) $now->format('H'), 0)->modify('+1 hour');
        $result = ['nextResetAt' => $nextReset->format(DATE_ATOM), 'teams' => []];
        if (!$this->demoTokens->isConfigured()) {
            return $result;
        }

        $teams = [];
        foreach (array_keys($this->demoFixture->teams()) as $index => $name) {
            $token = $this->demoTokens->tokenFor($this->demoFixture->accessKey($index));
            $team = $this->teams->findByAccessVerifier(hash('sha256', $token));
            if ($team === null || $team['name'] !== $name) {
                return $result;
            }
            $teams[] = ['name' => $name, 'accessUrl' => rtrim($this->publicUrl, '/') . '/e#t=' . $token];
        }

        $result['teams'] = $teams;
        return $result;
    }
}
