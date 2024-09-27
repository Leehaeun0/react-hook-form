import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';

/**
중첩된 값을 가져올 수 있는 함수
const obj = {
  user: {
    name: 'John',
    address: {
      city: 'New York'
    }
  }
};
const name = get(obj, 'user.name'); // 결과: 'John'
*/
export default <T>(object: T, path?: string, defaultValue?: unknown): any => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }

  const result = compact(path.split(/[,[\].]+?/)).reduce(
    (result, key) =>
      isNullOrUndefined(result) ? result : result[key as keyof {}],
    object,
  );

  return isUndefined(result) || result === object
    ? isUndefined(object[path as keyof T])
      ? defaultValue
      : object[path as keyof T]
    : result;
};
