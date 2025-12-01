import chroma from 'chroma-js'
import { clsx } from 'clsx'

import { cn } from './classname'

import type { ClassNamesConfig, GroupBase, StylesConfig } from 'react-select'
import type { FormOption } from '../components/form-hook/MultiSelect'

export const colorizedStyles: StylesConfig<FormOption & { color: string }, true> = {
  option(styles, { data, isDisabled, isFocused, isSelected }) {
    const color = chroma(data.color)

    let backgroundColor: string | undefined
    let styleColor = data.color

    if (isSelected) {
      backgroundColor = data.color
      styleColor = chroma.contrast(color, 'white') > 2 ? 'white' : 'black'
    } else if (isFocused) {
      backgroundColor = color.alpha(0.1).css()
    }

    if (isDisabled) {
      styleColor = '#ccc'
    }

    return Object.assign({}, styles, {
      ...styles,
      backgroundColor,
      color: styleColor,
      cursor: isDisabled ? 'not-allowed' : 'default',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled ? (isSelected ? data.color : color.alpha(0.3).css()) : undefined,
      },
    })
  },
  multiValue: (styles, { data }) =>
    Object.assign({}, styles, { ...styles, backgroundColor: chroma(data.color).alpha(0.1).css() }),
  multiValueLabel: (styles, { data }) => Object.assign({}, styles, { ...styles, color: data.color }),
  multiValueRemove: (styles, { data }) =>
    Object.assign({}, styles, {
      ...styles,
      color: data.color,
      ':hover': { backgroundColor: data.color, color: 'white' },
    }),
}

export function getSelectClassNames<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({ controlClassName }: { controlClassName?: string }): ClassNamesConfig<Option, IsMulti, Group> {
  return {
    clearIndicator: ({ isFocused }) =>
      clsx(
        isFocused ? 'text-neutral-600 dark:text-gray-400' : 'text-neutral-200 dark:text-gray-500',
        'p-2',
        isFocused
          ? 'hover:text-neutral-800 dark:hover:text-gray-200'
          : 'hover:text-neutral-400 dark:hover:text-gray-300',
      ),
    control: ({ isDisabled, isFocused }) =>
      cn(
        'flex !min-h-[2.75rem] flex-wrap rounded-md border bg-white text-sm shadow-xs',
        'dark:bg-gray-800 dark:border-gray-700',
        isFocused ? 'border-primary' : 'border-zinc-200',
        isDisabled && 'opacity-50',
        isFocused && 'shadow-[0_0_0_1px] shadow-primary',
        controlClassName,
      ),
    dropdownIndicator: ({ isFocused }) =>
      clsx(
        'p-2',
        isFocused ? 'text-neutral-600 dark:text-gray-400' : 'text-neutral-200 dark:text-gray-500',
        isFocused
          ? 'hover:text-neutral-800 dark:hover:text-gray-200'
          : 'hover:text-neutral-400 dark:hover:text-gray-300',
      ),
    group: () => 'py-2',
    groupHeading: () => 'text-neutral-400 text-xs font-medium mb-1 px-3 uppercase dark:text-gray-500',
    indicatorSeparator: ({ isDisabled }) =>
      clsx(isDisabled ? 'bg-neutral-100 dark:bg-gray-700' : 'bg-neutral-200 dark:bg-gray-700', 'my-2'),
    input: () => 'm-0.5 py-0.5 text-neutral-800 dark:text-gray-200',
    loadingIndicator: ({ isFocused }) =>
      clsx(isFocused ? 'text-neutral-600 dark:text-gray-400' : 'text-neutral-200 dark:text-gray-500', 'p-2'),
    loadingMessage: () => 'text-neutral-400 py-2 px-3 dark:text-gray-500',
    menu: () =>
      'bg-white rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.1)] my-1 dark:bg-gray-800 dark:border dark:border-gray-700',
    menuList: () => 'py-1',
    multiValue: () => 'flex bg-neutral-200/70 rounded-md m-0.5 dark:bg-gray-700',
    multiValueLabel: () => 'rounded-md text-neutral-800 text-sm p-1 pl-2 dark:text-gray-200',
    multiValueRemove: ({ isFocused }) =>
      clsx(
        'flex items-center rounded-md rounded-l-none',
        isFocused && 'bg-red-500',
        'px-1',
        'hover:bg-red-500',
        'hover:text-red-800',
      ),
    noOptionsMessage: () => 'text-neutral-400 py-2 px-3 dark:text-gray-500',
    option: ({ isDisabled, isFocused, isSelected }) =>
      clsx(
        'px-3 py-2 text-sm!',
        isSelected ? 'bg-brand/90' : isFocused ? 'bg-light/50 dark:bg-gray-700/50' : 'bg-transparent',
        isDisabled
          ? 'text-neutral-200 dark:text-gray-600'
          : isSelected
            ? 'text-white'
            : 'text-inherit dark:text-gray-200',
        !isDisabled && (isSelected ? 'active:bg-brand' : 'active:bg-light dark:active:bg-gray-600'),
      ),
    placeholder: () => 'text-neutral-500 mx-0.5 dark:text-gray-500',
    singleValue: ({ isDisabled }) =>
      clsx(isDisabled ? 'text-neutral-400 dark:text-gray-600' : 'text-neutral-800 dark:text-gray-200', 'mx-0.5'),
    valueContainer: () => 'py-0.5 px-2',
  }
}
