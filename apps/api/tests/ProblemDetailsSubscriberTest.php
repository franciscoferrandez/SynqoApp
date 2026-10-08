<?php

declare(strict_types=1);

namespace App\Tests;

use App\Infrastructure\Http\ProblemDetailsSubscriber;
use PHPUnit\Framework\TestCase;
use RuntimeException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

final class ProblemDetailsSubscriberTest extends TestCase
{
    public function testUnhandledExceptionLogsOnlySafeMetadata(): void
    {
        $logFile = tempnam(sys_get_temp_dir(), 'synqo-http-error-');
        self::assertNotFalse($logFile);
        $previousErrorLog = ini_get('error_log');
        $sensitiveMessage = 'Bearer token-value-must-not-be-logged';

        try {
            ini_set('error_log', $logFile);
            $request = Request::create('/api/configuration', 'GET');
            $request->attributes->set('_route', 'api_public_configuration_get');
            $request->headers->set('x-railway-request-id', 'request_id-123');
            $event = new ExceptionEvent(
                $this->createStub(HttpKernelInterface::class),
                $request,
                HttpKernelInterface::MAIN_REQUEST,
                new RuntimeException($sensitiveMessage),
            );

            (new ProblemDetailsSubscriber())->onKernelException($event);

            $log = file_get_contents($logFile);
            self::assertIsString($log);
            self::assertStringContainsString('http.unhandled_exception', $log);
            self::assertStringContainsString(RuntimeException::class, $log);
            self::assertStringContainsString('request_id-123', $log);
            self::assertStringNotContainsString($sensitiveMessage, $log);
            self::assertStringNotContainsString('token-value-must-not-be-logged', $log);
            self::assertSame(500, $event->getResponse()?->getStatusCode());
            self::assertSame('application/problem+json', $event->getResponse()?->headers->get('Content-Type'));
        } finally {
            ini_restore('error_log');
            unlink($logFile);
        }
    }
}
