import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangleIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
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
import { formatDateTime } from '../../helpers/date'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface Item {
  id: number
  animalName?: string | null
  occurrenceTypeName?: string | null
  occurrenceDate: string
  description: string
}
interface SelectOption {
  value: number
  label: string
}

const schema = z.object({
  fields: z.string(),
  page: z.number(),
  perPage: z.number(),
  sort: z.string().optional(),
  animalName: z.string().nullish(),
  occurrenceTypeId: z.number().nullish(),
  occurrenceDateStart: z.string().optional(),
  occurrenceDateEnd: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const OccurrenceList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [typeOptions, setTypeOptions] = useState<SelectOption[]>([])

  const form = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,animalName,occurrenceTypeName,occurrenceDate,description',
      sort: '-occurrenceDate',
      animalName: '',
      occurrenceTypeId: null,
      occurrenceDateStart: '',
      occurrenceDateEnd: '',
    },
  })
  const { handleSubmit, getValues, setValue } = form
  const pages = Math.ceil(total / getValues('perPage')) || 1

  const removeItem = useCallback(
    (item: Item) => {
      modal.confirm({
        title: 'Remover ocorrência',
        message: `Deseja remover a ocorrência ${item.animalName ?? `#${item.id}`}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`occurrence.delete/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(refresh.force)
              .catch((error) => modal.alert(errorMessageHandler(error)))
          }
        },
      })
    },
    [modal, refresh, token],
  )

  async function listItems(values: Data) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`occurrence.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(Array.isArray(data) ? data : [])
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    }
    setFetching(false)
  }

  async function exportItems(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `occurrence.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'ocorrencias', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    api
      .get(`occurrence-type.list?${toQueryString({ page: 0, fields: 'id,name,active' })}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) =>
        setTypeOptions(
          (Array.isArray(data) ? data : [])
            .filter((i: { active: boolean }) => i.active)
            .map((i: { id: number; name: string }) => ({ value: i.id, label: i.name })),
        ),
      )
      .catch((error) => modal.alert(errorMessageHandler(error)))
  }, [token, modal])

  useEffect(() => {
    handleSubmit(listItems)()
  }, [refresh.ref])

  return (
    <>
      <Helmet>
        <title>Ocorrências - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <AlertTriangleIcon />
            Ocorrências
          </CardTitle>
          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportItems('csv')}
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
              onClick={() => exportItems('xlsx')}
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
            <Button type="button" variant="danger" disabled={downloading === 'pdf'} onClick={() => exportItems('pdf')}>
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
                <span>Nova ocorrência</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(listItems)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-4">
                <div>
                  <Form.Label htmlFor="animalName">Animal</Form.Label>
                  <Form.Input type="search" name="animalName" />
                  <Form.ErrorMessage field="animalName" />
                </div>
                <div>
                  <Form.Label htmlFor="occurrenceTypeId">Tipo</Form.Label>
                  <Form.Select
                    name="occurrenceTypeId"
                    type="number"
                    isClearable
                    placeholder="Todos"
                    options={typeOptions}
                  />
                  <Form.ErrorMessage field="occurrenceTypeId" />
                </div>
                <div>
                  <Form.Label htmlFor="occurrenceDateStart">Data inicial</Form.Label>
                  <Form.DateInput name="occurrenceDateStart" />
                  <Form.ErrorMessage field="occurrenceDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="occurrenceDateEnd">Data final</Form.Label>
                  <Form.DateInput name="occurrenceDateEnd" />
                  <Form.ErrorMessage field="occurrenceDateEnd" />
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.animalName ?? ''}</TableCell>
                    <TableCell>{item.occurrenceTypeName ?? ''}</TableCell>
                    <TableCell>{formatDateTime(item.occurrenceDate)}</TableCell>
                    <TableCell className="max-w-[400px] truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <ActionsList
                        values={item}
                        primaryKey="id"
                        actions={[
                          { title: 'Editar', icon: PencilIcon, action: '/ocorrencias/:id' },
                          { title: 'Remover', icon: XIcon, action: () => removeItem(item) },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {items.length === 0 && <TableCaption>Nenhuma ocorrência encontrada.</TableCaption>}
            </Table>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('ocorrências', getValues('page'), pages, total)}
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
