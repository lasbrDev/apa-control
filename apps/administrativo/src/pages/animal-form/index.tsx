import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { CalendarIcon, ChevronLeftIcon, DogIcon, HeartIcon, SaveIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'

const animalSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, 'O nome é obrigatório.').min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  species: z.string({ error: RequiredMessage }),
  breed: z.string().nullish(),
  size: z.string({ error: RequiredMessage }),
  sex: z.string({ error: RequiredMessage }),
  age: z
    .number({ error: RequiredMessage })
    .int('A idade deve ser um número inteiro.')
    .min(0, 'A idade deve ser maior ou igual a 0.')
    .max(50, 'A idade deve ser menor ou igual a 50.'),
  healthCondition: z.string({ error: RequiredMessage }),
  entryDate: z.string({ error: RequiredMessage }),
  observations: z.string().nullish(),
  status: z.string({ error: RequiredMessage }),
})

type AnimalData = z.infer<typeof animalSchema>

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

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_tratamento', label: 'Em Tratamento' },
  { value: 'adotado', label: 'Adotado' },
]

interface AnimalHistoryItem {
  id: number
  type: string
  description: string
  oldValue: string
  newValue: string
  createdAt: string
  employeeName: string | null
}

export const AnimalForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [activeTab, setActiveTab] = useState('animal')
  const [animalHistory, setAnimalHistory] = useState<AnimalHistoryItem[]>([])
  const [historyFetching, setHistoryFetching] = useState(false)

  const isEdit = Boolean(params.id && params.id !== 'cadastro')

  const animalForm = useForm({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      status: 'disponivel',
      entryDate: new Date().toISOString().split('T')[0],
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = animalForm

  async function addOrUpdateAnimal(values: AnimalData) {
    try {
      await api[params.id ? 'put' : 'post'](params.id ? 'animal.update' : 'animal.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Animal ${values.name} ${params.id ? 'atualizado' : 'criado'} com sucesso!`)
      pushTo(-1)
    } catch (err) {
      toast.error(errorMessageHandler(err))
    }
  }

  useEffect(() => {
    setFetching(true)

    const config = { headers: { Authorization: `Bearer ${token}` } }

    if (params.id) {
      api
        .get(`animal.key/${params.id}`, config)
        .then(({ data }) => {
          reset(data)
        })
        .catch((err) => toast.error(errorMessageHandler(err)))
        .finally(() => setFetching(false))
    } else {
      setFetching(false)
    }
  }, [params.id, reset, token])

  useEffect(() => {
    const parsedAnimalId = Number(params.id)
    if (!isEdit || !parsedAnimalId || parsedAnimalId <= 0) {
      setAnimalHistory([])
      return
    }

    const config = { headers: { Authorization: `Bearer ${token}` } }
    setHistoryFetching(true)

    api
      .get(`animal-history.key/${parsedAnimalId}?type=cadastro`, config)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : []
        setAnimalHistory(list)
      })
      .catch((err) => toast.error(errorMessageHandler(err)))
      .finally(() => setHistoryFetching(false))
  }, [isEdit, params.id, token])

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

  const formatHistoryValue = (value: string, showDashWhenEmpty = true) => {
    if (!value) return showDashWhenEmpty ? '-' : ''
    try {
      const parsed = JSON.parse(value) as unknown
      const fieldLabelMap: Record<string, string> = {
        name: 'Nome',
        species: 'Espécie',
        breed: 'Raça',
        size: 'Porte',
        sex: 'Sexo',
        age: 'Idade',
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
        status: { disponivel: 'Disponível', em_tratamento: 'Em Tratamento', adotado: 'Adotado' },
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
    if (Number.isNaN(d.getTime())) return '-'

    const date = d.toLocaleDateString('pt-BR')
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${date} ${time}`
  }

  const registrationHistory = animalHistory.filter((item) => item.type === 'cadastro')

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Animal - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <DogIcon />
            {params.id ? 'Editar Animal' : 'Novo Animal'}
          </CardTitle>
        </CardHeader>

        <FormProvider {...animalForm}>
          <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateAnimal)}>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="animal">Dados do Animal</TabsTrigger>
                  <TabsTrigger value="history" disabled={!isEdit}>
                    Histórico do Animal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="animal">
                  <h4 className="mb-6 font-semibold leading-none tracking-tight dark:text-gray-200">Dados Básicos</h4>

                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="name">Nome</Form.Label>
                      <Form.IconContainer>
                        <Form.Input name="name" className="pl-9" />
                        <Form.Icon icon={DogIcon} />
                      </Form.IconContainer>
                      <Form.ErrorMessage field="name" />
                    </div>

                    <div>
                      <Form.Label htmlFor="species">Espécie</Form.Label>
                      <Form.Select name="species" options={speciesOptions} />
                      <Form.ErrorMessage field="species" />
                    </div>

                    <div>
                      <Form.Label htmlFor="breed">Raça</Form.Label>
                      <Form.Input name="breed" placeholder="Ex: Golden Retriever" />
                      <Form.ErrorMessage field="breed" />
                    </div>

                    <div>
                      <Form.Label htmlFor="size">Porte</Form.Label>
                      <Form.Select name="size" options={sizeOptions} />
                      <Form.ErrorMessage field="size" />
                    </div>
                  </div>

                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="sex">Sexo</Form.Label>
                      <Form.Select name="sex" options={sexOptions} />
                      <Form.ErrorMessage field="sex" />
                    </div>

                    <div>
                      <Form.Label htmlFor="age">Idade Aproximada (anos)</Form.Label>
                      <Form.Input name="age" type="number" min="0" max="50" />
                      <Form.ErrorMessage field="age" />
                    </div>

                    <div>
                      <Form.Label htmlFor="healthCondition">Condição de Saúde</Form.Label>
                      <Form.IconContainer>
                        <Form.Select name="healthCondition" options={healthConditionOptions} className="pl-9" />
                        <Form.Icon icon={HeartIcon} />
                      </Form.IconContainer>
                      <Form.ErrorMessage field="healthCondition" />
                    </div>

                    <div>
                      <Form.Label htmlFor="entryDate">Data de Entrada</Form.Label>
                      <Form.IconContainer>
                        <Form.Input name="entryDate" type="date" className="pl-9" />
                        <Form.Icon icon={CalendarIcon} />
                      </Form.IconContainer>
                      <Form.ErrorMessage field="entryDate" />
                    </div>

                    <div>
                      <Form.Label htmlFor="status">Status</Form.Label>
                      <Form.Select name="status" options={statusOptions} />
                      <Form.ErrorMessage field="status" />
                    </div>
                  </div>

                  <Separator className="my-7" />
                  <div className="mb-6 font-semibold leading-none tracking-tight">Informações Adicionais</div>

                  <div className="mb-6">
                    <Form.Label htmlFor="observations">Observações</Form.Label>
                    <Form.TextArea
                      name="observations"
                      placeholder="Informações adicionais sobre o animal..."
                      rows={4}
                    />
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
                          {registrationHistory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.createdAt ? formatDateNoComma(item.createdAt) : '-'}</TableCell>
                              <TableCell>{formatAnimalHistoryType(item.type)}</TableCell>
                              <TableCell className="max-w-[260px] truncate" title={item.description}>
                                {item.description}
                              </TableCell>
                              <TableCell
                                className="max-w-[260px] truncate"
                                title={formatHistoryValue(item.oldValue, false)}
                              >
                                {formatHistoryValue(item.oldValue, false)}
                              </TableCell>
                              <TableCell className="max-w-[260px] truncate" title={formatHistoryValue(item.newValue)}>
                                {formatHistoryValue(item.newValue)}
                              </TableCell>
                              <TableCell>{item.employeeName ?? '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        {registrationHistory.length === 0 && <TableCaption>Nenhum histórico encontrado.</TableCaption>}
                      </Table>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => pushTo(-1)}>
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                <span>Voltar</span>
              </Button>

              {activeTab === 'animal' && (
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
