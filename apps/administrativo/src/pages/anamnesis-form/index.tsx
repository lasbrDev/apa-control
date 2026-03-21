import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, ClipboardListIcon, SaveIcon, SearchIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { AppointmentSearchModal } from '../../components/appointment-search-modal'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Spinner } from '../../components/spinner'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'

const schema = z.object({
  id: z.number().nullish(),
  appointmentId: z.number({ message: RequiredMessage }).int().positive(),
  symptomsPresented: z.string().min(1, RequiredMessage),
  dietaryHistory: z.string().optional().nullable(),
  behavioralHistory: z.string().optional().nullable(),
  requestedExams: z.string().optional().nullable(),
  presumptiveDiagnosis: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
})
type Data = z.infer<typeof schema>

export const AnamnesisForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false)
  const [appointmentDisplayLabel, setAppointmentDisplayLabel] = useState('')
  const form = useForm<Data>({ resolver: zodResolver(schema), defaultValues: { observations: '' } })
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form
  const appointmentId = watch('appointmentId')

  async function submit(values: Data) {
    try {
      await api[params.id ? 'put' : 'post'](params.id ? 'anamnesis.update' : 'anamnesis.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success(`Anamnese ${params.id ? 'atualizada' : 'registrada'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }
    Promise.all([params.id ? api.get(`anamnesis.key/${params.id}`, config) : Promise.resolve({ data: null })])
      .then(async ([keyResponse]) => {
        if (keyResponse.data) {
          const key = keyResponse.data
          reset({
            id: key.id,
            appointmentId: key.appointmentId,
            symptomsPresented: key.symptomsPresented,
            dietaryHistory: key.dietaryHistory ?? '',
            behavioralHistory: key.behavioralHistory ?? '',
            requestedExams: key.requestedExams ?? '',
            presumptiveDiagnosis: key.presumptiveDiagnosis ?? '',
            observations: key.observations ?? '',
          })
          try {
            const { data: appointment } = await api.get(`appointment.key/${key.appointmentId}`, config)
            setAppointmentDisplayLabel(
              `#${appointment.id} - ${appointment.animalName ?? 'Animal'} (${new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')})`,
            )
          } catch {
            setAppointmentDisplayLabel(`#${key.appointmentId}`)
          }
        }
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [])

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Anamnese - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <ClipboardListIcon />
            {params.id ? 'Editar anamnese' : 'Nova anamnese'}
          </CardTitle>
        </CardHeader>
        <FormProvider {...form}>
          <form autoComplete="off" onSubmit={handleSubmit(submit)}>
            <CardContent>
              <div className="mb-6">
                <Form.Label htmlFor="appointmentIdDisplay">Consulta</Form.Label>
                <div className="flex gap-2">
                  <Form.Input
                    id="appointmentIdDisplay"
                    name="appointmentIdDisplay"
                    value={appointmentDisplayLabel || (appointmentId ? `#${appointmentId}` : '')}
                    disabled
                    placeholder="Nenhuma consulta selecionada"
                  />
                  <Button type="button" variant="outline" onClick={() => setOpenAppointmentModal(true)}>
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                </div>
                <Form.ErrorMessage field="appointmentId" />
              </div>
              <div className="mb-6">
                <Form.Label htmlFor="symptomsPresented">Sintomas apresentados</Form.Label>
                <Form.TextArea name="symptomsPresented" rows={3} />
                <Form.ErrorMessage field="symptomsPresented" />
              </div>
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="dietaryHistory">Histórico alimentar</Form.Label>
                  <Form.TextArea name="dietaryHistory" rows={3} />
                  <Form.ErrorMessage field="dietaryHistory" />
                </div>
                <div>
                  <Form.Label htmlFor="behavioralHistory">Histórico comportamental</Form.Label>
                  <Form.TextArea name="behavioralHistory" rows={3} />
                  <Form.ErrorMessage field="behavioralHistory" />
                </div>
              </div>
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="requestedExams">Exames solicitados</Form.Label>
                  <Form.TextArea name="requestedExams" rows={3} />
                  <Form.ErrorMessage field="requestedExams" />
                </div>
                <div>
                  <Form.Label htmlFor="presumptiveDiagnosis">Diagnóstico presuntivo</Form.Label>
                  <Form.TextArea name="presumptiveDiagnosis" rows={3} />
                  <Form.ErrorMessage field="presumptiveDiagnosis" />
                </div>
              </div>
              <div className="mb-6">
                <Form.Label htmlFor="observations">Observações</Form.Label>
                <Form.TextArea name="observations" rows={3} />
                <Form.ErrorMessage field="observations" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-4">
              <Button type="button" variant="outline" onClick={() => pushTo(-1)}>
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                Voltar
              </Button>
              <Button type="submit" variant="danger" disabled={isSubmitting}>
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
      <AppointmentSearchModal
        open={openAppointmentModal}
        onClose={() => setOpenAppointmentModal(false)}
        onSelect={(appointment) => {
          setValue('appointmentId', appointment.id, { shouldValidate: true })
          setAppointmentDisplayLabel(appointment.label)
          setOpenAppointmentModal(false)
        }}
      />
    </>
  )
}
