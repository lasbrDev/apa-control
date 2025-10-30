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
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 font-semibold text-2xl">Olá, {operator.name}.</h1>
      </div>

      {statsCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.key} to={stat.path}>
                <Card className="h-full cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                    {Icon && (
                      <div className="rounded-full bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <p className="font-semibold text-3xl">{stat.value}</p>
                    <p className="text-muted-foreground text-xs">{stat.label}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Atividade Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="animals" fill="#8884d8" name="Animais" />
                  <Bar dataKey="adoptions" fill="#82ca9d" name="Adoções" />
                  <Bar dataKey="rescues" fill="#ffc658" name="Resgates" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Receitas</p>
                <p className="font-semibold text-green-600 text-xl">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financialStats.totalIncome,
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Despesas</p>
                <p className="font-semibold text-red-600 text-xl">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financialStats.totalExpense,
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Saldo</p>
                <p
                  className={`font-semibold text-xl ${financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financialStats.balance,
                  )}
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialStats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                    }
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" name="Receitas" />
                  <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
