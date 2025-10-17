import { addHours, isAfter } from 'date-fns'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { z } from 'zod'

import { Modal, type ModalActions, type ModalState } from './components/modal'
import { appConfig } from './config'
import { RequiredMessage } from './helpers/constants'
import { useInterval } from './hooks/interval'
import { useLocalStorage } from './hooks/local-storage'
import { api } from './service'

export const loginSchema = z.object({
  username: z.string().min(1, RequiredMessage),
  password: z.string().min(1, RequiredMessage),
})

export type LoginData = z.infer<typeof loginSchema>

interface Operator {
  name: string
  roles: string[]
}

interface AppContext {
  operator: Operator
  token: string
  signIn: (values: LoginData) => Promise<Operator>
  signOut: () => void
  modal: ModalActions
}

const initialOperator = {} as Operator
const AppContext = createContext<AppContext>({
  token: '',
  signIn: () => Promise.resolve(initialOperator),
  signOut: () => undefined,
  modal: { alert: () => undefined, confirm: () => undefined, prompt: () => undefined },
  operator: initialOperator,
})

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [operator, setOperator] = useLocalStorage<Operator>(appConfig.OPERATOR_KEY, initialOperator)
  const [token, setToken] = useLocalStorage(appConfig.TOKEN_KEY, '')
  const [tokenExpires, setTokenExpires] = useLocalStorage<Date | null>(`${appConfig.TOKEN_KEY}_expiresAt`, null)

  const [modal, setModal] = useState<ModalState>({
    type: 'alert',
    inputType: 'text',
    title: '',
    confirmText: '',
    message: '',
    value: '',
    show: false,
  })

  const modalActions = useMemo(
    (): ModalActions => ({
      alert: (message, callback) => setModal((prev) => ({ ...prev, type: 'alert', message, callback, show: true })),

      confirm: ({ message, callback, title, confirmText }) =>
        setModal((prev) => ({ ...prev, type: 'confirm', message, title, callback, confirmText, show: true })),

      prompt: ({ title, message, callback, inputType = 'text' }) =>
        setModal((prev) => ({ ...prev, type: 'prompt', inputType, message, callback, title, show: true })),
    }),
    [],
  )

  const signIn = useCallback(async (values: LoginData) => {
    // TODO: Implementar sua lógica de login aqui
    const { data } = await api.post('auth/login', values)
    const { permissions, ...user } = data.user

    setTokenExpires(addHours(new Date(), 20))
    setOperator({ ...user, roles: permissions })
    setToken(data.accessToken)

    return user
  }, [])

  const signOut = useCallback(() => {
    setTokenExpires(null)
    setToken('')
    setOperator(initialOperator)
  }, [])

  useInterval(
    () => {
      const isTokenExpired = (tokenExpires && !isAfter(new Date(tokenExpires), new Date())) || !tokenExpires

      if (isTokenExpired) {
        signOut()
      }
    },
    tokenExpires ? 1e3 : null,
  )

  return (
    <AppContext.Provider
      value={{
        operator,
        signIn,
        signOut,
        token,
        modal: modalActions,
      }}
    >
      {children}

      <Modal
        type={modal.type}
        message={modal.message}
        title={modal.title}
        value={modal.value}
        show={modal.show}
        confirmText={modal.confirmText}
        inputType={modal.inputType}
        setModal={setModal}
      />
    </AppContext.Provider>
  )
}
