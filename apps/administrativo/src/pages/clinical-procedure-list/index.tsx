import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import {
  CheckCircle2Icon,
  DownloadIcon,
  EyeIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  SyringeIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { Badge } from '../../components/badge'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { Form } from '../../components/form-hook'
import { ActionsList } from '../../components/list/ActionList'
import { Pagination } from '../../components/list/Pagination'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Spinner } from '../../components/spinner'
import {
  SelectableTable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table'
import { appConfig } from '../../config'
import { errorMessageHandler } from '../../helpers/axios'
import { formatDateTime } from '../../helpers/date'
import { resolveFileUrl } from '../../helpers/file-url'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface Item {
  id: number
  animalName?: string | null
  procedureTypeName?: string | null
  appointmentTypeName?: string | null
  procedureDate: string
  status: string
  proof?: string | null
  actualCost: number | null
}
interface SelectOption {
  value: number
  label: string
}

const schema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    animalName: z.string().nullish(),
    procedureTypeId: z.number().nullish(),
    appointmentTypeId: z.number().nullish(),
    status: z.string().nullish(),
    procedureDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    procedureDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.procedureDateStart || !data.procedureDateEnd) return true
      return new Date(data.procedureDateStart) <= new Date(data.procedureDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['procedureDateEnd'],
    },
  )
type FilterData = z.infer<typeof schema>

