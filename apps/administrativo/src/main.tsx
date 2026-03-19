import 'react-datepicker/dist/react-datepicker.css'
import './assets/css/index.css'

import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppProvider } from './App'
import { PanelOutlet } from './components/panel-outlet'
import { Toaster } from './components/sonner'
import { pages } from './config/pages'
import { ThemeProvider } from './hooks/theme'
import { AdopterForm } from './pages/adopter-form'
import { AdopterList } from './pages/adopter-list'
import { AnimalForm } from './pages/animal-form'
import { AnimalHistoryPage } from './pages/animal-history'
import { AnimalList } from './pages/animal-list'
import { AppointmentTypeList } from './pages/appointment-type-list'
import { CampaignForm } from './pages/campaign-form'
import { CampaignList } from './pages/campaign-list'
import { CampaignTypeList } from './pages/campaign-type-list'
import { EmployeeForm } from './pages/employee-form'
import { EmployeeList } from './pages/employee-list'
import { FinalDestinationForm } from './pages/final-destination-form'
import { FinalDestinationList } from './pages/final-destination-list'
import { FinalDestinationTypeList } from './pages/final-destination-type-list'
import { ForgotPassword } from './pages/forgot-password'
import { Home } from './pages/home'
import { Login } from './pages/login'
import { NotFound } from './pages/not-found'
import { ProcedureTypeList } from './pages/procedure-type-list'
import { ProfileForm } from './pages/profile-form'
import { ProfileList } from './pages/profile-list'
import { RescueForm } from './pages/rescue-form'
import { RescueList } from './pages/rescue-list'
import { TransactionTypeList } from './pages/transaction-type-list'
import { VeterinaryClinicForm } from './pages/veterinary-clinic-form'
import { VeterinaryClinicList } from './pages/veterinary-clinic-list'

const rootElement = document.getElementById('root')

ReactDOM.createRoot(rootElement!).render(
  <HelmetProvider>
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="esqueceu-senha" element={<ForgotPassword />} />
            <Route path="/" element={<PanelOutlet pages={pages} />}>
              <Route index element={<Home />} />
              <Route path="perfis" element={<ProfileList />} />
              <Route path="perfis/cadastro" element={<ProfileForm />} />
              <Route path="perfis/:id" element={<ProfileForm />} />
              <Route path="funcionarios" element={<EmployeeList />} />
              <Route path="funcionarios/cadastro" element={<EmployeeForm />} />
              <Route path="funcionarios/:id" element={<EmployeeForm />} />
              <Route path="tipos-procedimentos" element={<ProcedureTypeList />} />
              <Route path="tipos-procedimentos/cadastro" element={<ProcedureTypeList />} />
              <Route path="tipos-procedimentos/:id" element={<ProcedureTypeList />} />
              <Route path="tipos-consultas" element={<AppointmentTypeList />} />
              <Route path="tipos-consultas/cadastro" element={<AppointmentTypeList />} />
              <Route path="tipos-consultas/:id" element={<AppointmentTypeList />} />
              <Route path="tipos-campanhas" element={<CampaignTypeList />} />
              <Route path="tipos-campanhas/cadastro" element={<CampaignTypeList />} />
              <Route path="tipos-campanhas/:id" element={<CampaignTypeList />} />
              <Route path="tipos-destino" element={<FinalDestinationTypeList />} />
              <Route path="tipos-destino/cadastro" element={<FinalDestinationTypeList />} />
              <Route path="tipos-destino/:id" element={<FinalDestinationTypeList />} />
              <Route path="tipos-lancamento" element={<TransactionTypeList />} />
              <Route path="tipos-lancamento/cadastro" element={<TransactionTypeList />} />
              <Route path="tipos-lancamento/:id" element={<TransactionTypeList />} />
              <Route path="clinicas" element={<VeterinaryClinicList />} />
              <Route path="clinicas/cadastro" element={<VeterinaryClinicForm />} />
              <Route path="clinicas/:id" element={<VeterinaryClinicForm />} />
              <Route path="adotantes" element={<AdopterList />} />
              <Route path="adotantes/cadastro" element={<AdopterForm />} />
              <Route path="adotantes/:id" element={<AdopterForm />} />
              <Route path="animais" element={<AnimalList />} />
              <Route path="animais/cadastro" element={<AnimalForm />} />
              <Route path="animais/:id" element={<AnimalForm />} />
              <Route path="animais/:id/historico" element={<AnimalHistoryPage />} />
              <Route path="resgates" element={<RescueList />} />
              <Route path="resgates/cadastro" element={<RescueForm />} />
              <Route path="resgates/:id" element={<RescueForm />} />
              <Route path="campanhas" element={<CampaignList />} />
              <Route path="campanhas/cadastro" element={<CampaignForm />} />
              <Route path="campanhas/:id" element={<CampaignForm />} />
              <Route path="destino-final" element={<FinalDestinationList />} />
              <Route path="destino-final/cadastro" element={<FinalDestinationForm />} />
              <Route path="destino-final/:id" element={<FinalDestinationForm />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  </HelmetProvider>,
)
