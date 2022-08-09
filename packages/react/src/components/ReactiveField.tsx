import React, { Fragment, useContext } from 'react'
import { toJS } from '@formily/reactive'
import { observer } from '@formily/reactive-react'
import { FormPath, isFn } from '@formily/shared'
import { isVoidField, GeneralField, Form } from '@formily/core'
import { SchemaComponentsContext } from '../shared'
import { RenderPropsChildren } from '../types'
interface IReactiveFieldProps {
  field: GeneralField
  children?: RenderPropsChildren<GeneralField>
}

// 作为viewModel层 桥接 视图层中间的 胶水层

// 专门用于将 ViewModel 与 输入控件 做绑定的桥接组件 

// name 属性必传

const mergeChildren = (
  children: RenderPropsChildren<GeneralField>,
  content: React.ReactNode
) => {
  if (!children && !content) return
  if (isFn(children)) return
  return (
    <Fragment>
      {children}
      {content}
    </Fragment>
  )
}

const isValidComponent = (target: any) =>
  target && (typeof target === 'object' || typeof target === 'function')

const renderChildren = (
  children: RenderPropsChildren<GeneralField>,
  field?: GeneralField,
  form?: Form
) => (isFn(children) ? children(field, form) : children)

const ReactiveInternal: React.FC<IReactiveFieldProps> = (props) => {
  const components = useContext(SchemaComponentsContext)
  if (!props.field) {
    return <Fragment>{renderChildren(props.children)}</Fragment>
  }
  const field = props.field
  const content = mergeChildren(
    renderChildren(props.children, field, field.form),
    field.content ?? field.componentProps.children
  )
  if (field.display !== 'visible') return null

  const getComponent = (target: any) => {
    return isValidComponent(target)
      ? target
      : FormPath.getIn(components, target) ?? target
  }

  const renderDecorator = (children: React.ReactNode) => {
    if (!field.decoratorType) {
      return <Fragment>{children}</Fragment>
    }

    return React.createElement(
      getComponent(field.decoratorType),
      toJS(field.decoratorProps),
      children
    )
  }

  const renderComponent = () => {
    if (!field.componentType) return content
    const value = !isVoidField(field) ? field.value : undefined
    const onChange = !isVoidField(field)
      ? (...args: any[]) => {
          field.onInput(...args)
          field.componentProps?.onChange?.(...args)
        }
      : field.componentProps?.onChange
    const onFocus = !isVoidField(field)
      ? (...args: any[]) => {
          field.onFocus(...args)
          field.componentProps?.onFocus?.(...args)
        }
      : field.componentProps?.onFocus
    const onBlur = !isVoidField(field)
      ? (...args: any[]) => {
          field.onBlur(...args)
          field.componentProps?.onBlur?.(...args)
        }
      : field.componentProps?.onBlur
    const disabled = !isVoidField(field)
      ? field.pattern === 'disabled' || field.pattern === 'readPretty'
      : undefined
    const readOnly = !isVoidField(field)
      ? field.pattern === 'readOnly'
      : undefined
    return React.createElement(
      getComponent(field.componentType),
      {
        disabled,
        readOnly,
        ...toJS(field.componentProps),
        value,
        onChange,
        onFocus,
        onBlur,
      },
      content
    )
  }

  return renderDecorator(renderComponent())
}

ReactiveInternal.displayName = 'ReactiveField'

// interface IObserverOptions {
//   forwardRef?: boolean //是否透传引用
//   scheduler?: (updater: () => void) => void //调度器，可以手动控制更新时机
//   displayName?: string //包装后的组件的displayName
// }
export const ReactiveField = observer(ReactiveInternal, {
  forwardRef: true,
}) // 响应式驱动 ReactiveInternal 内部状态发生变化 重新渲染
