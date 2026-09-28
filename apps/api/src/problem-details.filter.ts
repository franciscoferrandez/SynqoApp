import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

type Response = {
  status: (status: number) => Response;
  type: (contentType: string) => Response;
  json: (body: object) => void;
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const source = typeof body === 'object' && body !== null ? body : {};
    const code = 'code' in source && typeof source.code === 'string' ? source.code : undefined;
    const message = 'message' in source ? source.message : undefined;
    response
      .status(status)
      .type('application/problem+json')
      .json({
        type: `https://synqo.app/problems/${code?.toLowerCase() ?? 'internal-error'}`,
        title: exception instanceof HttpException ? exception.name : 'Internal Server Error',
        status,
        ...(typeof message === 'string' ? { detail: message } : {}),
        ...(code ? { code } : {}),
      });
  }
}
