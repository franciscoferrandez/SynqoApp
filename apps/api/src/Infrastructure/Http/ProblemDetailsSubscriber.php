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
