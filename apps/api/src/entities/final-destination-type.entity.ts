export class FinalDestinationType {
  id?: number
  name: string
  description?: string | null
  active: boolean
  createdAt: Date

  constructor(props: Omit<FinalDestinationType, 'id'>, id?: number) {
    this.id = id
    this.name = props.name
    this.description = props.description
    this.active = props.active
    this.createdAt = props.createdAt
  }
}
