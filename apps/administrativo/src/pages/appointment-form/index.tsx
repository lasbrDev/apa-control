import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarHeartIcon, ChevronLeftIcon, ChevronRightIcon, SaveIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Spinner } from '../../components/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { toQueryString } from '../../helpers/qs'
import { api } from '../../service'

interface SelectOption {
  value: number
  label: string
}
interface AnimalOption {
  id: number
  name: string
}
const speciesOptions = [
  { value: 'canina', label: 'Cachorro' },
  { value: 'felina', label: 'Gato' },
  { value: 'outros', label: 'Outros' },
]
const sizeOptions = [
  { value: 'pequeno', label: 'Pequeno' },
  { value: 'medio', label: 'Médio' },
  { value: 'grande', label: 'Grande' },
]
const sexOptions = [
  { value: 'macho', label: 'Macho' },
  { value: 'femea', label: 'Fêmea' },
]
const healthConditionOptions = [
  { value: 'saudavel', label: 'Saudável' },
  { value: 'estavel', label: 'Estável' },
  { value: 'critica', label: 'Crítica' },
]
const schema = z.object({
  id: z.number().nullish(),
  animalId: z.number({ message: RequiredMessage }).int().positive(),
  appointmentTypeId: z.number({ message: RequiredMessage }).int().positive(),
  clinicId: z.number().nullish(),
  appointmentDate: z.string({ message: RequiredMessage }).min(1, RequiredMessage),
  consultationType: z.enum(['clinica', 'domiciliar', 'emergencia']),
  status: z.enum(['agendado', 'realizado', 'cancelado']),
  observations: z.string().nullish(),
  animalNamePreview: z.string().nullish(),
  speciesPreview: z.string().nullish(),
  breedPreview: z.string().nullish(),
  sizePreview: z.string().nullish(),
  sexPreview: z.string().nullish(),
  agePreview: z.string().nullish(),
  healthConditionPreview: z.string().nullish(),
  entryDatePreview: z.string().nullish(),
  animalObservationsPreview: z.string().nullish(),
})
type Data = z.infer<typeof schema>

