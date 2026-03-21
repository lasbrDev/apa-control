import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, ChevronRightIcon, SaveIcon, SearchIcon, SyringeIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { AppointmentSearchModal } from '../../components/appointment-search-modal'
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
interface AnimalPreview {
  name: string
  species: string
  breed: string
  size: string
  sex: string
  age: string
  healthCondition: string
  entryDate: string
  observations: string
  status: string
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
const animalStatusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_tratamento', label: 'Em Tratamento' },
  { value: 'adotado', label: 'Adotado' },
]
const statusOptions = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const schema = z.object({
  id: z.number().nullish(),
  animalId: z.number({ message: RequiredMessage }).int().positive(),
  procedureTypeId: z.number({ message: RequiredMessage }).int().positive(),
  appointmentId: z.number().nullish(),
  procedureDate: z.string().min(1, RequiredMessage),
  description: z.string().min(1, RequiredMessage),
  actualCost: z.number({ message: RequiredMessage }).nonnegative(RequiredMessage),
  observations: z.string().optional().nullable(),
  status: z.enum(['agendado', 'realizado', 'cancelado']),
})
type Data = z.infer<typeof schema>

export const ClinicalProcedureForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const isEdit = Boolean(params.id)
  const [fetching, setFetching] = useState(false)
  const [activeTab, setActiveTab] = useState<'animal' | 'procedimento'>('animal')
  const [animalDisplayLabel, setAnimalDisplayLabel] = useState('')
  const [appointmentDisplayLabel, setAppointmentDisplayLabel] = useState('')
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false)
  const [animalPreview, setAnimalPreview] = useState<AnimalPreview | null>(null)
  const searchAnimalOptions = useCallback(
    async (query: string): Promise<{ value: string; label: string }[]> => {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const qs = toQueryString({ name: query.trim(), perPage: 50, fields: 'id,name', sort: 'name' })
      const { data } = await api.get<AnimalOption[]>(`animal.list?${qs}`, config)
      const list = Array.isArray(data) ? data : []
      return list.map((a) => ({ value: String(a.id), label: a.name }))
    },
    [token],
  )

  const [procedureTypeOptions, setProcedureTypeOptions] = useState<SelectOption[]>([])
  const form = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'agendado', appointmentId: null, observations: '' },
  })
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form
  const animalId = form.watch('animalId')
  const appointmentId = watch('appointmentId')

  async function submit(values: Data) {
    try {
      await api[params.id ? 'put' : 'post'](
        params.id ? 'clinical-procedure.update' : 'clinical-procedure.add',
        values,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success(`Procedimento ${params.id ? 'atualizado' : 'registrado'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }
    Promise.all([
      api.get(`procedure-type.list?${toQueryString({ page: 0, fields: 'id,name,active', sort: 'name' })}`, config),
      params.id ? api.get(`clinical-procedure.key/${params.id}`, config) : Promise.resolve({ data: null }),
    ])
      .then(async ([typesRes, keyResponse]) => {
        setProcedureTypeOptions(
          (Array.isArray(typesRes.data) ? typesRes.data : [])
            .filter((i: { active: boolean }) => i.active)
            .map((i: { id: number; name: string }) => ({ value: i.id, label: i.name })),
        )

        if (keyResponse.data) {
          const key = keyResponse.data
          setAnimalDisplayLabel(key.animalName ?? '')
          const date = new Date(key.procedureDate)
          const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
          reset({
            id: key.id,
            animalId: key.animalId,
            procedureTypeId: key.procedureTypeId,
            appointmentId: key.appointmentId ?? null,
            procedureDate: local,
            description: key.description,
            actualCost: Number(key.actualCost),
            observations: key.observations ?? '',
            status: key.status,
          })
          if (key.appointmentId) {
            try {
              const { data: appointment } = await api.get(`appointment.key/${key.appointmentId}`, config)
              setAppointmentDisplayLabel(
                `#${appointment.id} - ${appointment.animalName ?? 'Animal'} (${new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')})`,
              )
            } catch {
              setAppointmentDisplayLabel(`#${key.appointmentId}`)
            }
          }
        }
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => {
    if (!animalId || Number(animalId) <= 0) {
      setAnimalPreview(null)
      return
    }
    api
      .get(`animal.key/${animalId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) =>
        setAnimalPreview({
          name: data.name ?? '',
          species: data.species ?? '',
          breed: data.breed ?? '',
          size: data.size ?? '',
          sex: data.sex ?? '',
          age: String(data.age ?? ''),
          healthCondition: data.healthCondition ?? '',
          entryDate: data.entryDate?.split('T')[0] ?? '',
          observations: data.observations ?? '',
          status: data.status ?? '',
        }),
      )
      .catch(() => setAnimalPreview(null))
  }, [animalId, token])

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Procedimento Clínico - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <SyringeIcon />
            {params.id ? 'Editar procedimento clínico' : 'Novo procedimento clínico'}
          </CardTitle>
        </CardHeader>
        <FormProvider {...form}>
          <form autoComplete="off" onSubmit={handleSubmit(submit)}>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'animal' | 'procedimento')}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="animal">Dados do Animal</TabsTrigger>
                  <TabsTrigger value="procedimento">Dados do Procedimento</TabsTrigger>
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
                      displayLabel={animalDisplayLabel || undefined}
                    />
                    <Form.ErrorMessage field="animalId" />
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="animalNamePreview">Nome</Form.Label>
                      <Form.Input name="animalNamePreview" value={animalPreview?.name ?? ''} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="speciesPreview">Espécie</Form.Label>
                      <Form.Select
                        name="speciesPreview"
                        options={speciesOptions}
                        disabled
                        value={animalPreview?.species ?? ''}
                      />
                    </div>
                    <div>
                      <Form.Label htmlFor="breedPreview">Raça</Form.Label>
                      <Form.Input name="breedPreview" value={animalPreview?.breed ?? ''} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="sizePreview">Porte</Form.Label>
                      <Form.Select
                        name="sizePreview"
                        options={sizeOptions}
                        disabled
                        value={animalPreview?.size ?? ''}
                      />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="sexPreview">Sexo</Form.Label>
                      <Form.Select name="sexPreview" options={sexOptions} disabled value={animalPreview?.sex ?? ''} />
                    </div>
                    <div>
                      <Form.Label htmlFor="agePreview">Idade (anos)</Form.Label>
                      <Form.Input name="agePreview" value={animalPreview?.age ?? ''} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="healthConditionPreview">Condição de saúde</Form.Label>
                      <Form.Select
                        name="healthConditionPreview"
                        options={healthConditionOptions}
                        disabled
                        value={animalPreview?.healthCondition ?? ''}
                      />
                    </div>
                    <div>
                      <Form.Label htmlFor="entryDatePreview">Data de entrada</Form.Label>
                      <Form.Input name="entryDatePreview" type="date" value={animalPreview?.entryDate ?? ''} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="statusPreview">Status</Form.Label>
                      <Form.Select
                        name="statusPreview"
                        options={animalStatusOptions}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        value={animalPreview?.status ?? ''}
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="animalObservationsPreview">Observações (animal)</Form.Label>
                    <Form.TextArea
                      name="animalObservationsPreview"
                      rows={2}
                      disabled
                      value={animalPreview?.observations ?? ''}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="procedimento">
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="procedureTypeId">Tipo de procedimento</Form.Label>
                      <Form.Select name="procedureTypeId" type="number" options={procedureTypeOptions} />
                      <Form.ErrorMessage field="procedureTypeId" />
                    </div>
                    <div>
                      <Form.Label htmlFor="appointmentIdDisplay">Consulta vinculada (opcional)</Form.Label>
                      <div className="flex gap-2">
                        <Form.Input
                          id="appointmentIdDisplay"
                          name="appointmentIdDisplay"
                          value={appointmentDisplayLabel || (appointmentId ? `#${appointmentId}` : '')}
                          disabled
                          placeholder="Nenhuma"
                        />
                        <Button type="button" variant="outline" onClick={() => setOpenAppointmentModal(true)}>
                          <SearchIcon className="mr-2 h-4 w-4" />
                          Buscar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setValue('appointmentId', null, { shouldValidate: true })
                            setAppointmentDisplayLabel('')
                          }}
                        >
                          Limpar
                        </Button>
                      </div>
                      <Form.ErrorMessage field="appointmentId" />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="procedureDate">Data/hora</Form.Label>
                      <Form.DateTimeInput name="procedureDate" />
                      <Form.ErrorMessage field="procedureDate" />
                    </div>
                    <div>
                      <Form.Label htmlFor="actualCost">Custo real (R$)</Form.Label>
                      <Form.Input name="actualCost" type="number" step="0.01" min={0} />
                      <Form.ErrorMessage field="actualCost" />
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
                    <Form.Label htmlFor="description">Descrição</Form.Label>
                    <Form.TextArea name="description" rows={3} />
                    <Form.ErrorMessage field="description" />
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="observations">Observações</Form.Label>
                    <Form.TextArea name="observations" rows={3} />
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
                <Button type="button" variant="outline" onClick={() => setActiveTab('procedimento')}>
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
      <AppointmentSearchModal
        open={openAppointmentModal}
        onClose={() => setOpenAppointmentModal(false)}
        onSelect={(appointment) => {
          setValue('appointmentId', appointment.id, { shouldValidate: true })
          setAppointmentDisplayLabel(appointment.label)
          setOpenAppointmentModal(false)
        }}
      />
    </>
  )
}
