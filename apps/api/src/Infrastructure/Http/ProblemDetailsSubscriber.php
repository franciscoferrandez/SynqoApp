<?php

declare(strict_types=1);

namespace App\Infrastructure\Http;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class ProblemDetailsSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::EXCEPTION => ['onKernelException', 1000]];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        if ($event->getThrowable() instanceof HttpExceptionInterface) {
            return;
        }

        $exception = $event->getThrowable();
        $request = $event->getRequest();
        $requestId = $request->headers->get('x-railway-request-id');
        $route = $request->attributes->get('_route');
        error_log((string) json_encode([
            'event' => 'http.unhandled_exception',
            'exception' => $exception::class,
            'file' => basename($exception->getFile()),
            'line' => $exception->getLine(),
            'method' => $request->getMethod(),
            'route' => is_string($route) ? $route : null,
            'requestId' => is_string($requestId) && preg_match('/^[A-Za-z0-9_-]{1,128}$/D', $requestId) === 1 ? $requestId : null,
        ], JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE));

        $response = new JsonResponse([
            'type' => 'about:blank',
            'title' => 'Error interno',
            'status' => 500,
            'detail' => 'No se pudo completar la operación. Inténtalo de nuevo.',
        ], 500, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');
        $event->setResponse($response);
    }
}
