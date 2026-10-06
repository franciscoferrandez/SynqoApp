<?php

declare(strict_types=1);

namespace App\Infrastructure\Mail;

final readonly class TeamLinkMessage
{
    public function __construct(private EmailLayout $layout) {}

    /** @return array{subject: string, html: string, text: string} */
    public function compose(string $teamName, string $accessUrl): array
    {
        $rendered = $this->layout->render(
            'Enlace de acceso',
            'Tu equipo ya está listo',
            [sprintf('Ya puedes entrar en «%s» y empezar a coordinarte con tu grupo.', $teamName)],
            'Entrar al equipo',
            $accessUrl,
            'Has recibido este mensaje porque se indicó esta dirección al crear el equipo. Synqo no necesita una cuenta para entrar.',
        );

        return ['subject' => sprintf('Enlace de acceso a %s', $teamName), ...$rendered];
    }
}
