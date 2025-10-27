import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { HeartIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-react'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { Form } from '../../components/form-hook'
import { ActionsList } from '../../components/list/ActionList'
import { Pagination } from '../../components/list/Pagination'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { itemCountMessage } from '../../helpers/item-count'
import { maskCpfCnpj } from '../../helpers/mask/cpf-cnpj'
import { toQueryString } from '../../helpers/qs'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface AdopterListValues {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  approvalStatus: string
}

const adopterFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  sort: z.string().optional(),
  name: z.string().nullish(),
  cpf: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  approvalStatus: z.enum(['pendente', 'aprovado', 'reprovado']).nullish(),
})

type AdopterFilterData = z.infer<typeof adopterFilterSchema>

const approvalStatusOptions = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'reprovado', label: 'Reprovados' },
]

export const AdopterList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const navigate = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [items, setItems] = useState<AdopterListValues[]>([])
  const [total, setTotal] = useState(0)

  const adopterFilterForm = useForm<AdopterFilterData>({
    resolver: zodResolver(adopterFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,cpf,email,phone,approvalStatus',
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
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
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
      modal.alert(errorMessageHandler(error))
    }

    setFetching(false)
  }

  useEffect(() => {
    handleSubmit(listAdopters)()
  }, [refresh.ref])

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  function getApprovalStatusBadge(status: string) {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      aprovado: { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
      reprovado: { label: 'Reprovado', className: 'bg-red-100 text-red-800' },
    }

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <HeartIcon />
          Adotantes
        </CardTitle>

        <CardToolbar>
          <Button variant="success" onClick={() => navigate('cadastro')}>
            <PlusIcon className="mr-2 h-5 w-5" />
            <span>Novo Adotante</span>
          </Button>
        </CardToolbar>
      </CardHeader>

      <CardContent>
        <FormProvider {...adopterFilterForm}>
          <form onSubmit={handleSubmit(listAdopters)}>
            <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
              <div>
                <Form.Label htmlFor="phone">Telefone</Form.Label>
                <Form.MaskInput type="search" name="phone" mask="(00) 00000-0000" />
                <Form.ErrorMessage field="phone" />
              </div>

              <div>
                <Form.Label htmlFor="approvalStatus">Status</Form.Label>
                <Form.Select name="approvalStatus" isClearable placeholder="Todos" options={approvalStatusOptions} />
                <Form.ErrorMessage field="approvalStatus" />
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
                <TableHead>Status</TableHead>
                <TableHead aria-label="Ações" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{maskCpfCnpj(item.cpf)}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{getApprovalStatusBadge(item.approvalStatus)}</TableCell>
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
          <span className="text-sm">{itemCountMessage('adotantes', page, pages, total)}</span>

          <Pagination current={page} total={pages} changePage={changePage} />
        </div>
      </div>
    </Card>
  )
}
