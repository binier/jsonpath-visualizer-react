export class ObjDfsIterValue {
  constructor(
    public key: string,
    public value: any,
    public depth: number,
    public parent: ObjDfsIterValue | null = null
  ) { }

  type() {
    if (typeof this.value === 'object' && Array.isArray(this.value))
      return 'array';
    return typeof this.value;
  }

  parents() {
    const parents = [];
    let cur: ObjDfsIterValue | null = this;
    while ((cur = cur.parent)) parents.push(cur);
    return parents;
  }
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
    private parent: ObjDfsIterValue | null = null,
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

  private iterValue(index = this.index): ObjDfsIterValue {
    const {key, value} = this.getKeyValue(this.index);
    return new ObjDfsIterValue(key, value, this.depth, this.parent);
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

    const selfIterValue = this.iterValue();
    const { value } = selfIterValue

    if (typeof value === 'object' && value)
      this.nestedIter = new ObjDfsIter(
        value,
        selfIterValue,
        { index: -1, depth: this.depth + 1 }
      );

    return selfIterValue;
  }

  prev(): ObjDfsIterValue | Symbol {
    if (this.nestedIter) {
      const wasNestedEmpty = this.nestedIter.index === -1;
      const nestedPrev = this.nestedIter.prev();
      if (nestedPrev !== ITER_END)
        return nestedPrev;
      this.nestedIter = undefined;

      if (!wasNestedEmpty)
        return this.iterValue();
    }
    if (--this.index < 0)
      return ITER_END;

    const selfIterValue = this.iterValue();
    const { value } = selfIterValue
    if (typeof value === 'object' && value) {
      this.nestedIter = new ObjDfsIter(
          value,
          selfIterValue,
          { index: -1, depth: this.depth + 1 }
        )
        .nextSkipAll();
      return this.prev();
    }
    return selfIterValue;
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
