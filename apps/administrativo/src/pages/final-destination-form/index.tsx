import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, FlagIcon, SaveIcon } from 'lucide-react'
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

const finalDestinationSchema = z.object({
  id: z.number().nullish(),
  animalId: z.number({ message: RequiredMessage }).int().positive(),
  destinationTypeId: z.number({ message: RequiredMessage }).int().positive(),
  destinationDate: z.string().min(1, RequiredMessage),
  reason: z.string().min(1, RequiredMessage),
  observations: z.string().optional().nullable(),
  proof: z.string().optional().nullable(),
  proofFile: z.any().optional().nullable(),
})

type FinalDestinationData = z.infer<typeof finalDestinationSchema>

export const FinalDestinationForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([])
  const [destinationTypeOptions, setDestinationTypeOptions] = useState<SelectOption[]>([])

  const finalDestinationForm = useForm<FinalDestinationData>({
    resolver: zodResolver(finalDestinationSchema),
    defaultValues: {
      observations: '',
      proof: '',
      proofFile: null,
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = finalDestinationForm
  const [currentProof, setCurrentProof] = useState<string>('')

  async function addOrUpdateFinalDestination(values: FinalDestinationData) {
    try {
      const formData = new FormData()
      if (values.id) formData.append('id', String(values.id))
      formData.append('animalId', String(values.animalId))
      formData.append('destinationTypeId', String(values.destinationTypeId))
      formData.append('destinationDate', values.destinationDate)
      formData.append('reason', values.reason)
      if (values.observations) formData.append('observations', values.observations)
      if (currentProof) formData.append('proof', currentProof)

      if (values.proofFile?.length) {
        formData.append('proofFile', values.proofFile[0])
      }

      await api[params.id ? 'put' : 'post'](
        params.id ? 'final-destination.update' : 'final-destination.add',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      toast.success(`Destino final ${params.id ? 'atualizado' : 'registrado'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([
      api.get(`animal.list?${toQueryString({ page: 0, fields: 'id,name,status', sort: 'name' })}`, config),
      api.get('final-destination-type.list', config),
      params.id ? api.get(`final-destination.key/${params.id}`, config) : Promise.resolve({ data: null }),
    ])
      .then(([animalsResponse, destinationTypesResponse, keyResponse]) => {
        const animals = Array.isArray(animalsResponse.data) ? animalsResponse.data : []
        setAnimalOptions(animals.map((item) => ({ value: item.id, label: item.name })))

        const destinationTypes = Array.isArray(destinationTypesResponse.data) ? destinationTypesResponse.data : []
        setDestinationTypeOptions(
          destinationTypes.filter((item) => item.active).map((item) => ({ value: item.id, label: item.name })),
        )

        if (keyResponse.data) {
          const key = keyResponse.data
          setCurrentProof(key.proof ?? '')
          const destinationDate =
            typeof key.destinationDate === 'string'
              ? key.destinationDate.split('T')[0]
              : new Date(key.destinationDate).toISOString().split('T')[0]

          reset({
            id: key.id,
            animalId: key.animalId,
            destinationTypeId: key.destinationTypeId,
            destinationDate,
            reason: key.reason,
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
        <title>Destino Final - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <FlagIcon />
            {params.id ? 'Editar Destino Final' : 'Novo Destino Final'}
          </CardTitle>
        </CardHeader>

        <FormProvider {...finalDestinationForm}>
          <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateFinalDestination)}>
            <CardContent>
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="animalId">Animal</Form.Label>
                  <Form.Select name="animalId" type="number" options={animalOptions} />
                  <Form.ErrorMessage field="animalId" />
                </div>

                <div>
                  <Form.Label htmlFor="destinationTypeId">Tipo de destino final</Form.Label>
                  <Form.Select name="destinationTypeId" type="number" options={destinationTypeOptions} />
                  <Form.ErrorMessage field="destinationTypeId" />
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="destinationDate">Data do destino final</Form.Label>
                  <Form.Input type="date" name="destinationDate" />
                  <Form.ErrorMessage field="destinationDate" />
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

              <div className="mb-6">
                <Form.Label htmlFor="reason">Motivo</Form.Label>
                <Form.TextArea name="reason" rows={3} />
                <Form.ErrorMessage field="reason" />
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
