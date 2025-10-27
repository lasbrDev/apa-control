import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CheckIcon, FlagIcon, PencilIcon, PlusIcon, XIcon } from 'lucide-react'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { ActionsList } from '../../components/list/ActionList'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'
import { FinalDestinationTypeForm } from '../final-destination-type-form'

interface FinalDestinationTypeListValues {
  id: number
  name: string
  requiresApproval: boolean
  active: boolean
}

export const FinalDestinationTypeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [items, setItems] = useState<FinalDestinationTypeListValues[]>([])

  const id = Number.parseInt(params.id!, 10)
  const showForm = location.pathname.includes('cadastro') || Boolean(id)

  const removeFinalDestinationType = useCallback(
    (values: FinalDestinationTypeListValues) => {
      modal.confirm({
        title: 'Remover tipo de destino final',
        message: `Deseja remover o tipo de destino final ${values.name}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`final-destination-type.delete/${values.id}`, {
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

  useEffect(() => {
    setFetching(true)

    api
      .get('final-destination-type.list', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setItems(data))
      .catch((err) => modal.alert(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [refresh.ref])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <FlagIcon />
            Tipos de Destino Final
          </CardTitle>

          <CardToolbar>
            <Button variant="success" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo Tipo de Destino Final</span>
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
                <TableHead>Requer Aprovação</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead aria-label="Ações" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.requiresApproval ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500" />
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
                        { icon: XIcon, title: 'Remover', action: removeFinalDestinationType },
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

      <FinalDestinationTypeForm id={id} show={showForm} refresh={refresh.force} />
    </>
  )
}
