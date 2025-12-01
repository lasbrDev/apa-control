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

interface CampaignTypeFormProps {
  id?: number
  show: boolean
  refresh: VoidFunction
}

const campaignTypeSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, RequiredMessage),
  description: z.string().min(1, RequiredMessage),
  active: z.coerce.boolean(),
})

type CampaignTypeData = z.infer<typeof campaignTypeSchema>

export const CampaignTypeForm = ({ show, refresh, id }: CampaignTypeFormProps) => {
  const { token } = useApp()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const campaignTypeForm = useForm({
    resolver: zodResolver(campaignTypeSchema),
    defaultValues: { active: true },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = campaignTypeForm

  async function addOrUpdateCampaignType(values: CampaignTypeData) {
    try {
      await api[id ? 'put' : 'post'](id ? 'campaign-type.update' : 'campaign-type.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Tipo de Campanha ${values.name} ${id ? 'atualizado' : 'criado'} com sucesso!`)
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
        .get(`campaign-type.key/${id}`, { headers: { Authorization: `Bearer ${token}` } })
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
        <title>Tipo de Campanha - APA Control</title>
      </Helmet>
      <FormProvider {...campaignTypeForm}>
        <ModalForm
          title={displayName || 'Novo Tipo de Campanha'}
          show={show}
          fetching={fetching}
          submitting={isSubmitting}
          resetForm={reset}
          onSubmit={handleSubmit(addOrUpdateCampaignType)}
          closeAction={handleClose}
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
