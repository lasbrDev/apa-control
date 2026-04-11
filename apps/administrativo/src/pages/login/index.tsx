import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { LogInIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'

import { type LoginData, loginSchema, useApp } from '../../App'
import { Button } from '../../components/button'
import { Form } from '../../components/form-hook'
import { HomeBox, HomeBoxBackground, HomeBoxLogo } from '../../components/home-box'
import { Spinner } from '../../components/spinner'
import { errorMessageHandler } from '../../helpers/axios'

export const Login = () => {
  const { signIn } = useApp()
  const pushTo = useNavigate()

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: '', password: '' },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = loginForm

  async function logIn(values: LoginData) {
    try {
      await signIn(values)

      pushTo('/')
    } catch (err) {
      toast.error(errorMessageHandler(err))
    }
  }

  return (
    <>
      <Helmet>
        <title>Login - APA Control</title>
      </Helmet>
      <HomeBoxBackground>
        <HomeBox>
          <HomeBoxLogo />

          <div className="mt-5 mb-8 text-center">
            <h1 className="mb-2 bg-linear-to-r from-brand via-pink-600 to-purple-600 bg-clip-text font-black text-3xl text-transparent">
              APA Control
            </h1>
            <p className="text-base text-muted-foreground dark:text-gray-400">
              Sistema de gestão para adoção de animais
            </p>
          </div>

          <FormProvider {...loginForm}>
            <form onSubmit={handleSubmit(logIn)}>
              <Form.Field>
                <Form.Input name="login" className="sm:h-14" placeholder="Usuário" autoComplete="login" />
                <Form.ErrorMessage field="login" />
              </Form.Field>

              <div className="mb-7">
                <Form.Input
                  className="sm:h-14"
                  name="password"
                  type="password"
                  placeholder="Senha"
                  autoComplete="current-password"
                />
                <Form.ErrorMessage field="password" />
              </div>

              <Button
                type="submit"
                variant="brand"
                className="group relative h-14 w-full overflow-hidden rounded-xl bg-linear-to-r from-brand to-pink-600 font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
                disabled={isSubmitting}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      <LogInIcon className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      <span>Entrar</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </form>
          </FormProvider>
        </HomeBox>
      </HomeBoxBackground>
    </>
  )
}
