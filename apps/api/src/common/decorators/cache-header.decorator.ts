import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export const CACHE_MAX_AGE_KEY = 'cache_max_age_seconds';

/**
 * Sets a `private, max-age=<seconds>` Cache-Control header on the response.
 *
 * These endpoints are authenticated (per-user bearer token), so we always use
 * `private` — never `public` — to avoid the response being cached by a shared
 * proxy/CDN. This only helps the browser skip an identical re-fetch within
 * the window (e.g. flipping between tabs quickly); it does not replace
 * React Query's own staleTime on the frontend, which is the primary cache.
 *
 * Use only on read endpoints for data that rarely changes, e.g. roles,
 * permissions, the tests catalogue.
 */
export function CacheHeader(maxAgeSeconds: number) {
  return applyDecorators(SetMetadata(CACHE_MAX_AGE_KEY, maxAgeSeconds), UseInterceptors(CacheHeaderInterceptor));
}

@Injectable()
export class CacheHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();
    const maxAge: number | undefined = Reflect.getMetadata(CACHE_MAX_AGE_KEY, handler);
    if (maxAge !== undefined) {
      const res = context.switchToHttp().getResponse();
      res.header?.('Cache-Control', `private, max-age=${maxAge}`);
    }
    return next.handle();
  }
}
