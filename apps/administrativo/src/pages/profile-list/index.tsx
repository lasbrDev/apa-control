import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from '@radix-ui/react-select'
import { PencilIcon, PlusIcon, UserSquare2Icon, XIcon } from 'lucide-react'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { ActionsList } from '../../components/list/ActionList'
import { Pagination } from '../../components/list/Pagination'
import { LoadingCard } from '../../components/loading-card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
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
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
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
      modal.alert(errorMessageHandler(error))
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <UserSquare2Icon />
          Perfis
        </CardTitle>

        <CardToolbar>
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
          <span className="text-sm">{itemCountMessage('perfis', page, pages, total)}</span>

          <Pagination current={page} total={pages} changePage={changePage} />
        </div>
      </div>
    </Card>
  )
}
