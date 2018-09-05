/**
 * DOC: oAuth2 - https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-specification
 * DOC: JWT - https://tools.ietf.org/html/rfc7519
 * DOC: JWS - https://tools.ietf.org/html/rfc7515
 * DOC: oAuth2 - https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/
 */

import logger from '../../../config/winston'
import {
  User,
  OAuthClient,
  OAuthAuthorizationCode,
  // OAuthAccessToken,
  // OAuthRefreshToken,
} from '../../models/oauth'
import OAuthConfig from '../../../config/oauth'
import { assign, } from 'lodash'
import jwt from 'jsonwebtoken'
// import jws from 'jws'
import fs from 'fs'
import moment from 'moment'
import Promise from 'bluebird'
import {
  ServerError,
  InvalidTokenError,
  UnauthorizedClientError,
  UnauthorizedRequestError,
} from 'oauth2-server'


/**
 * Invoked to generate a new access token.
 * This model function is optional. If not implemented, a default handler is used that generates access tokens
 * consisting of 40 characters in the range of a..z0..9.
 * Return A String to be used as access token.
 *
 * Invoked during: authorization_code grant, client_credentials grant, refresh_token grant, password grant
 *
 * @param client
 * @param user
 * @param scope
 */
function generateAccessToken(client, user, scope) {
  logger.log('debug', 'generateAccessToken')
  logger.log('debug', 'generateAccessToken::client:%j', client)
  logger.log('debug', 'generateAccessToken::user:%j', user)
  logger.log('debug', 'generateAccessToken::scope:%j', scope)

  return new Promise((resolve, reject) => {
    try {
      // Payload
      // todo: this payload is an example
      const payload = {
        iss: OAuthConfig.options.jwt.iss,
        user: user,
        client: client,
        scope: scope,
      }

      const privateKey = fs.readFileSync(OAuthConfig.options.jwt.atPrivateKey)

      const token = jwt.sign(payload, privateKey, {
        expiresIn: OAuthConfig.options.token.accessTokenLifetime,
        algorithm: 'RS256',
      })

      return resolve(token)
    } catch (e) {
      logger.log('debug', 'generateAccessToken::', e.message)
      return reject(new ServerError(e.message, { code: 500, }))
    }
  })
}


/**
 * Invoked to generate a new refresh token.
 * This model function is optional. If not implemented, a default handler is used that generates refresh tokens
 * consisting of 40 characters in the range of a..z0..9.
 * Returns A String to be used as refresh token.
 *
 * Invoked during: authorization_code grant, refresh_token grant, password grant,
 *
 * @param client
 * @param user
 * @param scope
 */
function generateRefreshToken(client, user, scope) {
  logger.log('debug', 'generateRefreshToken')
  logger.log('debug', 'generateRefreshToken::client:%j', client)
  logger.log('debug', 'generateRefreshToken::user:%j', user)
  logger.log('debug', 'generateRefreshToken::scope:%j', scope)

  return new Promise((resolve, reject) => {
    try {
      // Payload
      // todo: this payload is an example
      const payload = {
        iss: OAuthConfig.options.jwt.iss,
        user: user,
        client: client,
        scope: scope,
      }

      const privateKey = fs.readFileSync(OAuthConfig.options.jwt.rtPrivateKey)

      const token = jwt.sign(payload, privateKey, {
        expiresIn: OAuthConfig.options.token.accessTokenLifetime,
        notBefore: OAuthConfig.options.token.accessTokenLifetime,
        algorithm: 'RS256',
      })

      return resolve(token)
    } catch (e) {
      logger.log('debug', 'generateRefreshToken::', e.message)
      return reject(new ServerError(e.message, { code: 500, }))
    }
  })
}


/**
 * Invoked to generate a new authorization code.
 * This model function is optional. If not implemented, a default handler is used that generates authorization codes
 * consisting of 40 characters in the range of a..z0..9.
 * Returns A String to be used as authorization code.
 *
 * Invoked during: authorization_code grant}
 *
 * @param client
 * @param user
 * @param scope
 */

// function generateAuthorizationCode(client, user, scope) {}


/**
 * Invoked to retrieve an existing access token previously saved through Model#saveToken().
 * This model function is required if OAuth2Server#authenticate() is used.
 * Returns A String to be used as access token.
 *
 * Invoked during: request authentication
 *
 * @param bearerToken
 * @returns {Object<token>}
 */
