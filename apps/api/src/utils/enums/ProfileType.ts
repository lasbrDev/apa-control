export const ProfileType = {
  ADMINISTRATOR: 'administrador',
  ATTENDANT: 'atendente',
} as const

export type ProfileTypeValue = (typeof ProfileType)[keyof typeof ProfileType]

export const ProfileTypeValues = Object.values(ProfileType) as [string, ...string[]]
