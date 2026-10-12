<?php

declare(strict_types=1);

namespace App\Application\Demo;

use DateTimeImmutable;
use DateTimeZone;

final class DemoFixture
{
    public function accessKey(int $teamIndex): string
    {
        return match ($teamIndex) {
            0 => 'friends',
            1 => 'band',
            default => throw new \OutOfBoundsException('No hay una clave demo para este equipo.'),
        };
    }

    /** @return array<string, list<string>> */
    public function teams(): array
    {
        return [
            'La mesa del jueves' => ['Ana', 'Luis', 'Marta', 'Pablo'],
            'La banda del patio' => ['Inés', 'Leo', 'Nuria', 'Tomás'],
        ];
    }

    /** @return list<array{date: DateTimeImmutable, state: ?string}> */
    public function availability(DateTimeImmutable $now, int $teamIndex, int $participantIndex): array
    {
        if (!in_array($teamIndex, [0, 1], true) || $participantIndex < 0 || $participantIndex > 3) {
            throw new \OutOfBoundsException('No hay una identidad demo para esta disponibilidad.');
        }
        $now = $now->setTimezone(new DateTimeZone('UTC'));
        $monday = $now->modify('monday this week')->setTime(0, 0);
        $first = $now->modify('first day of previous month')->setTime(0, 0);
        $last = $now->modify('first day of this month')->modify('+4 months')->modify('-1 day')->setTime(0, 0);
        // Una semana relativa con resultados intencionados hace visibles los casos de resumen en cada reset.
        $examples = [
            7 => [null, null, null, null],
            8 => ['available', null, null, null],
            9 => ['maybe', 'available', null, null],
            10 => ['unavailable', 'available', null, null],
            11 => [null, 'maybe', null, null],
            12 => [null, null, 'available', 'available'],
            13 => [null, null, null, 'unavailable'],
        ];
        $marks = [];
        for ($date = $first; $date <= $last; $date = $date->modify('+1 day')) {
            $offset = (int) $monday->diff($date)->format('%r%a');
            $state = array_key_exists($participantIndex, $examples[$offset] ?? [])
                ? $examples[$offset][$participantIndex]
                : $this->sparseState($teamIndex, $participantIndex, $offset);
            // Conserva los extremos del horizonte configurado sin marcar todos los días de cada participante.
            if ($offset === (int) $monday->diff($first)->format('%r%a') && $teamIndex === 0 && $participantIndex === 0) {
                $state = 'available';
            }
            if ($offset === (int) $monday->diff($last)->format('%r%a') && $teamIndex === 1 && $participantIndex === 0) {
                $state = 'maybe';
            }
            $marks[] = ['date' => $date, 'state' => $state];
        }
        return $marks;
    }

    private function sparseState(int $teamIndex, int $participantIndex, int $offset): ?string
    {
        $bucket = hexdec(substr(hash('sha256', sprintf('%d:%d:%d', $teamIndex, $participantIndex, $offset)), 0, 2));
        return match (true) {
            $bucket < 180 => null,
            $bucket < 227 => 'unavailable',
            $bucket < 247 => 'available',
            default => 'maybe',
        };
    }

    /** @return list<array{type: string, title: string, state: string, options: list<string>}> */
    public function consultations(DateTimeImmutable $now, int $teamIndex): array
    {
        $monday = $now->setTimezone(new DateTimeZone('UTC'))->modify('monday this week')->setTime(0, 0);
        $consultations = [
            ['type' => 'date', 'title' => $teamIndex === 0 ? 'Próxima cena' : 'Próximo ensayo', 'state' => 'open', 'options' => [
                $monday->modify('+10 days')->format('Y-m-d'),
                $monday->modify('+38 days')->format('Y-m-d'),
                $monday->modify('+73 days')->format('Y-m-d'),
            ]],
            ['type' => 'date', 'title' => $teamIndex === 0 ? 'Cena especial' : 'Concierto de primavera', 'state' => 'resolved', 'options' => [
                $monday->modify('+17 days')->format('Y-m-d'),
                $monday->modify('+59 days')->format('Y-m-d'),
            ]],
            ['type' => 'text', 'title' => $teamIndex === 0 ? '¿Dónde cenamos?' : '¿Qué repertorio tocamos?', 'state' => 'open', 'options' => $teamIndex === 0 ? ['Italiano', 'Tapas', 'En casa'] : ['Acústico', 'Rock', 'Versiones']],
            ['type' => 'text', 'title' => $teamIndex === 0 ? 'Menú degustación' : 'Ensayo extraordinario', 'state' => 'rejected', 'options' => ['Sí', 'No']],
        ];
        return $teamIndex === 0 ? [$consultations[0], $consultations[3]] : [$consultations[1], $consultations[2]];
    }
}
