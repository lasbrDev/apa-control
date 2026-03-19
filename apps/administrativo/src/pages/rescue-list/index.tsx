import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, LifeBuoyIcon, PlusIcon, SearchIcon } from 'lucide-react'
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

interface RescueListValues {
  id: number
  animalId: number
  employeeId: number
  rescueDate: string
  locationFound: string
  circumstances: string
  foundConditions: string
  immediateProcedures: string | null
  observations: string | null
  createdAt: string
  animalName?: string
}

const rescueFilterSchema = z
  .object({
    fields: z.string(),
    page: z.number(),
    perPage: z.number(),
    sort: z.string().optional(),
    locationFound: z.string().nullish(),
    animalName: z.string().nullish(),
    rescueDateStart: z.string().min(1, 'Data inicial é obrigatória.'),
    rescueDateEnd: z.string().min(1, 'Data final é obrigatória.'),
  })
  .refine(
    (data) => {
      if (!data.rescueDateStart || !data.rescueDateEnd) return true
      return new Date(data.rescueDateStart) <= new Date(data.rescueDateEnd)
    },
    {
      message: 'A data inicial deve ser menor ou igual à data final.',
      path: ['rescueDateEnd'],
    },
  )

type RescueFilterData = z.infer<typeof rescueFilterSchema>

export const RescueList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [items, setItems] = useState<RescueListValues[]>([])
  const [total, setTotal] = useState(0)

  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const toDateInput = (date: Date) => date.toISOString().split('T')[0]

  const rescueFilterForm = useForm<RescueFilterData>({
    resolver: zodResolver(rescueFilterSchema),
    defaultValues: {
      page: 1,
      perPage: 10,
      fields: 'id,animalId,employeeId,rescueDate,locationFound,circumstances,foundConditions,animalName',
      sort: '-rescueDate',
      rescueDateStart: toDateInput(monthAgo),
      rescueDateEnd: toDateInput(today),
    },
  })

  const { handleSubmit, getValues, setValue } = rescueFilterForm
  const page = getValues('page')
  const perPage = getValues('perPage')
  const pages = Math.ceil(total / perPage) || 1

  async function listRescues(values: RescueFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`rescue.list?${toQueryString(values)}`, {
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
    handleSubmit(listRescues)()
  }, [refresh.ref])

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  return (
    <>
      <Helmet>
        <title>Resgates - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <LifeBuoyIcon />
            Resgates
          </CardTitle>

          <CardToolbar>
            <Button variant="danger" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo Resgate</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...rescueFilterForm}>
            <form onSubmit={handleSubmit(listRescues)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                <div>
                  <Form.Label htmlFor="animalName">Nome do animal</Form.Label>
                  <Form.Input type="search" name="animalName" />
                  <Form.ErrorMessage field="animalName" />
                </div>

                <div>
                  <Form.Label htmlFor="locationFound">Local encontrado</Form.Label>
                  <Form.Input type="search" name="locationFound" />
                  <Form.ErrorMessage field="locationFound" />
                </div>

                <div>
                  <Form.Label htmlFor="rescueDateStart">Data inicial do resgate</Form.Label>
                  <Form.Input type="date" name="rescueDateStart" />
                  <Form.ErrorMessage field="rescueDateStart" />
                </div>

                <div>
                  <Form.Label htmlFor="rescueDateEnd">Data final do resgate</Form.Label>
                  <Form.Input type="date" name="rescueDateEnd" />
                  <Form.ErrorMessage field="rescueDateEnd" />
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
                  <TableHead>Data do resgate</TableHead>
                  <TableHead>Local encontrado</TableHead>
                  <TableHead>Circunstâncias</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.animalName ?? `#${item.animalId}`}</TableCell>
                    <TableCell>
                      {item.rescueDate ? new Date(item.rescueDate).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.locationFound}>
                      {item.locationFound}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.circumstances}>
                      {item.circumstances}
                    </TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[{ icon: EyeIcon, title: 'Visualizar', action: ':id' }]}
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
            <span className="text-sm dark:text-gray-300">{itemCountMessage('resgates', page, pages, total)}</span>

            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}
