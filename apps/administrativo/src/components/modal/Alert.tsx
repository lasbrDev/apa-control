import { ModalAction, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from './styles'

interface AlertProps {
  message: string | JSX.Element
  closeModal: (type: 'close' | 'submit') => void
}

export function Alert({ message, closeModal }: AlertProps) {
  return (
    <ModalContent>
      <ModalHeader>
        <ModalTitle>Alerta</ModalTitle>
        <ModalDescription className="max-h-[calc(95vh_-_16rem)] overflow-auto">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <ModalAction type="button" onClick={() => closeModal('submit')}>
          Ok
        </ModalAction>
      </ModalFooter>
    </ModalContent>
  )
}
