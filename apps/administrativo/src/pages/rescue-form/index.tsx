import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  LifeBuoyIcon,
  MapPinIcon,
  SaveIcon,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Spinner } from '../../components/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { toQueryString } from '../../helpers/qs'
import { downloadReportBlob } from '../../helpers/report-download'
import { api } from '../../service'

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

const rescueFormSchema = z.object({
  id: z.number().nullish(),
  animalId: z.union([z.number(), z.string()]).optional(),
  name: z.string().min(1, 'O nome é obrigatório.').min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  species: z.string({ error: RequiredMessage }),
  breed: z.string().nullish(),
  size: z.string({ error: RequiredMessage }),
  sex: z.string({ error: RequiredMessage }),
  birthYear: z
    .number()
    .int()
    .min(1900, 'Ano inválido.')
    .max(new Date().getFullYear(), 'Ano não pode ser no futuro.')
    .nullish(),
  healthCondition: z.string({ error: RequiredMessage }),
  entryDate: z.string({ error: RequiredMessage }),
  observations: z.string().nullish(),
  rescueDate: z.string({ error: RequiredMessage }),
  locationFound: z.string().min(1, 'Local encontrado é obrigatório.').max(200),
  circumstances: z.string().min(1, 'Circunstâncias são obrigatórias.'),
  foundConditions: z.string().min(1, 'Condições em que foi encontrado é obrigatório.'),
  immediateProcedures: z.string().nullish(),
  rescueObservations: z.string().nullish(),
})

type RescueFormData = z.infer<typeof rescueFormSchema>

interface AnimalOption {
  id: number
  name: string
}

interface AnimalHistoryItem {
  id: number
  type: string
  description: string
  oldValue: string
  newValue: string
  createdAt: string
  employeeName: string | null
}

