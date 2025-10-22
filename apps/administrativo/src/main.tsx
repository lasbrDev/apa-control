import 'react-datepicker/dist/react-datepicker.css'
import './assets/css/index.css'

import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppProvider } from './App'
import { PanelOutlet } from './components/panel-outlet'
import { pages } from './config/pages'
import { ForgotPassword } from './pages/forgot-password'
import { Home } from './pages/home'
import { Login } from './pages/login'
import { NotFound } from './pages/not-found'
import { ProcedureTypeList } from './pages/procedure-type-list'
import { ProfileForm } from './pages/profile-form'
import { ProfileList } from './pages/profile-list'

const rootElement = document.getElementById('root')

ReactDOM.createRoot(rootElement!).render(
  <BrowserRouter basename={import.meta.env.PROD ? 'administrativo' : undefined}>
    <AppProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="esqueceu-senha" element={<ForgotPassword />} />
        <Route path="/" element={<PanelOutlet pages={pages} />}>
          <Route index element={<Home />} />
          <Route path="perfis" element={<ProfileList />} />
          <Route path="perfis/cadastro" element={<ProfileForm />} />
          <Route path="perfis/:id" element={<ProfileForm />} />
          <Route path="tipos-procedimentos" element={<ProcedureTypeList />} />
          <Route path="tipos-procedimentos/cadastro" element={<ProcedureTypeList />} />
          <Route path="tipos-procedimentos/:id" element={<ProcedureTypeList />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AppProvider>
  </BrowserRouter>,
)
