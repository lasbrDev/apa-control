import { useCallback } from 'react'

import { TextInput } from '../form/text-input'
import {
  ModalAction,
  ModalCancel,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './styles'

interface PromptProps {
  title: string
  message: string | JSX.Element
  type: 'text' | 'password' | 'number' | 'email'
  value: string
  setValue: (value: string) => void
  closeModal: (type: 'close' | 'submit') => void
}

export function Prompt({ message, title, type = 'text', value, setValue, closeModal }: PromptProps) {
  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((ev) => {
    const { target } = ev
    setValue(target.value)
  }, [])

  return (
    <ModalContent>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription>
          <div className="mb-2">{message}</div>
          <TextInput value={value} onChange={handleChange} type={type} />
        </ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <ModalCancel type="button" onClick={() => closeModal('close')}>
          Voltar
        </ModalCancel>
        <ModalAction type="button" onClick={() => closeModal('submit')}>
          Enviar
        </ModalAction>
      </ModalFooter>
    </ModalContent>
  )
}
