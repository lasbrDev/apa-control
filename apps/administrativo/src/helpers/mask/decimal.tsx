import { NumericFormat } from 'react-number-format'

interface DecimalConfig {
  decimalSeparator?: string
  precision?: number
  prefix?: string
  thousandSeparator?: string
}

export function maskDecimal(value: number, config: DecimalConfig = {}) {
  return (
    <NumericFormat
      fixedDecimalScale
      value={value}
      displayType="text"
      decimalSeparator={config.decimalSeparator ?? ','}
      thousandSeparator={config.thousandSeparator ?? '.'}
      decimalScale={config.precision ?? 2}
      prefix={config.prefix ?? ''}
    />
  )
}

export const maskMoney = (value: number) => maskDecimal(value, { prefix: 'R$ ' })
export const tableMaskMoney = (value: number) => (
  <div className="flex text-left">
    <div className="flex-1">R$</div>
    <div>{maskDecimal(value)}</div>
  </div>
)
