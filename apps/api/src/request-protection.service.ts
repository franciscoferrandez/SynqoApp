import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';

import { getEnvironment } from './config.js';

type StoredResult = { fingerprint: string; result: Promise<unknown> };

@Injectable()
export class RequestProtectionService {
  private readonly idempotency = new Map<string, StoredResult>();

  assertSafeMutation(headers: Record<string, string | string[] | undefined>): void {
    const origin = headers.origin;
    if (origin && origin !== getEnvironment().WEB_ORIGIN)
      throw new ForbiddenException({ code: 'ORIGIN_INVALID' });
    const cookies = typeof headers.cookie === 'string' ? headers.cookie : '';
    const context = cookies.match(/(?:^|; )synqo_context_session=([^;]+)/)?.[1];
    if (!context) return;
    const csrf = cookies.match(/(?:^|; )synqo_csrf=([^;]+)/)?.[1];
    const supplied = headers['x-csrf-token'];
    if (!csrf || supplied !== csrf) throw new ForbiddenException({ code: 'CSRF_INVALID' });
  }

  replay<T>(
    scope: string,
    key: string | undefined,
    payload: unknown,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (!key) return operation();
    const fingerprint = JSON.stringify(payload);
    const stored = this.idempotency.get(`${scope}:${key}`);
    if (stored) {
      if (stored.fingerprint !== fingerprint)
        throw new ConflictException({ code: 'IDEMPOTENCY_CONFLICT' });
      return Promise.resolve(stored.result as T);
    }
    const result = operation();
    this.idempotency.set(`${scope}:${key}`, { fingerprint, result });
    return result.catch((error: unknown) => {
      this.idempotency.delete(`${scope}:${key}`);
      throw error;
    });
  }
}
