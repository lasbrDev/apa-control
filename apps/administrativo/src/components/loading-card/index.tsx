import { Spinner } from '../spinner'

export const LoadingCard = ({ position = 'relative' }: { position?: 'relative' | 'absolute' }) => {
  return (
    <div className={position === 'relative' ? 'relative mx-auto p-3 pb-9' : undefined}>
      <div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center">
        <div className="table table-fixed rounded-md bg-white shadow-[0_0_20px_0_rgba(0,0,0,.1)]">
          <span className="table-cell px-5 py-3 align-middle font-semibold text-dark">Carregando...</span>
          <div className="table-cell px-5 py-3 align-middle">
            <Spinner className="fill-dark" />
          </div>
        </div>
      </div>
    </div>
  )
}
