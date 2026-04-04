import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CircleDollarSignIcon,
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

interface RevenueListValues {
  id: number
  transactionTypeId: number
  description: string
  value: number
  createdAt: string
  status: string
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
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const revenueFilterSchema = z
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
  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([])

  const revenueFilterForm = useForm<RevenueFilterData>({
    resolver: zodResolver(revenueFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields:
        'id,transactionTypeId,description,value,createdAt,status,transactionTypeName,campaignTitle,animalName,employeeName',
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

  const { handleSubmit, getValues, setValue } = revenueFilterForm
  const page = getValues('page')
  const perPage = getValues('perPage')
  const pages = Math.ceil(total / perPage) || 1

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
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
          }
        },
      })
    },
    [token, modal, refresh],
  )

  async function listRevenues(values: RevenueFilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`revenue.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
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
      .catch((error) => modal.alert(errorMessageHandler(error)))
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
              <div className="mb-6 grid gap-4 lg:grid-cols-3 2xl:grid-cols-3">
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
                  <Form.Input type="date" name="createdAtStart" />
                  <Form.ErrorMessage field="createdAtStart" />
                </div>
                <div>
                  <Form.Label htmlFor="createdAtEnd">Data final</Form.Label>
                  <Form.Input type="date" name="createdAtEnd" />
                  <Form.ErrorMessage field="createdAtEnd" />
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[200px] truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell>{item.transactionTypeName ?? `#${item.transactionTypeId}`}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Number(item.value),
                      )}
                    </TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="max-w-[140px] truncate" title={item.campaignTitle ?? undefined}>
                      {item.campaignTitle ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate" title={item.animalName ?? undefined}>
                      {item.animalName ?? '—'}
                    </TableCell>
                    <TableCell>{item.employeeName ?? '—'}</TableCell>
                    <TableCell>{formatRevenueStatus(item.status)}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          { icon: XIcon, title: 'Remover', action: removeRevenue },
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
            <span className="text-sm dark:text-gray-300">{itemCountMessage('receitas', page, pages, total)}</span>
            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}

function formatRevenueStatus(status: string) {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado',
  }
  return map[status] ?? status
}
