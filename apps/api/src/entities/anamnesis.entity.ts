export class Anamnesis {
  id?: number
  appointmentId: number
  symptomsPresented?: string | null
  dietaryHistory?: string | null
  behavioralHistory?: string | null
  requestedExams?: string | null
  presumptiveDiagnosis?: string | null
  observations?: string | null
  proof?: string | null
  createdAt: Date

  constructor(props: Omit<Anamnesis, 'id'>, id?: number) {
    this.id = id
    this.appointmentId = props.appointmentId
    this.symptomsPresented = props.symptomsPresented
    this.dietaryHistory = props.dietaryHistory
    this.behavioralHistory = props.behavioralHistory
    this.requestedExams = props.requestedExams
    this.presumptiveDiagnosis = props.presumptiveDiagnosis
    this.observations = props.observations
    this.proof = props.proof
    this.createdAt = props.createdAt
  }
}
