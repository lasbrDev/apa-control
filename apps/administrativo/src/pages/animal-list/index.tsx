import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  DogIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HistoryIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { z } from 'zod'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardToolbar } from '../../components/card'
import { Form } from '../../components/form-hook'
import { ActionsList } from '../../components/list/ActionList'
import { Pagination } from '../../components/list/Pagination'
import { LoadingCard } from '../../components/loading-card'
import { Separator } from '../../components/separator'
import { Spinner } from '../../components/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { errorMessageHandler } from '../../helpers/axios'
import { itemCountMessage } from '../../helpers/item-count'
import { toQueryString } from '../../helpers/qs'
import { type ReportExportType, downloadReportBlob } from '../../helpers/report-download'
import { useRefresh } from '../../hooks/refresh'
import { api } from '../../service'

interface AnimalListValues {
  id: number
  name: string
  species: string
  breed: string | null
  size: string
  sex: string
  age: number
  healthCondition: string
  entryDate: string
  observations: string | null
  status: string
}

const animalFilterSchema = z.object({
  fields: z.string(),
  page: z.number(),
  sort: z.string().optional(),
  name: z.string().nullish(),
  species: z.string().nullish(),
  breed: z.string().nullish(),
  status: z.string().nullish(),
})

type AnimalFilterData = z.infer<typeof animalFilterSchema>

const speciesOptions = [
  { value: 'canina', label: 'Cachorro' },
  { value: 'felina', label: 'Gato' },
  { value: 'outros', label: 'Outros' },
]

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_tratamento', label: 'Em Tratamento' },
  { value: 'adotado', label: 'Adotado' },
]

