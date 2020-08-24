export interface ElementData {
  type: string;
  path: string[];
  value: any;
  collapsed?: boolean;
  childrenCount?: number;
  end?: boolean;
}

function* jsonToElementsGen(
  json: any, path: string[] = []
): Generator<ElementData> {
  for (let [k, v] of Object.entries(json)) {
    const elData = {
      type: Array.isArray(v) ? 'array' : typeof v,
      path: [...path, k],
      value: v,
      collapsed: false,
      childrenCount: 0,
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
  return [...jsonToElementsGen(json)];
}
