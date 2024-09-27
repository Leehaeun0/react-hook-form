import {
  ValidationRule,
  ValidationValue,
  ValidationValueMessage,
} from '../types';
import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import isUndefined from '../utils/isUndefined';

// rule이 다양한 형태로 나왔을때 필요한 rule를 찾는 코드
export default <T extends ValidationValue>(
  rule?: ValidationRule<T> | ValidationValueMessage<T>,
) =>
  isUndefined(rule)
    ? rule
    : isRegex(rule)
    ? rule.source
    : isObject(rule)
    ? isRegex(rule.value)
      ? rule.value.source
      : rule.value
    : rule;
