<?php

declare(strict_types=1);

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ApiUnknownRouteTest extends WebTestCase
{
    public function testUnknownApiPathsReturnProblemDetailsInsteadOfHtml(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);

        foreach (['/api/no-such-route/nested'] as $path) {
            $client->request('GET', $path);

            self::assertResponseStatusCodeSame(404);
            self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
            self::assertStringContainsString('no-store', (string) $client->getResponse()->headers->get('Cache-Control'));

            $problem = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
            self::assertSame('about:blank', $problem['type']);
            self::assertSame('No encontrado', $problem['title']);
            self::assertSame(404, $problem['status']);
            self::assertArrayHasKey('detail', $problem);
            self::assertStringNotContainsString('<html', $client->getResponse()->getContent());
        }
    }
}
