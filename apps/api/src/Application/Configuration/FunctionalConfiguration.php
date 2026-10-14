<?php

declare(strict_types=1);

namespace App\Application\Configuration;

final readonly class FunctionalConfiguration
{
    public string $emailMode;
    public bool $demoPanelEnabled;
    public bool $demoResetScheduleEnabled;

    public function __construct(
        string $deploymentEnvironment,
        ?string $emailMode = null,
        ?string $demoPanelEnabled = null,
        ?string $demoResetScheduleEnabled = null,
    ) {
        $this->emailMode = ($emailMode === null || $emailMode === '')
            ? ($deploymentEnvironment === 'development' ? 'send' : 'hidden')
            : (in_array($emailMode, ['hidden', 'demo', 'send'], true) ? $emailMode : 'hidden');
        $this->demoPanelEnabled = ($demoPanelEnabled === null || $demoPanelEnabled === '')
            ? $deploymentEnvironment === 'preproduction'
            : $demoPanelEnabled === 'true';
        // A deployment must explicitly declare that its schedule is active.
        $this->demoResetScheduleEnabled = $demoResetScheduleEnabled === 'true';
    }

    public function sendsEmail(): bool
    {
        return $this->emailMode === 'send';
    }
}
