<?php

declare(strict_types=1);

namespace App\Application\Demo;

use DateTimeImmutable;
use DateTimeZone;

final class DemoFixture
{
    /** @return array<string, list<string>> */
    public function teams(): array
    {
        return [
            'La mesa del jueves' => ['Ana', 'Luis', 'Marta', 'Pablo'],
            'La banda del patio' => ['Inés', 'Leo', 'Nuria', 'Tomás'],
        ];
    }

    /** @return list<array{date: DateTimeImmutable, state: string}> */
    public function availability(DateTimeImmutable $now, int $participantIndex): array
    {
        $now = $now->setTimezone(new DateTimeZone('UTC'));
        $monday = $now->modify('monday this week')->setTime(0, 0);
        $first = $now->modify('first day of previous month')->setTime(0, 0);
        $last = $now->modify('first day of this month')->modify('+4 months')->modify('-1 day')->setTime(0, 0);
        $states = ['available', 'maybe', 'unavailable'];
        $marks = [];
        for ($date = $first; $date <= $last; $date = $date->modify('+1 day')) {
            $offset = (int) $monday->diff($date)->format('%r%a');
            // A reproducible weekly pattern, anchored to the execution week's UTC Monday.
            $index = (($offset + $participantIndex) % 3 + 3) % 3;
            $marks[] = ['date' => $date, 'state' => $states[$index]];
        }
        return $marks;
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
