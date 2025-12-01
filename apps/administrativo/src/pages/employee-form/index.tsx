import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { ChevronLeftIcon, EyeIcon, EyeOffIcon, MailIcon, PhoneIcon, SaveIcon, UserIcon, Users2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Spinner } from '../../components/spinner'
import { errorMessageHandler } from '../../helpers/axios'
import { BrazilStates, RequiredMessage } from '../../helpers/constants'
import { slugify } from '../../helpers/string'
import { isCpf } from '../../helpers/validation'
import { api } from '../../service'

const employeeSchema = z
  .object({
    id: z.number().nullish(),
    name: z
      .string()
      .min(1, 'O nome é obrigatório.')
      .refine((name) => (name ? name.length >= 8 : true), 'O nome deve ter pelo menos 8 caracteres.'),
    cpf: z
      .string({ error: RequiredMessage })
      .transform((cpf) => cpf.replace(/\D/g, ''))
      .refine((cpf) => isCpf(cpf), 'Informe um número de CPF válido.'),
    profileId: z.number({ error: RequiredMessage }),
    email: z.string().trim().email('Digite um endereço de e-mail válido.').nullish().or(z.literal('')),
    phone1: z
      .string()
      .transform((phone) => phone.replace(/\D/g, ''))
      .refine((phone) => [0, 10, 11].includes(phone.length), 'Informe um número de telefone válido.')
      .nullish(),
    phone2: z
      .string()
      .transform((phone) => phone.replace(/\D/g, ''))
      .refine((phone) => [0, 10, 11].includes(phone.length), 'Informe um número de telefone válido.')
      .nullish(),
    login: z
      .string({ error: RequiredMessage })
      .min(6, 'O login deve ter pelo menos 6 caracteres.')
      .refine(
        (login) => login.toLowerCase() === slugify(login),
        'O login não deve conter espaços, acentos e caracteres especiais.',
      )
      .transform(slugify),
    password: z.string().trim().or(z.literal('')),
    passwordCheck: z.string(),
    postalCode: z.string().nullish(),
    streetName: z.string().nullish(),
    streetNumber: z.string().nullish(),
    complement: z.string().nullish(),
    district: z.string().nullish(),
    city: z.string().nullish(),
    state: z.string().nullish(),
  })
  .refine((values) => (values.password && !values.id) || values.id, { message: RequiredMessage, path: ['password'] })
  .refine((values) => (values.passwordCheck && !values.id) || values.id, {
    message: RequiredMessage,
    path: ['passwordCheck'],
  })
  .refine((data) => data.password === data.passwordCheck, { message: 'Senhas não coincidem.', path: ['passwordCheck'] })

type EmployeeData = z.infer<typeof employeeSchema>

