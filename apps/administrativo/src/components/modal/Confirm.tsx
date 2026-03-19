import {
  ModalAction,
  ModalCancel,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './styles'

import type { ReactNode } from 'react'

interface ConfirmProps {
  title: string
  confirmText: string
  message: string | ReactNode
  closeModal: (type: 'close' | 'submit') => void
}

export function Confirm({ message, title, confirmText, closeModal }: ConfirmProps) {
  return (
    <ModalContent>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription className="max-h-[calc(95vh-16rem)] overflow-auto text-base leading-6">
          {typeof message === 'string' ? <p className="text-base">{message}</p> : message}
        </ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <ModalCancel type="button" onClick={() => closeModal('close')} className="text-base">
          Voltar
        </ModalCancel>
        <ModalAction type="button" onClick={() => closeModal('submit')} className="text-base">
          {confirmText}
        </ModalAction>
      </ModalFooter>
    </ModalContent>
  )
}
