import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileSpreadsheetIcon, FileTextIcon, HeartIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-react'
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
import { maskCpfCnpj } from '../../helpers/mask/cpf-cnpj'
import { maskPhone } from '../../helpers/mask/phone'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface AdopterListValues {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
}

const adopterFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  sort: z.string().optional(),
  name: z.string().nullish(),
  cpf: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
})

type AdopterFilterData = z.infer<typeof adopterFilterSchema>

export const AdopterList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const navigate = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<AdopterListValues[]>([])
  const [total, setTotal] = useState(0)

  const adopterFilterForm = useForm<AdopterFilterData>({
    resolver: zodResolver(adopterFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,cpf,email,phone',
      sort: 'name',
    },
  })

  const { handleSubmit, getValues, setValue } = adopterFilterForm
  const page = getValues('page')
  const pages = Math.ceil(total / 10)

  const removeAdopter = useCallback(
    (values: AdopterListValues) => {
      modal.confirm({
        title: 'Remover adotante',
        message: `Deseja remover o adotante ${values.name}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`adopter.delete/${values.id}`, {
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
    [token],
  )

  async function listAdopters(values: AdopterFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`adopter.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }

    setFetching(false)
  }

  async function exportAdopters(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `adopter.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'adotantes', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    handleSubmit(listAdopters)()
  }, [refresh.ref])

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  return (
    <>
      <Helmet>
        <title>Adotantes - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <HeartIcon />
            Adotantes
          </CardTitle>

          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportAdopters('csv')}
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
              onClick={() => exportAdopters('xlsx')}
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
              onClick={() => exportAdopters('pdf')}
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
                <span>Novo Adotante</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...adopterFilterForm}>
            <form onSubmit={handleSubmit(listAdopters)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-4">
                <div>
                  <Form.Label htmlFor="name">Nome</Form.Label>
                  <Form.Input type="search" name="name" />
                  <Form.ErrorMessage field="name" />
                </div>

                <div>
                  <Form.Label htmlFor="cpf">CPF</Form.Label>
                  <Form.MaskInput type="search" name="cpf" mask="000.000.000-00" />
                  <Form.ErrorMessage field="cpf" />
                </div>

                <div>
                  <Form.Label htmlFor="email">Email</Form.Label>
                  <Form.Input type="search" name="email" />
                  <Form.ErrorMessage field="email" />
                </div>

                <div>
                  <Form.Label htmlFor="phone">Telefone</Form.Label>
                  <Form.MaskInput type="search" name="phone" mask="(00) 00000-0000" />
                  <Form.ErrorMessage field="phone" />
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
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{maskCpfCnpj(item.cpf)}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{maskPhone(item.phone)}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: (item) => navigate(`${item.id}`) },
                          { icon: TrashIcon, title: 'Remover', action: removeAdopter },
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
            <span className="text-sm dark:text-gray-300">{itemCountMessage('adotantes', page, pages, total)}</span>

            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}
