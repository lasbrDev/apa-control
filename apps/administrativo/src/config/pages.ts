import {
  AlertTriangleIcon,
  CalendarHeartIcon,
  ClipboardListIcon,
  DogIcon,
  FlagIcon,
  HeartHandshakeIcon,
  HeartIcon,
  HospitalIcon,
  LifeBuoyIcon,
  MegaphoneIcon,
  PlusCircleIcon,
  SyringeIcon,
  UserCogIcon,
  UserIcon,
  WalletIcon,
} from 'lucide-react'
import type { PageProps } from '../components/panel-outlet'

export const pages: PageProps[] = [
  { title: 'Funcionários', path: '/funcionarios', icon: UserIcon, roles: ['AdminPanel', 'Employees'] },
  { title: 'Perfis de Acesso', path: '/perfis', icon: UserCogIcon, roles: ['AdminPanel', 'AccessProfiles'] },
  {
    title: 'Cadastros',
    icon: PlusCircleIcon,
    pages: [
      {
        title: 'Tipos de Procedimento',
        path: '/tipos-procedimentos',
        roles: ['AdminPanel', 'Registrations', 'ProcedureTypes'],
      },
      {
        title: 'Tipos de Consulta',
        path: '/tipos-consultas',
        roles: ['AdminPanel', 'Registrations', 'AppointmentTypes'],
      },
      {
        title: 'Tipos de Ocorrência',
        path: '/tipos-ocorrencia',
        roles: ['AdminPanel', 'Registrations'],
      },
      { title: 'Tipos de Campanha', path: '/tipos-campanhas', roles: ['AdminPanel', 'Registrations', 'CampaignTypes'] },
      {
        title: 'Tipos de Lançamento',
        path: '/tipos-lancamento',
        roles: ['AdminPanel', 'Registrations', 'TransactionTypes'],
      },
      {
        title: 'Tipos de Destino Final',
        path: '/tipos-destino',
        roles: ['AdminPanel', 'Registrations', 'FinalDestinationTypes'],
      },
    ],
    roles: [
      'AdminPanel',
      'Registrations',
      'ProcedureTypes',
      'AppointmentTypes',
      'CampaignTypes',
      'TransactionTypes',
      'FinalDestinationTypes',
    ],
  },
  {
    title: 'Clínicas Veterinárias',
    path: '/clinicas',
    icon: HospitalIcon,
    roles: ['AdminPanel', 'VeterinaryClinics'],
  },
  { title: 'Animais', path: '/animais', icon: DogIcon, roles: ['AdminPanel', 'Animals'] },
  { title: 'Resgates', path: '/resgates', icon: LifeBuoyIcon, roles: ['AdminPanel', 'Rescues'] },
  { title: 'Adoções', path: '/adocoes', icon: HeartHandshakeIcon, roles: ['AdminPanel', 'Adoptions'] },
  { title: 'Adotantes', path: '/adotantes', icon: HeartIcon, roles: ['AdminPanel', 'Adopters'] },
  { title: 'Consultas', path: '/consultas', icon: CalendarHeartIcon, roles: ['AdminPanel', 'Appointments'] },
  { title: 'Ocorrências', path: '/ocorrencias', icon: AlertTriangleIcon, roles: ['AdminPanel', 'Animals'] },
  { title: 'Anamnese', path: '/anamnese', icon: ClipboardListIcon, roles: ['AdminPanel', 'Anamnesis'] },
  {
    title: 'Procedimentos Clínicos',
    path: '/procedimentos',
    icon: SyringeIcon,
    roles: ['AdminPanel', 'ClinicalProcedures'],
  },
  { title: 'Campanhas', path: '/campanhas', icon: MegaphoneIcon, roles: ['AdminPanel', 'Campaigns'] },
  {
    title: 'Destino Final',
    path: '/destino-final',
    icon: FlagIcon,
    roles: ['AdminPanel', 'FinalDestinations'],
  },
  {
    title: 'Financeiro',
    icon: WalletIcon,
    pages: [
      { title: 'Despesas', path: '/financeiro/despesas', roles: ['AdminPanel', 'Financial', 'Expenses'] },
      { title: 'Receitas', path: '/financeiro/receitas', roles: ['AdminPanel', 'Financial', 'Revenues'] },
    ],
    roles: ['AdminPanel', 'Financial', 'Expenses', 'Revenues'],
  },
]
