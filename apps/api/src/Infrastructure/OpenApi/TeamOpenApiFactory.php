<?php

declare(strict_types=1);

namespace App\Infrastructure\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\Model\Header;
use ApiPlatform\OpenApi\Model\MediaType;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Parameter;
use ApiPlatform\OpenApi\Model\Paths;
use ApiPlatform\OpenApi\Model\PathItem;
use ApiPlatform\OpenApi\Model\RequestBody;
use ApiPlatform\OpenApi\Model\Response;
use ApiPlatform\OpenApi\Model\Schema;
use ApiPlatform\OpenApi\Model\SecurityScheme;
use ApiPlatform\OpenApi\OpenApi;

final readonly class TeamOpenApiFactory implements OpenApiFactoryInterface
{
    public function __construct(private OpenApiFactoryInterface $decorated) {}

    public function __invoke(array $context = []): OpenApi
    {
        $openApi = ($this->decorated)($context);
        $paths = new Paths();
        $demoTeams = $this->schema('array');
        $demoTeams['items'] = $this->schema('object', ['name' => $this->schema('string'), 'accessUrl' => $this->schema('string', format: 'uri'), 'kind' => $this->enumSchema(['social', 'music'])], ['name', 'accessUrl', 'kind']);
        $paths->addPath('/api/configuration', new PathItem(get: new Operation(
            operationId: 'getPublicConfiguration',
            tags: ['Configuration'],
            summary: 'Read public, environment-specific capabilities',
            responses: [
                '200' => $this->response('Effective public configuration', [
                    'teamCreationEmailMode' => $this->enumSchema(['hidden', 'demo', 'send']),
                    'teamCreationMaxTeams' => $this->schema('integer'),
                    'teamCreationWindowMinutes' => $this->schema('integer'),
                    'demo' => $this->schema('object', [
                        'nextResetAt' => $this->schema('string', format: 'date-time'),
                        'teams' => $demoTeams,
                    ], ['teams']),
                ], ['demo']),
            ],
        )));
        $paths->addPath('/api/teams', new PathItem(post: new Operation(
            operationId: 'createTeam',
            tags: ['Teams'],
            summary: 'Create a team and its first participant',
            parameters: [new Parameter(name: 'X-Creation-Device', in: 'header', required: false, description: 'Opaque first-party browser key; not a fingerprint. The server stores only a keyed digest.', schema: ['type' => 'string', 'pattern' => '^[A-Za-z0-9_-]{43}$'])],
            requestBody: new RequestBody(
                content: new \ArrayObject([
                    'application/json' => new MediaType(schema: $this->schema('object', [
                        'name' => $this->schema('string', maxLength: 50),
                        'firstParticipantName' => $this->schema('string', maxLength: 50),
                        'timeZone' => $this->schema('string'),
                        'email' => $this->schema('string', format: 'email', maxLength: 254),
                    ], ['name', 'firstParticipantName'])),
                ]),
                required: true,
            ),
            responses: [
                '201' => $this->response('Created', ['id' => $this->schema('string', format: 'uuid'), 'name' => $this->schema('string'), 'timeZone' => $this->schema('string'), 'expiresAt' => $this->schema('string', format: 'date-time'), 'firstParticipant' => $this->participant(), 'accessUrl' => $this->schema('string', format: 'uri'), 'creationAllowance' => $this->schema('object', ['maxTeams' => $this->schema('integer'), 'windowMinutes' => $this->schema('integer'), 'remaining' => $this->schema('integer')], ['maxTeams', 'windowMinutes', 'remaining']), 'mailAttempt' => $this->mailAttempt()], optional: ['mailAttempt']),
                '400' => $this->problem('Malformed JSON'), '422' => $this->problem('Invalid names or email', withViolations: true), '429' => $this->problem('Creation limit exceeded', 'urn:synqo:problem:creation-limit-exceeded'), '500' => $this->problem('Unexpected internal error'),
            ],
        )));
        $paths->addPath('/api/mail-attempts/current', new PathItem(get: new Operation(
            operationId: 'getCurrentMailAttempt',
            tags: ['Teams'],
            summary: 'Read the outcome of the optional link email sent when the team was created',
            security: [['mailReceipt' => []]],
            responses: [
                '200' => $this->response('Attempt status; never includes the address, the link or team data', ['status' => $this->enumSchema(['pending', 'succeeded', 'failed'])]),
                '401' => $this->problem('Mail receipt required')->withHeaders(new \ArrayObject(['WWW-Authenticate' => new Header(description: 'Challenge scheme for authentication.', required: true, schema: ['type' => 'string'])])),
                '404' => $this->problem('Receipt not found or attempt already deleted'), '500' => $this->problem('Unexpected internal error'),
            ],
        )));
        $security = [['teamBearer' => []]];
        $paths->addPath('/api/teams/current', new PathItem(get: new Operation(
            operationId: 'getCurrentTeam',
            tags: ['Teams'],
            summary: 'Read the team identified by the access link',
            security: $security,
            responses: [
                '200' => $this->response('Current team', ['id' => $this->schema('string', format: 'uuid'), 'name' => $this->schema('string'), 'timeZone' => $this->schema('string'), 'expiresAt' => $this->schema('string', format: 'date-time'), 'participants' => $this->participants()]),
                '401' => $this->unauthorizedProblem(), '404' => $this->problem('Team not found'), '410' => $this->problem('Team expired'), '500' => $this->problem('Unexpected internal error'),
            ],
        )));
        $paths->addPath('/api/teams/current/participants', new PathItem(post: new Operation(
            operationId: 'createTeamParticipant',
            tags: ['Teams'],
            summary: 'Add a participant to the current team',
            security: $security,
            requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $this->schema('object', ['name' => $this->schema('string', maxLength: 50)], ['name']))]), required: true),
            responses: [
                '201' => $this->response('Participant created', ['participant' => $this->participant(), 'expiresAt' => $this->schema('string', format: 'date-time')]),
                '400' => $this->problem('Malformed JSON'), '401' => $this->unauthorizedProblem(), '404' => $this->problem('Team not found'), '409' => $this->problem('Participant name already exists', 'urn:synqo:problem:duplicate-participant'), '410' => $this->problem('Team expired'), '422' => $this->problem('Invalid name', withViolations: true), '500' => $this->problem('Unexpected internal error'),
            ],
        )));
        $day = $this->availabilityDay();
        $days = $this->schema('array');
        $days['items'] = $day;
        $errors = ['400' => $this->problem('Malformed request'), '401' => $this->unauthorizedProblem(), '404' => $this->problem('Team or participant not found'), '410' => $this->problem('Team expired'), '500' => $this->problem('Unexpected internal error')];
        $paths->addPath('/api/teams/current/availability', new PathItem(get: new Operation(
            operationId: 'readAvailability',
            tags: ['Availability'],
            summary: 'Read up to 42 inclusive civil dates',
            security: $security,
            parameters: [new Parameter(name: 'from', in: 'query', required: true, schema: ['type' => 'string', 'format' => 'date']), new Parameter(name: 'to', in: 'query', required: true, schema: ['type' => 'string', 'format' => 'date'])],
            responses: ['200' => $this->response('Availability days', ['days' => $days])] + $errors,
        )));
        $state = $this->schema('string');
        $state['enum'] = ['available', 'maybe', 'unavailable', null];
        $state['nullable'] = true;
        $paths->addPath('/api/teams/current/availability/{date}/participants/{participantId}', new PathItem(put: new Operation(
            operationId: 'writeAvailability',
            tags: ['Availability'],
            summary: 'Set or remove the current mark',
            security: $security,
            parameters: [new Parameter(name: 'date', in: 'path', required: true, schema: ['type' => 'string', 'format' => 'date']), new Parameter(name: 'participantId', in: 'path', required: true, schema: ['type' => 'string', 'format' => 'uuid'])],
            requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $this->schema('object', ['state' => $state, 'timeZone' => $this->schema('string')], ['state']))]), required: true),
            responses: ['200' => $this->response('Confirmed day', ['day' => $day, 'expiresAt' => $this->schema('string', format: 'date-time')]), '422' => $this->problem('Invalid state, civil date, time zone or past day', withViolations: true)] + $errors,
        )));
        $consultation = $this->consultation();
        $consultations = $this->schema('array');
        $consultations['items'] = $consultation;
        $consultationErrors = ['400' => $this->problem('Malformed JSON'), '401' => $this->unauthorizedProblem(), '404' => $this->problem('Team or participant not found'), '410' => $this->problem('Team expired'), '500' => $this->problem('Unexpected internal error')];
        $paths->addPath('/api/teams/current/consultations', new PathItem(
            get: new Operation(
                operationId: 'listTeamConsultations',
                tags: ['Consultations'],
                summary: 'List the consultations for the current team',
                security: $security,
                responses: ['200' => $this->response('Consultations grouped by state', ['open' => $consultations, 'resolved' => $consultations, 'rejected' => $consultations])] + $consultationErrors,
            ),
            post: new Operation(
                operationId: 'createConsultation',
                tags: ['Consultations'],
                summary: 'Create an open text or date consultation',
                security: $security,
                requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $this->consultationRequest())]), required: true),
                responses: ['201' => $this->response('Created text or date consultation', ['consultation' => $consultation, 'expiresAt' => $this->schema('string', format: 'date-time')]), '409' => $this->problem('Event no longer eligible', 'urn:synqo:problem:event-conflict'), '422' => $this->problem('Invalid type, title, time zone or options', withViolations: true)] + $consultationErrors,
            ),
        ));
        $consultationDetail = $this->consultationDetail();
        $consultationId = new Parameter(name: 'consultationId', in: 'path', required: true, schema: ['type' => 'string', 'format' => 'uuid']);
        $decisionErrors = ['401' => $this->unauthorizedProblem(), '404' => $this->problem('Team, consultation, participant or option not found'), '410' => $this->problem('Team expired'), '500' => $this->problem('Unexpected internal error')];
        $paths->addPath('/api/teams/current/consultations/{consultationId}', new PathItem(get: new Operation(
            operationId: 'readConsultationDetail',
            tags: ['Consultations'],
            summary: 'Read current votes and resolution',
            security: $security,
            parameters: [$consultationId],
            responses: ['200' => new Response(description: 'Consultation detail', content: new \ArrayObject(['application/json' => new MediaType(schema: $consultationDetail)]))] + $decisionErrors,
        )));
        $paths->addPath('/api/teams/current/consultations/{consultationId}/event', new PathItem(put: new Operation(
            operationId: 'setConsultationEvent',
            tags: ['Consultations'],
            summary: 'Set or remove the event link of an open date consultation',
            security: $security,
            parameters: [$consultationId],
            requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $this->schema('object', ['eventId' => $this->eventLinkInput()], ['eventId']))]), required: true),
            responses: ['200' => $this->response('Updated consultation event link', ['consultation' => $consultationDetail, 'expiresAt' => $this->schema('string', format: 'date-time')]), '400' => $this->problem('Malformed or missing eventId'), '409' => $this->problem('Consultation closed or event no longer eligible (urn:synqo:problem:consultation-closed / urn:synqo:problem:event-conflict)'), '422' => $this->problem('Invalid event link', withViolations: true)] + $decisionErrors,
        )));
        $paths->addPath('/api/teams/current/consultations/{consultationId}/votes/{participantId}/options/{optionId}', new PathItem(put: new Operation(
            operationId: 'setConsultationVoteOption',
            tags: ['Consultations'],
            summary: 'Set or remove one vote option',
            security: $security,
            parameters: [$consultationId, new Parameter(name: 'participantId', in: 'path', required: true, schema: ['type' => 'string', 'format' => 'uuid']), new Parameter(name: 'optionId', in: 'path', required: true, schema: ['type' => 'string', 'format' => 'uuid'])],
            requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $this->schema('object', ['selected' => $this->schema('boolean')], ['selected']))]), required: true),
            responses: ['200' => $this->response('Confirmed vote and detail', ['consultation' => $consultationDetail, 'expiresAt' => $this->schema('string', format: 'date-time')]), '400' => $this->problem('Malformed JSON'), '409' => $this->problem('Consultation closed', 'urn:synqo:problem:consultation-closed'), '422' => $this->problem('Invalid selection', withViolations: true)] + $decisionErrors,
        )));
        $accepted = $this->schema('array');
        $accepted['items'] = $this->schema('string', format: 'uuid');
        $expectedEventVersion = $this->schema('integer');
        $expectedEventVersion['minimum'] = 1;
        $expectedEventVersion['description'] = 'Version shown in the definitive event warning; required to accept a linked definitive event. Any mismatch returns event-conflict without changes.';
        $paths->addPath('/api/teams/current/consultations/{consultationId}/resolution', new PathItem(put: new Operation(
            operationId: 'resolveConsultation',
            tags: ['Consultations'],
            summary: 'Accept options or reject an open consultation',
            security: $security,
            parameters: [$consultationId],
            requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $this->schema('object', ['participantId' => $this->schema('string', format: 'uuid'), 'status' => $this->enumSchema(['resolved', 'rejected']), 'acceptedOptionIds' => $accepted, 'eventId' => $this->eventLinkInput(), 'expectedEventVersion' => $expectedEventVersion], ['participantId', 'status', 'acceptedOptionIds']))]), required: true),
            responses: ['200' => $this->response('Confirmed resolution and detail', ['consultation' => $consultationDetail, 'expiresAt' => $this->schema('string', format: 'date-time')]), '400' => $this->problem('Malformed JSON'), '409' => $this->problem('Different resolution, rejected event or stale definitive event version (urn:synqo:problem:consultation-closed / urn:synqo:problem:event-conflict)'), '422' => $this->problem('Invalid resolution', withViolations: true)] + $decisionErrors,
        )));
        $event = $this->eventSummary();
        $eventList = $this->schema('array');
        $eventList['items'] = $event;
        $eventErrors = ['400' => $this->problem('Malformed JSON'), '401' => $this->unauthorizedProblem(), '404' => $this->problem('Team, event or participant not found'), '409' => $this->problem('Event state does not allow this operation', 'urn:synqo:problem:event-conflict'), '410' => $this->problem('Team expired'), '422' => $this->problem('Invalid event fields', withViolations: true), '500' => $this->problem('Unexpected internal error')];
        $eventRequest = $this->eventRequest(false);
        $paths->addPath('/api/teams/current/events', new PathItem(
            get: new Operation(
                operationId: 'listTeamEvents',
                tags: ['Events'],
                summary: 'List team events grouped by planning state',
                security: $security,
                responses: ['200' => $this->response('Events grouped and sorted for the team', ['unfinalized' => $eventList, 'future' => $eventList, 'past' => $eventList, 'rejected' => $eventList])] + $eventErrors,
            ),
            post: new Operation(
                operationId: 'createTeamEvent',
                tags: ['Events'],
                summary: 'Create an event',
                security: $security,
                requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $eventRequest)]), required: true),
                responses: ['201' => $this->response('Created event', ['event' => $this->eventDetail(), 'expiresAt' => $this->schema('string', format: 'date-time')])] + $eventErrors,
            ),
        ));
        $calendarRange = [new Parameter(name: 'from', in: 'query', required: true, schema: ['type' => 'string', 'format' => 'date']), new Parameter(name: 'to', in: 'query', required: true, schema: ['type' => 'string', 'format' => 'date'])];
        $paths->addPath('/api/teams/current/events/calendar', new PathItem(get: new Operation(
            operationId: 'calendarTeamEvents',
            tags: ['Events'],
            summary: 'List active dated events in a calendar range',
            security: $security,
            parameters: $calendarRange,
            responses: ['200' => $this->response('Events in the requested range', ['events' => $eventList]), '401' => $this->unauthorizedProblem(), '410' => $this->problem('Team expired'), '422' => $this->problem('Invalid calendar range', withViolations: true)],
        )));
        $eventId = new Parameter(name: 'eventId', in: 'path', required: true, schema: ['type' => 'string', 'format' => 'uuid']);
        $paths->addPath('/api/teams/current/events/{eventId}', new PathItem(
            get: new Operation(
                operationId: 'readTeamEvent',
                tags: ['Events'],
                summary: 'Read event details',
                security: $security,
                parameters: [$eventId],
                responses: ['200' => $this->response('Event detail', ['event' => $this->eventDetail()])] + $eventErrors,
            ),
            put: new Operation(
                operationId: 'updateTeamEvent',
                tags: ['Events'],
                summary: 'Replace event fields',
                security: $security,
                parameters: [$eventId],
                requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $this->eventRequest(true))]), required: true),
                responses: ['200' => $this->response('Updated event', ['event' => $this->eventDetail(), 'expiresAt' => $this->schema('string', format: 'date-time')])] + $eventErrors,
            ),
        ));
        $participantAction = $this->schema('object', ['participantId' => $this->schema('string', format: 'uuid')], ['participantId']);
        foreach (['rejection' => 'rejectTeamEvent', 'recovery' => 'recoverTeamEvent'] as $action => $operationId) {
            $paths->addPath('/api/teams/current/events/{eventId}/' . $action, new PathItem(put: new Operation(
                operationId: $operationId,
                tags: ['Events'],
                summary: $action === 'rejection' ? 'Reject an event' : 'Recover a rejected event',
                security: $security,
                parameters: [$eventId],
                requestBody: new RequestBody(content: new \ArrayObject(['application/json' => new MediaType(schema: $action === 'rejection' ? $this->schema('object', ['participantId' => $this->schema('string', format: 'uuid'), 'disposition' => $this->enumSchema(['unlink', 'reject_both'])], ['participantId']) : $participantAction)]), required: true),
                responses: ['200' => $this->response('Changed event lifecycle state', ['event' => $this->eventDetail(), 'expiresAt' => $this->schema('string', format: 'date-time')])] + $eventErrors,
            )));
        }
        $components = $openApi->getComponents()->withSecuritySchemes(new \ArrayObject(['teamBearer' => new SecurityScheme(type: 'http', description: 'Access token from the URL fragment', scheme: 'bearer'), 'mailReceipt' => new SecurityScheme(type: 'apiKey', description: 'Opaque receipt returned when the team was created with an email', name: 'X-Mail-Receipt', in: 'header')]));
        return $openApi->withPaths($paths)->withComponents($components);
    }

    /**
     * @param array<string, Schema> $properties
     * @param list<string> $required
     */
    private function schema(string $type, array $properties = [], array $required = [], ?string $format = null, ?int $maxLength = null): Schema
    {
        $schema = new Schema();
        $schema['type'] = $type;
        if ($properties) {
            $schema['properties'] = new \ArrayObject($properties);
        }
        if ($required) {
            $schema['required'] = $required;
        }
        if ($format !== null) {
            $schema['format'] = $format;
        }
        if ($maxLength !== null) {
            $schema['maxLength'] = $maxLength;
        }
        return $schema;
    }

    private function availabilityDay(): Schema
    {
        $state = $this->schema('string');
        $state['enum'] = ['available', 'maybe', 'unavailable'];
        $aggregate = clone $state;
        $aggregate['enum'] = ['available', 'maybe', 'unavailable', null];
        $aggregate['nullable'] = true;
        $marks = $this->schema('array');
        $marks['items'] = $this->schema('object', ['participantId' => $this->schema('string', format: 'uuid'), 'participantName' => $this->schema('string'), 'state' => $state], ['participantId', 'participantName', 'state']);
        return $this->schema('object', ['date' => $this->schema('string', format: 'date'), 'state' => $aggregate, 'summaryStates' => $this->schema('object', ['worst' => $aggregate, 'median' => $aggregate, 'mostFrequent' => $aggregate], ['worst', 'median', 'mostFrequent']), 'counts' => $this->schema('object', ['available' => $this->schema('integer'), 'maybe' => $this->schema('integer'), 'unavailable' => $this->schema('integer')], ['available', 'maybe', 'unavailable']), 'marks' => $marks], ['date', 'state', 'summaryStates', 'counts', 'marks']);
    }

    private function consultation(): Schema
    {
        $state = $this->schema('string');
        $state['enum'] = ['open', 'resolved', 'rejected'];
        $type = $this->schema('string');
        $type['enum'] = ['text', 'date'];
        $options = $this->schema('array');
        $options['items'] = $this->schema('object');
        $options['items']['oneOf'] = [
            $this->schema('object', ['id' => $this->schema('string', format: 'uuid'), 'text' => $this->schema('string', maxLength: 50), 'position' => $this->schema('integer')], ['id', 'text', 'position']),
            $this->schema('object', ['id' => $this->schema('string', format: 'uuid'), 'date' => $this->schema('string', format: 'date'), 'position' => $this->schema('integer')], ['id', 'date', 'position']),
        ];

        $accepted = $this->schema('array');
        $accepted['items'] = $this->schema('string', format: 'uuid');
        $resolution = $this->schema('object', ['participant' => $this->participant(), 'resolvedAt' => $this->schema('string', format: 'date-time'), 'acceptedOptionIds' => $accepted], ['participant', 'resolvedAt', 'acceptedOptionIds']);
        $event = $this->eventSummary();
        return $this->schema('object', ['id' => $this->schema('string', format: 'uuid'), 'type' => $type, 'title' => $this->schema('string', maxLength: 250), 'state' => $state, 'createdAt' => $this->schema('string', format: 'date-time'), 'createdBy' => $this->participant(), 'options' => $options, 'event' => $event, 'resolution' => $resolution], ['id', 'type', 'title', 'state', 'createdAt', 'createdBy', 'options']);
    }

    private function consultationDetail(): Schema
    {
        $schema = $this->consultation();
        $options = $this->schema('array');
        $voters = $this->participants();
        $common = ['id' => $this->schema('string', format: 'uuid'), 'position' => $this->schema('integer'), 'count' => $this->schema('integer'), 'voters' => $voters];
        $option = $this->schema('object');
        $option['oneOf'] = [
            $this->schema('object', $common + ['text' => $this->schema('string', maxLength: 50)], ['id', 'position', 'count', 'voters', 'text']),
            $this->schema('object', $common + ['date' => $this->schema('string', format: 'date')], ['id', 'position', 'count', 'voters', 'date']),
        ];
        $options['items'] = $option;
        $schema['properties']['options'] = $options;
        return $schema;
    }

    private function consultationRequest(): Schema
    {
        $type = $this->enumSchema(['text', 'date']);
        $type['description'] = 'Opcional por compatibilidad: si se omite, se interpreta como text.';
        $timeZone = $this->schema('string');
        $timeZone['description'] = 'Zona horaria IANA obligatoria para type date.';
        $options = $this->consultationOptionsSchema();
        $options['items']['description'] = 'Texto para type text; fecha civil YYYY-MM-DD para type date.';
        $createEvent = $this->schema('boolean');
        $createEvent['default'] = false;
        $createEvent['description'] = 'For date consultations only: atomically create a linked provisional event with no date, the same title and creator. Cannot be combined with eventId.';

        return $this->schema('object', [
            'participantId' => $this->schema('string', format: 'uuid'),
            'type' => $type,
            'title' => $this->schema('string', maxLength: 250),
            'options' => $options,
            'timeZone' => $timeZone,
            'eventId' => $this->eventLinkInput(),
            'createEvent' => $createEvent,
        ], ['participantId', 'title', 'options']);
    }

    private function eventLinkInput(): Schema
    {
        $schema = $this->schema('string', format: 'uuid');
        $schema['nullable'] = true;
        $schema['description'] = 'UUID changes the link; null removes it. Omit during resolution to keep the current link. New links require an eligible event.';
        return $schema;
    }

    /** @param list<string> $values */
    private function enumSchema(array $values): Schema
    {
        $schema = $this->schema('string');
        $schema['enum'] = $values;

        return $schema;
    }

    private function consultationOptionsSchema(): Schema
    {
        $options = $this->schema('array');
        $options['minItems'] = 1;
        $options['maxItems'] = 10;
        $options['items'] = $this->schema('string', maxLength: 50);

        return $options;
    }

    private function eventSummary(): Schema
    {
        $date = $this->schema('string', format: 'date');
        $date['nullable'] = true;
        $lastModifiedAt = $this->schema('string', format: 'date-time');
        $lastModifiedAt['nullable'] = true;
        $version = $this->schema('integer');
        $version['minimum'] = 1;
        return $this->schema('object', [
            'id' => $this->schema('string', format: 'uuid'),
            'title' => $this->schema('string', maxLength: 250),
            'date' => $date,
            'status' => $this->enumSchema(['provisional', 'definitive', 'rejected']),
            'lastModifiedAt' => $lastModifiedAt,
            'version' => $version,
        ], ['id', 'title', 'date', 'status', 'lastModifiedAt', 'version']);
    }

    private function eventDetail(): Schema
    {
        $event = $this->eventSummary();
        $consultations = $this->schema('array');
        $consultations['items'] = $this->schema('object', ['id' => $this->schema('string', format: 'uuid'), 'title' => $this->schema('string'), 'state' => $this->enumSchema(['open', 'resolved', 'rejected'])], ['id', 'title', 'state']);
        $event['properties']['consultations'] = $consultations;
        $notes = $this->schema('string', maxLength: 5000);
        $notes['nullable'] = true;
        $lastModifiedBy = $this->participant();
        $lastModifiedBy['nullable'] = true;
        $event['properties']['notes'] = $notes;
        $event['properties']['createdBy'] = $this->participant();
        $event['properties']['createdAt'] = $this->schema('string', format: 'date-time');
        $event['properties']['lastModifiedBy'] = $lastModifiedBy;
        $event['required'] = [...$event['required'], 'notes', 'createdBy', 'createdAt', 'lastModifiedBy'];
        return $event;
    }

    private function eventRequest(bool $updating): Schema
    {
        $notes = $this->schema('string', maxLength: 5000);
        $notes['nullable'] = true;
        $date = $this->schema('string', format: 'date');
        $date['nullable'] = true;
        $status = $this->enumSchema(['provisional', 'definitive']);
        if (!$updating) {
            $status['description'] = 'Optional; defaults to provisional. An event without a date is always provisional.';
        }
        return $this->schema('object', [
            'participantId' => $this->schema('string', format: 'uuid'),
            'title' => $this->schema('string', maxLength: 250),
            'notes' => $notes,
            'date' => $date,
            'status' => $status,
        ], $updating ? ['participantId', 'title', 'status'] : ['participantId', 'title']);
    }

    private function participant(): Schema
    {
        return $this->schema('object', ['id' => $this->schema('string', format: 'uuid'), 'name' => $this->schema('string')], ['id', 'name']);
    }

    private function participants(): Schema
    {
        $schema = $this->schema('array');
        $schema['items'] = $this->participant();
        return $schema;
    }

    private function mailAttempt(): Schema
    {
        return $this->schema('object', ['status' => $this->enumSchema(['pending']), 'receipt' => $this->schema('string')], ['status', 'receipt']);
    }

    /**
     * @param array<string, Schema> $properties
     * @param list<string> $optional
     */
    private function response(string $description, array $properties, array $optional = []): Response
    {
        return new Response(description: $description, content: new \ArrayObject(['application/json' => new MediaType(schema: $this->schema('object', $properties, array_values(array_diff(array_keys($properties), $optional))))]));
    }

    private function unauthorizedProblem(): Response
    {
        return $this->problem('Bearer token required')->withHeaders(new \ArrayObject([
            'WWW-Authenticate' => new Header(description: 'Challenge scheme for authentication.', required: true, schema: ['type' => 'string']),
        ]));
    }

    private function problem(string $description, ?string $problemType = null, bool $withViolations = false): Response
    {
        $type = $this->schema('string');
        if ($problemType !== null) {
            $type['enum'] = [$problemType];
        }
        $properties = ['type' => $type, 'title' => $this->schema('string'), 'status' => $this->schema('integer'), 'detail' => $this->schema('string')];
        if ($withViolations) {
            $violations = $this->schema('array');
            $violations['items'] = $this->schema('object', ['propertyPath' => $this->schema('string'), 'message' => $this->schema('string')], ['propertyPath', 'message']);
            $properties['violations'] = $violations;
        }
        return new Response(description: $description, content: new \ArrayObject(['application/problem+json' => new MediaType(schema: $this->schema('object', $properties, ['type', 'title', 'status', 'detail']))]));
    }
}
