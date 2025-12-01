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

interface FinalDestinationTypeFormProps {
  id?: number
  show: boolean
  refresh: VoidFunction
}

const finalDestinationTypeSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, RequiredMessage),
  description: z.string().min(1, RequiredMessage),
  requiresApproval: z.coerce.boolean(),
  active: z.coerce.boolean(),
})

type FinalDestinationTypeData = z.infer<typeof finalDestinationTypeSchema>

export const FinalDestinationTypeForm = ({ show, refresh, id }: FinalDestinationTypeFormProps) => {
  const { token } = useApp()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const finalDestinationTypeForm = useForm({
    resolver: zodResolver(finalDestinationTypeSchema),
    defaultValues: { requiresApproval: false, active: true },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = finalDestinationTypeForm

  async function addOrUpdateFinalDestinationType(values: FinalDestinationTypeData) {
    try {
      await api[id ? 'put' : 'post'](id ? 'final-destination-type.update' : 'final-destination-type.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Tipo de Destino Final ${values.name} ${id ? 'atualizado' : 'criado'} com sucesso!`)
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
        .get(`final-destination-type.key/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          reset(data)
          setDisplayName(data.name)
        })
        .catch((err) => toast.error(errorMessageHandler(err)))
        .finally(() => setFetching(false))
    } else if (show) {
      reset({ requiresApproval: false, active: true })
      setDisplayName('')
    }
  }, [id, show])

  return (
    <>
      <Helmet>
        <title>Tipo de Destino Final - APA Control</title>
      </Helmet>
      <FormProvider {...finalDestinationTypeForm}>
        <ModalForm
          title={displayName || 'Novo Tipo de Destino Final'}
          show={show}
          fetching={fetching}
          submitting={isSubmitting}
          resetForm={reset}
          onSubmit={handleSubmit(addOrUpdateFinalDestinationType)}
          closeAction={handleClose}
        >
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div>
              <Form.Label htmlFor="name">Nome</Form.Label>
              <Form.Input name="name" />
              <Form.ErrorMessage field="name" />
            </div>

            <div>
              <Form.Label htmlFor="description">Descrição</Form.Label>
              <Form.Input name="description" />
              <Form.ErrorMessage field="description" />
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="mb-6 flex items-center space-x-2">
              <Form.Switch name="requiresApproval" />
              <Form.Label htmlFor="requiresApproval" className="mb-0 leading-normal">
                Requer Aprovação?
              </Form.Label>
            </div>

            <div className="mb-6 flex items-center space-x-2">
              <Form.Switch name="active" />
              <Form.Label htmlFor="active" className="mb-0 leading-normal">
                Ativo?
              </Form.Label>
            </div>
          </div>
        </ModalForm>
      </FormProvider>
    </>
  )
}
