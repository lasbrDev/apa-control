import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, SaveIcon } from 'lucide-react'
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
  value: string
  label: string
}

const postTypeOptions: SelectOption[] = [
  { value: 'adocao', label: 'Adoção' },
  { value: 'campanha', label: 'Campanha' },
  { value: 'comunicado', label: 'Comunicado' },
]

const postStatusOptions: SelectOption[] = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'arquivado', label: 'Arquivado' },
]

const postSchema = z.object({
  id: z.number().nullish(),
  title: z.string().min(1, RequiredMessage).max(200),
  content: z.string().min(1, RequiredMessage),
  type: z.enum(['adocao', 'campanha', 'comunicado']),
  publicationDate: z.string().min(1, RequiredMessage),
  status: z.enum(['rascunho', 'publicado', 'arquivado']),
  relatedAnimals: z.string().nullish(),
})

type PostFormData = z.infer<typeof postSchema>

export const PostForm = () => {
  const { token } = useApp()
  const params = useParams()
  const pushTo = useNavigate()
  const [fetching, setFetching] = useState(false)

  const postForm = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: 'rascunho',
      type: 'comunicado',
      publicationDate: new Date().toISOString().split('T')[0],
      relatedAnimals: '',
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = postForm

  async function addOrUpdatePost(values: PostFormData) {
    try {
      const payload = {
        ...values,
        relatedAnimals: values.relatedAnimals ? values.relatedAnimals : null,
      }

      await api[params.id ? 'put' : 'post'](params.id ? 'post.update' : 'post.add', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success(`Publicação ${params.id ? 'atualizada' : 'registrada'} com sucesso!`)
      pushTo(-1)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  useEffect(() => {
    setFetching(true)
    const config = { headers: { Authorization: `Bearer ${token}` } }

    const keyPromise = params.id ? api.get(`post.key/${params.id}`, config) : Promise.resolve({ data: null })

    Promise.all([keyPromise])
      .then(([keyResponse]) => {
        const key = keyResponse.data
        if (!key) return

        const publicationDate =
          typeof key.publicationDate === 'string'
            ? key.publicationDate.split('T')[0]
            : new Date(key.publicationDate).toISOString().split('T')[0]

        reset({
          id: key.id,
          title: key.title,
          content: key.content,
          type: key.type,
          publicationDate,
          status: key.status,
          relatedAnimals: key.relatedAnimals ?? '',
        })
      })
      .catch((error) => toast.error(errorMessageHandler(error)))
      .finally(() => setFetching(false))
  }, [])

  if (fetching) return <LoadingCard />

  return (
    <>
      <Helmet>
        <title>Publicação - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>{params.id ? 'Editar publicação' : 'Nova publicação'}</CardTitle>
        </CardHeader>

        <FormProvider {...postForm}>
          <form autoComplete="off" onSubmit={handleSubmit(addOrUpdatePost)}>
            <CardContent>
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="type">Tipo</Form.Label>
                  <Form.Select name="type" options={postTypeOptions} />
                </div>
                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" options={postStatusOptions} />
                </div>
              </div>

              <div className="mb-6">
                <Form.Label htmlFor="title">Título</Form.Label>
                <Form.Input name="title" maxLength={200} />
              </div>

              <div className="mb-6">
                <Form.Label htmlFor="content">Conteúdo</Form.Label>
                <Form.TextArea name="content" rows={6} />
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Form.Label htmlFor="publicationDate">Data de publicação</Form.Label>
                  <Form.Input type="date" name="publicationDate" />
                </div>
                <div>
                  <Form.Label htmlFor="relatedAnimals">Animais relacionados (opcional)</Form.Label>
                  <Form.Input name="relatedAnimals" placeholder='Ex: "1,2,3" ou "[1,2]"' />
                </div>
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
    </>
  )
}
