export interface ListPostsData {
  title?: string
  type?: string
  status?: string
  employeeId?: number
  publicationDateStart?: string
  publicationDateEnd?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export interface PostWithDetails {
  id: number
  employeeId: number
  title: string
  content: string
  type: string
  publicationDate: Date
  status: string
  relatedAnimals: string | null
  createdAt: Date
  updatedAt: Date | null
  employeeName?: string | null
}
