import rateLimit from '@fastify/rate-limit'

import { rateLimitOptions } from './config/rate-limit'
import { accessProfileRoutes } from './http/controllers/access-profile/routes'
import { adopterRoutes } from './http/controllers/adopter/routes'
import { animalRoutes } from './http/controllers/animal/routes'
import { appointmentTypeRoutes } from './http/controllers/appointment-type/routes'
import { authRoutes } from './http/controllers/auth/routes'
import { campaignTypeRoutes } from './http/controllers/campaign-type/routes'
import { dashboardRoutes } from './http/controllers/dashboard/routes'
import { employeeRoutes } from './http/controllers/employee/routes'
import { finalDestinationTypeRoutes } from './http/controllers/final-destination-type/routes'
import { healthRoutes } from './http/controllers/health/routes'
import { procedureTypeRoutes } from './http/controllers/procedure-type/routes'
import { transactionTypeRoutes } from './http/controllers/transaction-type/routes'
import { veterinaryClinicRoutes } from './http/controllers/veterinary-clinic/routes'
import { createBaseApp } from './utils/fastify/create-base-app'

const app = createBaseApp()

app.register(rateLimit, rateLimitOptions)
app.register(healthRoutes)
app.register(authRoutes)
app.register(accessProfileRoutes)
app.register(procedureTypeRoutes)
app.register(employeeRoutes)
app.register(animalRoutes)
app.register(appointmentTypeRoutes)
app.register(campaignTypeRoutes)
app.register(finalDestinationTypeRoutes)
app.register(transactionTypeRoutes)
app.register(veterinaryClinicRoutes)
app.register(adopterRoutes)
app.register(dashboardRoutes)

export { app }
