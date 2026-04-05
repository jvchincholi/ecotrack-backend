import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayloadDto } from '../dto/auth-response.dto';

/**
 * JWT Authentication Strategy
 * 
 * Implements Passport's JWT strategy for protecting routes and extracting
 * authenticated user information from JWT tokens. Validates tokens and provides
 * the decoded payload to route handlers via the @GetUser decorator.
 * 
 * Token Extraction:
 * - Extracts JWT from the Authorization header (e.g., "Bearer <token>")
 * - Validates token signature and expiration
 * - Returns decoded payload to validate() method
 * 
 * Configuration:
 * - jwtFromRequest: Extracts token from Bearer authorization header
 * - ignoreExpiration: false (validates expiration time)
 * - secretOrKey: JWT secret from environment variable or default
 * 
 * @class JwtStrategy
 * @extends PassportStrategy(Strategy)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initialize JWT strategy configuration
   * 
   * Configures Passport JWT strategy with token extraction,
   * expiration validation, and secret key for verification.
   * 
   * The JWT_SECRET should be stored in environment variables
   * in production (e.g., .env file).
   */
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key',
    });
  }

  /**
   * Validate and return JWT payload
   * 
   * Called automatically by Passport after token verification.
   * Extracts the required claims from the decoded token.
   * The returned object is injected into route handlers via @GetUser() decorator.
   * 
   * @param {TokenPayloadDto} payload - Decoded JWT payload with user claims
   * @param {string} payload.sub - User ID (subject claim)
   * @param {string} payload.email - User email address
   * @param {number} payload.iat - Token issued at timestamp (seconds)
   * @param {number} payload.exp - Token expiration timestamp (seconds)
   * @returns {TokenPayloadDto} Validated token payload for route handlers
   * 
   * @example
   * // Token payload in decorated route:
   * @Get('me')
   * getCurrentUser(@GetUser() user: TokenPayloadDto) {
   *   // user contains { sub, email, iat, exp }
   * }
   */
  async validate(payload: TokenPayloadDto): Promise<TokenPayloadDto> {
    return {
      sub: payload.sub,
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