const consultationTypeOptions = [
  { value: 'clinica', label: 'Clínica' },
  { value: 'domiciliar', label: 'Domiciliar' },
  { value: 'emergencia', label: 'Emergência' },
]
const statusOptions = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const AppointmentForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const isEdit = Boolean(params.id)
  const [fetching, setFetching] = useState(false)
  const [activeTab, setActiveTab] = useState<'animal' | 'consulta'>('animal')
  const [appointmentTypeOptions, setAppointmentTypeOptions] = useState<SelectOption[]>([])
  const [clinicOptions, setClinicOptions] = useState<SelectOption[]>([])

  const searchAnimalOptions = useCallback(
    async (query: string): Promise<{ value: string; label: string }[]> => {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const qs = toQueryString({ name: query.trim(), perPage: 50, fields: 'id,name', sort: 'name', status: 'ativo' })
      const { data } = await api.get<AnimalOption[]>(`animal.list?${qs}`, config)
      const list = Array.isArray(data) ? data : []
      return list.map((a) => ({ value: String(a.id), label: a.name }))
    },
    [token],
  )

  const form = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'agendado', consultationType: 'clinica', observations: '', clinicId: null },
  })
  const {
    handleSubmit,
    reset,
    setValue,
    setFocus,
    formState: { isSubmitting },
  } = form
  const animalId = form.watch('animalId')
  const animalNamePreview = form.watch('animalNamePreview')

  async function submit(values: Data) {
    try {
      const payload = {
        id: values.id,
        animalId: values.animalId,
        appointmentTypeId: values.appointmentTypeId,
        clinicId: values.clinicId,
        appointmentDate: values.appointmentDate,
        consultationType: values.consultationType,
        status: values.status,
        observations: values.observations,
      }
      await api[params.id ? 'put' : 'post'](params.id ? 'appointment.update' : 'appointment.add', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success(`Consulta ${params.id ? 'atualizada' : 'registrada'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }
    Promise.all([
      api.get(`appointment-type.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, config),
      api.get(`veterinary-clinic.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, config),
      params.id ? api.get(`appointment.key/${params.id}`, config) : Promise.resolve({ data: null }),
    ])
      .then(([typesRes, clinicsRes, keyResponse]) => {
        setAppointmentTypeOptions(
          (Array.isArray(typesRes.data) ? typesRes.data : [])
            .filter((i: { active: boolean }) => i.active)
            .map((i: { id: number; name: string }) => ({ value: i.id, label: i.name })),
        )
        setClinicOptions(
          (Array.isArray(clinicsRes.data) ? clinicsRes.data : [])
            .filter((i: { active: boolean }) => i.active)
            .map((i: { id: number; name: string }) => ({ value: i.id, label: i.name })),
        )

        if (keyResponse.data) {
          const key = keyResponse.data
          const date = new Date(key.appointmentDate)
          const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
          reset({
            id: key.id,
            animalId: key.animalId,
            appointmentTypeId: key.appointmentTypeId,
            clinicId: key.clinicId ?? null,
            appointmentDate: local,
            consultationType: key.consultationType,
            status: key.status,
            observations: key.observations ?? '',
            animalNamePreview: key.animalName ?? '',
          })
        }
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => {
    if (!animalId || Number(animalId) <= 0) {
      setValue('animalNamePreview', '')
      setValue('speciesPreview', '')
      setValue('breedPreview', '')
      setValue('sizePreview', '')
      setValue('sexPreview', '')
      setValue('agePreview', '')
      setValue('healthConditionPreview', '')
      setValue('entryDatePreview', '')

      setValue('animalObservationsPreview', '')
      return
    }
    api
      .get(`animal.key/${animalId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setValue('animalNamePreview', data.name ?? '')
        setValue('speciesPreview', data.species ?? '')
        setValue('breedPreview', data.breed ?? '')
        setValue('sizePreview', data.size ?? '')
        setValue('sexPreview', data.sex ?? '')
        setValue('agePreview', data.birthYear ? `${new Date().getFullYear() - data.birthYear} anos` : '')
        setValue('healthConditionPreview', data.healthCondition ?? '')
        setValue('entryDatePreview', data.entryDate?.split('T')[0] ?? '')

        setValue('animalObservationsPreview', data.observations ?? '')
      })
      .catch(() => {
        setValue('animalNamePreview', '')
        setValue('speciesPreview', '')
        setValue('breedPreview', '')
        setValue('sizePreview', '')
        setValue('sexPreview', '')
        setValue('agePreview', '')
        setValue('healthConditionPreview', '')
        setValue('entryDatePreview', '')

        setValue('animalObservationsPreview', '')
      })
  }, [animalId, token, setValue])

  const animalTabFields: Array<keyof Data> = ['animalId']
  const consultaTabFields: Array<keyof Data> = [
    'appointmentTypeId',
    'appointmentDate',
    'consultationType',
    'status',
    'observations',
  ]

  const onSubmitError: Parameters<typeof handleSubmit>[1] = (errors) => {
    if (!errors) return
    if (animalTabFields.find((f) => Boolean(errors[f]))) {
      setActiveTab('animal')
      setTimeout(() => setFocus(animalTabFields.find((f) => Boolean(errors[f]))!), 0)
      return
    }
    if (consultaTabFields.find((f) => Boolean(errors[f]))) {
      setActiveTab('consulta')
      setTimeout(() => setFocus(consultaTabFields.find((f) => Boolean(errors[f]))!), 0)
    }
  }

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Consulta - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <CalendarHeartIcon />
            {params.id ? 'Editar consulta' : 'Nova consulta'}
          </CardTitle>
        </CardHeader>
        <FormProvider {...form}>
          <form autoComplete="off" onSubmit={handleSubmit(submit, onSubmitError)}>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'animal' | 'consulta')}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="animal">Dados do Animal</TabsTrigger>
                  <TabsTrigger value="consulta">Dados da Consulta</TabsTrigger>
                </TabsList>

                <TabsContent value="animal">
                  <div className="mb-6">
                    <Form.Label htmlFor="animalId">Animal</Form.Label>
                    <Form.SearchableSelect
                      name="animalId"
                      type="number"
                      searchOptions={searchAnimalOptions}
                      minChars={3}
                      debounceMs={300}
                      displayLabel={animalNamePreview || undefined}
                    />
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="animalNamePreview">Nome</Form.Label>
                      <Form.Input name="animalNamePreview" disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="speciesPreview">Espécie</Form.Label>
                      <Form.Select name="speciesPreview" options={speciesOptions} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="breedPreview">Raça</Form.Label>
                      <Form.Input name="breedPreview" disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="sizePreview">Porte</Form.Label>
                      <Form.Select name="sizePreview" options={sizeOptions} disabled />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="sexPreview">Sexo</Form.Label>
                      <Form.Select name="sexPreview" options={sexOptions} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="agePreview">Idade Aprox.</Form.Label>
                      <Form.Input name="agePreview" disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="healthConditionPreview">Condição de saúde</Form.Label>
                      <Form.Select name="healthConditionPreview" options={healthConditionOptions} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="entryDatePreview">Data de entrada</Form.Label>
                      <Form.Input name="entryDatePreview" type="date" disabled />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="animalObservationsPreview">Observações (animal)</Form.Label>
                    <Form.TextArea name="animalObservationsPreview" rows={2} disabled />
                  </div>
                </TabsContent>

                <TabsContent value="consulta">
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="appointmentTypeId">Tipo de consulta</Form.Label>
                      <Form.Select name="appointmentTypeId" type="number" options={appointmentTypeOptions} />
                      <Form.ErrorMessage field="appointmentTypeId" />
                    </div>
                    <div>
                      <Form.Label htmlFor="appointmentDate">Data/hora</Form.Label>
                      <Form.DateTimeInput name="appointmentDate" />
                      <Form.ErrorMessage field="appointmentDate" />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="clinicId">Clínica</Form.Label>
                      <Form.Select
                        name="clinicId"
                        type="number"
                        isClearable
                        placeholder="Nenhuma"
                        options={clinicOptions}
                      />
                      <Form.ErrorMessage field="clinicId" />
                    </div>
                    <div>
                      <Form.Label htmlFor="consultationType">Modalidade</Form.Label>
                      <Form.Select name="consultationType" options={consultationTypeOptions} />
                      <Form.ErrorMessage field="consultationType" />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="status">Status</Form.Label>
                      <Form.Select name="status" options={statusOptions} />
                      <Form.ErrorMessage field="status" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="observations">Observações</Form.Label>
                    <Form.TextArea name="observations" rows={4} />
                    <Form.ErrorMessage field="observations" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => (!isEdit && activeTab !== 'animal' ? setActiveTab('animal') : pushTo(-1))}
              >
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                <span>Voltar</span>
              </Button>
              {!isEdit && activeTab === 'animal' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab('consulta')
                  }}
                >
                  <ChevronRightIcon className="mr-2 h-5 w-5" />
                  <span>Continuar</span>
                </Button>
              ) : (
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
              )}
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </>
  )
}