function getAccessToken(bearerToken) {
  logger.log('debug', 'getAccessToken  %j', bearerToken)

  return new Promise((resolve, reject) => {
    try {
      const publicKey = fs.readFileSync(OAuthConfig.options.jwt.atPublicKey)

      return jwt.verify(bearerToken, publicKey, (err, decoded) => {
        if (err)
          return reject(new InvalidTokenError(err.message))   // the err contains JWT error data

        logger.log('debug', 'getAccessToken::JWT::decoded:%j', decoded)

        const token = {}

        token.accessToken = bearerToken
        token.user = decoded.user
        token.client = decoded.client
        token.scope = decoded.scope
        token.accessTokenExpiresAt = moment.unix(decoded.exp).toDate()

        return resolve(token)
      })

      // if you saved the token:
      // return OAuthAccessToken
      //   .getAccessToken(bearerToken)
      //   .then((accessToken) => {
      //     const token = {}
      //
      //     token.accessToken = accessToken.accessToken
      //     token.user = accessToken.User
      //     token.client = accessToken.OAuthClient
      //     token.scope = accessToken.scope
      //     token.accessTokenExpiresAt = accessToken.accessTokenExpiresAt
      //
      //     logger.log('debug', 'getAccessToken::token')
      //     logger.log('debug', 'getAccessToken::token::%j', token)
      //     logger.log('debug', 'getAccessToken::accessToken::%j', accessToken)
      //
      //     return token
      //   })
      //   .catch((err) => {
      //     logger.log('debug', 'getAccessToken - Err: ', err)
      //     return err
      //   })
    } catch (e) {
      logger.log('debug', 'getAccessToken::', e.message)
      return reject(new InvalidTokenError(e.message))
    }
  })
}


/**
 * Invoked to retrieve an existing refresh token previously saved through Model#saveToken().
 * This model function is required if the refresh_token grant is used.
 * Returns An Object representing the refresh token and associated data.
 *
 * Invoked during: refresh_token grant
 *
 * @param refreshToken - The access token to retrieve.
 * @returns {Object<refreshToken>}
 */
function getRefreshToken(refreshToken) {
  logger.log('debug', 'getRefreshToken %j', refreshToken)

  return new Promise((resolve, reject) => {
    try {
      const publicKey = fs.readFileSync(OAuthConfig.options.jwt.rtPublicKey)

      // Using JWT
      return jwt.verify(refreshToken, publicKey, (err, decoded) => {
        if (err)
          return reject(new InvalidTokenError(err.message))

        logger.log('debug', 'getAccessToken::JWT::decoded:%j', decoded)

        const token = {}

        token.user = decoded.user
        token.client = decoded.client
        token.client.id = decoded.client._id
        token.refreshTokenExpiresAt = moment.unix(decoded.exp).toDate()
        token.refreshToken = refreshToken
        token.scope = decoded.scope

        return resolve(token)
      })
    } catch (e) {
      logger.log('debug', 'getRefreshToken::', e.message)
      return reject(new InvalidTokenError(e.message))
    }

    // Using JWS
    // if (jws.verify(refreshToken, 'RS256', publicKey)) {
    //   const decoded = jws.decode(refreshToken)
    //
    //   const payload = JSON.parse(decoded.payload)
    //
    //   logger.log('debug', 'getRefreshToken::JWS::decoded:%j', decoded)
    //
    //   const token = {}
    //
    //   token.user = payload.user
    //   token.client = payload.client
    //   token.client.id = payload.client._id
    //   token.refreshTokenExpiresAt = moment.unix(payload.exp).toDate()
    //   token.refreshToken = refreshToken
    //   token.scope = payload.scope
    //
    //   return resolve(token)
    // } else {
    //   logger.log('debug', 'getRefreshToken::Invalido')
    //   return reject(new InvalidTokenError(err.message))
    // }

    // if you saved the refresh token:
    // return OAuthRefreshToken
    //   .getRefreshToken(refreshToken)
    //   .then((token) => {
    //     logger.log('debug', '\n\ngetRefreshToken::%j\n\n', token)
    //     return resolve(token)
    //   })
    //   .catch((err) => {
    //     logger.log('debug', 'getRefreshToken - Err: ', err)
    //     return reject(new InvalidTokenError(err.message))
    //   })
  })
}


/**
 * Invoked to retrieve an existing authorization code previously saved through Model#saveAuthorizationCode().
 * This model function is required if the authorization_code grant is used.
 * Returns An Object representing the authorization code and associated data.
 *
 * Invoked during: authorization_code grant
 *
 * @param code
 * @returns {Object<code>}
 */
function getAuthorizationCode(code) {
  logger.log('debug', 'getAuthorizationCode %j', code)

  return new Promise((resolve, reject) => {
    OAuthAuthorizationCode
      .getAuthorizationCode(code)
      .then((authCode) => {
        const client = authCode.OAuthClient
        const user = authCode.User
        return resolve({
          code: code,
          client: client,
          expiresAt: authCode.expiresAt,
          redirectUri: authCode.redirectUri,
          user: user,
          scope: authCode.scope,
        })
      })
      .catch((e) => {
        logger.log('debug', 'getAuthorizationCode - Err: ', err)
        return reject(new InvalidTokenError(e.message))
      })
  })
}


