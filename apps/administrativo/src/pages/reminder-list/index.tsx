import { useEffect, useMemo, useState } from 'react'

import { BellIcon, BellRingIcon, CheckCheckIcon, CheckCircleIcon } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'

import { useApp } from '../../App'
import { Button } from '../../components/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card'
import { LoadingCard } from '../../components/loading-card'
import { Tabs, TabsList, TabsTrigger } from '../../components/tabs'
import { errorMessageHandler } from '../../helpers/axios'
import { formatDateTime } from '../../helpers/date'
import { api } from '../../service'

type Reminder = {
  id: number
  appointmentId: number | null
  title: string
  message: string
  readAt: string | null
  createdAt: string
}

type ReminderFilter = 'unread' | 'read' | 'all'

export function ReminderList() {
  const { token } = useApp()
  const [fetching, setFetching] = useState(true)
  const [items, setItems] = useState<Reminder[]>([])
  const [filter, setFilter] = useState<ReminderFilter>('unread')
  const [markingAll, setMarkingAll] = useState(false)

  async function listReminders() {
    setFetching(true)
    try {
      const { data } = await api.get('reminder.list?page=1&perPage=200&readStatus=all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setFetching(false)
    }
  }

  async function markAsRead(reminderIds: number[]) {
    if (!reminderIds.length) return
    await api.post(
      'reminder.read',
      { reminderIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )
  }

  async function handleMarkOneAsRead(reminder: Reminder) {
    if (reminder.readAt) return

    try {
      await markAsRead([reminder.id])
      setItems((previous) =>
        previous.map((item) => (item.id === reminder.id ? { ...item, readAt: new Date().toISOString() } : item)),
      )
      window.dispatchEvent(new Event('reminder:read-updated'))
    } catch (error) {
      toast.error(errorMessageHandler(error))
    }
  }

  async function handleMarkAllAsRead() {
    const unreadIds = items.filter((item) => !item.readAt).map((item) => item.id)
    if (!unreadIds.length) return

    setMarkingAll(true)
    try {
      await markAsRead(unreadIds)
      setItems((previous) => previous.map((item) => ({ ...item, readAt: new Date().toISOString() })))
      window.dispatchEvent(new Event('reminder:read-updated'))
    } catch (error) {
      toast.error(errorMessageHandler(error))
    } finally {
      setMarkingAll(false)
    }
  }

  function handleOpenReminder(reminder: Reminder) {
    void handleMarkOneAsRead(reminder)
  }

  const filteredItems = useMemo(() => {
    if (filter === 'read') return items.filter((item) => item.readAt)
    if (filter === 'unread') return items.filter((item) => !item.readAt)
    return items
  }, [filter, items])

  useEffect(() => {
    void listReminders()
  }, [token])

  return (
    <>
      <Helmet>
        <title>Lembretes - APA Control</title>
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle>
            <BellIcon />
            Lembretes
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as ReminderFilter)} className="w-full">
              <TabsList>
                <TabsTrigger value="unread">Não lidos</TabsTrigger>
                <TabsTrigger value="read">Lidos</TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full sm:hidden"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
            >
              <CheckCheckIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
            >
              <CheckCheckIcon className="mr-2 h-4 w-4" />
              Marcar todos
            </Button>
          </div>

          <div className="space-y-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  item.readAt
                    ? 'border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800'
                    : 'border-brand/40 bg-brand/5 hover:bg-brand/10 dark:border-brand/50 dark:bg-brand/10 dark:hover:bg-brand/20'
                }`}
                onClick={() => handleOpenReminder(item)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  void handleOpenReminder(item)
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.readAt ? (
                      <BellIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <BellRingIcon className="h-4 w-4 text-brand" />
                    )}
                    <span className="font-semibold dark:text-gray-100">{item.title}</span>
                  </div>
                  <div className="text-gray-500 text-xs dark:text-gray-400">{formatDateTime(item.createdAt)}</div>
                </div>

                <p className="mt-2 text-sm dark:text-gray-300">{item.message}</p>

                {!item.readAt && (
                  <button
                    type="button"
                    className="mt-3 inline-flex cursor-pointer items-center gap-1 text-gray-600 text-xs dark:text-gray-400"
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleMarkOneAsRead(item)
                    }}
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Marcar como lido
                  </button>
                )}
              </button>
            ))}

            {!filteredItems.length && !fetching && (
              <p className="py-4 text-center font-semibold text-sm dark:text-gray-300">Nenhum lembrete encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {fetching && <LoadingCard />}
    </>
  )
}
