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
import { useTheme } from '../../hooks/theme'
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
  const { theme } = useTheme()
  const [stats, setStats] = useState<DashboardStats>({})
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [financialStats, setFinancialStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyData: [],
  })
  const [fetching, setFetching] = useState(true)

  const isDark = theme === 'dark'
  const tooltipStyle = {
    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: isDark ? '1px solid rgba(75, 85, 99, 0.5)' : '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '12px',
    color: isDark ? '#f3f4f6' : '#111827',
  }

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
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="animate-fade-in">
            <h1 className="mb-2 bg-linear-to-r from-brand via-pink-600 to-purple-600 bg-clip-text font-bold text-3xl text-transparent">
              Olá, {operator.name} 👋
            </h1>
            <p className="text-gray-600 text-sm dark:text-gray-400">Bem-vindo ao painel de controle</p>
          </div>

          {statsCards.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {statsCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <Link key={stat.key} to={stat.path}>
                    <Card className="glass-card group h-full cursor-pointer overflow-hidden border border-gray-200/50 transition-all duration-300 hover:border-brand/30 hover:shadow-xl dark:border-gray-700/50">
                      <CardContent className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
                        {Icon && (
                          <div className="rounded-lg bg-linear-to-br from-brand/20 via-brand/15 to-pink-500/20 p-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md dark:from-brand/30 dark:via-brand/25 dark:to-pink-500/30">
                            <Icon className="h-5 w-5 text-brand transition-transform duration-300 group-hover:scale-110" />
                          </div>
                        )}
                        <p className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text font-bold text-2xl text-transparent transition-all duration-300 group-hover:scale-105 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300">
                          {stat.value}
                        </p>
                        <p className="font-medium text-base text-gray-600 transition-colors duration-300 group-hover:text-brand dark:text-gray-400">
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
            <Card className="glass-card overflow-hidden border border-gray-200/50 transition-all duration-300 hover:border-blue-200/50 hover:shadow-xl dark:border-gray-700/50 dark:hover:border-blue-700/50">
              <CardHeader className="border-gray-100 border-b bg-linear-to-r from-blue-50/50 to-purple-50/50 dark:border-gray-700 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardTitle className="flex items-center gap-2 bg-linear-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-lg text-transparent">
                  <div className="rounded-lg bg-linear-to-br from-blue-500/20 to-purple-500/20 p-1.5 dark:from-blue-500/30 dark:to-purple-500/30">
                    <TrendingUpIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Atividade Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={0.3}
                        className="dark:stroke-gray-700"
                      />
                      <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
                      <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                      <Tooltip contentStyle={tooltipStyle} />
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

            <Card className="glass-card overflow-hidden border border-gray-200/50 transition-all duration-300 hover:border-emerald-200/50 hover:shadow-xl dark:border-gray-700/50 dark:hover:border-emerald-700/50">
              <CardHeader className="border-gray-100 border-b bg-linear-to-r from-emerald-50/50 to-teal-50/50 dark:border-gray-700 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle className="flex items-center gap-2 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-lg text-transparent">
                  <div className="rounded-lg bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-1.5 dark:from-emerald-500/30 dark:to-teal-500/30">
                    <DollarSignIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="group rounded-lg bg-linear-to-br from-emerald-50 via-emerald-50/80 to-green-50 p-3 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:from-emerald-900/30 dark:via-emerald-900/25 dark:to-green-900/30">
                    <p className="mb-1 font-medium text-gray-600 text-xs dark:text-gray-400">Receitas</p>
                    <p className="font-bold text-base text-emerald-600 transition-transform duration-300 group-hover:scale-105 dark:text-emerald-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        financialStats.totalIncome,
                      )}
                    </p>
                  </div>
                  <div className="group rounded-lg bg-linear-to-br from-rose-50 via-rose-50/80 to-red-50 p-3 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:from-rose-900/30 dark:via-rose-900/25 dark:to-red-900/30">
                    <p className="mb-1 font-medium text-gray-600 text-xs dark:text-gray-400">Despesas</p>
                    <p className="font-bold text-base text-rose-600 transition-transform duration-300 group-hover:scale-105 dark:text-rose-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        financialStats.totalExpense,
                      )}
                    </p>
                  </div>
                  <div
                    className={`group rounded-lg p-3 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
                      financialStats.balance >= 0
                        ? 'bg-linear-to-br from-emerald-50 via-emerald-50/80 to-green-50 dark:from-emerald-900/30 dark:via-emerald-900/25 dark:to-green-900/30'
                        : 'bg-linear-to-br from-rose-50 via-rose-50/80 to-red-50 dark:from-rose-900/30 dark:via-rose-900/25 dark:to-red-900/30'
                    }`}
                  >
                    <p className="mb-1 font-medium text-gray-600 text-xs dark:text-gray-400">Saldo</p>
                    <p
                      className={`font-bold text-base transition-transform duration-300 group-hover:scale-105 ${
                        financialStats.balance >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
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
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={0.3}
                        className="dark:stroke-gray-700"
                      />
                      <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
                      <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                      <Tooltip
                        formatter={(value: number) =>
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                        }
                        contentStyle={tooltipStyle}
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
        </CardContent>
      </Card>
    </>
  )
}
