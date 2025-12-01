import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  DogIcon,
  DollarSignIcon,
  HeartHandshakeIcon,
  HeartIcon,
  HospitalIcon,
  LifeBuoyIcon,
  TrendingUpIcon,
  UserIcon,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useApp } from '../../App'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card'
import { LoadingCard } from '../../components/loading-card'
import { errorMessageHandler } from '../../helpers/axios'
import { api } from '../../service'

interface DashboardStats {
  animals?: number
  adoptions?: number
  rescues?: number
  employees?: number
  veterinaryClinics?: number
  adopters?: number
}

interface MonthlyData {
  month: string
  animals: number
  adoptions: number
  rescues: number
}

interface FinancialStats {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyData: MonthlyFinancialData[]
}

interface MonthlyFinancialData {
  month: string
  income: number
  expense: number
}

export const Home = () => {
  const { modal, operator, token } = useApp()
  const [stats, setStats] = useState<DashboardStats>({})
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [financialStats, setFinancialStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyData: [],
  })
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    setFetching(true)

    api
      .get('/dashboard.stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const { stats: statsData, monthlyStats, financialStats: financialData } = response.data
        setStats(statsData)
        setMonthlyData(monthlyStats)
        setFinancialStats(financialData)
      })
      .catch((err) => modal.alert(errorMessageHandler(err)))
      .finally(() => setFetching(false))
  }, [])

  const statsCards = useMemo(
    () =>
      [
        { key: 'animals', label: 'Animais', icon: DogIcon, path: '/animais', value: stats.animals },
        {
          key: 'adoptions',
          label: 'Adoções',
          icon: HeartHandshakeIcon,
          path: '/adocoes',
          value: stats.adoptions,
        },
        { key: 'rescues', label: 'Resgates', icon: LifeBuoyIcon, path: '/resgates', value: stats.rescues },
        {
          key: 'employees',
          label: 'Funcionários',
          icon: UserIcon,
          path: '/funcionarios',
          value: stats.employees,
        },
        {
          key: 'veterinaryClinics',
          label: 'Clínicas Veterinárias',
          icon: HospitalIcon,
          path: '/clinicas',
          value: stats.veterinaryClinics,
        },
        { key: 'adopters', label: 'Adotantes', icon: HeartIcon, path: '/adotantes', value: stats.adopters },
      ].filter((card) => card.value !== undefined),
    [stats],
  )

  if (fetching) {
    return <LoadingCard />
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - APA Control</title>
      </Helmet>
      <div className="space-y-5">
        <div className="animate-fade-in">
          <h1 className="mb-2 bg-linear-to-r from-brand via-pink-600 to-purple-600 bg-clip-text font-bold text-3xl text-transparent">
            Olá, {operator.name} 👋
          </h1>
          <p className="text-gray-600 text-sm">Bem-vindo ao painel de controle</p>
        </div>

        {statsCards.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statsCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Link key={stat.key} to={stat.path}>
                  <Card className="glass-card group h-full cursor-pointer overflow-hidden border border-gray-200/50 transition-all duration-300 hover:border-brand/30 hover:shadow-xl">
                    <CardContent className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
                      {Icon && (
                        <div className="rounded-lg bg-linear-to-br from-brand/20 via-brand/15 to-pink-500/20 p-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                          <Icon className="h-5 w-5 text-brand transition-transform duration-300 group-hover:scale-110" />
                        </div>
                      )}
                      <p className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text font-bold text-2xl text-transparent transition-all duration-300 group-hover:scale-105">
                        {stat.value}
                      </p>
                      <p className="font-medium text-base text-gray-600 transition-colors duration-300 group-hover:text-brand">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-card overflow-hidden border border-gray-200/50 transition-all duration-300 hover:border-blue-200/50 hover:shadow-xl">
            <CardHeader className="border-gray-100 border-b bg-linear-to-r from-blue-50/50 to-purple-50/50">
              <CardTitle className="flex items-center gap-2 bg-linear-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-lg text-transparent">
                <div className="rounded-lg bg-linear-to-br from-blue-500/20 to-purple-500/20 p-1.5">
                  <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                </div>
                Atividade Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="animals" fill="url(#colorAnimals)" name="Animais" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="adoptions" fill="url(#colorAdoptions)" name="Adoções" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="rescues" fill="url(#colorRescues)" name="Resgates" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorAnimals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="colorAdoptions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f5576c" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="colorRescues" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden border border-gray-200/50 transition-all duration-300 hover:border-emerald-200/50 hover:shadow-xl">
            <CardHeader className="border-gray-100 border-b bg-linear-to-r from-emerald-50/50 to-teal-50/50">
              <CardTitle className="flex items-center gap-2 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-lg text-transparent">
                <div className="rounded-lg bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-1.5">
                  <DollarSignIcon className="h-4 w-4 text-emerald-600" />
                </div>
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="group rounded-lg bg-linear-to-br from-emerald-50 via-emerald-50/80 to-green-50 p-3 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <p className="mb-1 font-medium text-gray-600 text-xs">Receitas</p>
                  <p className="font-bold text-base text-emerald-600 transition-transform duration-300 group-hover:scale-105">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      financialStats.totalIncome,
                    )}
                  </p>
                </div>
                <div className="group rounded-lg bg-linear-to-br from-rose-50 via-rose-50/80 to-red-50 p-3 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <p className="mb-1 font-medium text-gray-600 text-xs">Despesas</p>
                  <p className="font-bold text-base text-rose-600 transition-transform duration-300 group-hover:scale-105">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      financialStats.totalExpense,
                    )}
                  </p>
                </div>
                <div
                  className={`group rounded-lg p-3 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    financialStats.balance >= 0
                      ? 'bg-linear-to-br from-emerald-50 via-emerald-50/80 to-green-50'
                      : 'bg-linear-to-br from-rose-50 via-rose-50/80 to-red-50'
                  }`}
                >
                  <p className="mb-1 font-medium text-gray-600 text-xs">Saldo</p>
                  <p
                    className={`font-bold text-base transition-transform duration-300 group-hover:scale-105 ${
                      financialStats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      financialStats.balance,
                    )}
                  </p>
                </div>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialStats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                      }
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="url(#colorIncome)" name="Receitas" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="url(#colorExpense)" name="Despesas" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
