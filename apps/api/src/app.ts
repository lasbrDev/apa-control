import rateLimit from '@fastify/rate-limit'

import { rateLimitOptions } from './config/rate-limit'
import { accessProfileRoutes } from './http/controllers/access-profile/routes'
import { adopterRoutes } from './http/controllers/adopter/routes'
import { animalHistoryRoutes } from './http/controllers/animal-history/routes'
import { animalRoutes } from './http/controllers/animal/routes'
import { appointmentTypeRoutes } from './http/controllers/appointment-type/routes'
import { authRoutes } from './http/controllers/auth/routes'
import { campaignTypeRoutes } from './http/controllers/campaign-type/routes'
import { campaignRoutes } from './http/controllers/campaign/routes'
import { dashboardRoutes } from './http/controllers/dashboard/routes'
import { employeeRoutes } from './http/controllers/employee/routes'
import { finalDestinationTypeRoutes } from './http/controllers/final-destination-type/routes'
import { finalDestinationRoutes } from './http/controllers/final-destination/routes'
import { healthRoutes } from './http/controllers/health/routes'
import { procedureTypeRoutes } from './http/controllers/procedure-type/routes'
import { rescueRoutes } from './http/controllers/rescue/routes'
import { transactionTypeRoutes } from './http/controllers/transaction-type/routes'
import { veterinaryClinicRoutes } from './http/controllers/veterinary-clinic/routes'
import { createBaseApp } from './utils/fastify/create-base-app'

const app = createBaseApp()

app.register(rateLimit, rateLimitOptions)
app.register(healthRoutes)
app.register(authRoutes)
app.register(accessProfileRoutes)
app.register(procedureTypeRoutes)
app.register(rescueRoutes)
app.register(employeeRoutes)
app.register(animalRoutes)
app.register(appointmentTypeRoutes)
app.register(campaignTypeRoutes)
app.register(campaignRoutes)
app.register(finalDestinationTypeRoutes)
app.register(finalDestinationRoutes)
app.register(transactionTypeRoutes)
app.register(veterinaryClinicRoutes)
app.register(adopterRoutes)
app.register(dashboardRoutes)
app.register(animalHistoryRoutes)

export { app }
