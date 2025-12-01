import { type ElementType, useEffect } from 'react'

import clsx from 'clsx'
import { ChevronLeftIcon, SaveIcon } from 'lucide-react'

import {
  ModalAction,
  ModalCancel,
  ModalContainer,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalTitle,
} from '../modal/styles'
import { Spinner } from '../spinner'

import type React from 'react'

interface ModalFormProps {
  children?: React.ReactNode
  title: string
  show: boolean
  submitting: boolean
  fetching?: boolean
  submitText?: string
  submitIcon?: ElementType
  isLarge?: boolean
  isExtraLarge?: boolean
  onSubmit: React.FormEventHandler<HTMLFormElement>
  closeAction?: VoidFunction
  resetForm?: VoidFunction
}

export const ModalForm = ({
  children,
  show,
  title,
  fetching,
  submitting,
  submitText = 'Salvar',
  submitIcon: SubmitIcon = SaveIcon,
  isLarge,
  isExtraLarge,
  onSubmit,
  closeAction,
  resetForm,
}: ModalFormProps) => {
  useEffect(() => {
    if (!show && resetForm) {
      setTimeout(resetForm, 300)
    }
  }, [show, resetForm])

  return (
    <ModalRoot open={show}>
      <ModalContainer>
        <form onSubmit={onSubmit}>
          <ModalContent
            className={clsx('max-h-full overflow-y-scroll', { 'max-w-3xl': isLarge, 'max-w-5xl': isExtraLarge })}
          >
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
              <ModalDescription className="text-left">
                {fetching ? <Spinner containerClassName="py-4" className="fill-black" /> : children}
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <ModalCancel type="button" onClick={closeAction}>
                <ChevronLeftIcon className="mr-2 h-5 w-5" />
                <span>Voltar</span>
              </ModalCancel>

              {!fetching && (
                <ModalAction type="submit" disabled={submitting}>
                  {submitting ? (
                    <Spinner />
                  ) : (
                    <>
                      {SubmitIcon && <SubmitIcon className="mr-2 h-5 w-5" />}
                      <span>{submitText}</span>
                    </>
                  )}
                </ModalAction>
              )}
            </ModalFooter>
          </ModalContent>
        </form>
      </ModalContainer>
    </ModalRoot>
  )
}
