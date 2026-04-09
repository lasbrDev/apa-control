import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, CircleDollarSignIcon, SaveIcon } from 'lucide-react'
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
import { toQueryString } from '../../helpers/qs'
import { api } from '../../service'

interface SelectOption {
  value: number
  label: string
}
interface AnimalOption {
  id: number
  name: string
}

const revenueSchema = z.object({
  id: z.number().nullish(),
  transactionTypeId: z.number({ message: RequiredMessage }).int().positive(),
  campaignId: z.number().nullish(),
  animalId: z.union([z.number(), z.string()]).nullish(),
  description: z.string().min(1, RequiredMessage).max(200),
  value: z.number({ message: RequiredMessage }).nonnegative(RequiredMessage),
  observations: z.string().nullish(),
  proof: z.string().nullish(),
  proofFile: z.any().nullish(),
})

type RevenueData = z.infer<typeof revenueSchema>

export const RevenueForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [transactionTypeOptions, setTransactionTypeOptions] = useState<SelectOption[]>([])
  const [campaignOptions, setCampaignOptions] = useState<SelectOption[]>([])
  const [animalDisplayLabel, setAnimalDisplayLabel] = useState('')
  const searchAnimalOptions = useCallback(
    async (query: string): Promise<{ value: string; label: string }[]> => {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const qs = toQueryString({ name: query.trim(), perPage: 50, fields: 'id,name', sort: 'name', status: 'ativo' })
      const { data } = await api.get<AnimalOption[]>(`animal.list?${qs}`, config)
      const list = Array.isArray(data) ? data : []
      return list.map((a) => ({ value: String(a.id), label: a.name }))
    },
    [token],
  )

  const [currentProof, setCurrentProof] = useState<string>('')

  const revenueForm = useForm<RevenueData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      observations: '',
      proof: '',
      proofFile: null,
      campaignId: null,
      animalId: null,
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = revenueForm

  async function addOrUpdateRevenue(values: RevenueData) {
    try {
      const formData = new FormData()
      if (values.id) formData.append('id', String(values.id))
      formData.append('transactionTypeId', String(values.transactionTypeId))
      if (values.campaignId != null) formData.append('campaignId', String(values.campaignId))
      if (values.animalId != null) formData.append('animalId', String(values.animalId))
      formData.append('description', values.description)
      formData.append('value', String(values.value))
      if (values.observations) formData.append('observations', values.observations)
      if (currentProof) formData.append('proof', currentProof)

      if (values.proofFile?.length) {
        formData.append('proofFile', values.proofFile[0])
      }

      await api[params.id ? 'put' : 'post'](params.id ? 'revenue.update' : 'revenue.add', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Receita ${params.id ? 'atualizada' : 'registrada'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([
      api.get(
        `transaction-type.list?${toQueryString({ categoryIds: 'receita', page: 0, fields: 'id,name,active' })}`,
        config,
      ),
      api.get(`campaign.list?${toQueryString({ page: 0, fields: 'id,title', sort: '-startDate' })}`, config),
      params.id ? api.get(`revenue.key/${params.id}`, config) : Promise.resolve({ data: null }),
    ])
      .then(([typesRes, campaignsRes, keyResponse]) => {
        const types = Array.isArray(typesRes.data) ? typesRes.data : []
        setTransactionTypeOptions(
          types
            .filter((item: { active: boolean }) => item.active)
            .map((item: { id: number; name: string }) => ({
              value: item.id,
              label: item.name,
            })),
        )

        const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : []
        setCampaignOptions(
          campaigns.map((item: { id: number; title: string }) => ({ value: item.id, label: item.title })),
        )

        if (keyResponse.data) {
          const key = keyResponse.data
          setAnimalDisplayLabel(key.animalName ?? '')
          setCurrentProof(key.proof ?? '')

          reset({
            id: key.id,
            transactionTypeId: key.transactionTypeId,
            campaignId: key.campaignId ?? null,
            animalId: key.animalId ?? null,
            description: key.description,
            value: Number(key.value),
            observations: key.observations ?? '',
            proof: key.proof ?? '',
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
        <title>Receita - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <CircleDollarSignIcon />
            {params.id ? 'Editar receita' : 'Nova receita'}
          </CardTitle>
        </CardHeader>

        <FormProvider {...revenueForm}>
          <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateRevenue)}>
            <CardContent>
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="transactionTypeId">Tipo de receita</Form.Label>
                  <Form.Select name="transactionTypeId" type="number" options={transactionTypeOptions} />
                  <Form.ErrorMessage field="transactionTypeId" />
                </div>

                <div>
                  <Form.Label htmlFor="proofFile">Comprovante</Form.Label>
                  <Form.FileInput name="proofFile" />
                  <Form.ErrorMessage field="proofFile" />
                  {currentProof ? (
                    <span className="mt-2 block text-muted-foreground text-xs">Arquivo atual: {currentProof}</span>
                  ) : null}
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="description">Descrição</Form.Label>
                  <Form.Input name="description" maxLength={200} />
                  <Form.ErrorMessage field="description" />
                </div>

                <div>
                  <Form.Label htmlFor="value">Valor (R$)</Form.Label>
                  <Form.DecimalInput name="value" />
                  <Form.ErrorMessage field="value" />
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="campaignId">Campanha</Form.Label>
                  <Form.Select
                    name="campaignId"
                    type="number"
                    isClearable
                    placeholder="Nenhuma"
                    options={campaignOptions}
                  />
                  <Form.ErrorMessage field="campaignId" />
                </div>

                <div>
                  <Form.Label htmlFor="animalId">Animal</Form.Label>
                  <Form.SearchableSelect
                    name="animalId"
                    type="number"
                    searchOptions={searchAnimalOptions}
                    minChars={3}
                    debounceMs={300}
                    displayLabel={animalDisplayLabel || undefined}
                  />
                </div>
              </div>

              <div className="mb-6">
                <Form.Label htmlFor="observations">Observações</Form.Label>
                <Form.TextArea name="observations" rows={4} />
                <Form.ErrorMessage field="observations" />
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-4">
              <Button type="button" variant="outline" onClick={() => pushTo(-1)}>
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                Voltar
              </Button>

              <Button type="submit" variant="success" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    <span>Salvando...</span>
                  </>
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
