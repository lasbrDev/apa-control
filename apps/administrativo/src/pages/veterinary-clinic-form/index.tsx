import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { Building2Icon, CalendarIcon, ChevronLeftIcon, GlobeIcon, PhoneIcon, SaveIcon } from 'lucide-react'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { ErrorAlert } from '../../components/form/error-alert'
import { LoadingCard } from '../../components/loading-card'
import { Spinner } from '../../components/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { isCnpj } from '../../helpers/validation'
import { api } from '../../service'

const veterinaryClinicSchema = z.object({
  id: z.number().nullish(),
  name: z
    .string()
    .min(1, 'O nome é obrigatório.')
    .refine((name) => (name ? name.length >= 8 : true), 'O nome deve ter pelo menos 8 caracteres.'),
  cnpj: z
    .string({ error: RequiredMessage })
    .transform((cnpj) => cnpj.replace(/\D/g, ''))
    .refine((cnpj) => isCnpj(cnpj), 'Informe um número de CNPJ válido.'),
  phone: z
    .string({ error: RequiredMessage })
    .transform((phone) => phone.replace(/\D/g, ''))
    .refine((phone) => [0, 10, 11].includes(phone.length), 'Informe um número de telefone válido.'),
  address: z.string().min(1, RequiredMessage),
  responsible: z.string().min(1, RequiredMessage),
  specialties: z.string().nullable().optional(),
  active: z.coerce.boolean(),
})

type VeterinaryClinicData = z.infer<typeof veterinaryClinicSchema>

export const VeterinaryClinicForm = () => {
  const { modal, token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)

  const veterinaryClinicForm = useForm({
    resolver: zodResolver(veterinaryClinicSchema),
    defaultValues: { active: true },
  })

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = veterinaryClinicForm

  async function addOrUpdateVeterinaryClinic(values: VeterinaryClinicData) {
    try {
      await api[params.id ? 'put' : 'post'](params.id ? 'veterinary-clinic.update' : 'veterinary-clinic.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      pushTo(-1)
    } catch (err) {
      setError('root', { message: errorMessageHandler(err) })
    }
  }

  useEffect(() => {
    setFetching(true)

    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([params.id ? api.get(`veterinary-clinic.key/${params.id}`, config) : Promise.resolve({ data: null })])
      .then(([{ data: keyData }]) => {
        if (keyData) {
          reset(keyData)
        }
      })
      .catch((err) => modal.alert(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [])

  if (fetching) return <LoadingCard />

  return (
    <Card>
      <Tabs defaultValue="general">
        <CardHeader>
          <CardTitle>
            <Building2Icon />
            {params.id ? 'Editar Clínica Veterinária' : 'Nova Clínica Veterinária'}
          </CardTitle>

          <TabsList>
            <TabsTrigger value="general">
              <GlobeIcon className="h-5 w-5 shrink-0" />
              Geral
            </TabsTrigger>

            <TabsTrigger value="schedule">
              <CalendarIcon className="h-5 w-5 shrink-0" />
              Agenda
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <FormProvider {...veterinaryClinicForm}>
          <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateVeterinaryClinic)}>
            <CardContent>
              <TabsContent value="general">
                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                  <div>
                    <Form.Label htmlFor="name">Nome</Form.Label>
                    <Form.Input name="name" />
                    <Form.ErrorMessage field="name" />
                  </div>

                  <div>
                    <Form.Label htmlFor="cnpj">CNPJ</Form.Label>
                    <Form.MaskInput name="cnpj" mask="00.000.000/0000-00" />
                    <Form.ErrorMessage field="cnpj" />
                  </div>
                </div>

                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                  <div>
                    <Form.Label htmlFor="phone">Telefone</Form.Label>
                    <Form.IconContainer>
                      <Form.MaskInput name="phone" mask="(00) 00000-0000" className="pl-9" />
                      <Form.Icon icon={PhoneIcon} />
                    </Form.IconContainer>
                    <Form.ErrorMessage field="phone" />
                  </div>

                  <div>
                    <Form.Label htmlFor="responsible">Responsável</Form.Label>
                    <Form.Input name="responsible" />
                    <Form.ErrorMessage field="responsible" />
                  </div>
                </div>

                <div className="mb-6">
                  <Form.Label htmlFor="address">Endereço</Form.Label>
                  <Form.TextArea name="address" rows={3} />
                  <Form.ErrorMessage field="address" />
                </div>

                <div className="mb-6">
                  <Form.Label htmlFor="specialties">Especialidades</Form.Label>
                  <Form.TextArea name="specialties" rows={3} />
                  <Form.ErrorMessage field="specialties" />
                </div>

                <div className="mb-6 flex items-center space-x-2">
                  <Form.Switch name="active" />
                  <Form.Label htmlFor="active" className="mb-0 leading-normal">
                    Ativo?
                  </Form.Label>
                </div>
              </TabsContent>

              <ErrorAlert className="mt-5" error={errors.root?.message} />
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
      </Tabs>
    </Card>
  )
}
