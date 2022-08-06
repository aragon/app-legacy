import {Dispatch, SetStateAction, useEffect, useState} from 'react';

/**
 * Hook that debounces state value for the specified delay.
 * @param initialState initial value of the state
 * @param delay delay in milliseconds; defaults to 500 ms
 * @returns debounced value, state, and state setter
 */
export const useDebouncedState = <T,>(
  initialState: T,
  delay = 500
): [T, T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState(initialState);
  const [debouncedValue, setDebouncedValue] = useState(initialState);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, value]);

  return [debouncedValue, value, setValue];
};
