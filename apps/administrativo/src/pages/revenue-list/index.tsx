import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CircleDollarSignIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
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
import { formatDate } from '../../helpers/date'
import { resolveFileUrl } from '../../helpers/file-url'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface RevenueListValues {
  id: number
  transactionTypeId: number
  description: string
  value: number
  createdAt: string
  status: string
  reversalDate?: string | null
  proof?: string | null
  transactionTypeName?: string
  campaignTitle?: string | null
  animalName?: string | null
  employeeName?: string | null
}

interface SelectOption {
  value: number
  label: string
}

const revenueStatusOptions = [
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'estornado', label: 'Estornado' },
]

const revenueFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    description: z.string().nullish(),
    animalName: z.string().nullish(),
    transactionTypeId: z.number().nullish(),
    campaignId: z.number().nullish(),
    employeeId: z.number().nullish(),
    status: z.string().nullish(),
    createdAtStart: z.string().optional(),
    createdAtEnd: z.string().optional(),
    dueDateStart: z.string().optional(),
    dueDateEnd: z.string().optional(),
    reversalDateStart: z.string().optional(),
    reversalDateEnd: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.createdAtStart || !data.createdAtEnd) return true
      return new Date(data.createdAtStart) <= new Date(data.createdAtEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['createdAtEnd'],
    },
  )
  .refine(
    (data) => {
      if (!data.dueDateStart || !data.dueDateEnd) return true
      return new Date(data.dueDateStart) <= new Date(data.dueDateEnd)
    },
    {
      message: 'A data inicial de vencimento deve ser menor ou igual à data final.',
      path: ['dueDateEnd'],
    },
  )
  .refine(
    (data) => {
      if (!data.reversalDateStart || !data.reversalDateEnd) return true
      return new Date(data.reversalDateStart) <= new Date(data.reversalDateEnd)
    },
    {
      message: 'A data inicial de estorno deve ser menor ou igual à data final.',
      path: ['reversalDateEnd'],
    },
  )

type RevenueFilterData = z.infer<typeof revenueFilterSchema>

