import React, {createContext, ReactNode, useContext, useState} from 'react';

// eslint is disabled to avoid the warning on the use of any
// this cache is not the final implementation, and when
// the final implementation is done the any should be updated with generics
/* eslint-disable @typescript-eslint/no-explicit-any */
interface ICacheContext {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
  cache: Map<string, any>;
}

const UseCacheContext = createContext<ICacheContext>({} as ICacheContext);

export const useCache = () => {
  const cache = useContext(UseCacheContext);
  if (cache === null) {
    throw new Error(
      'useCache() can only be used on the descendants of <UseCacheProvider />'
    );
  }
  return cache;
};

export const UseCacheProvider = ({children}: {children: ReactNode}) => {
  const [cache, setCache] = useState(new Map<string, any>());
  const get = (key: string) => {
    return cache.get(key) || null;
  };
  const set = (key: string, value: any) => {
    setCache(new Map(cache.set(key, value)));
  };
  const value = {
    get,
    set,
    cache,
  };
  return (
    <UseCacheContext.Provider value={value}>
      {children}
    </UseCacheContext.Provider>
  );
};
