interface JsonNodeTypesMap {
  'array': Array<any>;
  'object': Record<string, any>;
  'string': string;
  'boolean': boolean;
  'number': number;
  'undefined': undefined;
}

export type JsonNodeTypes = keyof JsonNodeTypesMap;

export interface JsonNode<T extends JsonNodeTypes = any> {
  index: number;
  type: T;
  path: string[];
  value: JsonNodeTypesMap[T];
  collapsed?: boolean;
  childrenCount?: number;
  isLastChild?: boolean;
  end?: boolean;
}

function* jsonToElementsGen(
  json: any, path: string[] = []
): Generator<Omit<JsonNode, 'index'>> {
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
    index: 0,
    type: Array.isArray(json) ? 'array' : typeof json,
    path: [],
    value: json,
    collapsed: false,
    childrenCount: 0,
    isLastChild: true,
  };
  const list: JsonNode[] = [root];

  let index = 0;
  for (let el of jsonToElementsGen(json))
    list.push(Object.assign(el, { index: ++index }));

  root.childrenCount = list.length;

  if (root.childrenCount > 1)
    list.push({ ...root, index: ++index, end: true });
  else
    --root.childrenCount;

  return list;
}
