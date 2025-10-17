import {
  ModalAction,
  ModalCancel,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './styles'

interface ConfirmProps {
  title: string
  confirmText: string
  message: string | JSX.Element
  closeModal: (type: 'close' | 'submit') => void
}

export function Confirm({ message, title, confirmText, closeModal }: ConfirmProps) {
  return (
    <ModalContent>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription className="max-h-[calc(95vh_-_16rem)] overflow-auto">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <ModalCancel type="button" onClick={() => closeModal('close')}>
          Voltar
        </ModalCancel>
        <ModalAction type="button" onClick={() => closeModal('submit')}>
          {confirmText}
        </ModalAction>
      </ModalFooter>
    </ModalContent>
  )
}
