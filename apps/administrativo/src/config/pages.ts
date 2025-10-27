import {
  BarChart3Icon,
  CalendarHeartIcon,
  ClipboardListIcon,
  DogIcon,
  FlagIcon,
  HeartHandshakeIcon,
  HeartIcon,
  HospitalIcon,
  LifeBuoyIcon,
  MegaphoneIcon,
  NewspaperIcon,
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
      { title: 'Tipos de Campanha', path: '/tipos-campanhas', roles: ['AdminPanel', 'Registrations', 'CampaignTypes'] },
      {
        title: 'Tipos de Transação',
        path: '/tipos-transacoes',
        roles: ['AdminPanel', 'Registrations', 'TransactionTypes'],
      },
      {
        title: 'Tipos de Destino Final',
        path: '/tipos-destino',
        roles: ['AdminPanel', 'Registrations', 'FinalDestinationTypes'],
      },
    ],
    roles: ['AdminPanel', 'Registrations'],
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
  { title: 'Publicações', path: '/publicacoes', icon: NewspaperIcon, roles: ['AdminPanel', 'Posts'] },
  {
    title: 'Financeiro',
    icon: WalletIcon,
    pages: [
      { title: 'Despesas', path: '/financeiro/despesas' },
      { title: 'Receitas', path: '/financeiro/receitas' },
    ],
    roles: ['AdminPanel', 'Financial'],
  },
  { title: 'Relatórios', path: '/relatorios', icon: BarChart3Icon, roles: ['AdminPanel', 'Reports'] },
]
