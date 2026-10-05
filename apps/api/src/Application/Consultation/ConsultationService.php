<?php

declare(strict_types=1);

namespace App\Application\Consultation;

use App\Application\Exception\InvalidConsultationInput;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Team\TeamRepository as TeamRepositoryPort;
use App\Application\Team\TeamService;
use App\Domain\Consultation\TextConsultationRules;
use App\Domain\Team\ExpiryCalculator;
use DateTimeImmutable;
use DateTimeZone;
use Psr\Clock\ClockInterface;

final readonly class ConsultationService
{
    public function __construct(
        private TeamService $access,
        private TeamRepositoryPort $teams,
        private ConsultationRepository $consultations,
        private ClockInterface $clock,
        private ExpiryCalculator $expiry,
    ) {}

    /** @return array{open: list<array<string, mixed>>, resolved: list<array<string, mixed>>, rejected: list<array<string, mixed>>} */
    public function list(?string $token): array
    {
        $team = $this->access->current($token);

        return $this->consultations->listForTeam($team['id']);
    }

    /** @return array{consultation: array<string, mixed>, expiresAt: string} */
    public function create(?string $token, mixed $participantId, mixed $title, mixed $options): array
    {
        if ($token === null) {
            throw new MissingAccessCredential();
        }
        $violations = TextConsultationRules::violations($title, $options);
        if (!is_string($participantId) || $participantId === '') {
            $violations[] = 'participantId';
        }
        if ($violations !== []) {
            throw new InvalidConsultationInput(array_values(array_unique($violations)));
        }
        if (!is_string($title) || !is_array($options) || !array_is_list($options) || !is_string($participantId)) {
            throw new InvalidConsultationInput(['participantId', 'title', 'options']);
        }
        $optionTexts = [];
        foreach ($options as $option) {
            if (!is_string($option)) {
                throw new InvalidConsultationInput(['options']);
            }
            $optionTexts[] = $option;
        }

        /** @var array{consultation: array<string, mixed>, expiresAt: string} $result */
        $result = $this->teams->withLockedTeam(hash('sha256', $token), function (?array $team) use ($participantId, $title, $optionTexts): array {
            if ($team === null) {
                throw new TeamNotFound();
            }
            $now = $this->clock->now()->setTimezone(new DateTimeZone('UTC'));
            $lastActivity = new DateTimeImmutable($team['last_activity_at']);
            if ($now >= $this->expiry->expiresAt($lastActivity, $team['time_zone'])) {
                throw new TeamExpired();
            }
            if (!in_array($participantId, array_column($this->teams->participants($team['id']), 'id'), true)) {
                throw new TeamNotFound();
            }
            $activity = $now > $lastActivity ? $now : $lastActivity;
            $consultation = $this->consultations->create(
                $team['id'],
                $participantId,
                $title,
                $optionTexts,
                $now->format(DATE_ATOM),
                $activity->format(DATE_ATOM),
            );

            return [
                'consultation' => $consultation,
                'expiresAt' => $this->expiry->expiresAt($activity, $team['time_zone'])->format(DATE_ATOM),
            ];
        });

        return $result;
    }
}
