import rateLimit from '@fastify/rate-limit'

import { rateLimitOptions } from './config/rate-limit'
import { accessProfileRoutes } from './http/controllers/access-profile/routes'
import { authRoutes } from './http/controllers/auth/routes'
import { procedureTypeRoutes } from './http/controllers/procedure-type/routes'
import { createBaseApp } from './utils/fastify/create-base-app'

const app = createBaseApp()

app.register(rateLimit, rateLimitOptions)
app.register(authRoutes)
app.register(accessProfileRoutes)
app.register(procedureTypeRoutes)

export { app }
