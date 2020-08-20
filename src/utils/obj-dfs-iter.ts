export interface ObjDfsIterValue {
  key: string;
  value: any;
}

export interface ObjDfsIter {
  next(): ObjDfsIterValue | Symbol;
  nextAll(): ObjDfsIterValue[];
}

const ITER_END = Symbol('Iterator End');

/**
 * Object depth-first search (dfs preordered)
 *
 * First visited edges are returned first.
 */
export function objDfsIter(obj: Record<string, any>): ObjDfsIter {
  const keys = Object.keys(obj);
  let index = -1;
  let nestedIter: ObjDfsIter;

  return {
    next() {
      if (nestedIter) {
        const nestedNext = nestedIter.next();
        if (nestedNext !== ITER_END)
          return nestedNext;
      }
      ++index;

      if (index === keys.length)
        return ITER_END;

      const key = keys[index],
            value = obj[key];

      if (typeof value === 'object' && value)
        nestedIter = objDfsIter(value);

      return { key, value };
    },
    nextAll() {
      const result: ObjDfsIterValue[] = [];
      let last;

      while((last = this.next()) !== ITER_END)
        result.push(last as ObjDfsIterValue);
      return result;
    },
  };
}
