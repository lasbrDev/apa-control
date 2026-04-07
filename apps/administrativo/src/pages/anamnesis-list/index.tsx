import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ClipboardListIcon,
  DownloadIcon,
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
import { appConfig } from '../../config'
import { errorMessageHandler } from '../../helpers/axios'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface Item {
  id: number
  appointmentId: number
  animalName?: string | null
  appointmentDate?: string | null
  employeeName?: string | null
  symptomsPresented: string
  proof?: string | null
}

const schema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    animalName: z.string().nullish(),
    createdDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    createdDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.createdDateStart || !data.createdDateEnd) return true
      return new Date(data.createdDateStart) <= new Date(data.createdDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['createdDateEnd'],
    },
  )
type FilterData = z.infer<typeof schema>

export const AnamnesisList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)

  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const toDateInput = (date: Date) => date.toISOString().split('T')[0]

  const form = useForm<FilterData>({
    resolver: zodResolver(schema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,animalName,appointmentDate,employeeName,symptomsPresented,proof',
      sort: '-createdAt',
      animalName: '',
      createdDateStart: toDateInput(monthAgo),
      createdDateEnd: toDateInput(today),
    },
  })
  const { handleSubmit, getValues, setValue } = form
  const pages = Math.ceil(total / getValues('perPage')) || 1

  const removeItem = useCallback(
    (item: Item) => {
      modal.confirm({
        title: 'Remover anamnese',
        message: `Deseja remover a anamnese #${item.id}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`anamnesis.delete/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
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
      const { data, headers } = await api.get(`anamnesis.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(Array.isArray(data) ? data : [])
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    }
    setFetching(false)
  }

  async function exportAnamneses(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `anamnesis.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'anamneses', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    handleSubmit(list)()
  }, [refresh.ref])

  return (
    <>
      <Helmet>
        <title>Anamnese - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <ClipboardListIcon />
            Anamnese
          </CardTitle>
          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportAnamneses('csv')}
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
              onClick={() => exportAnamneses('xlsx')}
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
              onClick={() => exportAnamneses('pdf')}
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
                <span>Nova anamnese</span>
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
                  <Form.Label htmlFor="createdDateStart">Data inicial</Form.Label>
                  <Form.DateInput name="createdDateStart" />
                  <Form.ErrorMessage field="createdDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="createdDateEnd">Data final</Form.Label>
                  <Form.DateInput name="createdDateEnd" />
                  <Form.ErrorMessage field="createdDateEnd" />
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
                  <TableHead>Consulta</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Sintomas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>#{item.appointmentId}</TableCell>
                    <TableCell>{item.animalName ?? ''}</TableCell>
                    <TableCell className="max-w-[320px] truncate">{item.symptomsPresented}</TableCell>
                    <TableCell>
                      <ActionsList
                        values={item}
                        primaryKey="id"
                        actions={[
                          { title: 'Editar', icon: PencilIcon, action: '/anamnese/:id' },
                          {
                            title: 'Baixar arquivo',
                            icon: DownloadIcon,
                            action: (i) => window.open(`${appConfig.API_URL}${i.proof}`, '_blank'),
                            hideWhen: (i) => !i.proof,
                          },
                          { title: 'Remover', icon: XIcon, action: () => removeItem(item) },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {items.length === 0 && <TableCaption>Nenhuma anamnese encontrada.</TableCaption>}
            </Table>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('anamneses', getValues('page'), pages, total)}
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
