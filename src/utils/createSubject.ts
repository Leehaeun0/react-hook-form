import { Noop } from '../types';

export type Observer<T> = {
  next: (value: T) => void;
};

export type Subscription = {
  unsubscribe: Noop;
};

export type Subject<T> = {
  readonly observers: Observer<T>[];
  subscribe: (value: Observer<T>) => Subscription;
  unsubscribe: Noop;
} & Observer<T>;

/**
 * createSubject 함수는 옵저버 패턴을 구현한 Subject 객체를 생성합니다.
 * Subject 객체는 옵저버들을 저장하고, 값을 전달하는 메커니즘을 제공합니다.
 */
export default <T>(): Subject<T> => {
  let _observers: Observer<T>[] = [];

  const next = (value: T) => {
    // _observers 배열에 있는 모든 옵저버에게 새로운 value값을 전달한다.
    // 이렇게 데이터의 변경을 감지하고 구독하는 옵저버들에게 새로운 값을 전달할 수 있다.
    for (const observer of _observers) {
      observer.next && observer.next(value);
    }
  };

  const subscribe = (observer: Observer<T>): Subscription => {
    // 옵저버 목록에 옵저버를 하나 더 추가
    _observers.push(observer);

    // 구독 해제 함수를 반환
    return {
      unsubscribe: () => {
        _observers = _observers.filter((o) => o !== observer);
      },
    };
  };

  const unsubscribe = () => {
    // 모든 옵저버 제거
    _observers = [];
  };

  // Subject 객체를 반환
  return {
    get observers() {
      return _observers;
    },
    next,
    subscribe,
    unsubscribe,
  };
};
