import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarHeartIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { Form } from '../../components/form-hook'
import { ActionsList } from '../../components/list/ActionList'
import { Pagination } from '../../components/list/Pagination'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Spinner } from '../../components/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
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

  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const toDateInput = (date: Date) => date.toISOString().split('T')[0]

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
      appointmentDateStart: toDateInput(monthAgo),
      appointmentDateEnd: toDateInput(today),
    },
  })
  const { handleSubmit, getValues, setValue } = filterForm
  const pages = Math.ceil(total / getValues('perPage')) || 1

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
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
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
      modal.alert(errorMessageHandler(error))
    }
    setFetching(false)
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
      .catch((error) => modal.alert(errorMessageHandler(error)))
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
                  <Form.Input type="date" name="appointmentDateStart" />
                  <Form.ErrorMessage field="appointmentDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="appointmentDateEnd">Data final</Form.Label>
                  <Form.Input type="date" name="appointmentDateEnd" />
                  <Form.ErrorMessage field="appointmentDateEnd" />
                </div>
              </div>
              <CardFooter className="gap-4 p-0">
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
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell>{item.animalName ?? ''}</TableCell>
                    <TableCell>{item.appointmentTypeName ?? ''}</TableCell>
                    <TableCell>{new Date(item.appointmentDate).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      <ActionsList
                        values={item}
                        primaryKey="id"
                        actions={[
                          { title: 'Editar', icon: PencilIcon, action: '/consultas/:id' },
                          { title: 'Remover', icon: XIcon, action: () => removeItem(item) },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {items.length === 0 && <TableCaption>Nenhuma consulta encontrada.</TableCaption>}
            </Table>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('consultas', getValues('page'), pages, total)}
            </span>
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