export const AnimalList = () => {
  const { modal, token } = useApp()
  const refresh = useRefresh()
  const [fetching, setFetching] = useState(false)
  const [downloading, setDownloading] = useState<ReportExportType | null>(null)
  const [items, setItems] = useState<AnimalListValues[]>([])
  const [total, setTotal] = useState(0)

  const animalFilterForm = useForm<AnimalFilterData>({
    resolver: zodResolver(animalFilterSchema),
    defaultValues: {
      page: 1,
      fields: 'id,name,species,breed,size,sex,age,healthCondition,entryDate,status',
      sort: 'name',
    },
  })

  const { handleSubmit, getValues, setValue } = animalFilterForm
  const page = getValues('page')
  const pages = Math.ceil(total / 10)

  const removeAnimal = useCallback(
    (values: AnimalListValues) => {
      modal.confirm({
        title: 'Remover animal',
        message: `Deseja remover o animal ${values.name}?`,
        confirmText: 'Remover',
        callback: (confirmed) => {
          if (confirmed) {
            api
              .delete(`animal.delete/${values.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(refresh.force)
              .catch((err) => modal.alert(errorMessageHandler(err)))
          }
        },
      })
    },
    [token],
  )

  async function listAnimals(values: AnimalFilterData) {
    setFetching(true)

    try {
      const { data, headers } = await api.get(`animal.list?${toQueryString(values)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setItems(data)
      setTotal(Number(headers['x-total-count']))
    } catch (error) {
      modal.alert(errorMessageHandler(error))
    }

    setFetching(false)
  }

  async function exportAnimals(exportType: ReportExportType) {
    setDownloading(exportType)

    try {
      const values = getValues()
      const response = await api.get(
        `animal.list?${toQueryString({
          ...values,
          page: undefined,
          perPage: undefined,
          exportType,
        })}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        },
      )

      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      downloadReportBlob(blob, 'animais', exportType)
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    handleSubmit(listAnimals)()
  }, [refresh.ref])

  function changePage(page: number) {
    setValue('page', page)
    refresh.force()
  }

  return (
    <>
      <Helmet>
        <title>Animais - APA Control</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>
            <DogIcon />
            Animais
          </CardTitle>

          <CardToolbar>
            <Button
              type="button"
              variant="outline"
              className="border-green-700 bg-green-200 text-green-900 hover:bg-green-300"
              disabled={downloading === 'csv'}
              onClick={() => exportAnimals('csv')}
            >
              {downloading === 'csv' ? (
                <Spinner />
              ) : (
                <>
                  <FileSpreadsheetIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span>Baixar em CSV</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="success"
              disabled={downloading === 'xlsx'}
              onClick={() => exportAnimals('xlsx')}
            >
              {downloading === 'xlsx' ? (
                <Spinner />
              ) : (
                <>
                  <FileSpreadsheetIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span>Baixar em Excel</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="danger"
              disabled={downloading === 'pdf'}
              onClick={() => exportAnimals('pdf')}
            >
              {downloading === 'pdf' ? (
                <Spinner />
              ) : (
                <>
                  <FileTextIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span>Baixar em PDF</span>
                </>
              )}
            </Button>

            <Button variant="danger" asChild>
              <Link to="cadastro">
                <PlusIcon className="mr-2 h-5 w-5" />
                <span>Novo Animal</span>
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <FormProvider {...animalFilterForm}>
            <form onSubmit={handleSubmit(listAnimals)}>
              <div className="mb-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                <div>
                  <Form.Label htmlFor="name">Nome</Form.Label>
                  <Form.Input type="search" name="name" />
                  <Form.ErrorMessage field="name" />
                </div>

                <div>
                  <Form.Label htmlFor="species">Espécie</Form.Label>
                  <Form.Select name="species" isClearable placeholder="Todas" options={speciesOptions} />
                  <Form.ErrorMessage field="species" />
                </div>

                <div>
                  <Form.Label htmlFor="breed">Raça</Form.Label>
                  <Form.Input type="search" name="breed" />
                  <Form.ErrorMessage field="breed" />
                </div>

                <div>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Form.Select name="status" isClearable placeholder="Todos" options={statusOptions} />
                  <Form.ErrorMessage field="status" />
                </div>
              </div>

              <CardFooter className="mt-6 p-0">
                <Button type="submit">
                  <SearchIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span>Consultar</span>
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>

        <div>
          <Separator />

          <div className="relative">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead aria-label="Ações" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatName(item.name)}</TableCell>
                    <TableCell>{formatSpecies(item.species)}</TableCell>
                    <TableCell>{item.breed}</TableCell>
                    <TableCell>{item.age} anos</TableCell>
                    <TableCell>{formatHealthCondition(item.healthCondition)}</TableCell>
                    <TableCell>{formatStatus(item.status)}</TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap">
                      <ActionsList
                        primaryKey="id"
                        values={item}
                        actions={[
                          { icon: PencilIcon, title: 'Editar', action: ':id' },
                          { icon: HistoryIcon, title: 'Ver Histórico', action: ':id/historico' },
                          { icon: XIcon, title: 'Remover', action: removeAnimal },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {items.length === 0 && <TableCaption>Nenhum item foi encontrado.</TableCaption>}
            </Table>

            {fetching && <LoadingCard position="absolute" />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 p-6">
            <span className="text-sm dark:text-gray-300">{itemCountMessage('animais', page, pages, total)}</span>

            <Pagination current={page} total={pages} changePage={changePage} />
          </div>
        </div>
      </Card>
    </>
  )
}

function formatName(name: string) {
  return <span>{name}</span>
}

function formatSpecies(species: string) {
  const speciesMap: Record<string, string> = {
    canina: 'Cachorro',
    felina: 'Gato',
    outros: 'Outros',
  }
  return speciesMap[species] || species
}

function formatHealthCondition(condition: string) {
  const conditionMap: Record<string, string> = {
    saudavel: 'Saudável',
    estavel: 'Estável',
    critica: 'Crítica',
  }
  return conditionMap[condition] || condition
}

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    disponivel: 'Disponível',
    em_tratamento: 'Em Tratamento',
    adotado: 'Adotado',
  }
  return statusMap[status] || status
}
