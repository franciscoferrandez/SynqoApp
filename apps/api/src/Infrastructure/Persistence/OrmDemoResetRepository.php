<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Demo\DemoFixture;
use App\Application\Demo\DemoResetRepository;
use App\Application\Team\AccessTokenGenerator;
use App\Application\Team\IdentifierGenerator;
use App\Domain\Team\ParticipantName;
use App\Infrastructure\Persistence\Entity\AvailabilityRecord;
use App\Infrastructure\Persistence\Entity\ConsultationOptionRecord;
use App\Infrastructure\Persistence\Entity\ConsultationRecord;
use App\Infrastructure\Persistence\Entity\ConsultationVoteRecord;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use DateTimeImmutable;
use DateTimeZone;
use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

final readonly class OrmDemoResetRepository implements DemoResetRepository
{
    public const int LOCK_KEY = 783912004;

    public function __construct(private ManagerRegistry $managers, private DemoFixture $fixture, private IdentifierGenerator $identifiers, private AccessTokenGenerator $tokens) {}

    public function isLocalPostgreSql(): bool
    {
        $connection = $this->managers->getConnection();
        $params = $connection->getParams();
        // Requiring a TCP host also rejects socket DSNs and missing/ambiguous hosts.
        return in_array($params['host'] ?? null, ['database', 'localhost', '127.0.0.1', '::1'], true)
            && $connection->getDatabasePlatform() instanceof PostgreSQLPlatform;
    }

    public function replace(DateTimeImmutable $now): array
    {
        $manager = $this->managers->getManager();
        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM entity manager is required.');
        }
        $now = $now->setTimezone(new DateTimeZone('UTC'));
        $connection = $manager->getConnection();
        try {
            return $connection->transactional(function () use ($manager, $connection, $now): array {
                if ($connection->fetchOne('SELECT pg_try_advisory_xact_lock(?)', [self::LOCK_KEY]) !== true) {
                    throw new \RuntimeException('Ya hay un reset demo en ejecución.');
                }
                $connection->executeStatement('DELETE FROM team');
                $manager->clear();
                $links = [];
                $teamIndex = 0;
                foreach ($this->fixture->teams() as $name => $names) {
                    $token = $this->tokens->generate();
                    $team = new TeamRecord($this->identifiers->generate(), $name, hash('sha256', $token), 'UTC', $now, $now);
                    $manager->persist($team);
                    $participants = [];
                    foreach ($names as $index => $participantName) {
                        $participant = new ParticipantRecord($this->identifiers->generate(), $team, $participantName, ParticipantName::normalize($participantName), $now);
                        $manager->persist($participant);
                        $participants[] = $participant;
                        foreach ($this->fixture->availability($now, $index) as $mark) {
                            $manager->persist(new AvailabilityRecord($team, $participant, $mark['date'], $mark['state']));
                        }
                    }
                    foreach ($this->fixture->consultations($now, $teamIndex) as $definition) {
                        $consultation = new ConsultationRecord($this->identifiers->generate(), $team, $participants[0], $definition['type'], $definition['title'], 'open', $now);
                        $manager->persist($consultation);
                        $options = [];
                        foreach ($definition['options'] as $position => $value) {
                            $option = $definition['type'] === 'date'
                                ? ConsultationOptionRecord::createDate($consultation, new DateTimeImmutable($value, new DateTimeZone('UTC')), $position)
                                : ConsultationOptionRecord::create($consultation, $value, $position);
                            $consultation->addOption($option);
                            $options[] = $option;
                        }
                        foreach ([$participants[0], $participants[1], $participants[2]] as $index => $participant) {
                            $vote = new ConsultationVoteRecord($this->identifiers->generate(), $consultation, $participant);
                            $vote->setOption($options[$index % count($options)], true);
                            $manager->persist($vote);
                        }
                        if ($definition['state'] !== 'open') {
                            $consultation->resolve($definition['state'], $participants[0], $now, $definition['state'] === 'resolved' ? [$options[0]] : []);
                        }
                    }
                    $links[] = ['name' => $name, 'token' => $token];
                    ++$teamIndex;
                }
                $manager->flush();
                return $links;
            });
        } finally {
            $manager->clear();
        }
    }
}
