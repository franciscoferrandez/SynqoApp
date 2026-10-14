<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Demo\DemoFixture;
use App\Application\Demo\DemoResetException;
use App\Application\Demo\DemoTeamSelection;
use App\Application\Demo\DemoResetRepository;
use App\Application\Demo\DemoAccessTokenDeriver;
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
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

final readonly class OrmDemoResetRepository implements DemoResetRepository
{
    public const int LOCK_KEY = 783912004;

    public function __construct(
        private ManagerRegistry $managers,
        private DemoFixture $fixture,
        private IdentifierGenerator $identifiers,
        private DemoAccessTokenDeriver $demoTokens,
        private string $deploymentEnvironment,
        private ?string $demoTeamIds = null,
    ) {}

    public function isLocalPostgreSql(): bool
    {
        $connection = $this->managers->getConnection();
        $params = $connection->getParams();
        // Requiring a TCP host also rejects socket DSNs and missing/ambiguous hosts.
        return in_array($params['host'] ?? null, ['database', 'localhost', '127.0.0.1', '::1'], true)
            && $connection->getDatabasePlatform() instanceof PostgreSQLPlatform;
    }

    public function isPrivatePreproductionPostgreSql(string $expectedHost, ?string $railwayEnvironmentName): bool
    {
        $connection = $this->managers->getConnection();
        $host = $connection->getParams()['host'] ?? null;

        return $connection->getDatabasePlatform() instanceof PostgreSQLPlatform
            && $expectedHost !== ''
            && is_string($host)
            && hash_equals($expectedHost, $host)
            && str_ends_with($host, '.railway.internal')
            && $railwayEnvironmentName === 'preproduction';
    }

    public function isPrivateProductionPostgreSql(string $expectedHost): bool
    {
        $connection = $this->managers->getConnection();
        $host = $connection->getParams()['host'] ?? null;
        if (
            $this->deploymentEnvironment !== 'production'
            || !$connection->getDatabasePlatform() instanceof PostgreSQLPlatform
            || $expectedHost === ''
            || !is_string($host)
            || !hash_equals($expectedHost, $host)
            || in_array(strtolower($host), ['database', 'localhost', '127.0.0.1', '::1'], true)
        ) {
            return false;
        }
        if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
            return self::isPrivateAddress($host);
        }
        // A DNS suffix is not proof of a private destination. Every returned
        // address must be private; failed or empty resolution is denied.
        $records = @dns_get_record($host, DNS_A | DNS_AAAA);
        if ($records === false || $records === []) {
            return false;
        }
        foreach ($records as $record) {
            $address = $record['ip'] ?? $record['ipv6'] ?? '';
            if (!is_string($address) || !self::isPrivateAddress($address)) {
                return false;
            }
        }
        return true;
    }

    private static function isPrivateAddress(string $address): bool
    {
        $packed = inet_pton($address);
        if ($packed === false) {
            return false;
        }
        if (strlen($packed) === 4) {
            $first = ord($packed[0]);
            $second = ord($packed[1]);
            return $first === 10 || ($first === 172 && $second >= 16 && $second <= 31) || ($first === 192 && $second === 168);
        }
        return (ord($packed[0]) & 0xfe) === 0xfc;
    }

    public function replace(DateTimeImmutable $now): array
    {
        return $this->restore($now, false);
    }

    public function initialize(DateTimeImmutable $now, bool $allowNonEmpty = false): array
    {
        return $this->restore($now, true, $allowNonEmpty);
    }

    /** @return list<array{name: string, token: string, id?: string}> */
    private function restore(DateTimeImmutable $now, bool $initialize, bool $allowNonEmpty = false): array
    {
        $selectedIds = DemoTeamSelection::parse($this->demoTeamIds);
        if ($initialize && $selectedIds !== []) {
            throw new DemoResetException('La inicialización requiere DEMO_TEAM_IDS definida y vacía.');
        }
        if (!$initialize && $selectedIds === []) {
            return [];
        }
        $manager = $this->managers->getManager();
        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM entity manager is required.');
        }
        $now = $now->setTimezone(new DateTimeZone('UTC'));
        $connection = $manager->getConnection();
        try {
            return $connection->transactional(function () use ($manager, $connection, $now, $selectedIds, $initialize, $allowNonEmpty): array {
                if ($connection->fetchOne('SELECT pg_try_advisory_xact_lock(?)', [self::LOCK_KEY]) !== true) {
                    throw new \RuntimeException('Ya hay un reset demo en ejecución.');
                }
                $existing = [];
                if ($initialize) {
                    // Prevent a normal team creation racing with the empty-database check.
                    $connection->executeStatement('LOCK TABLE team IN SHARE ROW EXCLUSIVE MODE');
                    if (!$allowNonEmpty && (int) $connection->fetchOne('SELECT COUNT(*) FROM team') !== 0) {
                        throw new DemoResetException('La inicialización requiere una base sin equipos; usa --allow-non-empty para añadir los demo sin borrar los equipos existentes.');
                    }
                    if ($allowNonEmpty) {
                        if ($this->containsDemoTeam($connection)) {
                            throw new DemoResetException('La inicialización encontró credenciales demo existentes; no se ha añadido ningún equipo.');
                        }
                    }
                } else {
                    $existing = $this->clearSelectedTeams($connection, $selectedIds);
                }
                $manager->clear();
                $links = [];
                $teamIndex = 0;
                foreach ($this->fixture->teams() as $name => $names) {
                    $existingTeam = $existing[$this->fixture->accessKey($teamIndex)] ?? null;
                    $generation = $existingTeam === null ? 1 : $existingTeam['generation'] + 1;
                    $token = $this->demoTokens->tokenFor($this->fixture->accessKey($teamIndex), $generation);
                    $verifier = hash('sha256', $token);
                    if ($existingTeam !== null) {
                        $id = $existingTeam['id'];
                        $updated = $connection->executeStatement(
                            'UPDATE team SET name = ?, time_zone = ?, last_activity_at = ?, access_verifier = ?, demo_access_generation = ? WHERE id = ?',
                            [$name, 'UTC', $now->format('Y-m-d H:i:sP'), $verifier, $generation, $id],
                        );
                        if ($updated !== 1) {
                            throw new DemoResetException(sprintf('Reset demo revertido: se esperaba actualizar 1 equipo y se actualizaron %d.', $updated));
                        }
                        $team = $manager->find(TeamRecord::class, $id);
                        if (!$team instanceof TeamRecord) {
                            throw new DemoResetException('Reset demo revertido: no se encontró una raíz demo bloqueada.');
                        }
                    } else {
                        $id = $this->identifiers->generate();
                        $team = new TeamRecord($id, $name, $verifier, 'UTC', $now, $now, $generation);
                        $manager->persist($team);
                    }
                    $participants = [];
                    foreach ($names as $index => $participantName) {
                        $participant = new ParticipantRecord($this->identifiers->generate(), $team, $participantName, ParticipantName::normalize($participantName), $now);
                        $manager->persist($participant);
                        $participants[] = $participant;
                        foreach ($this->fixture->availability($now, $teamIndex, $index) as $mark) {
                            if ($mark['state'] !== null) {
                                $manager->persist(new AvailabilityRecord($team, $participant, $mark['date'], $mark['state']));
                            }
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
                    $links[] = ['name' => $name, 'token' => $token, 'id' => $id];
                    ++$teamIndex;
                }
                $manager->flush();
                return $links;
            });
        } finally {
            $manager->clear();
        }
    }

    /**
     * @param list<string> $ids
     * @return array<string, array{id: string, generation: int}> keyed by logical demo identity
     */
    private function clearSelectedTeams(Connection $connection, array $ids): array
    {
        $rows = $connection->fetchAllAssociative(
            'SELECT id, access_verifier, demo_access_generation FROM team WHERE id IN (?) ORDER BY id FOR UPDATE',
            [$ids],
            [ArrayParameterType::STRING],
        );
        if (count($rows) !== count($ids)) {
            throw new DemoResetException(sprintf('Reset demo cancelado: se esperaban %d equipos configurados y se encontraron %d.', count($ids), count($rows)));
        }
        $teams = [];
        $matchedKeys = [];
        foreach (array_keys($this->fixture->teams()) as $index => $name) {
            $key = $this->fixture->accessKey($index);
            foreach ($rows as $row) {
                $generation = (int) $row['demo_access_generation'];
                $verifier = hash('sha256', $this->demoTokens->tokenFor($key, $generation));
                if (hash_equals($verifier, trim((string) $row['access_verifier']))) {
                    if (isset($teams[$key])) {
                        throw new DemoResetException('Reset demo cancelado: hay identidades demo duplicadas.');
                    }
                    $teams[$key] = ['id' => (string) $row['id'], 'generation' => $generation];
                    $matchedKeys[(string) $row['id']] = true;
                }
            }
        }
        if (count($teams) !== count($this->fixture->teams()) || count($matchedKeys) !== count($rows)) {
            throw new DemoResetException('Reset demo cancelado: los equipos configurados no corresponden a las dos identidades demo esperadas.');
        }
        foreach (['consultation', 'availability', 'team_mail_attempt', 'participant'] as $table) {
            $connection->executeStatement('DELETE FROM ' . $table . ' WHERE team_id IN (?)', [$ids], [ArrayParameterType::STRING]);
            if ((int) $connection->fetchOne('SELECT COUNT(*) FROM ' . $table . ' WHERE team_id IN (?)', [$ids], [ArrayParameterType::STRING]) !== 0) {
                throw new DemoResetException('Reset demo revertido: quedaron datos dependientes anteriores sin eliminar.');
            }
        }
        return $teams;
    }

    private function containsDemoTeam(Connection $connection): bool
    {
        $rows = $connection->fetchAllAssociative('SELECT access_verifier, demo_access_generation FROM team');
        foreach (array_keys($this->fixture->teams()) as $index => $name) {
            foreach ($rows as $row) {
                $token = $this->demoTokens->tokenFor($this->fixture->accessKey($index), (int) $row['demo_access_generation']);
                if (hash_equals(hash('sha256', $token), trim((string) $row['access_verifier']))) {
                    return true;
                }
            }
        }

        return false;
    }

}