/**
 * Invoked to retrieve a client using a client id or a client id/client secret combination, depending on the grant type.
 * This model function is required for all grant types.
 * Returns An Object representing the client and associated data
 *
 * Invoked during: authorization_code grant, client_credentials grant, implicit grant, refresh_token grant, password grant
 *
 * @param clientId - The client id of the client to retrieve.
 * @param clientSecret - The client secret of the client to retrieve. Can be null.
 * @returns {Object<Client>}
 */
function getClient(clientId, clientSecret) {
  logger.log('debug', 'getClient::clientId %j, clientSecret %j', clientId, clientSecret)

  return new Promise((resolve, reject) => {
    OAuthClient
      .getOAuthClient({ clientId, clientSecret, })
      .then((v) => {
        const client = v

        // Set default Grants
        client.grants = (client.grants) ? client.grants : OAuthConfig.grants

        // Set default accessTokenLifetime
        client.accessTokenLifetime = (client.accessTokenLifetime) ?
          client.accessTokenLifetime : OAuthConfig.options.token.accessTokenLifetime

        // Set default refreshTokenLifetime
        client.refreshTokenLifetime = (client.refreshTokenLifetime) ?
          client.refreshTokenLifetime : OAuthConfig.options.token.refreshTokenLifetime

        return resolve(client)
      })
      .catch((e) => {
        logger.log('debug', 'getClient - Err: ', e)
        return reject(new UnauthorizedClientError(e.message))
      })
  })
}


/**
 * Invoked to retrieve a user using a username/password combination.
 * This model function is required if the password grant is used.
 * Returns Node-style callback to be used instead of the returned Promise.
 *
 * Invoked during: password grant
 *
 * @param username - The username of the user to retrieve.
 * @param password - The user’s password.
 * @returns {Object<User>}
 */
function getUser(username, password) {
  return new Promise((resolve, reject) => {
    User
      .getUser(username, password)
      .then((user) => resolve(user))
      .catch((e) => {
        logger.log('debug', 'getUser - Err: ', e)
        return reject(new UnauthorizedRequestError(e.message))
      })
  })
}


/**
 * Invoked to retrieve the user associated with the specified client.
 * This model function is required if the client_credentials grant is used.
 * Returns An Object representing the user, or a falsy value if the client does not have an associated user,
 * the user object is completely transparent to oauth2-server and is simply used as input to other model functions.
 *
 * Invoked during: client_credentials grant
 *
 * @param client
 * @returns {Object<User>}
 */
function getUserFromClient(client) {
  logger.log('debug', 'getUserFromClient:%j', client)
  return new Promise((resolve, reject) => {
    const { clientId, } = client

    return OAuthClient
      .getUserFromClient(clientId)
      .then((user) => {
        logger.log('debug', 'getUserFromClient::User::%j', user)
        return resolve(user)
      })
      .catch((e) => {
        logger.log('debug', 'getUserFromClient - Err: ', e)
        return reject(new UnauthorizedRequestError(e.message))
      })
  })
}


/**
 * Invoked to save an access token and optionally a refresh token, depending on the grant type.
 * This model function is required for all grant types.
 * Returns An Object representing the token(s) and associated data.
 *
 * Invoked during: authorization_code grant, client_credentials grant, implicit grant, refresh_token grant, password grant
 *
 * @param token - The token to be saved.
 * @param client - The client associated with the token.
 * @param user - The user associated with the token.
 * @returns {Object<token>}
 */
function saveToken(token, client, user) {
  logger.log('debug', 'saveToken::\nToken: %j\nClient: %j\nUser: %j', token, client, user)
  return new Promise((resolve, reject) => {
    try {
      const savedToken = assign(  // expected to return client and user, but not returning
        {
          client: client,
          user: user,
          accessToken: (token.accessToken), // proxy
          refreshToken: (token.refreshToken), // proxy
        },
        token
      )

      return resolve(savedToken)
    } catch (e) {
      return reject(new ServerError(e.message, { code: 500, }))
    }
  })

  // if you need save the token or something:
  // const l = [
  //   // Create AccessToken
  //   OAuthAccessToken
  //     .saveAccessToken({
  //       accessToken: token.accessToken,
  //       accessTokenExpiresAt: token.accessTokenExpiresAt,
  //       clientId: client._id,
  //       userId: user._id,
  //       scope: token.scope,
  //     }),
  // ]
  //
  // // Create AccessToken for password grant
  // if (token.refreshToken)
  //   l.push(OAuthRefreshToken.saveRefreshToken({
  //     refreshToken: token.refreshToken,
  //     refreshTokenExpiresAt: token.refreshTokenExpiresAt,
  //     clientId: client._id,
  //     userId: user._id,
  //     scope: token.scope,
  //   }))
  //
  // return Promise
  //   .all(l)
  //   .then((resultsArray) => {
  //     return assign(  // expected to return client and user, but not returning
  //       {
  //         client: client,
  //         user: user,
  //         accessToken: token.accessToken, // proxy
  //         refreshToken: token.refreshToken, // proxy
  //       },
  //       token
  //     )
  //   })
  //   .catch((err) => {
  //     logger.log('debug', 'revokeToken - Err: ', err)
  //     return err
  //   })
}


