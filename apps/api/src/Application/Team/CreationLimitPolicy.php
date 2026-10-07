<?php

declare(strict_types=1);

namespace App\Application\Team;

final readonly class CreationLimitPolicy
{
    public int $maxTeams;

    public int $windowMinutes;

    public function __construct(
        string $deploymentEnvironment,
        string $maxTeamsOverride,
        string $windowMinutesOverride,
    ) {
        $defaults = match ($deploymentEnvironment) {
            'development', 'preproduction', 'test' => [2, 60],
            'production' => [5, 120],
            default => throw new \InvalidArgumentException('SYNQO_DEPLOYMENT_ENV must be development, preproduction, production or test.'),
        };

        $this->maxTeams = $this->positiveOverride($maxTeamsOverride, $defaults[0], 'TEAM_CREATION_LIMIT');
        $this->windowMinutes = $this->positiveOverride($windowMinutesOverride, $defaults[1], 'TEAM_CREATION_WINDOW_MINUTES');
    }

    private function positiveOverride(string $value, int $default, string $name): int
    {
        if ($value === '') {
            return $default;
        }
        if (preg_match('/^[1-9][0-9]*$/D', $value) !== 1) {
            throw new \InvalidArgumentException(sprintf('%s must be a positive integer.', $name));
        }

        return (int) $value;
    }

    public function windowSeconds(): int
    {
        return $this->windowMinutes * 60;
    }
}
