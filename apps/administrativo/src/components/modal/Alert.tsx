import { ModalAction, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from './styles'

import type { ReactNode } from 'react'

interface AlertProps {
  message: string | ReactNode
  closeModal: (type: 'close' | 'submit') => void
}

export function Alert({ message, closeModal }: AlertProps) {
  return (
    <ModalContent>
      <ModalHeader>
        <ModalTitle>Alerta</ModalTitle>
        <ModalDescription className="max-h-[calc(95vh-16rem)] overflow-auto text-base leading-6">
          {typeof message === 'string' ? <p className="text-base">{message}</p> : message}
        </ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <ModalAction type="button" onClick={() => closeModal('submit')} className="text-base">
          Ok
        </ModalAction>
      </ModalFooter>
    </ModalContent>
  )
}
