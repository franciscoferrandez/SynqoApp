<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Configuration\FunctionalConfiguration;
use App\Application\Mail\MailAttemptProcessor;
use App\Application\Mail\MailAttemptRepository;
use App\Application\Mail\MailAttemptStatus;
use App\Application\Mail\PayloadCipher;
use App\Application\Mail\TeamLinkMailer;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

final class FunctionalConfigurationTest extends TestCase
{
    public function testDefaultsAndIndependentOverrides(): void
    {
        foreach (['development', 'preproduction', 'production', 'test'] as $environment) {
            $defaults = new FunctionalConfiguration($environment);
            self::assertSame($environment === 'development' ? 'send' : 'hidden', $defaults->emailMode);
            self::assertSame($environment === 'preproduction', $defaults->demoPanelEnabled);
            self::assertFalse($defaults->demoResetScheduleEnabled);
            foreach (['hidden', 'demo', 'send'] as $mode) {
                $override = new FunctionalConfiguration($environment, $mode);
                self::assertSame($mode, $override->emailMode);
                self::assertSame($mode === 'send', $override->sendsEmail());
                self::assertSame($defaults->demoPanelEnabled, $override->demoPanelEnabled);
                self::assertFalse($override->demoResetScheduleEnabled);
            }
            $panel = new FunctionalConfiguration($environment, demoPanelEnabled: 'true');
            self::assertTrue($panel->demoPanelEnabled);
            self::assertFalse($panel->demoResetScheduleEnabled);
            $schedule = new FunctionalConfiguration($environment, demoResetScheduleEnabled: 'true');
            self::assertSame($defaults->demoPanelEnabled, $schedule->demoPanelEnabled);
            self::assertTrue($schedule->demoResetScheduleEnabled);
        }
    }

    public function testEmptyComposeVariablesRetainDefaultsForEveryEnvironment(): void
    {
        foreach (['development', 'preproduction', 'production', 'test'] as $environment) {
            $configuration = new FunctionalConfiguration($environment, '', '', '');
            self::assertSame($environment === 'development' ? 'send' : 'hidden', $configuration->emailMode);
            self::assertSame($environment === 'preproduction', $configuration->demoPanelEnabled);
            self::assertFalse($configuration->demoResetScheduleEnabled);
        }
    }

    public function testInvalidExplicitValuesFailClosed(): void
    {
        foreach (['SEND', '1', 'yes', 'garbage'] as $invalid) {
            $configuration = new FunctionalConfiguration('development', $invalid, $invalid, $invalid);
            self::assertSame('hidden', $configuration->emailMode);
            self::assertFalse($configuration->sendsEmail());
            self::assertFalse($configuration->demoPanelEnabled);
            self::assertFalse($configuration->demoResetScheduleEnabled);
        }
    }

    #[DataProvider('nonSendingModes')]
    public function testPendingAttemptCannotSendInHiddenOrDemoMode(string $mode): void
    {
        $attempts = $this->createMock(MailAttemptRepository::class);
        $attempts->method('claimNext')->willReturn(['id' => 'attempt', 'payload' => 'secret', 'team_name' => 'Equipo']);
        $attempts->expects(self::once())->method('finish')->with('attempt', MailAttemptStatus::Failed, self::anything());
        $cipher = $this->createMock(PayloadCipher::class);
        $cipher->expects(self::never())->method('decrypt');
        $mailer = $this->createMock(TeamLinkMailer::class);
        $mailer->expects(self::never())->method('send');
        $processor = new MailAttemptProcessor($attempts, $cipher, $mailer, new MockClock(), 'http://localhost', new FunctionalConfiguration('development', $mode));
        self::assertTrue($processor->processNext());
    }

    #[DataProvider('nonSendingModes')]
    public function testCreationRejectsEmailBeforePersistingInNonSendingModes(string $mode): void
    {
        $teams = $this->createMock(\App\Application\Team\TeamRepository::class);
        $teams->expects(self::never())->method('createWithOriginLimit');
        $cipher = $this->createMock(PayloadCipher::class);
        $cipher->expects(self::never())->method('encrypt');
        $service = new \App\Application\Team\TeamService(
            $teams,
            new MockClock(),
            new \App\Domain\Team\ExpiryCalculator(),
            $this->createStub(\App\Application\Team\IdentifierGenerator::class),
            $this->createStub(\App\Application\Team\AccessTokenGenerator::class),
            $cipher,
            'http://localhost',
            1800,
            new FunctionalConfiguration('development', $mode),
            new \App\Application\Team\CreationLimitPolicy('development', '', ''),
            'local-test-secret',
        );
        $this->expectException(\App\Application\Exception\InvalidTeamInput::class);
        $service->create('Equipo', 'Ana', 'UTC', 'private@example.invalid');
    }

    public static function nonSendingModes(): iterable
    {
        yield ['hidden'];
        yield ['demo'];
    }
}
