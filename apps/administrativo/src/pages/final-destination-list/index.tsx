import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FlagIcon,
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
import { formatDate } from '../../helpers/date'
import { resolveFileUrl } from '../../helpers/file-url'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface FinalDestinationListValues {
  id: number
  animalId: number
  destinationTypeId: number
  employeeId: number
  destinationDate: string
  reason: string
  observations: string | null
  proof: string | null
  animalName?: string
  destinationTypeName?: string
  employeeName?: string
}

interface SelectOption {
  value: number
  label: string
}

const finalDestinationFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    animalName: z.string().nullish(),
    destinationTypeId: z.number().nullish(),
    employeeId: z.number().nullish(),
    destinationDateStart: z.string().optional(),
    destinationDateEnd: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.destinationDateStart || !data.destinationDateEnd) return true
      return new Date(data.destinationDateStart) <= new Date(data.destinationDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['destinationDateEnd'],
    },
  )

type FinalDestinationFilterData = z.infer<typeof finalDestinationFilterSchema>

export const FinalDestinationList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<FinalDestinationListValues[]>([])
  const [total, setTotal] = useState(0)
  const [destinationTypeOptions, setDestinationTypeOptions] = useState<SelectOption[]>([])
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([])

  const finalDestinationFilterForm = useForm<FinalDestinationFilterData>({
    resolver: zodResolver(finalDestinationFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields:
        'id,animalId,destinationTypeId,employeeId,destinationDate,reason,proof,animalName,destinationTypeName,employeeName',
      sort: '-destinationDate',
      animalName: '',
      destinationTypeId: null,
      employeeId: null,
      destinationDateStart: '',
      destinationDateEnd: '',
    },
  })

  const { handleSubmit, getValues, setValue } = finalDestinationFilterForm
  const page = getValues('page')
  const perPage = getValues('perPage')
  const pages = Math.ceil(total / perPage) || 1

  const removeFinalDestination = useCallback(
    (values: FinalDestinationListValues) => {
      modal.confirm({
        title: 'Remover destino final',
        message: `Deseja remover o destino final de ${values.animalName ?? `#${values.animalId}`}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`final-destination.delete/${values.id}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(() => {
                toast.success('Registro removido com sucesso!')
                refresh.force()
              })
              .catch((err) => toast.error(errorMessageHandler(err)))
          }
        },
      })
    },
    [token],
  )

  async function listFinalDestinations(values: FinalDestinationFilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`final-destination.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
    setFetching(false)
  }

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    Promise.all([
      api.get('final-destination-type.list', config),
      api.get(`employee.list?${toQueryString({ page: 0, fields: 'id,name', sort: 'name' })}`, config),
    ])
      .then(([typeResponse, employeeResponse]) => {
        const types = Array.isArray(typeResponse.data) ? typeResponse.data : []
        setDestinationTypeOptions(
          types.filter((item) => item.active).map((item) => ({ value: item.id, label: item.name })),
        )

        const employees = Array.isArray(employeeResponse.data) ? employeeResponse.data : []
        setEmployeeOptions(employees.map((item) => ({ value: item.id, label: item.name })))
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
  }, [])

  useEffect(() => {
    handleSubmit(listFinalDestinations)()
  }, [refresh.ref])

  function changePage(currentPage: number) {
    setValue('page', currentPage)
    refresh.force()
  }

  async function exportItems(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `final-destination.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'destinos-finais', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }
  return (
    <>
      <Helmet>
        <title>Destino Final - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <FlagIcon />
            Destino Final
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
                <span>Novo Destino Final</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...finalDestinationFilterForm}>
            <form onSubmit={handleSubmit(listFinalDestinations)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-3 2xl:grid-cols-3">
                <div>
                  <Form.Label htmlFor="animalName">Nome do animal</Form.Label>
                  <Form.Input type="search" name="animalName" />
                  <Form.ErrorMessage field="animalName" />
                </div>

                <div>
                  <Form.Label htmlFor="destinationTypeId">Tipo de destino</Form.Label>
                  <Form.Select
                    name="destinationTypeId"
                    type="number"
                    isClearable
                    placeholder="Todos"
                    options={destinationTypeOptions}
                  />
                  <Form.ErrorMessage field="destinationTypeId" />
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

              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="destinationDateStart">Data inicial</Form.Label>
                  <Form.DateInput name="destinationDateStart" />
                  <Form.ErrorMessage field="destinationDateStart" />
                </div>

                <div>
                  <Form.Label htmlFor="destinationDateEnd">Data final</Form.Label>
                  <Form.DateInput name="destinationDateEnd" />
                  <Form.ErrorMessage field="destinationDateEnd" />
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
        </CardContent>

        <div>
          <Separator />

          <div className="relative">
            <SelectableTable>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Tipo de destino</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Por</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.animalName ?? `#${item.animalId}`}</TableCell>
                    <TableCell>{item.destinationTypeName ?? `#${item.destinationTypeId}`}</TableCell>
                    <TableCell>{item.destinationDate ? formatDate(item.destinationDate) : ''}</TableCell>
                    <TableCell className="max-w-55 truncate" title={item.reason}>
                      {item.reason}
                    </TableCell>
                    <TableCell>{item.employeeName ?? `#${item.employeeId}`}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          {
                            icon: DownloadIcon,
                            title: 'Baixar comprovante',
                            action: (item) => window.open(resolveFileUrl(item.proof!, appConfig.API_URL), '_blank'),
                            hideWhen: (item) => !item.proof,
                          },
                          { icon: XIcon, title: 'Remover', action: removeFinalDestination },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {items.length === 0 && <TableCaption>Nenhum item foi encontrado.</TableCaption>}
            </SelectableTable>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('destinos finais', page, pages, total)}
            </span>
            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}
