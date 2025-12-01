import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, CreditCardIcon, PencilIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
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
import { toQueryString } from '../../helpers/qs'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'
import { TransactionTypeForm } from '../transaction-type-form'

interface TransactionTypeListValues {
  id: number
  name: string
  category: string
  active: boolean
}

const transactionTypeFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  name: z.string().nullish(),
  categoryIds: z.array(z.string()),
})

type TransactionTypeFilterData = z.infer<typeof transactionTypeFilterSchema>

export const TransactionTypeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [items, setItems] = useState<TransactionTypeListValues[]>([])
  const [total, setTotal] = useState(0)

  const id = Number.parseInt(params.id!, 10)
  const showForm = location.pathname.includes('cadastro') || Boolean(id)

  const transactionTypeFilterForm = useForm<TransactionTypeFilterData>({
    resolver: zodResolver(transactionTypeFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,category,active',
      categoryIds: [],
    },
  })

  const { handleSubmit, getValues, setValue } = transactionTypeFilterForm
  const page = getValues('page')
  const pages = Math.ceil(total / 10)

  async function listTransactionTypes(values: TransactionTypeFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`transaction-type.list?${toQueryString(values)}`, {
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

  function removeTransactionType(values: TransactionTypeListValues) {
    modal.confirm({
      title: 'Remover tipo de transação',
      message: `Deseja remover o tipo de transação ${values.name}?`,
      confirmText: 'Remover',
      callback: (confirmed) => {
        if (confirmed) {
          api
            .delete(`transaction-type.delete/${values.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then(refresh.force)
            .catch((err) => modal.alert(errorMessageHandler(err)))
        }
      },
    })
  }

  useEffect(() => {
    handleSubmit(listTransactionTypes)()
  }, [refresh.ref])

  return (
    <>
      <Helmet>
        <title>Tipos de Lançamento - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <CreditCardIcon />
            Tipos de Lançamento
          </CardTitle>

          <CardToolbar>
            <Button variant="danger" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo Tipo de Lançamento</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...transactionTypeFilterForm}>
            <form onSubmit={handleSubmit(listTransactionTypes)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
                <div>
                  <Form.Label htmlFor="name">Nome</Form.Label>
                  <Form.Input type="search" name="name" />
                  <Form.ErrorMessage field="name" />
                </div>

                <div>
                  <Form.Label>Categoria</Form.Label>
                  <Form.MultiSelect
                    name="categoryIds"
                    options={[
                      { label: 'Receita', value: 'receita' },
                      { label: 'Despesa', value: 'despesa' },
                    ]}
                  />
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
                <TableHead>Categoria</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead aria-label="Ações" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.category === 'receita' ? (
                      <span className="text-green-600">Receita</span>
                    ) : (
                      <span className="text-red-600">Despesa</span>
                    )}
                  </TableCell>
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
                        { icon: XIcon, title: 'Remover', action: removeTransactionType },
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
            {itemCountMessage('tipos de lançamento', page, pages, total)}
          </span>

          <Pagination current={page} total={pages} changePage={changePage} />
        </div>
      </Card>

      <TransactionTypeForm id={id} show={showForm} refresh={refresh.force} />
    </>
  )
}
