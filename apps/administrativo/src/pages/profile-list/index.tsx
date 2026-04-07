import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from '@radix-ui/react-select'
import { FileSpreadsheetIcon, FileTextIcon, PencilIcon, PlusIcon, UserSquare2Icon, XIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { ActionsList } from '../../components/list/ActionList'
import { Pagination } from '../../components/list/Pagination'
import { LoadingCard } from '../../components/loading-card'
import { Spinner } from '../../components/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface ProfileListValues {
  id: number
  description: string
}

const profileFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  sort: z.string().optional(),
})

type ProfileFilterData = z.infer<typeof profileFilterSchema>

export const ProfileList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<ProfileListValues[]>([])
  const [total, setTotal] = useState(0)

  const profileFilterForm = useForm<ProfileFilterData>({
    resolver: zodResolver(profileFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,login',
      sort: 'id',
    },
  })

  const { handleSubmit, getValues, setValue } = profileFilterForm
  const page = getValues('page')
  const pages = Math.ceil(total / 10)

  const removeProfile = useCallback(
    (values: ProfileListValues) => {
      modal.confirm({
        title: 'Remover perfil',
        message: `Deseja remover o perfil: ${values.description}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`profile.delete/${values.id}`, { headers: { Authorization: `Bearer ${token}` } })
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

  async function listProfiles(values: ProfileFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`profile.list?${toQueryString(values)}`, {
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
    handleSubmit(listProfiles)()
  }, [refresh.ref])

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  async function exportItems(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `profile.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'perfis', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }
  return (
    <>
      <Helmet>
        <title>Perfis de Acesso - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <UserSquare2Icon />
            Perfis
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
                <span>Novo Perfil</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <div>
          <Separator />

          <div className="relative">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          { icon: XIcon, title: 'Remover', action: removeProfile },
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
            <span className="text-sm dark:text-gray-300">{itemCountMessage('perfis', page, pages, total)}</span>

            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}
