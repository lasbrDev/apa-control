import 'react-datepicker/dist/react-datepicker.css'
import './assets/css/index.css'

import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppProvider } from './App'
import { NotFound } from './pages/not-found'

const rootElement = document.getElementById('root')

ReactDOM.createRoot(rootElement!).render(
  <BrowserRouter>
    <AppProvider>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppProvider>
  </BrowserRouter>,
)
