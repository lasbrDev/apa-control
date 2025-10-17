import { app } from './app'
import { env } from './env'

app.listen({ host: '0.0.0.0', port: env.PORT ?? 3333 }, (error) => {
  if (error) {
    console.error(error)
    process.exit(1)
  } else {
    process.send?.('ready')
  }
})
