import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, SendIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { z } from 'zod'
import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Form } from '../../components/form-hook'
import { ErrorAlert } from '../../components/form/error-alert'
import { HomeBox, HomeBoxBackground, HomeBoxLogo } from '../../components/home-box'
import { Spinner } from '../../components/spinner'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'
const forgotPasswordSchema = z.object({
  cpf: z.string().min(1, RequiredMessage),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export const ForgotPassword = () => {
  const { modal } = useApp()
  const pushTo = useNavigate()

  const forgotPasswordForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {},
  })

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = forgotPasswordForm

  async function sendRecoverEmail(values: ForgotPasswordData) {
    try {
      const { data } = await api.post('auth.forgotpassword', values)

      modal.alert(`Um e-mail foi enviado para ${data.email}.\nVerifique seu e-mail e siga as instruções.`)
      pushTo('/')
    } catch (err) {
      setError('root', { message: errorMessageHandler(err) })
    }
  }

  return (
    <>
      <Helmet>
        <title>Esqueceu sua senha - APA Control</title>
      </Helmet>
      <HomeBoxBackground>
        <HomeBox>
          <HomeBoxLogo />

          <div className="my-5 text-center">
            <h1 className="font-black text-brand text-xl">Esqueceu sua senha ?</h1>

            <div className="mt-2 font-medium text-gray-500 text-sm dark:text-gray-400">
              <p>
                Insira seu cpf abaixo e nós enviaremos um link para o seu e-mail cadastrado para criar uma nova senha.
              </p>
            </div>
          </div>

          <FormProvider {...forgotPasswordForm}>
            <form onSubmit={handleSubmit(sendRecoverEmail)}>
              <Form.MaskInput
                type="cpf"
                name="cpf"
                className="sm:h-14"
                placeholder="CPF"
                inputMode="numeric"
                mask="000.000.000-00"
                autoComplete="cpf"
              />
              <Form.ErrorMessage field="cpf" />

              <div className="mt-5 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-md font-normal sm:h-12"
                  onClick={() => pushTo(-1)}
                >
                  <ChevronLeftIcon className="mr-2 h-5 w-5" />
                  <span>Voltar</span>
                </Button>

                <Button
                  type="submit"
                  variant="brand"
                  className="w-full rounded-md font-normal sm:h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      <SendIcon className="mr-2 h-5 w-5" />
                      <span>Enviar</span>
                    </>
                  )}
                </Button>
              </div>

              <ErrorAlert className="mt-5" error={errors.root?.message} />
            </form>
          </FormProvider>
        </HomeBox>
      </HomeBoxBackground>
    </>
  )
}
