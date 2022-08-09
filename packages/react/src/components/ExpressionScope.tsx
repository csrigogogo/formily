import React, { useContext } from 'react'
import { lazyMerge } from '@formily/shared'
import { SchemaExpressionScopeContext } from '../shared'
import { IExpressionScopeProps, ReactFC } from '../types'

export const ExpressionScope: ReactFC<IExpressionScopeProps> = (props) => {
  const scope = useContext(SchemaExpressionScopeContext)
  return (
    <SchemaExpressionScopeContext.Provider
      value={lazyMerge(scope, props.value)}
    >
      {/* 将SchemaField 组件 的 scope 和 createSchemaField 传递的 scope 合并一下 这个应该是要丢到@formily/json-schema 这个包里面 去处理渲染逻辑 */}
      {props.children}
    </SchemaExpressionScopeContext.Provider>
  )
}
