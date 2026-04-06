import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PawPrintIcon,
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
import { maskMoney } from '../../helpers/mask/decimal'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'
import { ProcedureTypeForm } from '../procedure-type-form'

interface ProcedureTypeListValues {
  id: number
  name: string
  category: string
  averageCost: number
  active: boolean
}

const procedureTypeFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  name: z.string().nullish(),
  categoryIds: z.array(z.string()),
})

type ProcedureTypeFilterData = z.infer<typeof procedureTypeFilterSchema>

export const ProcedureTypeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<ProcedureTypeListValues[]>([])
  const [total, setTotal] = useState(0)

  const id = Number.parseInt(params.id!, 10)
  const showForm = location.pathname.includes('cadastro') || Boolean(id)

  const procedureTypeFilterForm = useForm<ProcedureTypeFilterData>({
    resolver: zodResolver(procedureTypeFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,category,averageCost,active',
      categoryIds: [],
    },
  })

  const { handleSubmit, getValues, setValue } = procedureTypeFilterForm
  const page = getValues('page')
  const pages = Math.ceil(total / 10)

  async function listProcedureTypes(values: ProcedureTypeFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`procedure-type.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    }
    setFetching(false)
  }

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  function removeProcedureType(values: ProcedureTypeListValues) {
    modal.confirm({
      title: 'Remover tipo de procedimento',
      message: `Deseja remover o tipo de procedimento ${values.name}?`,
      confirmText: 'Remover',
      callback: (confirmed) => {
        if (confirmed) {
          api
            .delete(`procedure-type.delete/${values.id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(refresh.force)
            .catch((err) => modal.alert(errorMessageHandler(err)))
        }
      },
    })
  }

  useEffect(() => {
    handleSubmit(listProcedureTypes)()
  }, [refresh.ref])

  async function exportItems(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `procedure-type.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'tipos-procedimento', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }
  return (
    <>
      <Helmet>
        <title>Tipos de Procedimento - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <PawPrintIcon />
            Tipos de Procedimento
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
                <span>Novo Tipo de Procedimento</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...procedureTypeFilterForm}>
            <form onSubmit={handleSubmit(listProcedureTypes)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
                <div>
                  <Form.Label htmlFor="name">Nome</Form.Label>
                  <Form.Input type="search" name="name" />
                  <Form.ErrorMessage field="name" />
                </div>

                <div>
                  <Form.Label>Classificação</Form.Label>
                  <Form.MultiSelect name="categoryIds" options={procedureCategoryOptions} />
                  <Form.ErrorMessage field="categoryIds" />
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

        <div className="relative">
          <Separator />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Custo Médio</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead aria-label="Ações" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{formatProcedureCategory(item.category)}</TableCell>
                  <TableCell>{maskMoney(item.averageCost)}</TableCell>
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
                        { icon: XIcon, title: 'Remover', action: removeProcedureType },
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
            {itemCountMessage('tipos de procedimento', page, pages, total)}
          </span>

          <Pagination current={page} total={pages} changePage={changePage} />
        </div>
      </Card>

      <ProcedureTypeForm id={id} show={showForm} refresh={refresh.force} />
    </>
  )
}

const procedureCategoryOptions = [
  { label: 'Clínico', value: 'clinico' },
  { label: 'Cirúrgico', value: 'cirurgico' },
  { label: 'Exame', value: 'exame' },
  { label: 'Vacina', value: 'vacina' },
]

function formatProcedureCategory(category: string) {
  return procedureCategoryOptions.find((option) => option.value === category)?.label
}
