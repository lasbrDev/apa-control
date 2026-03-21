import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileSpreadsheetIcon, FileTextIcon, PencilIcon, PlusIcon, SearchIcon, SyringeIcon, XIcon } from 'lucide-react'
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
  procedureTypeName?: string | null
  procedureDate: string
  status: string
  actualCost: number
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

  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const toDateInput = (date: Date) => date.toISOString().split('T')[0]

  const form = useForm<FilterData>({
    resolver: zodResolver(schema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,animalName,procedureTypeName,procedureDate,status,actualCost',
      sort: '-procedureDate',
      animalName: '',
      procedureTypeId: null,
      status: null,
      procedureDateStart: toDateInput(monthAgo),
      procedureDateEnd: toDateInput(today),
    },
  })
  const { handleSubmit, getValues, setValue } = form
  const pages = Math.ceil(total / getValues('perPage')) || 1

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
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
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
      modal.alert(errorMessageHandler(error))
    }
    setFetching(false)
  }

  async function exportClinicalProcedures(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `clinical-procedure.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
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
    api
      .get(`procedure-type.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setProcedureTypeOptions(
          (Array.isArray(res.data) ? res.data : [])
            .filter((i: { active: boolean }) => i.active)
            .map((i: { id: number; name: string }) => ({ value: i.id, label: i.name })),
        ),
      )
      .catch((error) => modal.alert(errorMessageHandler(error)))
  }, [token, modal])

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
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="procedureDateStart">Data inicial</Form.Label>
                  <Form.Input type="date" name="procedureDateStart" />
                  <Form.ErrorMessage field="procedureDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="procedureDateEnd">Data final</Form.Label>
                  <Form.Input type="date" name="procedureDateEnd" />
                  <Form.ErrorMessage field="procedureDateEnd" />
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
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.animalName ?? '-'}</TableCell>
                    <TableCell>{item.procedureTypeName ?? '-'}</TableCell>
                    <TableCell>{new Date(item.procedureDate).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      {Number(item.actualCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>
                      <ActionsList
                        values={item}
                        primaryKey="id"
                        actions={[
                          { title: 'Editar', icon: PencilIcon, action: '/procedimentos/:id' },
                          { title: 'Remover', icon: XIcon, action: () => removeItem(item) },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {items.length === 0 && <TableCaption>Nenhum procedimento encontrado.</TableCaption>}
            </Table>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('procedimentos', getValues('page'), pages, total)}
            </span>
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
