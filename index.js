'use strict'

require('require-self-ref')

const fastify = require('fastify')()

const plugin = require('fastify-auth0')
const config = require('~/config')

fastify
  .register(require('fastify-cookie'))
  .register(require('fastify-caching'))
  .register(require('fastify-server-session'), {
    secretKey: 'some-secret-password-at-least-32-characters-long',
    sessionMaxAge: 1000 * 60 * 15, // 15 minutes
    cookie: {
      domain: '.charlesread.com',
      path: '/',
      expires: 1000 * 60 * 15,
      sameSite: 'Lax' // important because of the nature of OAuth 2, with all the redirects
    }
  })
  .register(plugin, {
    domain: config.auth0.domain,
    client_id: config.auth0.client_id,
    client_secret: config.auth0.client_secret,
    appUrl: 'http://charlesread.com',
    // optional
    transformer: async function (credentials) {
      credentials.log_in_date = new Date()
      credentials.foo = 'bar'
      // credentials.id = await someFunctionThatLooksUpId(credentials)
      return credentials
    },
    // optional
    success: async function (credentials) {
      console.log(`${credentials.given_name} logged in at ${credentials.log_in_date}`)
    }
  })

fastify.get('/', async function (request, reply) {
  // the credentials returned from Auth0 will be available in routes as request.session.credentials
  return reply.send({
    message: 'I accidentally deleted the VM on which my site ran, oops, https://github.com/charlesread/fastify-auth0',
    credentials: request.session.credentials
  })
})

fastify.listen(8001)
  .then(function () {
    console.log('listening on %s', fastify.server.address().port)
  })
  .catch(function (err) {
    console.error(err.stack)
  })