/**
 * DOC: https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html#new-oauth2server-options
 */

import path from 'path'

const
  addAcceptedScopesHeader = true,
  addAuthorizedScopesHeader = true,
  allowBearerTokensInQueryString = false,
  authorizationCodeLifetime = 300, // seconds, default = 5 minutes, 300 sec
  accessTokenLifetime = 3600, // seconds, default = 1 hour, 3600 se
  refreshTokenLifetime = 1209600, // seconds, default = 2 weeks, 1209600 sec
  allowExtendedTokenAttributes = false,
  requireClientAuthentication = true,
  alwaysIssueNewRefreshToken = true,
  extendedGrantTypes = {},
  scopes = undefined,
  jwtISS = 'node_scaffolding',
  jwtATPrivateKey = path.join(__dirname, './ac', '/at-privateKey.pem'),
  jwtATPublicKey = path.join(__dirname, './ac', '/at-publicKey.pem'),
  jwtRTPrivateKey = path.join(__dirname, './ac', '/rt-privateKey.pem'),
  jwtRTPublicKey = path.join(__dirname, './ac', '/rt-publicKey.pem'),
  grants = [
    'authorization_code',
    'password',
    'refresh_token',
    'client_credentials',
  ]

export default {
  options: {
    // The supplied options will be used as default for the other methods.
    server: {
      addAcceptedScopesHeader,
      addAuthorizedScopesHeader,
      allowBearerTokensInQueryString,
      authorizationCodeLifetime,
      accessTokenLifetime,
      refreshTokenLifetime,
      allowExtendedTokenAttributes,
      requireClientAuthentication,
      alwaysIssueNewRefreshToken,
      extendedGrantTypes,
      scopes,
    },
    // Options by handler methods:
    authenticate: {
      addAcceptedScopesHeader,
      addAuthorizedScopesHeader,
      allowBearerTokensInQueryString,
    },
    authorize: {
      authorizationCodeLifetime,
      accessTokenLifetime,
    },
    token: {
      accessTokenLifetime,
      refreshTokenLifetime,
      allowExtendedTokenAttributes,
      requireClientAuthentication,
      alwaysIssueNewRefreshToken,
      extendedGrantTypes,
    },
    jwt: {
      iss: jwtISS,
      atPrivateKey: jwtATPrivateKey,
      atPublicKey: jwtATPublicKey,
      rtPrivateKey: jwtRTPrivateKey,
      rtPublicKey: jwtRTPublicKey,
    },
  },
  grants,
}
