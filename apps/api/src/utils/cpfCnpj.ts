const isRepeatingChars = (str: string) => str.split('').every((char) => char === str.charAt(0))
export const getValidationDigit = (digits: number[], multiplier: number) => {
  let mult = multiplier
  let result = 0

  result = digits.reduce((result, num) => {
    mult = mult === 1 ? 9 : mult
    const calc = result + num * mult
    mult -= 1
    return calc
  }, 0)

  const num = result % 11
  return num > 1 ? 11 - num : 0
}

export const isCnpj = (cnpjTxt: string) => {
  const cnpj = cnpjTxt.replace(/\D/g, '')

  if (cnpj.length !== 14 || isRepeatingChars(cnpj)) {
    return false
  }

  const digits = cnpj.substring(0, 12).split('').map(Number)

  const checker = cnpj.substring(12)
  const firstDigit = getValidationDigit(digits, 5)
  const secondDigit = getValidationDigit([...digits, firstDigit], 6)

  return checker === `${firstDigit}${secondDigit}`
}
