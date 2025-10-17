import { PatternFormat } from 'react-number-format'

export function maskPhone(phone: string | null | undefined) {
  return (
    <PatternFormat
      value={phone}
      displayType="text"
      format={phone && phone.length <= 10 ? '(##) ####-####' : '(##) #####-####'}
    />
  )
}
