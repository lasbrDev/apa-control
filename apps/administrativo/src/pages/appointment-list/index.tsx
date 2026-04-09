import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import {
  CalendarHeartIcon,
  CheckCircle2Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
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
import { errorMessageHandler } from '../../helpers/axios'
import { formatDateTime } from '../../helpers/date'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface Item {
  id: number
  animalName?: string | null
  appointmentTypeName?: string | null
  clinicName?: string | null
  employeeName?: string | null
  appointmentDate: string
  consultationType: string
  status: string
}
interface SelectOption {
  value: number
  label: string
}

const appointmentFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    animalName: z.string().nullish(),
    appointmentTypeId: z.number().nullish(),
    clinicId: z.number().nullish(),
    consultationType: z.string().nullish(),
    status: z.string().nullish(),
    appointmentDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    appointmentDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.appointmentDateStart || !data.appointmentDateEnd) return true
      return new Date(data.appointmentDateStart) <= new Date(data.appointmentDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['appointmentDateEnd'],
    },
  )
type FilterData = z.infer<typeof appointmentFilterSchema>

const consultationTypeOptions = [
  { value: 'clinica', label: 'Clínica' },
  { value: 'domiciliar', label: 'Domiciliar' },
  { value: 'emergencia', label: 'Emergência' },
]
const statusOptions = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const AppointmentList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [appointmentTypeOptions, setAppointmentTypeOptions] = useState<SelectOption[]>([])
  const [clinicOptions, setClinicOptions] = useState<SelectOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchLoading, setBatchLoading] = useState<'confirm' | 'cancel' | null>(null)

  const selectableItems = items.filter((item) => item.status === 'agendado')
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id))

  const currentDate = new Date()
  const toDateInput = (date: Date) => format(date, 'yyyy-MM-dd')

  const filterForm = useForm<FilterData>({
    resolver: zodResolver(appointmentFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,animalName,appointmentTypeName,clinicName,employeeName,appointmentDate,consultationType,status',
      sort: '-appointmentDate',
      animalName: '',
      appointmentTypeId: null,
      clinicId: null,
      consultationType: null,
      status: null,
      appointmentDateStart: toDateInput(startOfMonth(currentDate)),
      appointmentDateEnd: toDateInput(endOfMonth(currentDate)),
    },
  })
  const { handleSubmit, getValues, setValue } = filterForm
  const pages = Math.ceil(total / getValues('perPage')) || 1

  useEffect(() => {
    setSelectedIds([])
  }, [items])

  const removeItem = useCallback(
    (item: Item) => {
      modal.confirm({
        title: 'Remover consulta',
        message: `Deseja remover a consulta ${item.animalName ?? `#${item.id}`}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`appointment.delete/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(() => {
                toast.success('Registro removido com sucesso!')
                refresh.force()
              })
              .catch((err) => {
                if (isAxiosError(err) && err.response?.status === 409) {
                  toast.error('Essa consulta não pode mais ser removida porque não está agendada.')
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

  async function listItems(values: FilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`appointment.list?${toQueryString(values)}`, {
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

  function confirmAppointmentsBatch() {
    modal.confirm({
      title: 'Confirmar consultas',
      message: `Deseja confirmar ${selectedIds.length} consulta(s) selecionada(s) como realizada(s)?`,
      confirmText: 'Confirmar consultas',
      callback: async (confirmed) => {
        if (!confirmed) return
        setBatchLoading('confirm')
        try {
          await api.post('appointment.confirm', { ids: selectedIds }, { headers: { Authorization: `Bearer ${token}` } })
          toast.success(`${selectedIds.length} consulta(s) confirmada(s) com sucesso.`)
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

  function cancelAppointmentsBatch() {
    modal.confirm({
      title: 'Cancelar consultas',
      message: `Deseja cancelar ${selectedIds.length} consulta(s) selecionada(s)?`,
      confirmText: 'Cancelar consultas',
      callback: async (confirmed) => {
        if (!confirmed) return
        setBatchLoading('cancel')
        try {
          await api.post('appointment.cancel', { ids: selectedIds }, { headers: { Authorization: `Bearer ${token}` } })
          toast.success(`${selectedIds.length} consulta(s) cancelada(s) com sucesso.`)
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

  async function exportAppointments(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `appointment.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'consultas', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    Promise.all([
      api.get(`appointment-type.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, config),
      api.get(`veterinary-clinic.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, config),
    ])
      .then(([typesRes, clinicsRes]) => {
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
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
  }, [token, modal])

  useEffect(() => {
    handleSubmit(listItems)()
  }, [refresh.ref])

  return (
    <>
      <Helmet>
        <title>Consultas - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <CalendarHeartIcon />
            Consultas
          </CardTitle>
          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportAppointments('csv')}
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
              onClick={() => exportAppointments('xlsx')}
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
              onClick={() => exportAppointments('pdf')}
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
                <span>Nova consulta</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardContent>
          <FormProvider {...filterForm}>
            <form onSubmit={handleSubmit(listItems)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div>
                  <Form.Label htmlFor="animalName">Animal</Form.Label>
                  <Form.Input type="search" name="animalName" />
                  <Form.ErrorMessage field="animalName" />
                </div>
                <div>
                  <Form.Label htmlFor="appointmentTypeId">Tipo</Form.Label>
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
                  <Form.Label htmlFor="clinicId">Clínica</Form.Label>
                  <Form.Select name="clinicId" type="number" isClearable placeholder="Todas" options={clinicOptions} />
                  <Form.ErrorMessage field="clinicId" />
                </div>
              </div>
              <div className="mb-6 grid gap-4 lg:grid-cols-4">
                <div>
                  <Form.Label htmlFor="consultationType">Modalidade</Form.Label>
                  <Form.Select
                    name="consultationType"
                    isClearable
                    placeholder="Todas"
                    options={consultationTypeOptions}
                  />
                  <Form.ErrorMessage field="consultationType" />
                </div>
                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" isClearable placeholder="Todos" options={statusOptions} />
                  <Form.ErrorMessage field="status" />
                </div>
                <div>
                  <Form.Label htmlFor="appointmentDateStart">Data inicial</Form.Label>
                  <Form.DateInput name="appointmentDateStart" />
                  <Form.ErrorMessage field="appointmentDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="appointmentDateEnd">Data final</Form.Label>
                  <Form.DateInput name="appointmentDateEnd" />
                  <Form.ErrorMessage field="appointmentDateEnd" />
                </div>
              </div>
              <CardFooter className="gap-4 p-0">
                <Button
                  type="button"
                  variant="success"
                  disabled={selectedIds.length === 0 || batchLoading !== null}
                  onClick={confirmAppointmentsBatch}
                >
                  {batchLoading === 'confirm' ? (
                    <Spinner />
                  ) : (
                    <>
                      <CheckCircle2Icon className="mr-2 h-5 w-5" />
                      Confirmar realizadas
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={selectedIds.length === 0 || batchLoading !== null}
                  onClick={cancelAppointmentsBatch}
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{item.appointmentTypeName ?? ''}</TableCell>
                    <TableCell>{formatDateTime(item.appointmentDate)}</TableCell>
                    <TableCell>{appointmentStatusBadge(item.status, item.appointmentDate)}</TableCell>
                    <TableCell>
                      <ActionsList
                        values={item}
                        primaryKey="id"
                        actions={[
                          {
                            title: 'Editar',
                            icon: PencilIcon,
                            action: '/consultas/:id',
                            hideWhen: (currentItem) => currentItem.status !== 'agendado',
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
              {items.length === 0 && <TableCaption>Nenhuma consulta encontrada.</TableCaption>}
            </SelectableTable>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('consultas', getValues('page'), pages, total)}
            </span>
            {selectedIds.length > 0 && (
              <span className="text-sm dark:text-gray-300">{selectedIds.length} item(s) selecionado(s).</span>
            )}
            <Pagination
              current={getValues('page')}
              total={pages}
              changePage={(currentPage) => {
                setValue('page', currentPage)
                refresh.force()
              }}
            />
          </div>
        </div>
      </Card>
    </>
  )
}

function appointmentStatusBadge(status: string, appointmentDate: string) {
  const isPending = status === 'agendado' && new Date(appointmentDate) < new Date()
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
