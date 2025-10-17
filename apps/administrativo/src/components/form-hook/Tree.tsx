import 'rc-tree/assets/index.css'
import { type ReactNode, useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import Tree, { type BasicDataNode } from 'rc-tree'

export interface FormTreeNode extends BasicDataNode {
  key: string | number
  title?: ReactNode
  parentId?: number
  children?: FormTreeNode[]
}

interface FormTreeProps {
  name: string
  options: FormTreeNode[]
}

export const FormTree = ({ name, options }: FormTreeProps) => {
  const { control } = useFormContext()
  const treeData = useMemo(() => processData(options), [options])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Tree
          checkable
          className="text-sm"
          showIcon={false}
          selectable={false}
          checkedKeys={field.value}
          treeData={treeData}
          onCheck={(keys, props) => {
            if (Array.isArray(keys)) {
              const onlyParentKeys = props.checkedNodes
                .filter((node) => !keys.includes(node.parentId!))
                .map((node) => node.key)

              field.onChange(onlyParentKeys)
            } else {
              const onlyParentKeys = props.checkedNodes
                .filter((node) => !keys.checked.includes(node.parentId!))
                .map((node) => node.key)

              field.onChange(onlyParentKeys)
            }
          }}
        />
      )}
    />
  )
}

function processData(nodes: FormTreeNode[]): FormTreeNode[] {
  return nodes.map((node) => ({
    ...node,
    title: <span className="ml-1">{node.title}</span>,
    children: node.children ? processData(node.children) : node.children,
  }))
}
