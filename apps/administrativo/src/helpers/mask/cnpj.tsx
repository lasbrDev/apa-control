import { PatternFormat } from 'react-number-format'

export function maskCnpj(cnpj: string | undefined | null) {
  return cnpj ? <PatternFormat value={cnpj} displayType="text" format="##.###.###/####-##" /> : ''
}