/**
 * Invoked to save an authorization code.
 * This model function is required if the authorization_code grant is used.
 * Returns An Object representing the authorization code and associated data.
 *
 * Invoked during: authorization_code grant
 *
 * @param code
 * @param client
 * @param user
 * @returns {Object<code>}
 */
function saveAuthorizationCode(code, client, user) {
  logger.log('debug', 'saveAuthorizationCode\ncode %j\nclient %j\nuser %j', code, client, user)

  return new Promise((resolve, reject) => {
    OAuthAuthorizationCode
      .saveAuthorizationCode({
        expiresAt: code.expiresAt,
        OAuthClient: client._id,
        redirectUri: client.redirectUris[0], // todo: get Authorization RedirectUri
        authorizationCode: code.authorizationCode,
        User: user._id,
        scope: code.scope,
      })
      .then(() => {
        code.code = code.authorizationCode
        return resolve(code)
      })
      .catch((e) => {
        logger.log('debug', 'saveAuthorizationCode - Err: ', e)
        return reject(new ServerError(e.message, { code: 500, }))
      })
  })
}


/**
 * Invoked to revoke a refresh token.
 * This model function is required if the refresh_token grant is used.
 * Returns true if the revocation was successful or false if the refresh token could not be found.
 *
 * Invoked during: refresh_token grant
 *
 * @param token
 * @returns {Object<Boolean>}
 */
function revokeToken(token) {
  logger.log('debug', 'revokeToken %j', token)
  return token

  // if you saved the refresh token:
  // other option is use redis with ttl at expiration time how a blacklist

  // return new Promise((resolve, reject) => {
  //   OAuthRefreshToken
  //     .revokeToken(token.refreshToken)
  //     .then((token) => {
  //       logger.log('debug', 'revokeToken::Then::%j', token)
  //       return resolve(token)
  //     })
  //     .catch((err) => {
  //       logger.log('debug', 'revokeToken - Err: ', err)
  //       return reject(false)
  //       return reject(new ServerError(e.message, { code: 500, }))
  //     })
  // })
}


/**
 * Invoked to revoke an authorization code.
 * This model function is required if the authorization_code grant is used.
 * Returns true if the revocation was successful or false if the authorization code could not be found.
 *
 * Invoked during: authorization_code grant
 *
 * @param code
 * @returns {Object<Boolean>}
 */
function revokeAuthorizationCode(code) {
  logger.log('debug', 'revokeAuthorizationCode %j', code)

  return new Promise((resolve, reject) => {
    OAuthAuthorizationCode
      .removeAuthorizationCode()
      .then((code) => resolve(code))
      .catch((e) => {
        logger.log('debug', 'revokeAuthorizationCode - Err: ', e)
        return reject(new ServerError(e.message, { code: 500, }))
      })
  })
}


/**
 * Doc: https://oauth2-server.readthedocs.io/en/latest/model/spec.html#verifyscope-accesstoken-scope-callback
 * Invoked to check if the requested scope is valid for a particular client/user combination.
 * This model function is optional. If not implemented, any scope is accepted.
 * Returns Validated scopes to be used or a falsy value to reject the requested scopes.
 *
 * Invoked during: authorization_code grant, client_credentials grant, implicit grant, password grant
 *
 * @param user
 * @param client
 * @param scope
 * @returns {boolean}
 */
function validateScope(user, client, scope) {
  // If you need other validation, modify this code:
  // You can use OAuthScope schema
  return (user.scope === scope && client.scope === scope && scope !== null) ? scope : false
}


/**
 * Invoked during request authentication to check if the provided access token was authorized the requested scopes.
 * This model function is required if scopes are used with OAuth2Server#authenticate().
 * Returns true if the access token passes, false otherwise.
 *
 * Invoked during: request authentication
 *
 * @param token - is the access token object previously obtained through Model#getAccessToken().
 * @param scope - is the required scope as given to OAuth2Server#authenticate() as options.scope.
 * @returns {boolean}
 */
// function verifyScope(accessToken, scope) {}


export default {
  generateAccessToken,
  generateRefreshToken,
  // generateAuthorizationCode, // optional
  getAccessToken,
  getRefreshToken,
  getAuthorizationCode,
  getClient,
  getUser,
  getUserFromClient,
  saveToken,
  saveAuthorizationCode,
  revokeToken,
  revokeAuthorizationCode,
  validateScope,
  // verifyScope
}
