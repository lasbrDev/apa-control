import { isAxiosError } from 'axios'

export function errorMessageHandler(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        return 'Efetue novo acesso a sua conta.'
      }
      if (status === 403) {
        return 'Você não tem permissão pra executar essa ação.'
      }
      if (status === 404 && !data?.message) {
        return 'Não encontrado.'
      }
      if (status === 500) {
        return (
          <>
            <p className="dark:text-gray-200">500 - Entre em contato com o suporte</p>

            <pre className="mt-3 whitespace-pre-wrap break-all rounded-md border border-stone-400 bg-stone-50 p-3 text-left text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <code>{data.message?.trim()}</code>
            </pre>
          </>
        )
      }

      if (data?.message) {
        return data.message
      }
      return 'Sem conexão com o servidor.'
    }
    if (error.request) {
      return 'Sem conexão com o servidor.'
    }
  } else if (error instanceof Error) {
    return error.message
  } else {
    return 'Erro desconhecido.'
  }
}
