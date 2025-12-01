'use client'

import * as React from 'react'

import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '../../helpers/classname'

const Tabs = TabsPrimitive.Root
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex w-full flex-wrap items-center justify-center gap-x-0.5 gap-y-4 rounded-lg bg-zinc-100 p-1 text-zinc-600 lg:w-auto dark:bg-gray-800 dark:text-gray-300',
      className,
    )}
    {...props}
  />
))

TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex flex-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 font-medium text-sm ring-offset-white transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-800 data-[state=active]:shadow-sm lg:min-w-40 dark:ring-offset-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:focus-visible:ring-gray-600',
      className,
    )}
    {...props}
  />
))

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))

TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsContent, TabsList, TabsTrigger }