export const RevenueList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<RevenueListValues[]>([])
  const [total, setTotal] = useState(0)
  const [transactionTypeOptions, setTransactionTypeOptions] = useState<SelectOption[]>([])
  const [campaignOptions, setCampaignOptions] = useState<SelectOption[]>([])
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchLoading, setBatchLoading] = useState(false)

  const selectableItems = items.filter((item) => item.status === 'estornado')
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id))

  const revenueFilterForm = useForm<RevenueFilterData>({
    resolver: zodResolver(revenueFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields:
        'id,transactionTypeId,description,value,createdAt,status,reversalDate,proof,transactionTypeName,campaignTitle,animalName,employeeName',
      sort: '-createdAt',
      description: '',
      animalName: '',
      transactionTypeId: null,
      campaignId: null,
      employeeId: null,
      status: null,
      createdAtStart: '',
      createdAtEnd: '',
      dueDateStart: '',
      dueDateEnd: '',
      reversalDateStart: '',
      reversalDateEnd: '',
    },
  })

  const { handleSubmit, getValues, setValue } = revenueFilterForm
  const page = getValues('page')
  const perPage = getValues('perPage')
  const pages = Math.ceil(total / perPage) || 1

  useEffect(() => {
    setSelectedIds([])
  }, [items])

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? selectableItems.map((i) => i.id) : [])
  }

  function handleSelectItem(id: number, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const removeRevenue = useCallback(
    (values: RevenueListValues) => {
      modal.confirm({
        title: 'Remover receita',
        message: `Deseja remover a receita "${values.description}"?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`revenue.delete/${values.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(() => {
                toast.success('Registro removido com sucesso!')
                refresh.force()
              })
              .catch((err) => toast.error(errorMessageHandler(err)))
          }
        },
      })
    },
    [token, modal, refresh],
  )

  const reverseRevenue = useCallback(
    (values: RevenueListValues) => {
      modal.confirm({
        title: 'Estornar receita',
        message: `Deseja estornar a receita "${values.description}"?`,
        confirmText: 'Estornar',
        callback: async (confirmed) => {
          if (!confirmed) return
          try {
            await api.post('revenue.reverse', { id: values.id }, { headers: { Authorization: `Bearer ${token}` } })
            toast.success('Receita estornada com sucesso.')
            refresh.force()
          } catch (error) {
            toast.error(errorMessageHandler(error))
          }
        },
      })
    },
    [token, modal, refresh],
  )

  function confirmRevenueBatch() {
    modal.confirm({
      title: 'Confirmar recebimento',
      message: `Deseja confirmar o recebimento de ${selectedIds.length} receita(s) selecionada(s)?`,
      confirmText: 'Confirmar recebimento',
      callback: async (confirmed) => {
        if (!confirmed) return
        setBatchLoading(true)
        try {
          await api.post('revenue.confirm', { ids: selectedIds }, { headers: { Authorization: `Bearer ${token}` } })
          toast.success(`${selectedIds.length} receita(s) confirmada(s) com sucesso.`)
          setSelectedIds([])
          refresh.force()
        } catch (error) {
          toast.error(errorMessageHandler(error))
        } finally {
          setBatchLoading(false)
        }
      },
    })
  }

  async function listRevenues(values: RevenueFilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`revenue.list?${toQueryString(values)}`, {
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
      api.get(
        `transaction-type.list?${toQueryString({ categoryIds: 'receita', page: 0, fields: 'id,name,active' })}`,
        config,
      ),
      api.get(`campaign.list?${toQueryString({ page: 0, fields: 'id,title', sort: '-startDate' })}`, config),
      api.get(`employee.list?${toQueryString({ page: 0, fields: 'id,name', sort: 'name' })}`, config),
    ])
      .then(([typesRes, campaignsRes, employeesRes]) => {
        const types = Array.isArray(typesRes.data) ? typesRes.data : []
        setTransactionTypeOptions(
          types
            .filter((item: { active: boolean }) => item.active)
            .map((item: { id: number; name: string }) => ({
              value: item.id,
              label: item.name,
            })),
        )

        const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : []
        setCampaignOptions(
          campaigns.map((item: { id: number; title: string }) => ({ value: item.id, label: item.title })),
        )

        const employees = Array.isArray(employeesRes.data) ? employeesRes.data : []
        setEmployeeOptions(
          employees.map((item: { id: number; name: string }) => ({ value: item.id, label: item.name })),
        )
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
  }, [token, modal])

  useEffect(() => {
    handleSubmit(listRevenues)()
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
        `revenue.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'receitas', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }
  return (
    <>
      <Helmet>
        <title>Receitas - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <CircleDollarSignIcon />
            Receitas
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
                <span>Nova receita</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...revenueFilterForm}>
            <form onSubmit={handleSubmit(listRevenues)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-4">
                <div>
                  <Form.Label htmlFor="description">Descrição</Form.Label>
                  <Form.Input type="search" name="description" />
                  <Form.ErrorMessage field="description" />
                </div>
                <div>
                  <Form.Label htmlFor="transactionTypeId">Tipo de receita</Form.Label>
                  <Form.Select
                    name="transactionTypeId"
                    type="number"
                    isClearable
                    placeholder="Todos"
                    options={transactionTypeOptions}
                  />
                  <Form.ErrorMessage field="transactionTypeId" />
                </div>
                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" isClearable placeholder="Todos" options={revenueStatusOptions} />
                  <Form.ErrorMessage field="status" />
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

              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                <div>
                  <Form.Label htmlFor="campaignId">Campanha</Form.Label>
                  <Form.Select
                    name="campaignId"
                    type="number"
                    isClearable
                    placeholder="Todas"
                    options={campaignOptions}
                  />
                  <Form.ErrorMessage field="campaignId" />
                </div>
                <div>
                  <Form.Label htmlFor="animalName">Animal</Form.Label>
                  <Form.Input type="search" name="animalName" />
                  <Form.ErrorMessage field="animalName" />
                </div>
                <div>
                  <Form.Label htmlFor="createdAtStart">Data inicial</Form.Label>
                  <Form.DateInput name="createdAtStart" />
                  <Form.ErrorMessage field="createdAtStart" />
                </div>
                <div>
                  <Form.Label htmlFor="createdAtEnd">Data final</Form.Label>
                  <Form.DateInput name="createdAtEnd" />
                  <Form.ErrorMessage field="createdAtEnd" />
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                <div>
                  <Form.Label htmlFor="dueDateStart">Data inicial vencimento</Form.Label>
                  <Form.DateInput name="dueDateStart" />
                  <Form.ErrorMessage field="dueDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="dueDateEnd">Data final vencimento</Form.Label>
                  <Form.DateInput name="dueDateEnd" />
                  <Form.ErrorMessage field="dueDateEnd" />
                </div>
                <div>
                  <Form.Label htmlFor="reversalDateStart">Data inicial estorno</Form.Label>
                  <Form.DateInput name="reversalDateStart" />
                  <Form.ErrorMessage field="reversalDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="reversalDateEnd">Data final estorno</Form.Label>
                  <Form.DateInput name="reversalDateEnd" />
                  <Form.ErrorMessage field="reversalDateEnd" />
                </div>
              </div>

              <CardFooter className="mt-6 flex flex-wrap gap-3 p-0">
                <Button
                  type="button"
                  variant="success"
                  disabled={selectedIds.length === 0 || batchLoading}
                  onClick={confirmRevenueBatch}
                >
                  {batchLoading ? <Spinner /> : <span>Confirmar Recebimento</span>}
                </Button>

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
                  <TableHead className="w-[1%]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Por</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estorno</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="w-[1%]">
                      {item.status === 'estornado' ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="h-4 w-4 cursor-pointer"
                        />
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-50 truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell>{item.transactionTypeName ?? `#${item.transactionTypeId}`}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Number(item.value),
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="max-w-45 truncate" title={item.campaignTitle ?? ''}>
                      {item.campaignTitle ?? ''}
                    </TableCell>
                    <TableCell className="max-w-45 truncate" title={item.animalName ?? ''}>
                      {item.animalName ?? ''}
                    </TableCell>
                    <TableCell>{item.employeeName ?? ''}</TableCell>
                    <TableCell>{revenueStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.reversalDate ? formatDate(item.reversalDate) : ''}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          {
                            icon: PencilIcon,
                            title: 'Editar',
                            action: ':id',
                            hideWhen: (item) => item.status === 'confirmado',
                          },
                          {
                            icon: DownloadIcon,
                            title: 'Baixar comprovante',
                            action: (item) => window.open(resolveFileUrl(item.proof!, appConfig.API_URL), '_blank'),
                            hideWhen: (item) => !item.proof,
                          },
                          {
                            icon: RotateCcwIcon,
                            title: 'Estornar',
                            action: reverseRevenue,
                            hideWhen: (item) => item.status !== 'confirmado',
                          },
                          {
                            icon: XIcon,
                            title: 'Remover',
                            action: removeRevenue,
                            hideWhen: (item) => item.status === 'confirmado',
                          },
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
            <span className="text-sm dark:text-gray-300">{itemCountMessage('receitas', page, pages, total)}</span>
            {selectedIds.length > 0 && (
              <span className="text-sm dark:text-gray-300">{selectedIds.length} item(s) selecionado(s).</span>
            )}
            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}

function revenueStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'warning' | 'success' | 'outline' }> = {
    confirmado: { label: 'Confirmado', variant: 'success' },
    estornado: { label: 'Estornado', variant: 'warning' },
  }
  const config = map[status]
  if (!config) return <Badge variant="outline">{status}</Badge>
  return <Badge variant={config.variant}>{config.label}</Badge>
}
