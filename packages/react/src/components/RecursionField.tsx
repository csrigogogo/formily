import React, { Fragment, useMemo } from 'react'
import { isFn, isValid } from '@formily/shared'
import { GeneralField } from '@formily/core'
import { Schema } from '@formily/json-schema'
import { SchemaContext } from '../shared'
import { IRecursionFieldProps, ReactFC } from '../types'
import { useField, useExpressionScope } from '../hooks'
import { ObjectField } from './ObjectField'
import { ArrayField } from './ArrayField'
import { Field } from './Field'
import { VoidField } from './VoidField'

const useFieldProps = (schema: Schema) => {
  const scope = useExpressionScope() // 消费外界的 ExpressionScopeContext 的内容
  return schema.toFieldProps({
    scope,
  }) as any // 将 scope 的内容 解析到 schema 上 
}

const useBasePath = (props: IRecursionFieldProps) => {
  const parent = useField()
  if (props.onlyRenderProperties) {
    return props.basePath || parent?.address.concat(props.name)
  }
  return props.basePath || parent?.address
}

// SchemaField 实际上渲染成了这个 RecursionField
export const RecursionField: ReactFC<IRecursionFieldProps> = (props) => {
  const basePath = useBasePath(props)
  const fieldSchema = useMemo(() => new Schema(props.schema), [props.schema]) // 是 @formily/json-schema 导出的 schema类 的实例
  const fieldProps = useFieldProps(fieldSchema) // 已经消费了ExpressionScopeContext 的 scope
  const renderProperties = (field?: GeneralField) => {
    if (props.onlyRenderSelf) return
    const properties = Schema.getOrderProperties(fieldSchema)
    if (!properties.length) return
    return (
      <Fragment>
        {properties.map(({ schema: item, key: name }, index) => {
          const base = field?.address || basePath
          let schema: Schema = item
          if (isFn(props.mapProperties)) {
            const mapped = props.mapProperties(item, name)
            if (mapped) {
              schema = mapped
            }
          }
          if (isFn(props.filterProperties)) {
            if (props.filterProperties(schema, name) === false) {
              return null
            }
          }
          return (
            <RecursionField
              schema={schema}
              key={`${index}-${name}`}
              name={name}
              basePath={base}
            />
          )
        })}
      </Fragment>
    )
  }

  const render = () => {
    if (!isValid(props.name)) return renderProperties()
    if (fieldSchema.type === 'object') {
      if (props.onlyRenderProperties) return renderProperties()
      return (
        <ObjectField {...fieldProps} name={props.name} basePath={basePath}>
          {renderProperties}
        </ObjectField>
      )
    } else if (fieldSchema.type === 'array') {
      return (
        <ArrayField {...fieldProps} name={props.name} basePath={basePath} />
      )
    } else if (fieldSchema.type === 'void') {
      if (props.onlyRenderProperties) return renderProperties()
      return (
        <VoidField {...fieldProps} name={props.name} basePath={basePath}>
          {renderProperties}
        </VoidField>
      )
    }
    return <Field {...fieldProps} name={props.name} basePath={basePath} />
  }

  if (!fieldSchema) return <Fragment />

  return (
    <SchemaContext.Provider value={fieldSchema}>
      {render()}
    </SchemaContext.Provider>
  )
}
