import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2Icon,
  CheckIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  UnlockIcon,
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
import { maskCpfCnpj } from '../../helpers/mask/cpf-cnpj'
import { maskPhone } from '../../helpers/mask/phone'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface VeterinaryClinicListValues {
  id: number
  name: string
  cnpj: string
  phone: string
  responsible: string
  active: boolean
}

const veterinaryClinicFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  sort: z.string().optional(),
  name: z.string().nullish(),
  cnpj: z.string().nullish(),
  phone: z.string().nullish(),
  responsible: z.string().nullish(),
  active: z.enum(['true', 'false']).nullish(),
})

type VeterinaryClinicFilterData = z.infer<typeof veterinaryClinicFilterSchema>

const activeOptions = [
  { value: 'true', label: 'Ativas' },
  { value: 'false', label: 'Inativas' },
]

const isDisabled = (values: VeterinaryClinicListValues): boolean => !values.active
const isNotDisabled = (values: VeterinaryClinicListValues): boolean => values.active

export const VeterinaryClinicList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const navigate = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<VeterinaryClinicListValues[]>([])
  const [total, setTotal] = useState(0)

  const veterinaryClinicFilterForm = useForm<VeterinaryClinicFilterData>({
    resolver: zodResolver(veterinaryClinicFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,cnpj,phone,responsible,active',
      sort: 'name',
    },
  })

  const { handleSubmit, getValues, setValue } = veterinaryClinicFilterForm
  const page = getValues('page')
  const pages = Math.ceil(total / 10)

  const removeVeterinaryClinic = useCallback(
    (values: VeterinaryClinicListValues) => {
      modal.confirm({
        title: 'Remover clínica veterinária',
        message: `Deseja remover a clínica veterinária ${values.name}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`veterinary-clinic.delete/${values.id}`, {
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

  const disableVeterinaryClinic = useCallback(
    (values: VeterinaryClinicListValues) => {
      modal.confirm({
        title: `Desabilitar ${values.name}`,
        message: `Deseja desabilitar ${values.name}?`,
        confirmText: 'Desabilitar',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .post(
                'veterinary-clinic.disable',
                { id: values.id, disabled: true },
                { headers: { Authorization: `Bearer ${token}` } },
              )
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
          }
        },
      })
    },
    [token],
  )

  const enableVeterinaryClinic = useCallback(
    (values: VeterinaryClinicListValues) => {
      modal.confirm({
        title: `Habilitar ${values.name}`,
        message: `Deseja habilitar ${values.name}?`,
        confirmText: 'Habilitar',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .post(
                'veterinary-clinic.disable',
                { id: values.id, disabled: false },
                { headers: { Authorization: `Bearer ${token}` } },
              )
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
          }
        },
      })
    },
    [token],
  )

  async function listVeterinaryClinics(values: VeterinaryClinicFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`veterinary-clinic.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    }

    setFetching(false)
  }

  async function exportVeterinaryClinics(exportType: ReportExportType) {
    setDownloading(exportType)
    try {
      const values = getValues()
      const response = await api.get(
        `veterinary-clinic.list?${toQueryString({ ...values, page: 1, perPage: 100000, exportType })}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' },
      )
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'clinicas-veterinarias', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    handleSubmit(listVeterinaryClinics)()
  }, [refresh.ref])

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  return (
    <>
      <Helmet>
        <title>Clínicas Veterinárias - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <Building2Icon />
            Clínicas Veterinárias
          </CardTitle>

          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportVeterinaryClinics('csv')}
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
              onClick={() => exportVeterinaryClinics('xlsx')}
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
              onClick={() => exportVeterinaryClinics('pdf')}
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
                <span>Nova Clínica Veterinária</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...veterinaryClinicFilterForm}>
            <form onSubmit={handleSubmit(listVeterinaryClinics)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                <div>
                  <Form.Label htmlFor="name">Nome</Form.Label>
                  <Form.Input type="search" name="name" />
                  <Form.ErrorMessage field="name" />
                </div>

                <div>
                  <Form.Label htmlFor="cnpj">CNPJ</Form.Label>
                  <Form.MaskInput type="search" name="cnpj" mask="00.000.000/0000-00" />
                  <Form.ErrorMessage field="cnpj" />
                </div>

                <div>
                  <Form.Label htmlFor="phone">Telefone</Form.Label>
                  <Form.MaskInput type="search" name="phone" mask="(00) 00000-0000" />
                  <Form.ErrorMessage field="phone" />
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
                <div>
                  <Form.Label htmlFor="responsible">Responsável</Form.Label>
                  <Form.Input type="search" name="responsible" />
                  <Form.ErrorMessage field="responsible" />
                </div>

                <div>
                  <Form.Label htmlFor="active">Status</Form.Label>
                  <Form.Select name="active" isClearable placeholder="Todos" options={activeOptions} />
                  <Form.ErrorMessage field="active" />
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
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{maskCpfCnpj(item.cnpj)}</TableCell>
                    <TableCell>{maskPhone(item.phone)}</TableCell>
                    <TableCell>{item.responsible}</TableCell>
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
                          { icon: PencilIcon, title: 'Editar', action: (item) => navigate(`${item.id}`) },
                          {
                            icon: LockIcon,
                            title: 'Desabilitar',
                            hideWhen: isDisabled,
                            action: disableVeterinaryClinic,
                          },
                          {
                            icon: UnlockIcon,
                            title: 'Habilitar',
                            hideWhen: isNotDisabled,
                            action: enableVeterinaryClinic,
                          },
                          { icon: XIcon, title: 'Remover', action: removeVeterinaryClinic },
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
              {itemCountMessage('clínicas veterinárias', page, pages, total)}
            </span>

            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}
