import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileSpreadsheetIcon, FileTextIcon, PencilIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react'
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

interface PostListValues {
  id: number
  title: string
  type: string
  publicationDate: string
  status: string
  employeeName?: string | null
}

interface SelectOption {
  value: string
  label: string
}

const postTypeOptions: SelectOption[] = [
  { value: 'adocao', label: 'Adoção' },
  { value: 'campanha', label: 'Campanha' },
  { value: 'comunicado', label: 'Comunicado' },
]

const postStatusOptions: SelectOption[] = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'arquivado', label: 'Arquivado' },
]

const postFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    title: z.string().nullish(),
    type: z.string().nullish(),
    status: z.string().nullish(),
    publicationDateStart: z.string().optional(),
    publicationDateEnd: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.publicationDateStart || !data.publicationDateEnd) return true
      return new Date(data.publicationDateStart) <= new Date(data.publicationDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['publicationDateEnd'],
    },
  )

type PostFilterData = z.infer<typeof postFilterSchema>

export const PostList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<PostListValues[]>([])
  const [total, setTotal] = useState(0)

  const postFilterForm = useForm<PostFilterData>({
    resolver: zodResolver(postFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,title,type,publicationDate,status,employeeName',
      sort: '-publicationDate',
      title: '',
      type: null,
      status: null,
      publicationDateStart: '',
      publicationDateEnd: '',
    },
  })

  const { handleSubmit, getValues, setValue } = postFilterForm
  const page = getValues('page')
  const perPage = getValues('perPage')
  const pages = Math.ceil(total / perPage) || 1

  const removePost = useCallback(
    (values: PostListValues) => {
      modal.confirm({
        title: 'Remover publicação',
        message: `Deseja remover a publicação \"${values.title}\"?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`post.delete/${values.id}`, {
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

  async function listPosts(values: PostFilterData) {
    setFetching(true)
    try {
      const { data, headers } = await api.get(`post.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    }
    setFetching(false)
  }

  async function exportPosts(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `post.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'publicacoes', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    handleSubmit(listPosts)()
  }, [refresh.ref])

  function changePage(currentPage: number) {
    setValue('page', currentPage)
    refresh.force()
  }

  return (
    <>
      <Helmet>
        <title>Publicações - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>Publicações</CardTitle>

          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportPosts('csv')}
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
              onClick={() => exportPosts('xlsx')}
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
            <Button type="button" variant="danger" disabled={downloading === 'pdf'} onClick={() => exportPosts('pdf')}>
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
                <span>Nova publicação</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...postFilterForm}>
            <form onSubmit={handleSubmit(listPosts)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div>
                  <Form.Label htmlFor="title">Título</Form.Label>
                  <Form.Input type="search" name="title" />
                </div>

                <div>
                  <Form.Label htmlFor="type">Tipo</Form.Label>
                  <Form.Select name="type" isClearable placeholder="Todos" options={postTypeOptions} />
                </div>

                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" isClearable placeholder="Todos" options={postStatusOptions} />
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
                <div>
                  <Form.Label htmlFor="publicationDateStart">Data inicial</Form.Label>
                  <Form.Input type="date" name="publicationDateStart" />
                </div>
                <div>
                  <Form.Label htmlFor="publicationDateEnd">Data final</Form.Label>
                  <Form.Input type="date" name="publicationDateEnd" />
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
                  <TableHead>Publicação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[240px] truncate" title={item.title}>
                      {item.title}
                    </TableCell>
                    <TableCell>{formatPostType(item.type)}</TableCell>
                    <TableCell>{new Date(item.publicationDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{formatPostStatus(item.status)}</TableCell>
                    <TableCell>{item.employeeName ?? '—'}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          { icon: XIcon, title: 'Remover', action: removePost },
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
            <span className="text-sm dark:text-gray-300">
              {itemCountMessage('publicações', page, pages, total, perPage)}
            </span>
            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}

function formatPostType(type: string) {
  const map: Record<string, string> = {
    adocao: 'Adoção',
    campanha: 'Campanha',
    comunicado: 'Comunicado',
  }
  return map[type] ?? type
}

function formatPostStatus(status: string) {
  const map: Record<string, string> = {
    rascunho: 'Rascunho',
    publicado: 'Publicado',
    arquivado: 'Arquivado',
  }
  return map[status] ?? status
}
