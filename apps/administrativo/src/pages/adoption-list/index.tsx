import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeartHandshakeIcon,
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

interface AdoptionListValues {
  id: number
  animalId: number
  adopterId: number
  adoptionDate: string
  termSigned: boolean
  adaptationPeriod: number | null
  status: string
  observations: string | null
  animalName?: string | null
  adopterName?: string | null
  employeeName?: string | null
}

const adoptionStatusOptions = [
  { value: 'processando', label: 'Processando' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

const adoptionFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    animalName: z.string().nullish(),
    adopterName: z.string().nullish(),
    status: z.string().nullish(),
    adoptionDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    adoptionDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.adoptionDateStart || !data.adoptionDateEnd) return true
      return new Date(data.adoptionDateStart) <= new Date(data.adoptionDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['adoptionDateEnd'],
    },
  )

type AdoptionFilterData = z.infer<typeof adoptionFilterSchema>

export const AdoptionList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<AdoptionListValues[]>([])
  const [total, setTotal] = useState(0)

  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const toDateInput = (date: Date) => date.toISOString().split('T')[0]

  const adoptionFilterForm = useForm<AdoptionFilterData>({
    resolver: zodResolver(adoptionFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields:
        'id,animalId,adopterId,adoptionDate,termSigned,adaptationPeriod,status,observations,animalName,adopterName,employeeName',
      sort: '-adoptionDate',
      animalName: '',
      adopterName: '',
      status: null,
      adoptionDateStart: toDateInput(monthAgo),
      adoptionDateEnd: toDateInput(today),
    },
  })

  const { handleSubmit, getValues, setValue } = adoptionFilterForm
  const page = getValues('page')
  const perPage = getValues('perPage')
  const pages = Math.ceil(total / perPage) || 1

  const removeAdoption = useCallback(
    (values: AdoptionListValues) => {
      modal.confirm({
        title: 'Remover adoção',
        message: `Deseja remover o registro de adoção do animal ${values.animalName ?? `#${values.animalId}`}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`adoption.delete/${values.id}`, {
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

  const confirmAdoption = useCallback(
    (values: AdoptionListValues) => {
      modal.confirm({
        title: 'Confirmar adoção',
        message: `Deseja confirmar a adoção do animal ${values.animalName ?? `#${values.animalId}`}?`,
        confirmText: 'Confirmar',
        callback: (confirmed) => {
          if (!confirmed) return
          api
            .put(
              'adoption.confirm',
              { id: values.id },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            )
            .then(refresh.force)
            .catch((err) => modal.alert(errorMessageHandler(err)))
        },
      })
    },
    [token, modal, refresh],
  )

  const cancelAdoption = useCallback(
    (values: AdoptionListValues) => {
      modal.prompt({
        title: 'Cancelar adoção',
        message: 'Informe o motivo do cancelamento:',
        callback: (reason) => {
          const value = String(reason ?? '').trim()
          if (!value) {
            modal.alert('Motivo é obrigatório para cancelar a adoção.')
            return
          }
          api
            .put(
              'adoption.cancel',
              { id: values.id, reason: value },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            )
            .then(refresh.force)
            .catch((err) => modal.alert(errorMessageHandler(err)))
        },
      })
    },
    [token, modal, refresh],
  )

  async function listAdoptions(values: AdoptionFilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`adoption.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    }
    setFetching(false)
  }

  async function exportAdoptions(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `adoption.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'adocoes', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    handleSubmit(listAdoptions)()
  }, [refresh.ref])

  function changePage(currentPage: number) {
    setValue('page', currentPage)
    refresh.force()
  }

  return (
    <>
      <Helmet>
        <title>Adoções - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <HeartHandshakeIcon />
            Adoções
          </CardTitle>

          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportAdoptions('csv')}
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
              onClick={() => exportAdoptions('xlsx')}
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
              onClick={() => exportAdoptions('pdf')}
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
                <span>Nova adoção</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...adoptionFilterForm}>
            <form onSubmit={handleSubmit(listAdoptions)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-3 2xl:grid-cols-3">
                <div>
                  <Form.Label htmlFor="animalName">Animal</Form.Label>
                  <Form.Input type="search" name="animalName" placeholder="Nome do animal" />
                  <Form.ErrorMessage field="animalName" />
                </div>
                <div>
                  <Form.Label htmlFor="adopterName">Adotante</Form.Label>
                  <Form.Input type="search" name="adopterName" placeholder="Nome do adotante" />
                  <Form.ErrorMessage field="adopterName" />
                </div>
                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" isClearable placeholder="Todos" options={adoptionStatusOptions} />
                  <Form.ErrorMessage field="status" />
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
                <div>
                  <Form.Label htmlFor="adoptionDateStart">Data inicial</Form.Label>
                  <Form.Input type="date" name="adoptionDateStart" />
                  <Form.ErrorMessage field="adoptionDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="adoptionDateEnd">Data final</Form.Label>
                  <Form.Input type="date" name="adoptionDateEnd" />
                  <Form.ErrorMessage field="adoptionDateEnd" />
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
                  <TableHead>Animal</TableHead>
                  <TableHead>Adotante</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Termo</TableHead>
                  <TableHead>Período adapt.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[160px] truncate" title={item.animalName ?? undefined}>
                      {item.animalName ?? `#${item.animalId}`}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate" title={item.adopterName ?? undefined}>
                      {item.adopterName ?? `#${item.adopterId}`}
                    </TableCell>
                    <TableCell>{new Date(item.adoptionDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{item.termSigned ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{item.adaptationPeriod != null ? `${item.adaptationPeriod} dias` : '—'}</TableCell>
                    <TableCell>{formatAdoptionStatus(item.status)}</TableCell>
                    <TableCell>{item.employeeName ?? '—'}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.status === 'processando' && (
                          <>
                            <Button type="button" variant="success" onClick={() => confirmAdoption(item)}>
                              <CheckCircle2Icon className="mr-2 h-4 w-4 shrink-0" />
                              <span>Confirmar</span>
                            </Button>
                            <Button type="button" variant="danger" onClick={() => cancelAdoption(item)}>
                              <XCircleIcon className="mr-2 h-4 w-4 shrink-0" />
                              <span>Cancelar</span>
                            </Button>
                          </>
                        )}
                        <ActionsList
                          primaryKey="id"
                          values={item}
                          actions={[
                            { icon: PencilIcon, title: 'Editar', action: ':id' },
                            { icon: XIcon, title: 'Remover', action: removeAdoption },
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {items.length === 0 && <TableCaption>Nenhum item foi encontrado.</TableCaption>}
            </Table>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('adoções', page, pages, total, perPage)}
            </span>
            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}

function formatAdoptionStatus(status: string) {
  const map: Record<string, string> = {
    processando: 'Processando',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  }
  return map[status] ?? status
}
