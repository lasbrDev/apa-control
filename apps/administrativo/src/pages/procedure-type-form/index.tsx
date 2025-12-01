import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { DollarSignIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { useApp } from '../../App'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { ModalForm } from '../../components/modal-form'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'

interface ProcedureTypeFormProps {
  id?: number
  show: boolean
  refresh: VoidFunction
}

const procedureTypeSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, RequiredMessage),
  description: z.string().min(1, RequiredMessage),
  category: z.enum(['clinico', 'cirurgico', 'exame', 'vacina']),
  averageCost: z.number().min(1, RequiredMessage),
  active: z.coerce.boolean(),
})

type ProcedureTypeData = z.infer<typeof procedureTypeSchema>

export const ProcedureTypeForm = ({ show, refresh, id }: ProcedureTypeFormProps) => {
  const { token } = useApp()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const procedureTypeForm = useForm({
    resolver: zodResolver(procedureTypeSchema),
    defaultValues: { category: 'clinico', averageCost: 0, active: true },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = procedureTypeForm

  async function addOrUpdateProcedureType(values: ProcedureTypeData) {
    try {
      await api[id ? 'put' : 'post'](id ? 'procedure-type.update' : 'procedure-type.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Tipo de Procedimento ${values.name} ${id ? 'atualizado' : 'criado'} com sucesso!`)
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
        .get(`procedure-type.key/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          reset(data)
          setDisplayName(data.name)
        })
        .catch((err) => toast.error(errorMessageHandler(err)))
        .finally(() => setFetching(false))
    } else if (show) {
      reset({ category: 'clinico', averageCost: 0, active: true })
      setDisplayName('')
    }
  }, [id, show])

  if (fetching) return <LoadingCard />

  return (
    <FormProvider {...procedureTypeForm}>
      <ModalForm
        title={displayName || 'Novo Tipo de Procedimento'}
        show={show}
        fetching={fetching}
        submitting={isSubmitting}
        resetForm={reset}
        onSubmit={handleSubmit(addOrUpdateProcedureType)}
        closeAction={handleClose}
      >
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div>
            <Form.Label htmlFor="name">Nome</Form.Label>
            <Form.Input name="name" />
            <Form.ErrorMessage field="name" />
          </div>

          <div>
            <Form.Label htmlFor="category">Classificação</Form.Label>
            <Form.Select name="category" options={procedureCategoryOptions} />
            <Form.ErrorMessage field="category" />
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div>
            <Form.Label htmlFor="description">Descrição</Form.Label>
            <Form.Input name="description" />
            <Form.ErrorMessage field="description" />
          </div>

          <div>
            <Form.Label htmlFor="averageCost">Custo Médio</Form.Label>

            <Form.IconContainer>
              <Form.DecimalInput name="averageCost" className="pl-9" />
              <Form.Icon icon={DollarSignIcon} />
            </Form.IconContainer>

            <Form.ErrorMessage field="averageCost" />
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
  )
}

const procedureCategoryOptions = [
  { label: 'Clínico', value: 'clinico' },
  { label: 'Cirúrgico', value: 'cirurgico' },
  { label: 'Exame', value: 'exame' },
  { label: 'Vacina', value: 'vacina' },
]
