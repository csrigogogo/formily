import React from 'react'
import { useField, useForm } from '../hooks'
import { useAttach } from '../hooks/useAttach'
import { ReactiveField } from './ReactiveField'
import { FieldContext } from '../shared'
import { JSXComponent, IFieldProps } from '../types'

export const Field = <D extends JSXComponent, C extends JSXComponent>(
  props: IFieldProps<D, C>
) => {
  const form = useForm() // 获取 form 实例
  const parent = useField() // FieldContext
  const field = useAttach(
    form.createField({ basePath: parent?.address, ...props })
  ) // 生成 field model  https://core.formilyjs.org/zh-CN/api/models/form#createfield
  return (
    <FieldContext.Provider value={field}>
      <ReactiveField field={field}>{props.children}</ReactiveField>  
      {/* 在 ReactiveField 中 消费 field model   */}
    </FieldContext.Provider>
  )
}

Field.displayName = 'Field'
