import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { Helmet } from 'react-helmet-async'
import { useApp } from '../../App'
import { Form } from '../../components/form-hook'
import { ModalForm } from '../../components/modal-form'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'

interface TransactionTypeFormProps {
  id?: number
  show: boolean
  refresh: VoidFunction
}

const transactionTypeSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, RequiredMessage),
  category: z.string().min(1, RequiredMessage),
  description: z.string().min(1, RequiredMessage),
  active: z.coerce.boolean(),
})

type TransactionTypeData = z.infer<typeof transactionTypeSchema>

export const TransactionTypeForm = ({ show, refresh, id }: TransactionTypeFormProps) => {
  const { token } = useApp()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const transactionTypeForm = useForm({
    resolver: zodResolver(transactionTypeSchema),
    defaultValues: { active: true },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = transactionTypeForm

  async function addOrUpdateTransactionType(values: TransactionTypeData) {
    try {
      await api[id ? 'put' : 'post'](id ? 'transaction-type.update' : 'transaction-type.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Tipo de Lançamento ${values.name} ${id ? 'atualizado' : 'criado'} com sucesso!`)
      refresh()
      pushTo(-1)
    } catch (err) {
      toast.error(errorMessageHandler(err))
    }
  }

  function handleClose() {
    setDisplayName('')
    pushTo(-1)
  }

  useEffect(() => {
    if (id) {
      setFetching(true)

      api
        .get(`transaction-type.key/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          reset(data)
          setDisplayName(data.name)
        })
        .catch((err) => toast.error(errorMessageHandler(err)))
        .finally(() => setFetching(false))
    } else if (show) {
      reset({ active: true })
      setDisplayName('')
    }
  }, [id, show])

  return (
    <>
      <Helmet>
        <title>Tipo de Lançamento - APA Control</title>
      </Helmet>
      <FormProvider {...transactionTypeForm}>
        <ModalForm
          title={displayName || 'Novo Tipo de Lançamento'}
          show={show}
          fetching={fetching}
          submitting={isSubmitting}
          resetForm={reset}
          onSubmit={handleSubmit(addOrUpdateTransactionType)}
          closeAction={handleClose}
        >
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div>
              <Form.Label htmlFor="name">Nome</Form.Label>
              <Form.Input name="name" />
              <Form.ErrorMessage field="name" />
            </div>

            <div>
              <Form.Label htmlFor="category">Categoria</Form.Label>
              <Form.Select
                name="category"
                options={[
                  { value: 'receita', label: 'Receita' },
                  { value: 'despesa', label: 'Despesa' },
                ]}
              />
              <Form.ErrorMessage field="category" />
            </div>
          </div>

          <div className="mb-6">
            <Form.Label htmlFor="description">Descrição</Form.Label>
            <Form.TextArea name="description" />
            <Form.ErrorMessage field="description" />
          </div>

          <div className="mb-6 flex items-center space-x-2">
            <Form.Switch name="active" />
            <Form.Label htmlFor="active" className="mb-0 leading-normal">
              Ativo?
            </Form.Label>
          </div>
        </ModalForm>
      </FormProvider>
    </>
  )
}