const statusOptions = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const ClinicalProcedureList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [procedureTypeOptions, setProcedureTypeOptions] = useState<SelectOption[]>([])
  const [appointmentTypeOptions, setAppointmentTypeOptions] = useState<SelectOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchLoading, setBatchLoading] = useState<'confirm' | 'cancel' | null>(null)
  const selectableItems = items.filter((item) => item.status === 'agendado')
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id))

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const toDateInput = (date: Date) => date.toISOString().split('T')[0]

  const form = useForm<FilterData>({
    resolver: zodResolver(schema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,animalName,procedureTypeName,appointmentTypeName,procedureDate,status,proof,actualCost',
      sort: '-procedureDate',
      animalName: '',
      procedureTypeId: null,
      appointmentTypeId: null,
      status: null,
      procedureDateStart: toDateInput(monthStart),
      procedureDateEnd: toDateInput(monthEnd),
    },
  })
  const { handleSubmit, getValues, setValue } = form
  const pages = Math.ceil(total / getValues('perPage')) || 1

  useEffect(() => {
    setSelectedIds([])
  }, [items])

  const removeItem = useCallback(
    (item: Item) => {
      modal.confirm({
        title: 'Remover procedimento',
        message: `Deseja remover o procedimento #${item.id}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`clinical-procedure.delete/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(() => {
                toast.success('Registro removido com sucesso!')
                refresh.force()
              })
              .catch((err) => {
                if (isAxiosError(err) && err.response?.status === 409) {
                  toast.error('Esse procedimento não pode mais ser removido porque não está agendado.')
                  return
                }
                toast.error(errorMessageHandler(err))
              })
          }
        },
      })
    },
    [token, modal, refresh],
  )

  async function list(values: FilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`clinical-procedure.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(Array.isArray(data) ? data : [])
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
    setFetching(false)
  }

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? selectableItems.map((item) => item.id) : [])
  }

  function handleSelectItem(id: number, checked: boolean) {
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((itemId) => itemId !== id)))
  }

  function confirmProceduresBatch() {
    modal.confirm({
      title: 'Confirmar procedimentos',
      message: `Deseja confirmar ${selectedIds.length} procedimento(s) selecionado(s) como realizado(s)?`,
      confirmText: 'Confirmar procedimentos',
      callback: async (confirmed) => {
        if (!confirmed) return
        setBatchLoading('confirm')
        try {
          await api.post(
            'clinical-procedure.confirm',
            { ids: selectedIds },
            { headers: { Authorization: `Bearer ${token}` } },
          )
          toast.success(`${selectedIds.length} procedimento(s) confirmado(s) com sucesso.`)
          setSelectedIds([])
          refresh.force()
        } catch (error) {
          toast.error(errorMessageHandler(error))
        } finally {
          setBatchLoading(null)
        }
      },
    })
  }

  function cancelProceduresBatch() {
    modal.confirm({
      title: 'Cancelar procedimentos',
      message: `Deseja cancelar ${selectedIds.length} procedimento(s) selecionado(s)?`,
      confirmText: 'Cancelar procedimentos',
      callback: async (confirmed) => {
        if (!confirmed) return
        setBatchLoading('cancel')
        try {
          await api.post(
            'clinical-procedure.cancel',
            { ids: selectedIds },
            { headers: { Authorization: `Bearer ${token}` } },
          )
          toast.success(`${selectedIds.length} procedimento(s) cancelado(s) com sucesso.`)
          setSelectedIds([])
          refresh.force()
        } catch (error) {
          toast.error(errorMessageHandler(error))
        } finally {
          setBatchLoading(null)
        }
      },
    })
  }

  async function exportClinicalProcedures(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const exportFields =
        'id,animalName,procedureTypeName,appointmentTypeName,appointmentDate,employeeName,procedureDate,description,actualCost,observations,status,createdAt'
      const response = await api.get(
        `clinical-procedure.list?${toQueryString({ ...values, fields: exportFields, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'procedimentos-clinicos', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    Promise.all([
      api.get(`procedure-type.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, config),
      api.get(`appointment-type.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, config),
    ])
      .then(([procedureTypeResponse, appointmentTypeResponse]) => {
        setProcedureTypeOptions(
          (Array.isArray(procedureTypeResponse.data) ? procedureTypeResponse.data : [])
            .filter((item: { active: boolean }) => item.active)
            .map((item: { id: number; name: string }) => ({ value: item.id, label: item.name })),
        )
        setAppointmentTypeOptions(
          (Array.isArray(appointmentTypeResponse.data) ? appointmentTypeResponse.data : [])
            .filter((item: { active: boolean }) => item.active)
            .map((item: { id: number; name: string }) => ({ value: item.id, label: item.name })),
        )
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
  }, [token])

  useEffect(() => {
    handleSubmit(list)()
  }, [refresh.ref])

  return (
    <>
      <Helmet>
        <title>Procedimentos Clínicos - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <SyringeIcon />
            Procedimentos Clínicos
          </CardTitle>
          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportClinicalProcedures('csv')}
            >
              {downloading === 'csv' ? (
                <Spinner />
              ) : (
                <>
                  <FileSpreadsheetIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span>Baixar em CSV</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={downloading === 'xlsx'}
              onClick={() => exportClinicalProcedures('xlsx')}
            >
              {downloading === 'xlsx' ? (
                <Spinner />
              ) : (
                <>
                  <FileSpreadsheetIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span>Baixar em Excel</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={downloading === 'pdf'}
              onClick={() => exportClinicalProcedures('pdf')}
            >
              {downloading === 'pdf' ? (
                <Spinner />
              ) : (
                <>
                  <FileTextIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span>Baixar em PDF</span>
                </>
              )}
            </Button>
            <Button variant="danger" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo procedimento</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(list)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div>
                  <Form.Label htmlFor="animalName">Animal</Form.Label>
                  <Form.Input name="animalName" />
                  <Form.ErrorMessage field="animalName" />
                </div>
                <div>
                  <Form.Label htmlFor="procedureTypeId">Tipo de procedimento</Form.Label>
                  <Form.Select
                    name="procedureTypeId"
                    type="number"
                    isClearable
                    placeholder="Todos"
                    options={procedureTypeOptions}
                  />
                  <Form.ErrorMessage field="procedureTypeId" />
                </div>
                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" isClearable placeholder="Todos" options={statusOptions} />
                  <Form.ErrorMessage field="status" />
                </div>
              </div>
              <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div>
                  <Form.Label htmlFor="appointmentTypeId">Tipo de consulta</Form.Label>
                  <Form.Select
                    name="appointmentTypeId"
                    type="number"
                    isClearable
                    placeholder="Todos"
                    options={appointmentTypeOptions}
                  />
                  <Form.ErrorMessage field="appointmentTypeId" />
                </div>
                <div>
                  <Form.Label htmlFor="procedureDateStart">Data inicial</Form.Label>
                  <Form.DateInput name="procedureDateStart" />
                  <Form.ErrorMessage field="procedureDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="procedureDateEnd">Data final</Form.Label>
                  <Form.DateInput name="procedureDateEnd" />
                  <Form.ErrorMessage field="procedureDateEnd" />
                </div>
              </div>
              <CardFooter className="gap-4 p-0">
                <Button
                  type="button"
                  variant="success"
                  disabled={selectedIds.length === 0 || batchLoading !== null}
                  onClick={confirmProceduresBatch}
                >
                  {batchLoading === 'confirm' ? (
                    <Spinner />
                  ) : (
                    <>
                      <CheckCircle2Icon className="mr-2 h-5 w-5" />
                      Confirmar realizados
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={selectedIds.length === 0 || batchLoading !== null}
                  onClick={cancelProceduresBatch}
                >
                  {batchLoading === 'cancel' ? (
                    <Spinner />
                  ) : (
                    <>
                      <XCircleIcon className="mr-2 h-5 w-5" />
                      Confirmar cancelamento
                    </>
                  )}
                </Button>
                <Button type="submit">
                  <SearchIcon className="mr-2 h-5 w-5" />
                  Consultar
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>
        <div>
          <Separator />

          <div className="relative">
            <SelectableTable>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[1%]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Tipo de consulta</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="w-[1%]">
                      {item.status === 'agendado' ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="h-4 w-4 cursor-pointer"
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>{item.animalName ?? ''}</TableCell>
                    <TableCell>{item.procedureTypeName ?? ''}</TableCell>
                    <TableCell>{item.appointmentTypeName ?? ''}</TableCell>
                    <TableCell>{formatDateTime(item.procedureDate)}</TableCell>
                    <TableCell>{procedureStatusBadge(item.status, item.procedureDate)}</TableCell>
                    <TableCell>
                      {item.actualCost === null
                        ? ''
                        : Number(item.actualCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>
                      <ActionsList
                        values={item}
                        primaryKey="id"
                        actions={[
                          {
                            title: 'Visualizar',
                            icon: EyeIcon,
                            action: '/procedimentos/:id',
                            hideWhen: (currentItem) => currentItem.status !== 'agendado',
                          },
                          {
                            title: 'Baixar arquivo',
                            icon: DownloadIcon,
                            action: (currentItem) =>
                              window.open(resolveFileUrl(currentItem.proof!, appConfig.API_URL), '_blank'),
                            hideWhen: (currentItem) => !currentItem.proof,
                          },
                          {
                            title: 'Remover',
                            icon: XIcon,
                            action: () => removeItem(item),
                            hideWhen: (currentItem) => currentItem.status !== 'agendado',
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {items.length === 0 && <TableCaption>Nenhum procedimento encontrado.</TableCaption>}
            </SelectableTable>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('procedimentos', getValues('page'), pages, total)}
            </span>
            {selectedIds.length > 0 && (
              <span className="text-sm dark:text-gray-300">{selectedIds.length} item(s) selecionado(s).</span>
            )}
            <Pagination
              current={getValues('page')}
              total={pages}
              changePage={(p) => {
                setValue('page', p)
                refresh.force()
              }}
            />
          </div>
        </div>
      </Card>
    </>
  )
}

function procedureStatusBadge(status: string, procedureDate: string) {
  const isPending = status === 'agendado' && new Date(procedureDate) < new Date()
  if (isPending) return <Badge variant="warning">Pendente</Badge>

  const map: Record<string, { label: string; variant: 'outline' | 'success' | 'danger' }> = {
    agendado: { label: 'Agendado', variant: 'outline' },
    realizado: { label: 'Realizado', variant: 'success' },
    cancelado: { label: 'Cancelado', variant: 'danger' },
  }

  const config = map[status]
  if (!config) return <Badge variant="outline">{status}</Badge>
  return <Badge variant={config.variant}>{config.label}</Badge>
}
