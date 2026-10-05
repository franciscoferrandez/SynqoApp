<?php

declare(strict_types=1);

namespace App\Infrastructure\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\Model\Header;
use ApiPlatform\OpenApi\Model\MediaType;
use ApiPlatform\OpenApi\Model\Operation;
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
        $paths->addPath('/api/teams', new PathItem(post: new Operation(
            operationId: 'createTeam',
            tags: ['Teams'],
            summary: 'Create a team and its first participant',
            requestBody: new RequestBody(
                content: new \ArrayObject([
                    'application/json' => new MediaType(schema: $this->schema('object', [
                        'name' => $this->schema('string', maxLength: 50),
                        'firstParticipantName' => $this->schema('string', maxLength: 50),
                        'timeZone' => $this->schema('string'),
                    ], ['name', 'firstParticipantName'])),
                ]),
                required: true,
            ),
            responses: [
                '201' => $this->response('Created', ['id' => $this->schema('string', format: 'uuid'), 'name' => $this->schema('string'), 'timeZone' => $this->schema('string'), 'expiresAt' => $this->schema('string', format: 'date-time'), 'firstParticipant' => $this->participant(), 'accessUrl' => $this->schema('string', format: 'uri')]),
                '400' => $this->problem('Malformed JSON'), '422' => $this->problem('Invalid names', withViolations: true), '500' => $this->problem('Unexpected internal error'),
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
        $components = $openApi->getComponents()->withSecuritySchemes(new \ArrayObject(['teamBearer' => new SecurityScheme(type: 'http', description: 'Access token from the URL fragment', scheme: 'bearer')]));
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

    /** @param array<string, Schema> $properties */
    private function response(string $description, array $properties): Response
    {
        return new Response(description: $description, content: new \ArrayObject(['application/json' => new MediaType(schema: $this->schema('object', $properties, array_keys($properties)))]));
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
