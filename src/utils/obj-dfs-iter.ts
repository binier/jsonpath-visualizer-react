export interface ObjDfsIterValue {
  key: string;
  value: any;
  depth: number;
}

export const ITER_END = Symbol('Iterator End');

/**
 * Object depth-first search (dfs preordered)
 *
 * First visited edges are returned first.
 */
export class ObjDfsIter {
  private index: number;
  private depth: number;
  private keys: string[];
  private nestedIter?: ObjDfsIter;

  constructor(
    private obj: Record<string, any>,
    { depth, index } = { depth: 0, index: -1 }
  ) {
    this.depth = depth;
    this.index = index;
    this.keys = Object.keys(obj);
  }

  private getKeyValue(index = this.index) {
    const key = this.keys[index];
    return { key, value: this.obj[key] };
  }

  next(): ObjDfsIterValue | Symbol {
    if (this.nestedIter) {
      const nestedNext = this.nestedIter.next();
      if (nestedNext !== ITER_END)
        return nestedNext;
      this.nestedIter = undefined;
    }

    if (++this.index === this.keys.length)
      return ITER_END;

    const {key, value} = this.getKeyValue(this.index);

    if (typeof value === 'object' && value)
      this.nestedIter = new ObjDfsIter(
        value,
        { index: -1, depth: this.depth + 1 }
      );

    return { key, value, depth: this.depth };
  }

  prev(): ObjDfsIterValue | Symbol {
    if (this.nestedIter) {
      const wasNestedEmpty = this.nestedIter.index === -1;
      const nestedPrev = this.nestedIter.prev();
      if (nestedPrev !== ITER_END)
        return nestedPrev;
      this.nestedIter = undefined;
      if (!wasNestedEmpty)
        return { ...this.getKeyValue(this.index), depth: this.depth };
    }
    if (--this.index < 0)
      return ITER_END;

    const {key, value} = this.getKeyValue(this.index);
    if (typeof value === 'object' && value) {
      this.nestedIter = new ObjDfsIter(
          value,
          { index: -1, depth: this.depth + 1 }
        )
        .nextSkipAll();
      return this.prev();
    }
    return { key, value, depth: this.depth };
  }

  nextSkip(count: number) {
    for (let i = 0; i < count; ++i, this.next());
    return this;
  }

  nextSkipAll() {
    this.index = this.keys.length;
    return this;
  }

  private collectAll(
    direction: 'next' | 'prev' = 'next',
    count = Infinity
  ) {
    const next = direction === 'next'
      ? () => this.next()
      : () => this.prev();

    const result: ObjDfsIterValue[] = [];

    for (let i = 0, cur: ObjDfsIterValue | Symbol; i < count; ++i) {
      cur = next();
      if (cur === ITER_END) break;
      result.push(cur as ObjDfsIterValue);
    }

    return result;
  }

  nextAll(count: number = Infinity) {
    return this.collectAll('next', count);
  }

  prevAll(count: number = Infinity) {
    return this.collectAll('prev', count);
  }

  /** **Warning:** consumes iterator! */
  count() {
    let count = 0;

    while (this.next() !== ITER_END)
      ++count;
    return count;
  }
}
