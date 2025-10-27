import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CheckIcon, CreditCardIcon, PencilIcon, PlusIcon, XIcon } from 'lucide-react'

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
import { TransactionTypeForm } from '../transaction-type-form'

interface TransactionTypeListValues {
  id: number
  name: string
  category: string
  active: boolean
}

export const TransactionTypeList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const params = useParams()
  const [fetching, setFetching] = useState(false)
  const [items, setItems] = useState<TransactionTypeListValues[]>([])

  const id = Number.parseInt(params.id!, 10)
  const showForm = location.pathname.includes('cadastro') || Boolean(id)

  const removeTransactionType = useCallback(
    (values: TransactionTypeListValues) => {
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
    },
    [token],
  )

  useEffect(() => {
    setFetching(true)

    api
      .get('transaction-type.list', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setItems(data))
      .catch((err) => modal.alert(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [refresh.ref])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <CreditCardIcon />
            Tipos de Transação
          </CardTitle>

          <CardToolbar>
            <Button variant="danger" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo Tipo de Transação</span>
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
      </Card>

      <TransactionTypeForm id={id} show={showForm} refresh={refresh.force} />
    </>
  )
}
