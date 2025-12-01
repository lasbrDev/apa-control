import * as React from 'react'

import * as AlertDialog from '@radix-ui/react-alert-dialog'

import { cn } from '../../helpers/classname'
import { buttonVariants } from '../button'

const ModalRoot = AlertDialog.Root
const ModalPortal = AlertDialog.Portal
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialog.Overlay
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-1040 bg-black/50 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in',
      className,
    )}
    {...props}
    ref={ref}
  />
))

ModalOverlay.displayName = AlertDialog.Overlay.displayName

const ModalContainer = ({ children, ...props }: AlertDialog.AlertDialogPortalProps) => (
  <ModalPortal {...props}>
    <ModalOverlay />
    {children}
  </ModalPortal>
)

const ModalContent = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Content>
>(({ className, ...props }, ref) => (
  <AlertDialog.Content
    ref={ref}
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-1050 grid max-h-[95vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg md:w-full dark:border-gray-700 dark:bg-gray-800 dark:shadow-xl',
      className,
    )}
    {...props}
  />
))

ModalContent.displayName = AlertDialog.Content.displayName

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
)

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse gap-4 sm:flex-row sm:justify-end sm:gap-3', className)} {...props} />
)

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Title>
>(({ className, ...props }, ref) => (
  <AlertDialog.Title ref={ref} className={cn('font-semibold text-lg dark:text-gray-100', className)} {...props} />
))

ModalTitle.displayName = AlertDialog.Title.displayName

const ModalDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-stone-500 dark:text-gray-400', className)} {...props} />
  ),
)

const ModalAction = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Action>
>(({ className, ...props }, ref) => (
  <AlertDialog.Action ref={ref} className={cn(buttonVariants({ variant: 'success' }), className)} {...props} />
))

ModalAction.displayName = AlertDialog.Action.displayName

const ModalCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialog.Cancel ref={ref} className={cn(buttonVariants({ variant: 'outline' }), className)} {...props} />
))

ModalCancel.displayName = AlertDialog.Cancel.displayName

export {
  ModalAction,
  ModalCancel,
  ModalContainer,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalTitle,
}
