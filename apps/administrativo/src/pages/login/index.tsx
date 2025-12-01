import { FormProvider, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { LogInIcon } from 'lucide-react'
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
    <HomeBoxBackground>
      <HomeBox>
        <HomeBoxLogo />

        <div className="mt-5 mb-7 text-center">
          <h1 className="font-black text-brand text-xl">APA Control</h1>
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

              <Link
                className="mt-3 block text-right font-medium text-brand text-sm hover:text-brand/90"
                to={'/esqueceu-senha'}
              >
                Esqueceu sua senha ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="brand"
              className="flex h-14 w-full rounded-md font-normal text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner />
              ) : (
                <>
                  <LogInIcon className="mr-2 h-5 w-5" />
                  <span>Entrar</span>
                </>
              )}
            </Button>

          </form>
        </FormProvider>
      </HomeBox>
    </HomeBoxBackground>
  )
}
