import Decimal from 'decimal.js'
import { customType } from 'drizzle-orm/pg-core'

type DecimalJsConfig = {
  precision?: number
  scale?: number
}

export const decimalJs = customType<{
  data: Decimal
  driverData: number
  config: DecimalJsConfig
}>({
  dataType: (config) => {
    if (config?.precision && config?.scale) {
      return `decimal(${config.precision}, ${config.scale})`
    }

    return 'decimal'
  },
  fromDriver: (value: number) => new Decimal(value),
  toDriver: (value: Decimal) => value.toNumber(),
})
