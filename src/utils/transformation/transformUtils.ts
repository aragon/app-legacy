/* eslint-disable @typescript-eslint/no-explicit-any */
export function slashTrim(s: string): string {
  let start = 0;
  let end = s.length;
  if (s[start] === '/') start++;
  if (s[end - 1] === '/') end--;
  if (end <= start) return '';
  return s.substring(start, end);
}

export function pathCombine(...args: string[]): string {
  const stripped = args.filter(a => !!a);
  if (stripped.length === 0) return '';
  const startSlash = stripped[0].startsWith('/');
  const endSlash = stripped[stripped.length - 1].endsWith('/');
  let joined = stripped
    .map(a => slashTrim(a))
    .filter(a => !!a)
    .join('/');
  if (startSlash) joined = '/' + joined;
  if (endSlash && joined !== '/') joined += '/';
  return joined;
}

/** Starts scanning str at start to find the first match from searches. If multiple matches complete at the
 * same position in str, it prefers the one which is listed first in searches.
 */
export const scanFirst = (
  str: string,
  start: number,
  searches: string[]
): [string, number] => {
  const matches: [number, number][] = [];
  for (let idx = start; idx < str.length; idx++) {
    for (let matchIdx = 0; matchIdx < matches.length; matchIdx++) {
      const [srchIdx, pos] = matches[matchIdx];
      if (searches[srchIdx][pos + 1] === str[idx]) {
        matches[matchIdx][1]++;
        if (pos + 2 === searches[srchIdx].length) {
          return [searches[srchIdx], idx + 1];
        }
      } else {
        matches.splice(matchIdx, 1);
        matchIdx--;
      }
    }

    for (let srchIdx = 0; srchIdx < searches.length; srchIdx++) {
      if (searches[srchIdx][0] === str[idx]) {
        matches.push([srchIdx, 0]);
        if (1 === searches[srchIdx].length) {
          return [searches[srchIdx], idx + 1];
        }
      }
    }
  }
  return ['', -1];
};

export function shallowCopy(value: any) {
  if (Array.isArray(value)) return [...value];
  if (typeof value === 'object') return {...value};
  return value;
}

export const upTo = (str: string, match: string, start?: number) => {
  const pos = str.indexOf(match, start);
  return pos < 0 ? str.substring(start || 0) : str.substring(start || 0, pos);
};
