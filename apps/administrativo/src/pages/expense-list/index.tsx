import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  ReceiptIcon,
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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { appConfig } from '../../config'
import { errorMessageHandler } from '../../helpers/axios'
import { formatDate } from '../../helpers/date'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface ExpenseListValues {
  id: number
  transactionTypeId: number
  description: string
  value: number
  createdAt: string
  status: string
  paymentDate?: string | null
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

const expenseStatusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const expenseFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    description: z.string().nullish(),
    transactionTypeId: z.number().nullish(),
    campaignId: z.number().nullish(),
    animalId: z.number().nullish(),
    status: z.string().nullish(),
    createdAtStart: z.string().optional(),
    createdAtEnd: z.string().optional(),
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

type ExpenseFilterData = z.infer<typeof expenseFilterSchema>

export const ExpenseList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<ExpenseListValues[]>([])
  const [total, setTotal] = useState(0)
  const [transactionTypeOptions, setTransactionTypeOptions] = useState<SelectOption[]>([])
  const [campaignOptions, setCampaignOptions] = useState<SelectOption[]>([])
  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchLoading, setBatchLoading] = useState(false)

  const selectableItems = items.filter((item) => item.status === 'pendente')
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id))

  const expenseFilterForm = useForm<ExpenseFilterData>({
    resolver: zodResolver(expenseFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields:
        'id,transactionTypeId,description,value,createdAt,status,paymentDate,proof,transactionTypeName,campaignTitle,animalName,employeeName',
      sort: '-createdAt',
      description: '',
      transactionTypeId: null,
      campaignId: null,
      animalId: null,
      status: null,
      createdAtStart: '',
      createdAtEnd: '',
    },
  })

  const { handleSubmit, getValues, setValue } = expenseFilterForm
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

  const removeExpense = useCallback(
    (values: ExpenseListValues) => {
      modal.confirm({
        title: 'Remover despesa',
        message: `Deseja remover a despesa "${values.description}"?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`expense.delete/${values.id}`, {
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

  function cancelBatch() {
    modal.confirm({
      title: 'Registrar cancelamento',
      message: `Deseja cancelar ${selectedIds.length} despesa(s) selecionada(s)?`,
      confirmText: 'Cancelar despesas',
      callback: async (confirmed) => {
        if (!confirmed) return
        setBatchLoading(true)
        try {
          await api.post('expense.cancel', { ids: selectedIds }, { headers: { Authorization: `Bearer ${token}` } })
          toast.success(`${selectedIds.length} despesa(s) cancelada(s) com sucesso.`)
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

  function confirmPaymentBatch() {
    modal.confirm({
      title: 'Registrar pagamento',
      message: `Deseja confirmar o pagamento de ${selectedIds.length} despesa(s) selecionada(s)?`,
      confirmText: 'Confirmar pagamento',
      callback: async (confirmed) => {
        if (!confirmed) return
        setBatchLoading(true)
        try {
          await api.post(
            'expense.confirmPayment',
            { ids: selectedIds },
            { headers: { Authorization: `Bearer ${token}` } },
          )
          toast.success(`${selectedIds.length} despesa(s) confirmada(s) com sucesso.`)
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

  async function listExpenses(values: ExpenseFilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`expense.list?${toQueryString(values)}`, {
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
        `transaction-type.list?${toQueryString({ categoryIds: 'despesa', page: 0, fields: 'id,name,active' })}`,
        config,
      ),
      api.get(`campaign.list?${toQueryString({ page: 0, fields: 'id,title', sort: '-startDate' })}`, config),
      api.get(`animal.list?${toQueryString({ page: 0, perPage: 500, fields: 'id,name', sort: 'name' })}`, config),
    ])
      .then(([typesRes, campaignsRes, animalsRes]) => {
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

        const animals = Array.isArray(animalsRes.data) ? animalsRes.data : []
        setAnimalOptions(animals.map((item: { id: number; name: string }) => ({ value: item.id, label: item.name })))
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
  }, [token, modal])

  useEffect(() => {
    handleSubmit(listExpenses)()
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
        `expense.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'despesas', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }
  return (
    <>
      <Helmet>
        <title>Despesas - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <ReceiptIcon />
            Despesas
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
                <span>Nova despesa</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...expenseFilterForm}>
            <form onSubmit={handleSubmit(listExpenses)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-3 2xl:grid-cols-3">
                <div>
                  <Form.Label htmlFor="description">Descrição</Form.Label>
                  <Form.Input type="search" name="description" />
                  <Form.ErrorMessage field="description" />
                </div>
                <div>
                  <Form.Label htmlFor="transactionTypeId">Tipo de despesa</Form.Label>
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
                  <Form.Select name="status" isClearable placeholder="Todos" options={expenseStatusOptions} />
                  <Form.ErrorMessage field="status" />
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
                  <Form.Label htmlFor="animalId">Animal</Form.Label>
                  <Form.Select name="animalId" type="number" isClearable placeholder="Todos" options={animalOptions} />
                  <Form.ErrorMessage field="animalId" />
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

              <CardFooter className="mt-6 flex flex-wrap gap-3 p-0">
                <Button
                  type="button"
                  variant="danger"
                  disabled={selectedIds.length === 0 || batchLoading}
                  onClick={cancelBatch}
                >
                  {batchLoading ? <Spinner /> : <span>Registrar Cancelamento</span>}
                </Button>
                <Button
                  type="button"
                  variant="success"
                  disabled={selectedIds.length === 0 || batchLoading}
                  onClick={confirmPaymentBatch}
                >
                  {batchLoading ? <Spinner /> : <span>Registrar Pagamento</span>}
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
            <Table>
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
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Pagamento</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="w-[1%]">
                      {item.status === 'pendente' ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="h-4 w-4 cursor-pointer"
                        />
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell>{item.transactionTypeName ?? `#${item.transactionTypeId}`}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Number(item.value),
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{item.employeeName ?? ''}</TableCell>
                    <TableCell>{expenseStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.paymentDate ? formatDate(item.paymentDate) : ''}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          {
                            icon: DownloadIcon,
                            title: 'Baixar comprovante',
                            action: (item) => window.open(`${appConfig.API_URL}${item.proof}`, '_blank'),
                            hideWhen: (item) => !item.proof,
                          },
                          { icon: XIcon, title: 'Remover', action: removeExpense },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {items.length === 0 && <TableCaption>Nenhum item foi encontrado.</TableCaption>}
            </Table>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">{itemCountMessage('despesas', page, pages, total)}</span>
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

function expenseStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
    pendente: { label: 'Pendente', variant: 'warning' },
    confirmado: { label: 'Confirmado', variant: 'success' },
    cancelado: { label: 'Cancelado', variant: 'danger' },
  }
  const config = map[status]
  if (!config) return <Badge variant="outline">{status}</Badge>
  return <Badge variant={config.variant}>{config.label}</Badge>
}
