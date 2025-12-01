import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { LockIcon, PencilIcon, PlusIcon, SearchIcon, UnlockIcon, Users2Icon } from 'lucide-react'
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
import { maskCpfCnpj } from '../../helpers/mask/cpf-cnpj'
import { toQueryString } from '../../helpers/qs'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface AccessProfile {
  id: number
  description: string
}

interface EmployeeListValues {
  id: number
  name: string
  login: string
  cpf: string
  profileName: string
  disabledAt?: Date
}

const employeeFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  sort: z.string().optional(),
  name: z.string().nullish(),
  login: z.string().nullish(),
  cpf: z.string().nullish(),
  profileIds: z.array(z.number()),
  show: z.enum(['all', 'disabled', 'enabled']).nullish(),
})

type EmployeeFilterData = z.infer<typeof employeeFilterSchema>

const showOptions = [
  { value: 'enabled', label: 'Habilitados' },
  { value: 'disabled', label: 'Desabilitados' },
]

export const EmployeeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [items, setItems] = useState<EmployeeListValues[]>([])
  const [total, setTotal] = useState(0)
  const [profiles, setProfiles] = useState<AccessProfile[]>([])

  const employeeFilterForm = useForm<EmployeeFilterData>({
    resolver: zodResolver(employeeFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,login,cpf,profileName,disabledAt',
      sort: 'name',
      profileIds: [],
    },
  })

  const { handleSubmit, getValues, setValue } = employeeFilterForm
  const page = getValues('page')
  const pages = Math.ceil(total / 10)

  const disableEmployee = useCallback(
    (values: EmployeeListValues) => {
      modal.confirm({
        title: `Desabilitar ${values.name}`,
        message: `Deseja desabilitar ${values.name}?`,
        confirmText: 'Desabilitar',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .post(
                'employee.disable',
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

  const enableEmployee = useCallback(
    (values: EmployeeListValues) => {
      modal.confirm({
        title: `Habilitar ${values.name}`,
        message: `Deseja habilitar ${values.name}?`,
        confirmText: 'Habilitar',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .post(
                'employee.disable',
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

  async function listEmployees(values: EmployeeFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`employee.list?${toQueryString(values)}`, {
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
    handleSubmit(listEmployees)()
  }, [refresh.ref])

  useEffect(() => {
    api
      .get(`profile.list?${toQueryString({ page: 0, fields: 'id,description', sort: 'description' })}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setProfiles(data))
      .catch((err) => modal.alert(errorMessageHandler(err)))
  }, [])

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  const profileOptions = profiles.map((profile) => ({ value: profile.id, label: profile.description }))

  return (
    <>
      <Helmet>
        <title>Funcionários - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <Users2Icon />
            Funcionários
          </CardTitle>

          <CardToolbar>
            <Button variant="danger" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo Funcionário</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...employeeFilterForm}>
            <form onSubmit={handleSubmit(listEmployees)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                <div>
                  <Form.Label htmlFor="name">Nome</Form.Label>
                  <Form.Input type="search" name="name" />
                  <Form.ErrorMessage field="name" />
                </div>

                <div>
                  <Form.Label htmlFor="login">Login</Form.Label>
                  <Form.Input type="search" name="login" />
                  <Form.ErrorMessage field="login" />
                </div>

                <div>
                  <Form.Label htmlFor="cpf">CPF</Form.Label>
                  <Form.MaskInput type="search" name="cpf" mask="000.000.000-00" />
                  <Form.ErrorMessage field="cpf" />
                </div>
              </div>
              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-2">
                <div>
                  <Form.Label>Perfil</Form.Label>
                  <Form.MultiSelect name="profileIds" options={profileOptions} />
                  <Form.ErrorMessage field="profileIds" />
                </div>

                <div>
                  <Form.Label htmlFor="show">Exibir</Form.Label>
                  <Form.Select name="show" isClearable placeholder="Todos" options={showOptions} />
                  <Form.ErrorMessage field="show" />
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
                  <TableHead>Login</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatName(item.name, item)}</TableCell>
                    <TableCell>{item.login}</TableCell>
                    <TableCell>{maskCpfCnpj(item.cpf)}</TableCell>
                    <TableCell>{item.profileName}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          { icon: LockIcon, title: 'Desabilitar', hideWhen: isDisabled, action: disableEmployee },
                          { icon: UnlockIcon, title: 'Habilitar', hideWhen: isNotDisabled, action: enableEmployee },
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
            <span className="text-base">{itemCountMessage('funcionários', page, pages, total)}</span>

            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}

const isDisabled = (values: EmployeeListValues): boolean => Boolean(values.disabledAt)
const isNotDisabled = (values: EmployeeListValues): boolean => !values.disabledAt

function formatName(name: string, values: EmployeeListValues) {
  return (
    <span className="flex items-center gap-2">
      {name}
      {values.disabledAt ? <LockIcon className="h-4 w-4" /> : null}
    </span>
  )
}
