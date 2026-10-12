<?php

declare(strict_types=1);

namespace App\Application\Demo;

final class DemoTeamSelection
{
    /** @return list<string> */
    public static function parse(?string $configuration): array
    {
        if ($configuration === null) {
            throw new DemoResetException('DEMO_TEAM_IDS debe estar definida, aunque esté vacía.');
        }
        if ($configuration === '') {
            return [];
        }
        $ids = array_map(static fn(string $id): string => strtolower(trim($id)), explode(',', $configuration));
        if (count($ids) !== 2 || count(array_unique($ids)) !== 2) {
            throw new DemoResetException('DEMO_TEAM_IDS debe contener exactamente dos UUID distintos.');
        }
        foreach ($ids as $id) {
            if (preg_match('/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/', $id) !== 1) {
                throw new DemoResetException('DEMO_TEAM_IDS contiene un UUID inválido.');
            }
        }
        return $ids;
    }
}
