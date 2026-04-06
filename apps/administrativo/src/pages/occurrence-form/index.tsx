import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, SaveIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
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
  occurrenceTypeId: z.number({ message: RequiredMessage }).int().positive(),
  occurrenceDate: z.string({ message: RequiredMessage }).min(1, RequiredMessage),
  description: z.string().min(1, RequiredMessage),
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

export const OccurrenceForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const isEdit = Boolean(params.id)
  const [fetching, setFetching] = useState(false)
  const [activeTab, setActiveTab] = useState<'animal' | 'ocorrencia'>('animal')
  const [typeOptions, setTypeOptions] = useState<SelectOption[]>([])
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

  const form = useForm<Data>({ resolver: zodResolver(schema), mode: 'onSubmit', defaultValues: { observations: '' } })
  const {
    handleSubmit,
    reset,
    setValue,
    setFocus,
    formState: { isSubmitting },
  } = form
  const animalId = form.watch('animalId')
  const animalNamePreview = form.watch('animalNamePreview')

  const animalTabFields: Array<keyof Data> = ['animalId']
  const occurrenciaTabFields: Array<keyof Data> = ['occurrenceTypeId', 'occurrenceDate', 'description']

  const onSubmitError: Parameters<typeof handleSubmit>[1] = (errors) => {
    if (!errors) return
    const firstAnimalError = animalTabFields.find((f) => Boolean(errors[f]))
    const firstOccurrenceError = occurrenciaTabFields.find((f) => Boolean(errors[f]))
    if (firstAnimalError) {
      setActiveTab('animal')
      setTimeout(() => setFocus(firstAnimalError), 0)
      return
    }
    if (firstOccurrenceError) {
      setActiveTab('ocorrencia')
      setTimeout(() => setFocus(firstOccurrenceError), 0)
    }
  }

  async function submit(values: Data) {
    try {
      const payload = {
        id: values.id,
        animalId: values.animalId,
        occurrenceTypeId: values.occurrenceTypeId,
        occurrenceDate: values.occurrenceDate,
        description: values.description,
        observations: values.observations,
      }
      await api[params.id ? 'put' : 'post'](params.id ? 'occurrence.update' : 'occurrence.add', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success(`Ocorrência ${params.id ? 'atualizada' : 'registrada'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }
    Promise.all([
      api.get(`occurrence-type.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, config),
      params.id ? api.get(`occurrence.key/${params.id}`, config) : Promise.resolve({ data: null }),
    ])
      .then(([typesRes, keyResponse]) => {
        setTypeOptions(
          (Array.isArray(typesRes.data) ? typesRes.data : [])
            .filter((i: { active: boolean }) => i.active)
            .map((i: { id: number; name: string }) => ({ value: i.id, label: i.name })),
        )
        if (keyResponse.data) {
          const key = keyResponse.data
          const date = new Date(key.occurrenceDate)
          const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
          reset({
            id: key.id,
            animalId: key.animalId,
            occurrenceTypeId: key.occurrenceTypeId,
            occurrenceDate: local,
            description: key.description,
            observations: key.observations ?? '',
            animalNamePreview: key.animalName ?? '',
          })
        }
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [params.id, token, reset])

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

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Ocorrência - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <AlertTriangleIcon />
            {params.id ? 'Editar ocorrência' : 'Nova ocorrência'}
          </CardTitle>
        </CardHeader>
        <FormProvider {...form}>
          <form autoComplete="off" onSubmit={handleSubmit(submit, onSubmitError)}>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'animal' | 'ocorrencia')}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="animal">Dados do Animal</TabsTrigger>
                  <TabsTrigger value="ocorrencia">Dados da Ocorrência</TabsTrigger>
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
                <TabsContent value="ocorrencia">
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="occurrenceTypeId">Tipo de ocorrência</Form.Label>
                      <Form.Select name="occurrenceTypeId" type="number" options={typeOptions} />
                      <Form.ErrorMessage field="occurrenceTypeId" />
                    </div>
                    <div>
                      <Form.Label htmlFor="occurrenceDate">Data/hora</Form.Label>
                      <Form.DateTimeInput name="occurrenceDate" />
                      <Form.ErrorMessage field="occurrenceDate" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="description">Descrição</Form.Label>
                    <Form.TextArea name="description" rows={4} />
                    <Form.ErrorMessage field="description" />
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
                    setActiveTab('ocorrencia')
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
