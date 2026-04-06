import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, MegaphoneIcon, SaveIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Spinner } from '../../components/spinner'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'

interface SelectOption {
  value: number
  label: string
}

const campaignSchema = z
  .object({
    id: z.number().nullish(),
    campaignTypeId: z.number({ error: RequiredMessage }),
    title: z.string().min(1, RequiredMessage).max(200),
    description: z.string().min(1, RequiredMessage),
    startDate: z.string().min(1, RequiredMessage),
    endDate: z.string().min(1, RequiredMessage),
    fundraisingGoal: z.number().nonnegative(RequiredMessage).nullish(),
    observations: z.string().nullish(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'A data inicial deve ser menor ou igual à data final.',
    path: ['endDate'],
  })

type CampaignData = z.infer<typeof campaignSchema>

export const CampaignForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [campaignTypeOptions, setCampaignTypeOptions] = useState<SelectOption[]>([])

  const campaignForm = useForm<CampaignData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      observations: '',
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = campaignForm

  async function addOrUpdateCampaign(values: CampaignData) {
    try {
      await api[params.id ? 'put' : 'post'](params.id ? 'campaign.update' : 'campaign.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Campanha ${params.id ? 'atualizada' : 'criada'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([
      api.get('campaign-type.list', config),
      params.id ? api.get(`campaign.key/${params.id}`, config) : Promise.resolve({ data: null }),
    ])
      .then(([typesResponse, keyResponse]) => {
        const campaignTypes = Array.isArray(typesResponse.data) ? typesResponse.data : []
        setCampaignTypeOptions(
          campaignTypes.filter((item) => item.active).map((item) => ({ value: item.id, label: item.name })),
        )

        if (keyResponse.data) {
          const key = keyResponse.data
          reset({
            id: key.id,
            campaignTypeId: key.campaignTypeId,
            title: key.title,
            description: key.description,
            startDate: typeof key.startDate === 'string' ? key.startDate.split('T')[0] : '',
            endDate: typeof key.endDate === 'string' ? key.endDate.split('T')[0] : '',
            fundraisingGoal: key.fundraisingGoal != null ? Number(key.fundraisingGoal) : null,
            observations: key.observations ?? '',
          })
        }
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [])

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Campanha - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <MegaphoneIcon />
            {params.id ? 'Editar Campanha' : 'Nova Campanha'}
          </CardTitle>
        </CardHeader>

        <FormProvider {...campaignForm}>
          <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateCampaign)}>
            <CardContent>
              <div className="mb-6">
                <Form.Label htmlFor="campaignTypeId">Tipo de campanha</Form.Label>
                <Form.Select name="campaignTypeId" type="number" options={campaignTypeOptions} />
                <Form.ErrorMessage field="campaignTypeId" />
              </div>

              <div className="mb-6">
                <Form.Label htmlFor="title">Título</Form.Label>
                <Form.Input name="title" />
                <Form.ErrorMessage field="title" />
              </div>

              <div className="mb-6">
                <Form.Label htmlFor="description">Descrição</Form.Label>
                <Form.TextArea name="description" rows={4} />
                <Form.ErrorMessage field="description" />
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div>
                  <Form.Label htmlFor="startDate">Data inicial</Form.Label>
                  <Form.Input type="date" name="startDate" />
                  <Form.ErrorMessage field="startDate" />
                </div>

                <div>
                  <Form.Label htmlFor="endDate">Data final</Form.Label>
                  <Form.Input type="date" name="endDate" />
                  <Form.ErrorMessage field="endDate" />
                </div>

                <div>
                  <Form.Label htmlFor="fundraisingGoal">Meta de arrecadação</Form.Label>
                  <Form.DecimalInput name="fundraisingGoal" />
                  <Form.ErrorMessage field="fundraisingGoal" />
                </div>
              </div>

              <div className="mb-6">
                <Form.Label htmlFor="observations">Observações</Form.Label>
                <Form.TextArea name="observations" rows={3} />
                <Form.ErrorMessage field="observations" />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => pushTo(-1)}>
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                <span>Voltar</span>
              </Button>

              <Button type="submit" variant="success" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Spinner />
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-5 w-5" />
                    <span>Salvar</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </>
  )
}