export const EmployeeForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profiles, setProfiles] = useState<Array<{ id: number; description: string }>>([])

  const employeeForm = useForm({
    resolver: zodResolver(employeeSchema),
  })

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = employeeForm

  async function addOrUpdateEmployee(values: EmployeeData) {
    try {
      await api[params.id ? 'put' : 'post'](params.id ? 'employee.update' : 'employee.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Funcionário ${values.name} ${params.id ? 'atualizado' : 'criado'} com sucesso!`)
      pushTo(-1)
    } catch (err) {
      toast.error(errorMessageHandler(err))
    }
  }

  useEffect(() => {
    setFetching(true)

    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([
      params.id ? api.get(`employee.key/${params.id}`, config) : Promise.resolve({ data: null }),
      api.get('profile.list', config),
    ])
      .then(([{ data: keyData }, { data: profileData }]) => {
        setProfiles(profileData)

        if (keyData) {
          reset(keyData)
        }
      })
      .catch((err) => toast.error(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [])

  const profileOptions = useMemo(
    () => profiles.map(({ id, description }) => ({ label: description, value: id })),
    [profiles],
  )

  function handleShowPassword() {
    setShowPassword((prev) => !prev)
  }

  function generateNewPassword() {
    let password = ''

    for (let i = 0; i < 6; i++) {
      password += String(Math.floor(Math.random() * 10))
    }

    setValue('password', password, { shouldValidate: true })
    setValue('passwordCheck', password, { shouldValidate: true })
  }

  const passwordType = showPassword ? 'text' : 'password'
  const PasswordIcon = showPassword ? EyeIcon : EyeOffIcon

  if (fetching) return <LoadingCard />

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Users2Icon />
          {params.id ? 'Editar Funcionário' : 'Novo Funcionário'}
        </CardTitle>
      </CardHeader>

      <FormProvider {...employeeForm}>
        <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateEmployee)}>
          <CardContent>
            <h4 className="mb-6 font-semibold leading-none tracking-tight dark:text-gray-200">Dados</h4>

            <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
              <div>
                <Form.Label htmlFor="name">Nome</Form.Label>
                <Form.IconContainer>
                  <Form.Input name="name" className="pl-9" />
                  <Form.Icon icon={UserIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="name" />
              </div>

              <div>
                <Form.Label htmlFor="cpf">CPF</Form.Label>
                <Form.MaskInput name="cpf" mask="000.000.000-00" />
                <Form.ErrorMessage field="cpf" />
              </div>

              <div>
                <Form.Label htmlFor="email">Email</Form.Label>
                <Form.IconContainer>
                  <Form.Input name="email" type="email" className="pl-9" />
                  <Form.Icon icon={MailIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="email" />
              </div>

              <div>
                <Form.Label htmlFor="profileId">Perfil de Acesso</Form.Label>
                <Form.Select type="number" name="profileId" options={profileOptions} />
                <Form.ErrorMessage field="profileId" />
              </div>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
              <div>
                <Form.Label htmlFor="login">Login</Form.Label>
                <Form.Input name="login" />
                <Form.ErrorMessage field="login" />
              </div>

              <div>
                <Form.Label htmlFor="password">Senha</Form.Label>

                <div className="flex items-stretch">
                  <Form.Input
                    name="password"
                    autoComplete="new-password"
                    type={passwordType}
                    className="-mr-px rounded-r-none"
                  />

                  <Button type="button" className="h-auto shrink-0 rounded-l-none" onClick={generateNewPassword}>
                    Gerar Senha
                  </Button>
                </div>

                <Form.ErrorMessage field="password" />
              </div>

              <div>
                <Form.Label htmlFor="passwordCheck">Confirme a Senha</Form.Label>

                <div className="flex items-stretch">
                  <Form.Input
                    name="passwordCheck"
                    autoComplete="new-password"
                    type={passwordType}
                    className="-mr-px rounded-r-none"
                  />

                  <Button
                    type="button"
                    className="h-auto shrink-0 rounded-l-none lg:w-12"
                    variant="outline"
                    size="icon"
                    onClick={handleShowPassword}
                  >
                    <PasswordIcon className="h-5 w-5" />
                  </Button>
                </div>

                <Form.ErrorMessage field="passwordCheck" />
              </div>

              <div>
                <Form.Label htmlFor="phone1">Telefone 1</Form.Label>
                <Form.IconContainer>
                  <Form.MaskInput name="phone1" mask="(00) 00000-0000" className="pl-9" />
                  <Form.Icon icon={PhoneIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="phone1" />
              </div>

              <div>
                <Form.Label htmlFor="phone2">Telefone 2</Form.Label>
                <Form.IconContainer>
                  <Form.MaskInput name="phone2" mask="(00) 00000-0000" className="pl-9" />
                  <Form.Icon icon={PhoneIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="phone2" />
              </div>
            </div>

            <Separator className="my-7" />
            <div className="mb-6 font-semibold leading-none tracking-tight dark:text-gray-200">Endereço</div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
              <div>
                <Form.Label htmlFor="postalCode">CEP</Form.Label>
                <Form.MaskInput name="postalCode" inputMode="numeric" mask="00000-000" />
                <Form.ErrorMessage field="postalCode" />
              </div>

              <div>
                <Form.Label htmlFor="streetName">Endereço</Form.Label>
                <Form.Input name="streetName" maxLength={50} />
                <Form.ErrorMessage field="streetName" />
              </div>

              <div>
                <Form.Label htmlFor="streetNumber">Número</Form.Label>
                <Form.Input name="streetNumber" maxLength={20} />
                <Form.ErrorMessage field="streetNumber" />
              </div>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
              <div>
                <Form.Label htmlFor="complement">Complemento</Form.Label>
                <Form.Input name="complement" maxLength={50} />
                <Form.ErrorMessage field="complement" />
              </div>

              <div>
                <Form.Label htmlFor="district">Bairro</Form.Label>
                <Form.Input name="district" maxLength={80} />
                <Form.ErrorMessage field="district" />
              </div>

              <div>
                <Form.Label htmlFor="city">Cidade</Form.Label>
                <Form.Input name="city" />
                <Form.ErrorMessage field="city" />
              </div>

              <div>
                <Form.Label>Estado</Form.Label>
                <Form.Select name="state" options={stateOptions} />
                <Form.ErrorMessage field="state" />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => pushTo(-1)}>
              <ChevronLeftIcon className="mr-2 h-5 w-5" />
              <span>Voltar</span>
            </Button>

            <Button type="submit" variant="success" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner />
              ) : (
                <>
                  <SaveIcon className="mr-2 h-5 w-5" />
                  <span>Salvar</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  )
}

const stateOptions = Object.entries(BrazilStates).map(([value, label]) => ({ value, label }))
