import {
  AlertTriangleIcon,
  CheckIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
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
import { OccurrenceTypeForm } from '../occurrence-type-form'

interface Item {
  id: number
  name: string
  active: boolean
}

export const OccurrenceTypeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const id = Number.parseInt(params.id!, 10)
  const showForm = location.pathname.includes('cadastro') || Boolean(id)

  const removeItem = useCallback(
    (item: Item) => {
      modal.confirm({
        title: 'Remover tipo de ocorrência',
        message: `Deseja remover o tipo de ocorrência ${item.name}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`occurrence-type.delete/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(refresh.force)
              .catch((error) => modal.alert(errorMessageHandler(error)))
          }
        },
      })
    },
    [modal, refresh, token],
  )

  useEffect(() => {
    setFetching(true)
    api
      .get('occurrence-type.list', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch((error) => modal.alert(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [modal, token, refresh.ref])

  async function exportItems(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const response = await api.get(
        `occurrence-type.list?${toQueryString({ page: 1, perPage: 100000, exportType })}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'tipos-ocorrencia', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  return (
    <>
      <Helmet>
        <title>Tipos de Ocorrência - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <AlertTriangleIcon />
            Tipos de Ocorrência
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
                <span>Novo Tipo de Ocorrência</span>
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
                <TableHead />
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
                        { icon: XIcon, title: 'Remover', action: removeItem },
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
      <OccurrenceTypeForm id={id} show={showForm} refresh={refresh.force} />
    </>
  )
}
