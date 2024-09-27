import React from 'react';

import { Subject } from './utils/createSubject';

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  next: (value: T) => void;
};

/**
 * useEffect 훅을 사용하여 props.disabled 값의 변경을 감지하고, 변경될 때 disabled이 아니면 구독을 업데이트합니다.
 * disabled값이 변경될떄마다 subject.subscribe({next: ...}) 이렇게 next 값을 넘겨줌
 */
export function useSubscribe<T>(props: Props<T>) {
  const _props = React.useRef(props);
  _props.current = props;

  React.useEffect(() => {
    const subscription =
      !props.disabled &&
      _props.current.subject &&
      _props.current.subject.subscribe({
        next: _props.current.next,
      });

    return () => {
      subscription && subscription.unsubscribe();
    };
  }, [props.disabled]);
}
