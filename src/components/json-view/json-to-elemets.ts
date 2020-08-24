interface ElementTypesMap {
  'array': Array<any>;
  'object': Record<string, any>;
  'string': string;
  'boolean': boolean;
  'number': number;
  'undefined': undefined;
}

export type ElementTypes = keyof ElementTypesMap;

export interface ElementData<T extends ElementTypes = any> {
  type: T;
  path: string[];
  value: ElementTypesMap[T];
  collapsed?: boolean;
  childrenCount?: number;
  isLastChild?: boolean;
  end?: boolean;
}

function* jsonToElementsGen(
  json: any, path: string[] = []
): Generator<ElementData> {
  const entries = Object.entries(json);
  let index = 0;
  for (let [k, v] of entries) {
    const elData = {
      type: Array.isArray(v) ? 'array' : typeof v,
      path: [...path, k],
      value: v,
      collapsed: false,
      childrenCount: 0,
      isLastChild: ++index === entries.length,
    };

    yield elData;
    if (typeof v === 'object') {
      for (let child of jsonToElementsGen(v, elData.path)) {
        ++elData.childrenCount;
        yield child;
      }
      if (elData.childrenCount > 0) {
        ++elData.childrenCount;
        yield { ...elData, end: true };
      }
    }
  }
}

export function jsonToElements(json: any) {
  const root = {
    type: Array.isArray(json) ? 'array' : typeof json,
    path: [],
    value: json,
    collapsed: false,
    childrenCount: 0,
    isLastChild: true,
  };

  const list = [root, ...jsonToElementsGen(json)];

  root.childrenCount = list.length;

  if (root.childrenCount > 0)
    list.push({ ...root, end: true })

  return list;
}
