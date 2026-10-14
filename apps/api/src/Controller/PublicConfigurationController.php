<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Team\CreationLimitPolicy;
use App\Application\Demo\DemoAccessTokenDeriver;
use App\Application\Demo\DemoFixture;
use App\Application\Demo\DemoTeamSelection;
use App\Application\Demo\DemoResetException;
use App\Application\Team\TeamRepository;
use DateTimeZone;
use Psr\Clock\ClockInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

final readonly class PublicConfigurationController
{
    public function __construct(
        private \App\Application\Configuration\FunctionalConfiguration $functionalConfiguration,
        private CreationLimitPolicy $creationLimitPolicy,
        private DemoAccessTokenDeriver $demoTokens,
        private DemoFixture $demoFixture,
        private TeamRepository $teams,
        private ClockInterface $clock,
        private string $publicUrl,
        private ?string $demoTeamIds = null,
    ) {}

    public function __invoke(): JsonResponse
    {
        $configuration = [
            'teamCreationEmailMode' => $this->functionalConfiguration->emailMode,
            'teamCreationMaxTeams' => $this->creationLimitPolicy->maxTeams,
            'teamCreationWindowMinutes' => $this->creationLimitPolicy->windowMinutes,
        ];
        if ($this->functionalConfiguration->demoPanelEnabled) {
            $configuration['demo'] = $this->demoMetadata();
        }
        $response = new JsonResponse($configuration);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }

    /** @return array{nextResetAt?: string, teams: list<array{name: string, accessUrl: string}>} */
    private function demoMetadata(): array
    {
        $now = $this->clock->now()->setTimezone(new DateTimeZone('UTC'));
        $nextReset = $now->setTime((int) $now->format('H'), 0)->modify('+1 hour');
        $result = ['teams' => []];
        if ($this->functionalConfiguration->demoResetScheduleEnabled) {
            $result['nextResetAt'] = $nextReset->format(DATE_ATOM);
        }
        if (!$this->demoTokens->isConfigured()) {
            return $result;
        }

        try {
            $ids = DemoTeamSelection::parse($this->demoTeamIds);
        } catch (DemoResetException) {
            return $result;
        }
        if ($ids === []) {
            return $result;
        }

        $teams = [];
        foreach (array_keys($this->demoFixture->teams()) as $index => $name) {
            $matched = null;
            $token = '';
            foreach ($ids as $id) {
                $candidate = $this->teams->findById($id);
                if ($candidate === null || $candidate['name'] !== $name) {
                    continue;
                }
                $candidateToken = $this->demoTokens->tokenFor($this->demoFixture->accessKey($index), (int) $candidate['demo_access_generation']);
                if (hash_equals((string) $candidate['access_verifier'], hash('sha256', $candidateToken))) {
                    $matched = $candidate;
                    $token = $candidateToken;
                    break;
                }
            }
            if ($matched === null) {
                return $result;
            }
            $teams[] = ['name' => $name, 'accessUrl' => rtrim($this->publicUrl, '/') . '/e#t=' . $token];
        }

        $result['teams'] = $teams;
        return $result;
    }
}
