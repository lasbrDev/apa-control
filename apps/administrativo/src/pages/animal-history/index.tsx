import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftIcon, DogIcon, SearchIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { toQueryString } from '../../helpers/qs'
import { api } from '../../service'

interface AnimalHistoryItem {
  id: number
  type: string
  description: string
  oldValue: string
  newValue: string
  createdAt: string
  employeeName: string | null
}

interface EmployeeOption {
  id: number
  name: string
}

const historyTypeOptions = [
  { value: 'resgate', label: 'Resgate' },
  { value: 'cadastro', label: 'Cadastro' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'procedimento', label: 'Procedimento' },
  { value: 'destino_final', label: 'Destino Final' },
]

const historyFilterSchema = z.object({
  historyTypes: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  employeeId: z.number().nullable().optional(),
})

export function AnimalHistoryPage() {
  const { token, modal } = useApp()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [animalName, setAnimalName] = useState<string>('')
  const [items, setItems] = useState<AnimalHistoryItem[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const historyFilterForm = useForm<z.infer<typeof historyFilterSchema>>({
    resolver: zodResolver(historyFilterSchema),
    defaultValues: {
      historyTypes: [],
      startDate: '',
      endDate: '',
      employeeId: null,
    },
  })
  const fetchHistory = useCallback(
    async (values: z.infer<typeof historyFilterSchema>) => {
      if (!params.id) return
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const query = toQueryString({
        types: values.historyTypes,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        employeeId: values.employeeId || undefined,
      })
      const path = query ? `animal-history.key/${params.id}?${query}` : `animal-history.key/${params.id}`
      const historyResponse = await api.get(path, config)
      const list = Array.isArray(historyResponse.data) ? historyResponse.data : []
      setItems(list)
    },
    [params.id, token],
  )

  async function onSubmitFilters(values: z.infer<typeof historyFilterSchema>) {
    setFetching(true)
    try {
      await fetchHistory(values)
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (!params.id) return

    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([
      api.get(`animal.key/${params.id}`, config),
      api.get(`employee.list?${toQueryString({ page: 0, fields: 'id,name', sort: 'name' })}`, config),
      fetchHistory(historyFilterForm.getValues()),
    ])
      .then(([animalResponse, employeeResponse]) => {
        setAnimalName(animalResponse.data?.name ?? '')
        const employeeList = Array.isArray(employeeResponse.data) ? employeeResponse.data : []
        setEmployees(employeeList)
      })
      .catch((error) => modal.alert(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [params.id, token, modal, historyFilterForm, fetchHistory])

  if (fetching) return <LoadingCard />

  const employeeOptions = employees.map((employee) => ({ value: employee.id, label: employee.name }))

  return (
    <>
      <Helmet>
        <title>Histórico do Animal - APA Control</title>
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle>
            <DogIcon />
            Histórico do Animal {animalName ? `- ${animalName}` : ''}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <FormProvider {...historyFilterForm}>
              <form onSubmit={historyFilterForm.handleSubmit(onSubmitFilters)}>
                <div className="mb-6 grid gap-4 lg:grid-cols-4">
                  <div>
                    <Form.Label htmlFor="historyTypes">Tipo</Form.Label>
                    <Form.MultiSelect name="historyTypes" options={historyTypeOptions} placeholder="Todos" />
                  </div>
                  <div>
                    <Form.Label htmlFor="startDate">Data/hora inicial</Form.Label>
                    <Form.DateTimeInput name="startDate" isClearable />
                    <Form.ErrorMessage field="startDate" />
                  </div>
                  <div>
                    <Form.Label htmlFor="endDate">Data/hora final</Form.Label>
                    <Form.DateTimeInput name="endDate" isClearable />
                    <Form.ErrorMessage field="endDate" />
                  </div>
                  <div>
                    <Form.Label htmlFor="employeeId">Por</Form.Label>
                    <Form.Select
                      name="employeeId"
                      type="number"
                      isClearable
                      placeholder="Todos"
                      options={employeeOptions}
                    />
                    <Form.ErrorMessage field="employeeId" />
                  </div>
                </div>
                <CardFooter className="mt-6 p-0">
                  <Button type="submit">
                    <SearchIcon className="mr-2 h-5 w-5 shrink-0" />
                    <span>Consultar</span>
                  </Button>
                </CardFooter>
              </form>
            </FormProvider>
          </div>

          <div className="overflow-auto">
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
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.createdAt ? formatDateNoComma(item.createdAt) : '-'}</TableCell>
                    <TableCell>{formatHistoryType(item.type)}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate" title={formatHistoryValue(item.oldValue, false)}>
                      {formatHistoryValue(item.oldValue, false)}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate" title={formatHistoryValue(item.newValue)}>
                      {formatHistoryValue(item.newValue)}
                    </TableCell>
                    <TableCell>{item.employeeName ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {items.length === 0 && <TableCaption>Nenhum histórico encontrado.</TableCaption>}
            </Table>
          </div>
        </CardContent>

        <CardFooter>
          <Button asChild variant="outline">
            <Link to="/animais">
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Voltar
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}

function formatDateNoComma(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'

  const date = d.toLocaleDateString('pt-BR')
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

function formatHistoryType(type: string) {
  const map: Record<string, string> = {
    resgate: 'Resgate',
    cadastro: 'Cadastro',
    consulta: 'Consulta',
    procedimento: 'Procedimento',
    destino_final: 'Destino Final',
  }
  return map[type] ?? type
}

function formatHistoryValue(value: string, showDashWhenEmpty = true) {
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
