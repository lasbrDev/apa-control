import type React from 'react'
import { useCallback } from 'react'

import { Alert } from './Alert'
import { Confirm } from './Confirm'
import { Prompt } from './Prompt'
import { ModalContainer, ModalRoot } from './styles'

type InputType = 'text' | 'password' | 'number' | 'email'

export interface ModalState {
  type: 'alert' | 'confirm' | 'prompt'
  title: string
  confirmText: string
  message: string | JSX.Element
  value: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  callback?: (value: any) => void
  inputType: InputType
  show: boolean
}

interface ConfirmData {
  title: string
  message: string | JSX.Element
  confirmText: string
  callback: (confirmed: boolean) => void
}

interface PromptData {
  title: string
  message: string | JSX.Element
  callback: (value: string) => void
  inputType?: InputType
}

export interface ModalActions {
  alert: (message: string | JSX.Element, callback?: VoidFunction) => void
  confirm: (data: ConfirmData) => void
  prompt: (data: PromptData) => void
}

interface ModalProps {
  type: 'alert' | 'confirm' | 'prompt'
  title: string
  message: string | JSX.Element
  value: string
  confirmText: string
  inputType: InputType
  setModal: React.Dispatch<React.SetStateAction<ModalState>>
  show: boolean
}

export function Modal({ message, title, confirmText, type, show, inputType, value, setModal }: ModalProps) {
  const closeModal = useCallback(
    (action: 'close' | 'submit') => {
      setModal((prev) => ({ ...prev, show: false }))
      setModal((prev) => {
        const { callback, ...state } = prev

        if (prev.type === 'prompt' && action !== 'close' && callback) {
          callback(prev.value)
        } else if (['confirm', 'alert'].includes(prev.type) && callback) {
          const hasSubmitted = action === 'submit'
          callback(hasSubmitted)
        }

        return state
      })
    },
    [setModal],
  )

  const setValue = useCallback((newValue: string) => setModal((prev) => ({ ...prev, value: newValue })), [setModal])

  return (
    <ModalRoot open={show}>
      <ModalContainer>
        {type === 'alert' && <Alert message={message} closeModal={closeModal} />}

        {type === 'confirm' && (
          <Confirm title={title} message={message} confirmText={confirmText} closeModal={closeModal} />
        )}

        {type === 'prompt' && (
          <Prompt
            message={message}
            title={title}
            type={inputType}
            value={value}
            setValue={setValue}
            closeModal={closeModal}
          />
        )}
      </ModalContainer>
    </ModalRoot>
  )
}
