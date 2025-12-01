import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { CalendarIcon, ChevronLeftIcon, DogIcon, HeartIcon, SaveIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Spinner } from '../../components/spinner'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { api } from '../../service'

const animalSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(1, 'O nome é obrigatório.').min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  species: z.string({ error: RequiredMessage }),
  breed: z.string().nullish(),
  size: z.string({ error: RequiredMessage }),
  sex: z.string({ error: RequiredMessage }),
  age: z
    .number({ error: RequiredMessage })
    .int('A idade deve ser um número inteiro.')
    .min(0, 'A idade deve ser maior ou igual a 0.')
    .max(50, 'A idade deve ser menor ou igual a 50.'),
  healthCondition: z.string({ error: RequiredMessage }),
  entryDate: z.string({ error: RequiredMessage }),
  observations: z.string().nullish(),
  status: z.string({ error: RequiredMessage }),
})

type AnimalData = z.infer<typeof animalSchema>

const speciesOptions = [
  { value: 'canina', label: 'Cachorro' },
  { value: 'felina', label: 'Gato' },
  { value: 'outros', label: 'Outros' },
]

const sizeOptions = [
  { value: 'pequeno', label: 'Pequeno' },
  { value: 'medio', label: 'Médio' },
  { value: 'grande', label: 'Grande' },
]

const sexOptions = [
  { value: 'macho', label: 'Macho' },
  { value: 'femea', label: 'Fêmea' },
]

const healthConditionOptions = [
  { value: 'saudavel', label: 'Saudável' },
  { value: 'estavel', label: 'Estável' },
  { value: 'critica', label: 'Crítica' },
]

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_tratamento', label: 'Em Tratamento' },
  { value: 'adotado', label: 'Adotado' },
]

export const AnimalForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)

  const animalForm = useForm({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      status: 'disponivel',
      entryDate: new Date().toISOString().split('T')[0],
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = animalForm

  async function addOrUpdateAnimal(values: AnimalData) {
    try {
      await api[params.id ? 'put' : 'post'](params.id ? 'animal.update' : 'animal.add', values, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Animal ${values.name} ${params.id ? 'atualizado' : 'criado'} com sucesso!`)
      pushTo(-1)
    } catch (err) {
      toast.error(errorMessageHandler(err))
    }
  }

  useEffect(() => {
    setFetching(true)

    const config = { headers: { Authorization: `Bearer ${token}` } }

    if (params.id) {
      api
        .get(`animal.key/${params.id}`, config)
        .then(({ data }) => {
          reset(data)
        })
        .catch((err) => toast.error(errorMessageHandler(err)))
        .finally(() => setFetching(false))
    } else {
      setFetching(false)
    }
  }, [])

  if (fetching) return <LoadingCard />

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <DogIcon />
          {params.id ? 'Editar Animal' : 'Novo Animal'}
        </CardTitle>
      </CardHeader>

      <FormProvider {...animalForm}>
        <form autoComplete="off" onSubmit={handleSubmit(addOrUpdateAnimal)}>
          <CardContent>
            <h4 className="mb-6 font-semibold leading-none tracking-tight">Dados Básicos</h4>

            <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
              <div>
                <Form.Label htmlFor="name">Nome</Form.Label>
                <Form.IconContainer>
                  <Form.Input name="name" className="pl-9" />
                  <Form.Icon icon={DogIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="name" />
              </div>

              <div>
                <Form.Label htmlFor="species">Espécie</Form.Label>
                <Form.Select name="species" options={speciesOptions} />
                <Form.ErrorMessage field="species" />
              </div>

              <div>
                <Form.Label htmlFor="breed">Raça</Form.Label>
                <Form.Input name="breed" placeholder="Ex: Golden Retriever" />
                <Form.ErrorMessage field="breed" />
              </div>

              <div>
                <Form.Label htmlFor="size">Porte</Form.Label>
                <Form.Select name="size" options={sizeOptions} />
                <Form.ErrorMessage field="size" />
              </div>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
              <div>
                <Form.Label htmlFor="sex">Sexo</Form.Label>
                <Form.Select name="sex" options={sexOptions} />
                <Form.ErrorMessage field="sex" />
              </div>

              <div>
                <Form.Label htmlFor="age">Idade Aproximada (anos)</Form.Label>
                <Form.Input name="age" type="number" min="0" max="50" />
                <Form.ErrorMessage field="age" />
              </div>

              <div>
                <Form.Label htmlFor="healthCondition">Condição de Saúde</Form.Label>
                <Form.IconContainer>
                  <Form.Select name="healthCondition" options={healthConditionOptions} className="pl-9" />
                  <Form.Icon icon={HeartIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="healthCondition" />
              </div>

              <div>
                <Form.Label htmlFor="entryDate">Data de Entrada</Form.Label>
                <Form.IconContainer>
                  <Form.Input name="entryDate" type="date" className="pl-9" />
                  <Form.Icon icon={CalendarIcon} />
                </Form.IconContainer>
                <Form.ErrorMessage field="entryDate" />
              </div>

              <div>
                <Form.Label htmlFor="status">Status</Form.Label>
                <Form.Select name="status" options={statusOptions} />
                <Form.ErrorMessage field="status" />
              </div>
            </div>

            <Separator className="my-7" />
            <div className="mb-6 font-semibold leading-none tracking-tight">Informações Adicionais</div>

            <div className="mb-6">
              <Form.Label htmlFor="observations">Observações</Form.Label>
              <Form.TextArea name="observations" placeholder="Informações adicionais sobre o animal..." rows={4} />
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
  )
}
