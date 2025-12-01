import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { ChevronLeftIcon, DollarSignIcon, HeartIcon, MailIcon, PhoneIcon, SaveIcon } from 'lucide-react'
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
import { RequiredMessage } from '../../helpers/constants'
import { isCpf } from '../../helpers/validation'
import { api } from '../../service'

const adopterSchema = z.object({
  id: z.number().nullish(),
  name: z
    .string()
    .min(1, 'O nome é obrigatório.')
    .refine((name) => (name ? name.length >= 8 : true), 'O nome deve ter pelo menos 8 caracteres.'),
  cpf: z
    .string({ error: RequiredMessage })
    .transform((cpf) => cpf.replace(/\D/g, ''))
    .refine((cpf) => isCpf(cpf), 'Informe um número de CPF válido.'),
  email: z.string({ error: RequiredMessage }).trim().email('Digite um endereço de e-mail válido.'),
  phone: z
    .string({ error: RequiredMessage })
    .transform((phone) => phone.replace(/\D/g, ''))
    .refine((phone) => [0, 10, 11].includes(phone.length), 'Informe um número de telefone válido.'),
  address: z.string().min(1, RequiredMessage),
  familyIncome: z.number().min(1, 'A renda familiar não pode ser zero.'),
  animalExperience: z.coerce.boolean(),
})

type AdopterData = z.infer<typeof adopterSchema>

export const AdopterForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)

  const adopterForm = useForm({
    resolver: zodResolver(adopterSchema),
    defaultValues: { familyIncome: 0, animalExperience: false },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = adopterForm

  async function addOrUpdateAdopter(values: AdopterData) {
    try {
      await api[params.id ? 'put' : 'post'](params.id ? 'adopter.update' : 'adopter.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Adotante ${values.name} ${params.id ? 'atualizado' : 'criado'} com sucesso!`)
      pushTo(-1)
    } catch (err) {
      toast.error(errorMessageHandler(err))
    }
  }

  useEffect(() => {
    setFetching(true)

    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([params.id ? api.get(`adopter.key/${params.id}`, config) : Promise.resolve({ data: null })])
      .then(([{ data: keyData }]) => {
        if (keyData) {
          reset(keyData)
        }
      })
      .catch((err) => toast.error(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [])

  if (fetching) return <LoadingCard />

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <HeartIcon />
          {params.id ? 'Editar Adotante' : 'Novo Adotante'}
        </CardTitle>
      </CardHeader>

      <FormProvider {...adopterForm}>
        <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateAdopter)}>
          <CardContent>
            <h4 className="mb-6 font-semibold leading-none tracking-tight">Dados Pessoais</h4>

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div>
                <Form.Label htmlFor="name">Nome</Form.Label>
                <Form.Input name="name" />
                <Form.ErrorMessage field="name" />
              </div>

              <div>
                <Form.Label htmlFor="cpf">CPF</Form.Label>
                <Form.MaskInput name="cpf" mask="000.000.000-00" />
                <Form.ErrorMessage field="cpf" />
              </div>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div>
                <Form.Label htmlFor="email">Email</Form.Label>
                <Form.IconContainer>
                  <Form.Input name="email" type="email" className="pl-9" />
                  <Form.Icon icon={MailIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="email" />
              </div>

              <div>
                <Form.Label htmlFor="phone">Telefone</Form.Label>
                <Form.IconContainer>
                  <Form.MaskInput name="phone" mask="(00) 00000-0000" className="pl-9" />
                  <Form.Icon icon={PhoneIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="phone" />
              </div>
            </div>

            <Separator className="my-7" />
            <div className="mb-6 font-semibold leading-none tracking-tight">Endereço</div>

            <div className="mb-6">
              <Form.Label htmlFor="address">Endereço Completo</Form.Label>
              <Form.TextArea name="address" rows={3} />
              <Form.ErrorMessage field="address" />
            </div>

            <Separator className="my-7" />
            <div className="mb-6 font-semibold leading-none tracking-tight">Informações para Adoção</div>

            <div className="mb-6">
              <Form.Label htmlFor="familyIncome">Renda Familiar</Form.Label>

              <Form.IconContainer>
                <Form.DecimalInput name="familyIncome" className="pl-9" />
                <Form.Icon icon={DollarSignIcon} />
              </Form.IconContainer>

              <Form.ErrorMessage field="familyIncome" />
            </div>

            <div className="mb-6 flex items-center space-x-2">
              <Form.Switch name="animalExperience" />
              <Form.Label htmlFor="animalExperience" className="mb-0 leading-normal">
                Tem experiência com animais?
              </Form.Label>
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
