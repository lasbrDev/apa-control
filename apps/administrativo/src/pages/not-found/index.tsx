import { Helmet } from 'react-helmet-async'

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Página não encontrada - APA Control</title>
      </Helmet>
      <div>
        <h1 className="mb-3 font-bold dark:text-gray-100">404 - Não Encontrado</h1>
        <p className="font-medium text-sm leading-relaxed dark:text-gray-300">
          A página que você solicitou não pôde ser encontrada, entre em contato com o administrador ou tente novamente.
        </p>
      </div>
    </>
  )
}
