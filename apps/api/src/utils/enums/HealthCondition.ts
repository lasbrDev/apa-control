export const HealthCondition = {
  CRITICAL: 'critica',
  STABLE: 'estavel',
  HEALTHY: 'saudavel',
} as const

export type HealthConditionValue = (typeof HealthCondition)[keyof typeof HealthCondition]

export const HealthConditionValues = Object.values(HealthCondition) as [string, ...string[]]
