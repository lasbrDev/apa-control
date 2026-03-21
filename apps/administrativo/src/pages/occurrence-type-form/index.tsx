import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useApp } from '../../App'
import { Form } from '../../components/form-hook'
import { ModalForm } from '../../components/modal-form'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'

interface OccurrenceTypeFormProps {
  id?: number
  show: boolean
  refresh: VoidFunction
}

const schema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, RequiredMessage),
  description: z.string().optional().nullable(),
  active: z.boolean(),
})
type Data = z.infer<typeof schema>

export const OccurrenceTypeForm = ({ show, refresh, id }: OccurrenceTypeFormProps) => {
  const { token } = useApp()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const form = useForm<Data>({ resolver: zodResolver(schema), defaultValues: { active: true } })
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form

  async function submit(values: Data) {
    try {
      await api[id ? 'put' : 'post'](id ? 'occurrence-type.update' : 'occurrence-type.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success(`Tipo de ocorrência ${id ? 'atualizado' : 'criado'} com sucesso!`)
      refresh()
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    if (id) {
      setFetching(true)
      api
        .get(`occurrence-type.key/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          reset(data)
          setDisplayName(data.name)
        })
        .catch((error) => toast.error(errorMessageHandler(error)))
        .finally(() => setFetching(false))
    } else if (show) {
      reset({ active: true })
      setDisplayName('')
    }
  }, [id, show, token, reset])

  return (
    <>
      <Helmet>
        <title>Tipo de Ocorrência - APA Control</title>
      </Helmet>
      <FormProvider {...form}>
        <ModalForm
          title={displayName || 'Novo Tipo de Ocorrência'}
          show={show}
          fetching={fetching}
          submitting={isSubmitting}
          resetForm={reset}
          onSubmit={handleSubmit(submit)}
          closeAction={() => pushTo(-1)}
        >
          <div className="mb-6">
            <Form.Label htmlFor="name">Nome</Form.Label>
            <Form.Input name="name" />
            <Form.ErrorMessage field="name" />
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
