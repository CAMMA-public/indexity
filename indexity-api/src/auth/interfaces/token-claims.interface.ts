// See https://tools.ietf.org/html/rfc7519#section-4

export interface TokenClaims {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}
