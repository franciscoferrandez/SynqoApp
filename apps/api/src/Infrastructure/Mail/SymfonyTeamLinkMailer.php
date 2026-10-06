<?php

declare(strict_types=1);

namespace App\Infrastructure\Mail;

use App\Application\Mail\TeamLinkMailer;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

final readonly class SymfonyTeamLinkMailer implements TeamLinkMailer
{
    public function __construct(
        private MailerInterface $mailer,
        private TeamLinkMessage $message,
        private string $from,
    ) {}

    public function send(string $recipient, string $teamName, string $accessUrl): void
    {
        $content = $this->message->compose($teamName, $accessUrl);
        $this->mailer->send(
            new Email()
                ->from(Address::create($this->from))
                ->to($recipient)
                ->subject($content['subject'])
                ->text($content['text'])
                ->html($content['html']),
        );
    }
}
