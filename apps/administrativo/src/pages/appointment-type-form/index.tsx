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

interface AppointmentTypeFormProps {
  id?: number
  show: boolean
  refresh: VoidFunction
}

const appointmentTypeSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, RequiredMessage),
  description: z.string().min(1, RequiredMessage),
  urgency: z.enum(['rotina', 'urgente', 'emergencia']),
  active: z.coerce.boolean(),
})

type AppointmentTypeData = z.infer<typeof appointmentTypeSchema>

export const AppointmentTypeForm = ({ show, refresh, id }: AppointmentTypeFormProps) => {
  const { token } = useApp()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const appointmentTypeForm = useForm({
    resolver: zodResolver(appointmentTypeSchema),
    defaultValues: { urgency: 'rotina', active: true },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = appointmentTypeForm

  async function addOrUpdateAppointmentType(values: AppointmentTypeData) {
    try {
      await api[id ? 'put' : 'post'](id ? 'appointment-type.update' : 'appointment-type.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Tipo de Consulta ${values.name} ${id ? 'atualizado' : 'criado'} com sucesso!`)
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
        .get(`appointment-type.key/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          reset(data)
          setDisplayName(data.name)
        })
        .catch((err) => toast.error(errorMessageHandler(err)))
        .finally(() => setFetching(false))
    } else if (show) {
      reset({ urgency: 'rotina', active: true })
      setDisplayName('')
    }
  }, [id, show])

  return (
    <>
      <Helmet>
        <title>Tipo de Consulta - APA Control</title>
      </Helmet>
      <FormProvider {...appointmentTypeForm}>
        <ModalForm
          title={displayName || 'Novo Tipo de Consulta'}
          show={show}
          fetching={fetching}
          submitting={isSubmitting}
          resetForm={reset}
          onSubmit={handleSubmit(addOrUpdateAppointmentType)}
          closeAction={handleClose}
        >
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div>
              <Form.Label htmlFor="name">Nome</Form.Label>
              <Form.Input name="name" />
              <Form.ErrorMessage field="name" />
            </div>

            <div>
              <Form.Label htmlFor="urgency">Classificação</Form.Label>
              <Form.Select name="urgency" options={urgencyLevelOptions} />
              <Form.ErrorMessage field="urgency" />
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

const urgencyLevelOptions = [
  { label: 'Rotina', value: 'rotina' },
  { label: 'Urgente', value: 'urgente' },
  { label: 'Emergência', value: 'emergencia' },
]
