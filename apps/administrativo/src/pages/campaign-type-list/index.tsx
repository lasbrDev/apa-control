import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CheckIcon, FileSpreadsheetIcon, FileTextIcon, MegaphoneIcon, PencilIcon, PlusIcon, XIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { ActionsList } from '../../components/list/ActionList'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Spinner } from '../../components/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'
import { CampaignTypeForm } from '../campaign-type-form'

interface CampaignTypeListValues {
  id: number
  name: string
  active: boolean
}

export const CampaignTypeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<CampaignTypeListValues[]>([])

  const id = Number.parseInt(params.id!, 10)
  const showForm = location.pathname.includes('cadastro') || Boolean(id)

  const removeCampaignType = useCallback(
    (values: CampaignTypeListValues) => {
      modal.confirm({
        title: 'Remover tipo de campanha',
        message: `Deseja remover o tipo de campanha ${values.name}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`campaign-type.delete/${values.id}`, { headers: { Authorization: `Bearer ${token}` } })
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

  useEffect(() => {
    setFetching(true)

    api
      .get('campaign-type.list', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setItems(data))
      .catch((err) => toast.error(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [refresh.ref])

  async function exportItems(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = {}
      const response = await api.get(
        `campaign-type.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'tipos-campanha', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }
  return (
    <>
      <Helmet>
        <title>Tipos de Campanha - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <MegaphoneIcon />
            Tipos de Campanha
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
                <span>Novo Tipo de Campanha</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <div className="relative">
          <Separator />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead aria-label="Ações" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.active ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="w-[1%] whitespace-nowrap">
                    <ActionsList
                      primaryKey="id"
                      values={item}
                      actions={[
                        { icon: PencilIcon, title: 'Editar', action: ':id' },
                        { icon: XIcon, title: 'Remover', action: removeCampaignType },
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
      </Card>

      <CampaignTypeForm id={id} show={showForm} refresh={refresh.force} />
    </>
  )
}