export const RescueForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [activeTab, setActiveTab] = useState('animal')
  const [animalHistory, setAnimalHistory] = useState<AnimalHistoryItem[]>([])
  const [historyFetching, setHistoryFetching] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const rescueForm = useForm<RescueFormData>({
    resolver: zodResolver(rescueFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      animalId: '',
      entryDate: new Date().toISOString().split('T')[0],
      rescueDate: new Date().toISOString().split('T')[0],
    },
  })

  const {
    handleSubmit,
    reset,
    setValue,
    setFocus,
    watch,
    formState: { isSubmitting },
  } = rescueForm

  const animalId = watch('animalId')

  const isEdit = Boolean(params.id && params.id !== 'cadastro')
  const isExistingAnimal = animalId != null && animalId !== '' && Number(animalId) > 0
  const disableAnimalFields = isEdit || isExistingAnimal

  const searchAnimalOptions = useCallback(
    async (query: string): Promise<{ value: string; label: string }[]> => {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const qs = toQueryString({
        name: query.trim(),
        perPage: 50,
        fields: 'id,name',
        sort: 'name',
        status: 'pendente',
      })
      const { data } = await api.get<AnimalOption[]>(`animal.list?${qs}`, config)
      const list = Array.isArray(data) ? data : []
      return list.map((a) => ({ value: String(a.id), label: a.name }))
    },
    [token],
  )

  useEffect(() => {
    if (animalId != null && animalId !== '' && Number(animalId) > 0) {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      api
        .get(`animal.key/${animalId}`, config)
        .then(({ data }) => {
          setValue('name', data.name)
          setValue('species', data.species)
          setValue('breed', data.breed ?? '')
          setValue('size', data.size)
          setValue('sex', data.sex)
          setValue('birthYear', data.birthYear ?? null)
          setValue('healthCondition', data.healthCondition)
          setValue('entryDate', data.entryDate?.split('T')[0] ?? '')
          setValue('observations', data.observations ?? '')
        })
        .catch(() => toast.error('Não foi possível carregar os dados do animal.'))
    }
  }, [animalId, isEdit, setValue, token])

  useEffect(() => {
    const parsedAnimalId = Number(animalId)
    if (!parsedAnimalId || parsedAnimalId <= 0) {
      setAnimalHistory([])
      return
    }

    const config = { headers: { Authorization: `Bearer ${token}` } }
    setHistoryFetching(true)
    api
      .get(`animal-history.key/${parsedAnimalId}?type=resgate`, config)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : []
        setAnimalHistory(list)
      })
      .catch((err) => toast.error(errorMessageHandler(err)))
      .finally(() => setHistoryFetching(false))
  }, [animalId, token])

  const formatAnimalHistoryType = (type: string) => {
    const map: Record<string, string> = {
      resgate: 'Resgate',
      cadastro: 'Cadastro',
      consulta: 'Consulta',
      procedimento: 'Procedimento',
      destino_final: 'Destino Final',
    }
    return map[type] ?? type
  }

  const handleDownloadPDF = async () => {
    if (!animalId || Number(animalId) <= 0) return
    setIsDownloading(true)
    try {
      const config = { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' as const }
      const res = await api.get(`animal-history.key/${animalId}?type=resgate&exportType=pdf`, config)
      downloadReportBlob(res.data, `historico-resgate-${animalId}`, 'pdf')
    } catch (err) {
      toast.error('Erro ao baixar PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const formatHistoryValue = (value: string) => {
    if (!value) return ''
    try {
      const parsed = JSON.parse(value) as unknown
      const fieldLabelMap: Record<string, string> = {
        name: 'Nome',
        species: 'Espécie',
        breed: 'Raça',
        size: 'Porte',
        sex: 'Sexo',
        birthYear: 'Ano de Nascimento',
        healthCondition: 'Condição de Saúde',
        entryDate: 'Data de Entrada',
        observations: 'Observações',
        status: 'Status',
        rescueDate: 'Data do Resgate',
        locationFound: 'Local Encontrado',
        circumstances: 'Circunstâncias',
        foundConditions: 'Condições em que foi encontrado',
        immediateProcedures: 'Procedimentos Imediatos',
        destinationTypeId: 'Tipo de Destino Final',
        destinationDate: 'Data do Destino Final',
        reason: 'Motivo',
        proof: 'Comprovante',
        animal: 'Animal',
      }

      const valueLabelMapByField: Record<string, Record<string, string>> = {
        species: { canina: 'Cachorro', felina: 'Gato', outros: 'Outros' },
        size: { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' },
        sex: { macho: 'Macho', femea: 'Fêmea' },
        healthCondition: { saudavel: 'Saudável', estavel: 'Estável', critica: 'Crítica' },
        status: { pendente: 'Pendente', ativo: 'Ativo', inativo: 'Inativo' },
      }

      const translateValue = (fieldKey: string, fieldValue: unknown): unknown => {
        if (typeof fieldValue === 'string') {
          return valueLabelMapByField[fieldKey]?.[fieldValue] ?? fieldValue
        }
        return fieldValue
      }

      const translatePayload = (input: unknown): unknown => {
        if (Array.isArray(input)) return input.map(translatePayload)
        if (input && typeof input === 'object') {
          const entries = Object.entries(input as Record<string, unknown>).map(([key, fieldValue]) => {
            const translatedValue =
              fieldValue && typeof fieldValue === 'object'
                ? translatePayload(fieldValue)
                : translateValue(key, fieldValue)
            return [fieldLabelMap[key] ?? key, translatedValue]
          })
          return Object.fromEntries(entries)
        }
        return input
      }

      return JSON.stringify(translatePayload(parsed))
    } catch {
      return value
    }
  }

  const formatDateNoComma = (value: string) => {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''

    const date = d.toLocaleDateString('pt-BR')
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${date} ${time}`
  }

  useEffect(() => {
    if (!params.id || params.id === 'cadastro') {
      setFetching(false)
      return
    }
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }
    api
      .get(`rescue.key/${params.id}`, config)
      .then(({ data }) => {
        reset({
          id: data.id,
          animalId: data.animalId,
          name: data.animalName ?? '',
          species: 'canina',
          breed: null,
          size: 'medio',
          sex: 'macho',
          birthYear: null,
          healthCondition: 'saudavel',
          entryDate: '',
          observations: null,
          rescueDate: data.rescueDate?.split('T')[0] ?? '',
          locationFound: data.locationFound,
          circumstances: data.circumstances,
          foundConditions: data.foundConditions,
          immediateProcedures: data.immediateProcedures ?? null,
          rescueObservations: data.observations ?? null,
        })
      })
      .catch((err) => toast.error(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [params.id, reset, token])

  async function submitRescue(values: RescueFormData) {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }

      if (isEdit) {
        await api.put(
          'rescue.update',
          {
            id: values.id,
            rescueDate: values.rescueDate,
            locationFound: values.locationFound,
            circumstances: values.circumstances,
            foundConditions: values.foundConditions,
            immediateProcedures: values.immediateProcedures ?? null,
            observations: values.rescueObservations ?? null,
          },
          config,
        )
        toast.success('Resgate atualizado com sucesso!')
      } else {
        const rescuePayload = {
          rescueDate: values.rescueDate,
          locationFound: values.locationFound,
          circumstances: values.circumstances,
          foundConditions: values.foundConditions,
          immediateProcedures: values.immediateProcedures ?? null,
          observations: values.rescueObservations ?? null,
        }

        if (isExistingAnimal) {
          await api.post(
            'rescue.add',
            {
              animalId: Number(values.animalId as string),
              ...rescuePayload,
            },
            config,
          )
        } else {
          await api.post(
            'rescue.add',
            {
              animal: {
                name: values.name,
                species: values.species,
                breed: values.breed || null,
                size: values.size,
                sex: values.sex,
                birthYear: values.birthYear ?? null,
                healthCondition: values.healthCondition,
                entryDate: values.entryDate,
                observations: values.observations ?? null,
              },
              ...rescuePayload,
            },
            config,
          )
        }
        toast.success('Resgate registrado com sucesso!')
      }
      pushTo(-1)
    } catch (err) {
      toast.error(errorMessageHandler(err))
    }
  }

  const animalTabFields: Array<keyof RescueFormData> = [
    'animalId',
    'name',
    'species',
    'breed',
    'size',
    'sex',
    'birthYear',
    'healthCondition',
    'entryDate',
    'observations',
  ]

  const rescueTabFields: Array<keyof RescueFormData> = [
    'rescueDate',
    'locationFound',
    'circumstances',
    'foundConditions',
    'immediateProcedures',
    'rescueObservations',
  ]

  const onSubmitError: Parameters<typeof handleSubmit>[1] = (errors) => {
    if (!errors) return

    const firstAnimalErrorField = animalTabFields.find((field) => Boolean(errors[field]))
    const firstRescueErrorField = rescueTabFields.find((field) => Boolean(errors[field]))

    if (firstAnimalErrorField) {
      setActiveTab('animal')
      setTimeout(() => setFocus(firstAnimalErrorField), 0)
      return
    }

    if (firstRescueErrorField) {
      setActiveTab('resgate')
      setTimeout(() => setFocus(firstRescueErrorField), 0)
    }
  }

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Visualizar Resgate' : 'Novo Resgate'} - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? <EyeIcon /> : <LifeBuoyIcon />}
            {isEdit ? 'Visualizar Resgate' : 'Novo Resgate'}
          </CardTitle>
        </CardHeader>

        <FormProvider {...rescueForm}>
          <form autoComplete="off" onSubmit={handleSubmit(submitRescue, onSubmitError)}>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="animal">Dados do Animal</TabsTrigger>
                  <TabsTrigger value="resgate">Dados do Resgate</TabsTrigger>
                  {isEdit && <TabsTrigger value="history">Histórico do Animal</TabsTrigger>}
                </TabsList>

                <TabsContent value="animal">
                  {!isEdit && (
                    <div className="mb-6">
                      <Form.Label htmlFor="animalId">Animal</Form.Label>
                      <Form.SearchableSelect
                        name="animalId"
                        searchOptions={searchAnimalOptions}
                        minChars={3}
                        debounceMs={300}
                        displayLabel={isExistingAnimal ? (watch('name') as string) : undefined}
                      />
                    </div>
                  )}

                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="name">Nome</Form.Label>
                      <Form.Input name="name" disabled={disableAnimalFields} />
                      <Form.ErrorMessage field="name" />
                    </div>
                    <div>
                      <Form.Label htmlFor="species">Espécie</Form.Label>
                      <Form.Select name="species" options={speciesOptions} disabled={disableAnimalFields} />
                      <Form.ErrorMessage field="species" />
                    </div>
                    <div>
                      <Form.Label htmlFor="breed">Raça</Form.Label>
                      <Form.Input name="breed" disabled={disableAnimalFields} />
                      <Form.ErrorMessage field="breed" />
                    </div>
                    <div>
                      <Form.Label htmlFor="size">Porte</Form.Label>
                      <Form.Select name="size" options={sizeOptions} disabled={disableAnimalFields} />
                      <Form.ErrorMessage field="size" />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="sex">Sexo</Form.Label>
                      <Form.Select name="sex" options={sexOptions} disabled={disableAnimalFields} />
                      <Form.ErrorMessage field="sex" />
                    </div>
                    <div>
                      <Form.Label htmlFor="birthYear">Nascimento</Form.Label>
                      <Form.Input
                        name="birthYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="Ex: 2021"
                        disabled={disableAnimalFields}
                      />
                      <Form.ErrorMessage field="birthYear" />
                    </div>
                    <div>
                      <Form.Label htmlFor="healthCondition">Condição de saúde</Form.Label>
                      <Form.Select
                        name="healthCondition"
                        options={healthConditionOptions}
                        disabled={disableAnimalFields}
                      />
                      <Form.ErrorMessage field="healthCondition" />
                    </div>
                    <div>
                      <Form.Label htmlFor="entryDate">Data de entrada</Form.Label>
                      <Form.Input name="entryDate" type="date" disabled={disableAnimalFields} />
                      <Form.ErrorMessage field="entryDate" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="observations">Observações (animal)</Form.Label>
                    <Form.TextArea name="observations" rows={2} disabled={disableAnimalFields} />
                    <Form.ErrorMessage field="observations" />
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="mt-2">
                    <h4 className="mb-3 font-semibold leading-none tracking-tight dark:text-gray-200">
                      Histórico do Animal
                    </h4>

                    {historyFetching ? (
                      <div className="py-4">
                        <Spinner />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Valor Antigo</TableHead>
                            <TableHead>Valor Novo</TableHead>
                            <TableHead>Por</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {animalHistory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.createdAt ? formatDateNoComma(item.createdAt) : ''}</TableCell>
                              <TableCell>{formatAnimalHistoryType(item.type)}</TableCell>
                              <TableCell className="max-w-[260px] truncate" title={item.description}>
                                {item.description}
                              </TableCell>
                              <TableCell className="max-w-[260px] truncate" title={formatHistoryValue(item.oldValue)}>
                                {formatHistoryValue(item.oldValue)}
                              </TableCell>
                              <TableCell className="max-w-[260px] truncate" title={formatHistoryValue(item.newValue)}>
                                {formatHistoryValue(item.newValue)}
                              </TableCell>
                              <TableCell>{item.employeeName ?? ''}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        {animalHistory.length === 0 && <TableCaption>Nenhum histórico encontrado.</TableCaption>}
                      </Table>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="resgate">
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="rescueDate">Data do resgate</Form.Label>
                      <Form.IconContainer>
                        <Form.Input name="rescueDate" type="date" className="pl-9" />
                        <Form.Icon icon={CalendarIcon} />
                      </Form.IconContainer>
                      <Form.ErrorMessage field="rescueDate" />
                    </div>
                    <div>
                      <Form.Label htmlFor="locationFound">Local encontrado</Form.Label>
                      <Form.IconContainer>
                        <Form.Input
                          name="locationFound"
                          placeholder="Endereço ou ponto de referência"
                          className="pl-9"
                        />
                        <Form.Icon icon={MapPinIcon} />
                      </Form.IconContainer>
                      <Form.ErrorMessage field="locationFound" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="circumstances">Circunstâncias</Form.Label>
                    <Form.TextArea name="circumstances" placeholder="Como o animal foi encontrado..." rows={3} />
                    <Form.ErrorMessage field="circumstances" />
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="foundConditions">Condições em que foi encontrado</Form.Label>
                    <Form.TextArea name="foundConditions" placeholder="Estado de saúde, ambiente..." rows={3} />
                    <Form.ErrorMessage field="foundConditions" />
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="immediateProcedures">Procedimentos imediatos</Form.Label>
                    <Form.TextArea name="immediateProcedures" placeholder="O que foi feito no local..." rows={2} />
                    <Form.ErrorMessage field="immediateProcedures" />
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="rescueObservations">Observações do resgate</Form.Label>
                    <Form.TextArea name="rescueObservations" rows={2} />
                    <Form.ErrorMessage field="rescueObservations" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  if (activeTab === 'history') {
                    setActiveTab('resgate')
                  } else if (!isEdit && activeTab === 'resgate') {
                    setActiveTab('animal')
                  } else {
                    pushTo(-1)
                  }
                }}
              >
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                <span>Voltar</span>
              </Button>

              {activeTab === 'history' && (
                <Button
                  type="button"
                  variant="danger"
                  className="ml-2"
                  disabled={isDownloading}
                  onClick={handleDownloadPDF}
                >
                  {isDownloading ? <Spinner className="mr-2 h-5 w-5" /> : <DownloadIcon className="mr-2 h-5 w-5" />}
                  <span>Baixar</span>
                </Button>
              )}

              {!isEdit && activeTab === 'animal' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab('resgate')
                  }}
                >
                  <ChevronRightIcon className="mr-2 h-5 w-5" />
                  <span>Continuar</span>
                </Button>
              ) : activeTab !== 'history' ? (
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
              ) : null}
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </>
  )
}
