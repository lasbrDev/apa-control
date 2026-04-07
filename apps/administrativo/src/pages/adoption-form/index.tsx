import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DollarSignIcon,
  HeartHandshakeIcon,
  MailIcon,
  PhoneIcon,
  SaveIcon,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/card'
import { Form } from '../../components/form-hook'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Spinner } from '../../components/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs'
import { errorMessageHandler } from '../../helpers/axios'
import { RequiredMessage } from '../../helpers/constants'
import { toQueryString } from '../../helpers/qs'
import { isCpf } from '../../helpers/validation'
import { api } from '../../service'

interface AnimalOption {
  id: number
  name: string
  status: string
}
interface AdopterOption {
  id: number
  name: string
}
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
const adoptionStatusOptions = [
  { value: 'processando', label: 'Processando' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

const adoptionSchema = z.object({
  id: z.number().nullish(),
  animalId: z.number().nullish(),
  adopterId: z.union([z.number(), z.string()]).optional(),
  adopterName: z.string().optional(),
  adopterCpf: z.string().optional(),
  adopterEmail: z.string().optional(),
  adopterPhone: z.string().optional(),
  adopterAddress: z.string().optional(),
  adopterFamilyIncome: z.number().optional(),
  adopterAnimalExperience: z.boolean().optional(),
  adoptionDate: z.string().min(1, RequiredMessage),
  adaptationPeriod: z.any().transform((v): number | null => {
    if (v === '' || v === null || v === undefined) return null
    const n = typeof v === 'number' ? v : Number(v)
    if (!Number.isFinite(n) || n < 0) return null
    return Math.floor(n)
  }),
  status: z.enum(['processando', 'concluida', 'cancelada']),
  observations: z.string().nullish(),
  proof: z.string().nullish(),
  proofFile: z.any().nullish(),
  animalNamePreview: z.string().nullish(),
  speciesPreview: z.string().nullish(),
  breedPreview: z.string().nullish(),
  sizePreview: z.string().nullish(),
  sexPreview: z.string().nullish(),
  agePreview: z.string().nullish(),
  healthConditionPreview: z.string().nullish(),
  entryDatePreview: z.string().nullish(),
  animalObservationsPreview: z.string().nullish(),
})

type AdoptionFormData = z.infer<typeof adoptionSchema>

export const AdoptionForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [activeTab, setActiveTab] = useState<'animal' | 'adotante' | 'adocao'>('animal')
  const [currentProof, setCurrentProof] = useState('')
  const [animalReadOnlyLabel, setAnimalReadOnlyLabel] = useState('')
  const [adopterDisplayLabel, setAdopterDisplayLabel] = useState('')
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
  const searchAdopterOptions = useCallback(
    async (query: string): Promise<{ value: string; label: string }[]> => {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const qs = toQueryString({ name: query.trim(), perPage: 50, fields: 'id,name', sort: 'name' })
      const { data } = await api.get<AdopterOption[]>(`adopter.list?${qs}`, config)
      const list = Array.isArray(data) ? data : []
      return list.map((a) => ({ value: String(a.id), label: a.name }))
    },
    [token],
  )

  const adoptionForm = useForm<AdoptionFormData>({
    resolver: zodResolver(adoptionSchema),
    defaultValues: {
      status: 'processando',
      observations: '',
      proof: '',
      proofFile: null,
      animalId: null,
      adopterId: '',
      adopterName: '',
      adopterCpf: '',
      adopterEmail: '',
      adopterPhone: '',
      adopterAddress: '',
      adopterFamilyIncome: 0,
      adopterAnimalExperience: false,
      adaptationPeriod: null,
    },
  })

  const {
    handleSubmit,
    reset,
    setValue,
    setFocus,
    formState: { isSubmitting },
  } = adoptionForm
  const animalId = adoptionForm.watch('animalId')
  const animalNamePreview = adoptionForm.watch('animalNamePreview')
  const adopterId = adoptionForm.watch('adopterId')
  const parsedAdopterId = Number(adopterId)
  const isExistingAdopter = Number.isFinite(parsedAdopterId) && parsedAdopterId > 0

  async function saveAdoption(values: AdoptionFormData) {
    if (!params.id) {
      if (values.animalId == null) {
        toast.error('Selecione o animal.')
        return
      }
    }

    try {
      let finalAdopterId: number | null = Number(values.adopterId)
      if (!Number.isFinite(finalAdopterId) || finalAdopterId <= 0) {
        finalAdopterId = null
        const cpf = (values.adopterCpf ?? '').replace(/\D/g, '')
        const phone = (values.adopterPhone ?? '').replace(/\D/g, '')
        const inlineSchema = z.object({
          name: z.string().min(8),
          cpf: z.string().refine((v) => isCpf(v)),
          email: z.string().email(),
          phone: z.string().refine((v) => [10, 11].includes(v.length)),
          address: z.string().min(1),
          familyIncome: z.number().min(1),
          animalExperience: z.boolean(),
        })
        inlineSchema.parse({
          name: values.adopterName ?? '',
          cpf,
          email: values.adopterEmail ?? '',
          phone,
          address: values.adopterAddress ?? '',
          familyIncome: values.adopterFamilyIncome ?? 0,
          animalExperience: values.adopterAnimalExperience ?? false,
        })
        const { data } = await api.post(
          'adopter.add',
          {
            name: values.adopterName,
            cpf,
            email: values.adopterEmail,
            phone,
            address: values.adopterAddress,
            familyIncome: values.adopterFamilyIncome,
            animalExperience: values.adopterAnimalExperience,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        finalAdopterId = data.id
      }

      const formData = new FormData()
      if (params.id) {
        formData.append('id', String(values.id))
        formData.append('adopterId', String(finalAdopterId))
        formData.append('adoptionDate', values.adoptionDate)
        if (values.adaptationPeriod != null) formData.append('adaptationPeriod', String(values.adaptationPeriod))
        formData.append('status', values.status)
        if (values.observations) formData.append('observations', values.observations)
        if (currentProof) formData.append('proof', currentProof)
        if (values.proofFile?.length) formData.append('proofFile', values.proofFile[0])

        await api.put('adoption.update', formData, { headers: { Authorization: `Bearer ${token}` } })
      } else {
        formData.append('animalId', String(values.animalId))
        formData.append('adopterId', String(finalAdopterId))
        formData.append('adoptionDate', values.adoptionDate)
        if (values.adaptationPeriod != null) formData.append('adaptationPeriod', String(values.adaptationPeriod))
        formData.append('status', values.status)
        if (values.observations) formData.append('observations', values.observations)
        if (values.proofFile?.length) formData.append('proofFile', values.proofFile[0])

        await api.post('adoption.add', formData, { headers: { Authorization: `Bearer ${token}` } })
      }

      toast.success(`Adoção ${params.id ? 'atualizada' : 'registrada'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }

    Promise.all([params.id ? api.get(`adoption.key/${params.id}`, config) : Promise.resolve({ data: null })])
      .then(([keyResponse]) => {
        if (keyResponse.data) {
          const key = keyResponse.data
          const adoptionDate =
            typeof key.adoptionDate === 'string'
              ? key.adoptionDate.split('T')[0]
              : new Date(key.adoptionDate).toISOString().split('T')[0]

          setAnimalReadOnlyLabel(key.animalName ? `${key.animalName} (#${key.animalId})` : `Animal #${key.animalId}`)
          setCurrentProof(key.proof ?? '')
          setAdopterDisplayLabel(key.adopterName ?? '')
          reset({
            id: key.id,
            animalId: key.animalId,
            adopterId: key.adopterId,
            adopterName: key.adopterName ?? '',
            adoptionDate,
            adaptationPeriod: key.adaptationPeriod ?? null,
            status: key.status,
            observations: key.observations ?? '',
            proof: key.proof ?? '',
          })
        }
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => {
    if (!animalId || Number(animalId) <= 0) {
      setValue('animalNamePreview', '')
      setValue('speciesPreview', '')
      setValue('breedPreview', '')
      setValue('sizePreview', '')
      setValue('sexPreview', '')
      setValue('agePreview', '')
      setValue('healthConditionPreview', '')
      setValue('entryDatePreview', '')

      setValue('animalObservationsPreview', '')
      return
    }
    api
      .get(`animal.key/${animalId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setValue('animalNamePreview', data.name ?? '')
        setValue('speciesPreview', data.species ?? '')
        setValue('breedPreview', data.breed ?? '')
        setValue('sizePreview', data.size ?? '')
        setValue('sexPreview', data.sex ?? '')
        setValue('agePreview', data.birthYear ? `${new Date().getFullYear() - data.birthYear} anos` : '')
        setValue('healthConditionPreview', data.healthCondition ?? '')
        setValue('entryDatePreview', data.entryDate?.split('T')[0] ?? '')

        setValue('animalObservationsPreview', data.observations ?? '')
      })
      .catch(() => {
        setValue('animalNamePreview', '')
        setValue('speciesPreview', '')
        setValue('breedPreview', '')
        setValue('sizePreview', '')
        setValue('sexPreview', '')
        setValue('agePreview', '')
        setValue('healthConditionPreview', '')
        setValue('entryDatePreview', '')

        setValue('animalObservationsPreview', '')
      })
  }, [animalId, token, setValue])

  useEffect(() => {
    if (!adopterId || Number(adopterId) <= 0) return
    api
      .get(`adopter.key/${adopterId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        adoptionForm.setValue('adopterName', data.name ?? '')
        adoptionForm.setValue('adopterCpf', data.cpf ?? '')
        adoptionForm.setValue('adopterEmail', data.email ?? '')
        adoptionForm.setValue('adopterPhone', data.phone ?? '')
        adoptionForm.setValue('adopterAddress', data.address ?? '')
        adoptionForm.setValue('adopterFamilyIncome', Number(data.familyIncome ?? 0))
        adoptionForm.setValue('adopterAnimalExperience', Boolean(data.animalExperience))
        setAdopterDisplayLabel(data.name ?? '')
      })
      .catch(() => undefined)
  }, [adopterId, token, adoptionForm])

  const animalTabFields: Array<keyof AdoptionFormData> = ['animalId']
  const adotanteTabFields: Array<keyof AdoptionFormData> = [
    'adopterId',
    'adopterName',
    'adopterCpf',
    'adopterEmail',
    'adopterPhone',
    'adopterAddress',
    'adopterFamilyIncome',
    'adopterAnimalExperience',
  ]
  const adocaoTabFields: Array<keyof AdoptionFormData> = ['adoptionDate', 'adaptationPeriod', 'status', 'observations']

  const onSubmitError: Parameters<typeof handleSubmit>[1] = (errors) => {
    if (!errors) return
    if (animalTabFields.find((f) => Boolean(errors[f]))) {
      setActiveTab('animal')
      setTimeout(() => setFocus(animalTabFields.find((f) => Boolean(errors[f]))!), 0)
      return
    }
    if (adotanteTabFields.find((f) => Boolean(errors[f]))) {
      setActiveTab('adotante')
      setTimeout(() => setFocus(adotanteTabFields.find((f) => Boolean(errors[f]))!), 0)
      return
    }
    if (adocaoTabFields.find((f) => Boolean(errors[f]))) {
      setActiveTab('adocao')
      setTimeout(() => setFocus(adocaoTabFields.find((f) => Boolean(errors[f]))!), 0)
    }
  }

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Adoção - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <HeartHandshakeIcon />
            {params.id ? 'Editar adoção' : 'Nova adoção'}
          </CardTitle>
        </CardHeader>

        <FormProvider {...adoptionForm}>
          <form autoComplete="off" onSubmit={handleSubmit(saveAdoption, onSubmitError)}>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'animal' | 'adotante' | 'adocao')}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="animal">Dados do Animal</TabsTrigger>
                  <TabsTrigger value="adotante">Dados do Adotante</TabsTrigger>
                  <TabsTrigger value="adocao">Dados da Adoção</TabsTrigger>
                </TabsList>
                <TabsContent value="animal">
                  {params.id ? (
                    <div className="mb-6">
                      <Form.Label>Animal</Form.Label>
                      <p className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                        {animalReadOnlyLabel}
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        O animal não pode ser alterado após o cadastro.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Form.Label htmlFor="animalId">Animal</Form.Label>
                      <Form.SearchableSelect
                        name="animalId"
                        type="number"
                        searchOptions={searchAnimalOptions}
                        minChars={3}
                        debounceMs={300}
                        displayLabel={animalNamePreview || undefined}
                      />
                    </div>
                  )}
                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="animalNamePreview">Nome</Form.Label>
                      <Form.Input name="animalNamePreview" disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="speciesPreview">Espécie</Form.Label>
                      <Form.Select name="speciesPreview" options={speciesOptions} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="breedPreview">Raça</Form.Label>
                      <Form.Input name="breedPreview" disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="sizePreview">Porte</Form.Label>
                      <Form.Select name="sizePreview" options={sizeOptions} disabled />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col">
                    <div>
                      <Form.Label htmlFor="sexPreview">Sexo</Form.Label>
                      <Form.Select name="sexPreview" options={sexOptions} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="agePreview">Idade</Form.Label>
                      <Form.Input name="agePreview" disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="healthConditionPreview">Condição de saúde</Form.Label>
                      <Form.Select name="healthConditionPreview" options={healthConditionOptions} disabled />
                    </div>
                    <div>
                      <Form.Label htmlFor="entryDatePreview">Data de entrada</Form.Label>
                      <Form.DateInput name="entryDatePreview" disabled />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="animalObservationsPreview">Observações (animal)</Form.Label>
                    <Form.TextArea name="animalObservationsPreview" rows={2} disabled />
                  </div>
                </TabsContent>
                <TabsContent value="adotante">
                  <div className="mb-6">
                    <Form.Label htmlFor="adopterId">Adotante</Form.Label>
                    <Form.SearchableSelect
                      name="adopterId"
                      type="number"
                      searchOptions={searchAdopterOptions}
                      minChars={3}
                      debounceMs={300}
                      displayLabel={adopterDisplayLabel || undefined}
                    />
                  </div>

                  <h4 className="mb-6 font-semibold leading-none tracking-tight dark:text-gray-200">Dados Pessoais</h4>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="adopterName">Nome</Form.Label>
                      <Form.Input name="adopterName" disabled={isExistingAdopter} />
                      <Form.ErrorMessage field="adopterName" />
                    </div>
                    <div>
                      <Form.Label htmlFor="adopterCpf">CPF</Form.Label>
                      <Form.MaskInput name="adopterCpf" mask="000.000.000-00" disabled={isExistingAdopter} />
                      <Form.ErrorMessage field="adopterCpf" />
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="adopterEmail">Email</Form.Label>
                      <Form.IconContainer>
                        <Form.Input name="adopterEmail" type="email" className="pl-9" disabled={isExistingAdopter} />
                        <Form.Icon icon={MailIcon} />
                      </Form.IconContainer>
                      <Form.ErrorMessage field="adopterEmail" />
                    </div>
                    <div>
                      <Form.Label htmlFor="adopterPhone">Telefone</Form.Label>
                      <Form.IconContainer>
                        <Form.MaskInput
                          name="adopterPhone"
                          mask="(00) 00000-0000"
                          className="pl-9"
                          disabled={isExistingAdopter}
                        />
                        <Form.Icon icon={PhoneIcon} />
                      </Form.IconContainer>
                      <Form.ErrorMessage field="adopterPhone" />
                    </div>
                  </div>
                  <Separator className="my-7" />
                  <div className="mb-6">
                    <Form.Label htmlFor="adopterAddress">Endereço Completo</Form.Label>
                    <Form.TextArea name="adopterAddress" rows={3} disabled={isExistingAdopter} />
                    <Form.ErrorMessage field="adopterAddress" />
                  </div>
                  <Separator className="my-7" />
                  <div className="mb-6">
                    <Form.Label htmlFor="adopterFamilyIncome">Renda Familiar</Form.Label>
                    <Form.IconContainer>
                      <Form.DecimalInput name="adopterFamilyIncome" className="pl-9" disabled={isExistingAdopter} />
                      <Form.Icon icon={DollarSignIcon} />
                    </Form.IconContainer>
                    <Form.ErrorMessage field="adopterFamilyIncome" />
                  </div>
                  <div className="mb-6 flex items-center space-x-2">
                    <Form.Switch name="adopterAnimalExperience" disabled={isExistingAdopter} />
                    <Form.Label htmlFor="adopterAnimalExperience" className="mb-0 leading-normal">
                      Tem experiência com animais?
                    </Form.Label>
                  </div>
                </TabsContent>
                <TabsContent value="adocao">
                  <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <div>
                      <Form.Label htmlFor="adoptionDate">Data da adoção</Form.Label>
                      <Form.DateInput name="adoptionDate" />
                      <Form.ErrorMessage field="adoptionDate" />
                    </div>
                    <div>
                      <Form.Label htmlFor="status">Status</Form.Label>
                      <Form.Select name="status" options={adoptionStatusOptions} disabled />
                      <Form.ErrorMessage field="status" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="adaptationPeriod">Período de adaptação (dias)</Form.Label>
                    <Form.Input name="adaptationPeriod" type="number" min={0} step={1} placeholder="Opcional" />
                    <Form.ErrorMessage field="adaptationPeriod" />
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="proofFile">Comprovante</Form.Label>
                    <Form.FileInput name="proofFile" />
                    <Form.ErrorMessage field="proofFile" />
                    {currentProof ? (
                      <span className="mt-2 block text-muted-foreground text-xs">Arquivo atual: {currentProof}</span>
                    ) : null}
                  </div>
                  <div className="mb-6">
                    <Form.Label htmlFor="observations">Observações</Form.Label>
                    <Form.TextArea name="observations" rows={4} />
                    <Form.ErrorMessage field="observations" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  if (activeTab === 'adocao') return setActiveTab('adotante')
                  if (activeTab === 'adotante') return setActiveTab('animal')
                  return pushTo(-1)
                }}
              >
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                <span>Voltar</span>
              </Button>
              {activeTab !== 'adocao' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab(activeTab === 'animal' ? 'adotante' : 'adocao')
                  }}
                >
                  <ChevronRightIcon className="mr-2 h-5 w-5" />
                  <span>Continuar</span>
                </Button>
              ) : (
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
              )}
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </>
  )
}
