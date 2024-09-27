import React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import deepEqual from './utils/deepEqual';
import isFunction from './utils/isFunction';
import {
  FieldValues,
  FormState,
  InternalFieldName,
  UseFormProps,
  UseFormReturn,
} from './types';
import { useSubscribe } from './useSubscribe';

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useform) • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm) • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, watch, formState: { errors } } = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   console.log(watch("example"));
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue="test" {...register("example")} />
 *       <input {...register("exampleRequired", { required: true })} />
 *       {errors.exampleRequired && <span>This field is required</span>}
 *       <button>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  // _formControl.current로 return 하는 값
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext, TTransformedValues> | undefined
  >();
  // _values는 props.value가 바뀌었는지를 비교해서 인식하기 위한 값으로 큰 의미 없음
  const _values = React.useRef<typeof props.values>();
  //  const {formState: { errors }} = useForm(); 이럴때 사용하는 fromState로 반환됌
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    isLoading: isFunction(props.defaultValues),
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: props.errors || {},
    disabled: props.disabled || false,
    defaultValues: isFunction(props.defaultValues)
      ? undefined
      : props.defaultValues,
  });

  if (!_formControl.current) {
    _formControl.current = {
      ...createFormControl(props),
      formState,
    };
  }

  const control = _formControl.current.control;
  // control.options에 pros를 할당한다?? 왜쓰는 건지는 모르겠음..
  // 그래서 props로 받은값이 option에 할당된다.
  control._options = props;

  // state 구독을 시작하기 위해 옵져버를 추가한다. (_subjects 중에서 state만 구독)
  // 다른곳에서 _subjects.state.next를 호출하면 next로 넘긴 value가 들어와 함수를 실행한다.
  // control._formState를 updateFormState 상태값으로 싱크맞추는 작업
  useSubscribe({
    subject: control._subjects.state,
    next: (
      value: Partial<FormState<TFieldValues>> & { name?: InternalFieldName },
    ) => {
      if (
        shouldRenderFormState(
          value,
          control._proxyFormState,
          control._updateFormState,
          true,
        )
      ) {
        updateFormState({ ...control._formState });
      }
    },
  });

  React.useEffect(
    () => control._disableForm(props.disabled),
    [control, props.disabled],
  );

  React.useEffect(() => {
    if (control._proxyFormState.isDirty) {
      const isDirty = control._getDirty();
      if (isDirty !== formState.isDirty) {
        control._subjects.state.next({
          isDirty,
        });
      }
    }
  }, [control, formState.isDirty]);

  React.useEffect(() => {
    // useForm({ values: {name: '하은'} }) 처럼 props에 values를 전달했을때,
    // props.values와 변수 _values가 다르면 발동한다.
    // 대충 props.values를 formState에 반영하는 동작 같음.
    if (props.values && !deepEqual(props.values, _values.current)) {
      control._reset(props.values, control._options.resetOptions);
      _values.current = props.values;
      updateFormState((state) => ({ ...state }));
    } else {
      control._resetDefaultValues();
    }
  }, [props.values, control]);

  React.useEffect(() => {
    if (props.errors) {
      control._setErrors(props.errors);
    }
  }, [props.errors, control]);

  React.useEffect(() => {
    if (!control._state.mount) {
      control._updateValid();
      control._state.mount = true;
    }

    if (control._state.watch) {
      control._state.watch = false;
      control._subjects.state.next({ ...control._formState });
    }

    control._removeUnmounted();
  });

  React.useEffect(() => {
    props.shouldUnregister &&
      control._subjects.values.next({
        values: control._getWatch(),
      });
  }, [props.shouldUnregister, control]);

  _formControl.current.formState = getProxyFormState(formState, control);

  return _formControl.current;
}
