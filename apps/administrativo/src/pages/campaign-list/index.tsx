import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircleIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  MegaphoneIcon,
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

interface CampaignListValues {
  id: number
  campaignTypeId: number
  title: string
  description: string
  startDate: string
  endDate: string
  fundraisingGoal: string
  status: string
  observations: string | null
  campaignTypeName?: string
}

interface SelectOption {
  value: number
  label: string
}

const campaignStatusOptions = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

const campaignFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    title: z.string().nullish(),
    campaignTypeId: z.number().nullish(),
    status: z.string().nullish(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.startDate) <= new Date(data.endDate)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['endDate'],
    },
  )

type CampaignFilterData = z.infer<typeof campaignFilterSchema>

export const CampaignList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<CampaignListValues[]>([])
  const [total, setTotal] = useState(0)
  const [campaignTypeOptions, setCampaignTypeOptions] = useState<SelectOption[]>([])

  const campaignFilterForm = useForm<CampaignFilterData>({
    resolver: zodResolver(campaignFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,campaignTypeId,title,startDate,endDate,fundraisingGoal,status,campaignTypeName',
      sort: '-startDate',
      title: '',
      campaignTypeId: null,
      status: null,
      startDate: '',
      endDate: '',
    },
  })

  const { handleSubmit, getValues, setValue } = campaignFilterForm
  const page = getValues('page')
  const perPage = getValues('perPage')
  const pages = Math.ceil(total / perPage) || 1

  const removeCampaign = useCallback(
    (values: CampaignListValues) => {
      modal.confirm({
        title: 'Remover campanha',
        message: `Deseja remover a campanha ${values.title}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`campaign.delete/${values.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
          }
        },
      })
    },
    [token],
  )

  const cancelCampaign = useCallback(
    (values: CampaignListValues) => {
      modal.confirm({
        title: 'Cancelar campanha',
        message: `Deseja cancelar a campanha ${values.title}?`,
        confirmText: 'Cancelar',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .post(`campaign.cancel/${values.id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
          }
        },
      })
    },
    [token],
  )

  const completeCampaign = useCallback(
    (values: CampaignListValues) => {
      modal.confirm({
        title: 'Concluir campanha',
        message: `Deseja concluir a campanha ${values.title}?`,
        confirmText: 'Concluir',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .post(`campaign.complete/${values.id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
          }
        },
      })
    },
    [token],
  )

  async function listCampaigns(values: CampaignFilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`campaign.list?${toQueryString(values)}`, {
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
    api
      .get('campaign-type.list', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        const campaignTypes = Array.isArray(data) ? data : []
        setCampaignTypeOptions(
          campaignTypes.filter((item) => item.active).map((item) => ({ value: item.id, label: item.name })),
        )
      })
      .catch((error) => modal.alert(errorMessageHandler(error)))
  }, [])

  useEffect(() => {
    handleSubmit(listCampaigns)()
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
        `campaign.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'campanhas', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }
  return (
    <>
      <Helmet>
        <title>Campanhas - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <MegaphoneIcon />
            Campanhas
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
                <span>Nova Campanha</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...campaignFilterForm}>
            <form onSubmit={handleSubmit(listCampaigns)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-3 2xl:grid-cols-3">
                <div>
                  <Form.Label htmlFor="title">Título</Form.Label>
                  <Form.Input type="search" name="title" />
                  <Form.ErrorMessage field="title" />
                </div>
                <div>
                  <Form.Label htmlFor="campaignTypeId">Tipo de campanha</Form.Label>
                  <Form.Select
                    name="campaignTypeId"
                    type="number"
                    isClearable
                    placeholder="Todos"
                    options={campaignTypeOptions}
                  />
                  <Form.ErrorMessage field="campaignTypeId" />
                </div>
                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" isClearable placeholder="Todos" options={campaignStatusOptions} />
                  <Form.ErrorMessage field="status" />
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
                <div>
                  <Form.Label htmlFor="startDate">Data inicial</Form.Label>
                  <Form.Input type="date" name="startDate" />
                  <Form.ErrorMessage field="startDate" />
                </div>
                <div>
                  <Form.Label htmlFor="endDate">Data final</Form.Label>
                  <Form.Input type="date" name="endDate" />
                  <Form.ErrorMessage field="endDate" />
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
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[220px] truncate" title={item.title}>
                      {item.title}
                    </TableCell>
                    <TableCell>{item.campaignTypeName ?? `#${item.campaignTypeId}`}</TableCell>
                    <TableCell>
                      {new Date(item.startDate).toLocaleDateString('pt-BR')} -{' '}
                      {new Date(item.endDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {item.fundraisingGoal != null
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            Number(item.fundraisingGoal),
                          )
                        : '—'}
                    </TableCell>
                    <TableCell>{formatCampaignStatus(item.status)}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          { icon: XIcon, title: 'Remover', action: removeCampaign },
                          {
                            icon: XCircleIcon,
                            title: 'Cancelar',
                            action: cancelCampaign,
                            hideWhen: (item) => item.status !== 'ativa',
                          },
                          {
                            icon: CheckCircleIcon,
                            title: 'Concluir',
                            action: completeCampaign,
                            hideWhen: (item) => item.status !== 'ativa',
                          },
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
            <span className="text-sm dark:text-gray-300">{itemCountMessage('campanhas', page, pages, total)}</span>
            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}

function formatCampaignStatus(status: string) {
  const map: Record<string, string> = {
    ativa: 'Ativa',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  }
  return map[status] ?? status
}
