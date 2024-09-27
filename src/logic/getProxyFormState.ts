import { VALIDATION_MODE } from '../constants';
import { Control, FieldValues, FormState, ReadFormState } from '../types';

/**
 * getProxyFormState 함수는 주어진 formState 객체를 프록시로 감싸고,
 * 각 속성에 접근할 때마다 프록시 폼 상태(_proxyFormState)를 업데이트합니다.
 */
export default <TFieldValues extends FieldValues, TContext = any>(
  formState: FormState<TFieldValues>,
  control: Control<TFieldValues, TContext>,
  localProxyFormState?: ReadFormState,
  isRoot = true,
) => {
  const result = {
    defaultValues: control._defaultValues,
  } as typeof formState;

  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key as keyof FormState<TFieldValues> & keyof ReadFormState;

        if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
          control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
        }

        localProxyFormState && (localProxyFormState[_key] = true);
        return formState[_key];
      },
    });
  }

  return result;
};
