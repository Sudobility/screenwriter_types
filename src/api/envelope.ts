/**
 * Response envelope and pagination shape.
 *
 * The envelope is the canonical `@sudobility/types` `BaseResponse<T>`:
 * `{ success, data?, error?, timestamp }`. Constructors and guards are re-exported
 * from there so there is a single source of truth across the ecosystem.
 *
 * The REST error vocabulary and its HTTP-status map live in `./error-codes.ts`; they
 * are internal API machinery (how the server picks a status and disambiguates errors
 * that share one) and are no longer carried on the wire.
 */

export type {
  BaseResponse,
  ApiResponse,
  ApiInfoResponse,
  HealthResponse,
  HealthCheckData,
  PaginatedResponse,
  PaginationInfo,
} from '@sudobility/types';

export {
  successResponse,
  errorResponse,
  isSuccessResponse,
  isErrorResponse,
} from '@sudobility/types';
