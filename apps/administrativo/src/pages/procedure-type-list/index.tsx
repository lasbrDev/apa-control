import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CheckIcon, PawPrintIcon, PencilIcon, PlusIcon, XIcon } from 'lucide-react'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { ActionsList } from '../../components/list/ActionList'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { maskDecimal } from '../../helpers/mask/decimal'
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

export const ProcedureTypeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [items, setItems] = useState<ProcedureTypeListValues[]>([])

  const id = Number.parseInt(params.id!, 10)
  const showForm = location.pathname.includes('cadastro') || Boolean(id)

  const removeProcedureType = useCallback(
    (values: ProcedureTypeListValues) => {
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
    },
    [token],
  )

  useEffect(() => {
    setFetching(true)

    api
      .get('procedure-type.list', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setItems(data))
      .catch((err) => modal.alert(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [refresh.ref])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <PawPrintIcon />
            Tipos de Procedimento
          </CardTitle>

          <CardToolbar>
            <Button variant="danger" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo Tipo de Procedimento</span>
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
                <TableHead>Categoria</TableHead>
                <TableHead>Custo Médio</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead aria-label="Ações" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{maskDecimal(item.averageCost)}</TableCell>
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
      </Card>

      <ProcedureTypeForm id={id} show={showForm} refresh={refresh.force} />
    </>
  )
}
