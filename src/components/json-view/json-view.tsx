import React, { useEffect } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { debounce } from '../../utils';
import { JsonNode, jsonToElements } from './json-to-elemets';
import { observable } from 'mobx';

interface Props {
  json: Record<string, any>;
}

const getEl = () => document.getElementById('json-view-container');

export default (props: Props) => {
  const state = useLocalStore(() => ({
    /**
     * elements array can be huge and we don't need for it to be
     * observable since we won't be mutating it.
     * */
    shallow: observable({
      elements: new Array<JsonNode>(),
    }, {}, { deep: false }),
    elHeight: 24,
    height: 0,
    index: 0,
    left: 0,
    right: 0,
    visible: new Array<JsonNode>(),

    get elements() { return state.shallow.elements; },
    set elements(value: JsonNode[]) { state.shallow.elements = value; },

    get scrollTop() {
      return (state.left-1) * state.elHeight;
    },

    get scrollBottom() {
      return state.right * state.elHeight;
    },

    get elCount() {
      return Math.ceil(state.height / state.elHeight) + 1;
    },

    setJson(json: any) {
      const elements = jsonToElements(json);
      state.elements = elements;
      state.setHeight(state.height);
    },

    setHeight(height: number) {
      state.height = height;
      state.index = 0;
      state.left = -state.elCount;
      state.right = state.elements.length;
      state.visible = [];
      state.moveNext(state.elCount);
      // TODO: handle height change
    },

    setScrollTop(scrollTop: number) {
      const deltaY = Math.abs(scrollTop - state.scrollTop);

      if (deltaY < state.elHeight) return;

      if (scrollTop > state.scrollTop)
        state.moveNext(Math.floor(deltaY / state.elHeight));
      else
        state.movePrev(Math.floor(deltaY / state.elHeight));
    },

    moveNext(steps = 1) {
      let {index, left, right, visible, elCount, elements} = state;
      for (let i = 0; i < steps; ++i) {
        if (index >= elements.length) break;
        ++left;
        --right;
        visible = [
          ...visible.slice(index > elCount ? 1 : 0),
          elements[index++],
        ];
      }
      Object.assign(state, {index, left, right, visible});
    },

    movePrev(steps = 1) {
      let {index, left, right, visible, elements} = state;
      for (let i = 0; i < steps; ++i) {
        if (index <= visible.length) break;
        --left;
        ++right;
        visible = [
          elements[--index - visible.length],
          ...visible.slice(0, -1),
        ];
      }
      Object.assign(state, {index, left, right, visible});
    },
  }));

  useEffect(() => {
    const resetHeight = debounce(() => {
      state.setHeight(getEl()!.clientHeight);
    }, 200);
    const resetScroll = (e: any) => {
      state.setScrollTop(e.target.scrollTop);
    };
    resetHeight();
    state.setJson(props.json)

    window.addEventListener('resize', resetHeight);
    getEl()!.addEventListener('scroll', resetScroll);
    return () => {
      window.removeEventListener('resize', resetHeight);
      window.removeEventListener('scroll', resetScroll);
    };
  }, [props.json]);

  return useObserver(() => {
    return (
      <div id="json-view-container" className="overflow-auto text-left bg-gray-300 shadow" style={{ height: '85vh' }}>
        <div style={{ height: state.scrollTop }}></div>
        <Elements elements={state.visible} eachHeight={state.elHeight} />
        <div style={{ height: state.scrollBottom}}></div>
      </div>
    );
  });
};

function Elements(props: { elements: JsonNode[], eachHeight: number }) {
  return (
    <>
    {
      props.elements.map(element => Element({
        element,
        height: props.eachHeight,
      }))
    }
    </>
  );
}

type FullProps<T = { [key: string]: any }> = T & React.HTMLProps<any>;

function genElementProps(
  element: JsonNode,
  height: number,
  style: React.CSSProperties = {}
): FullProps {
  return {
    height,
    key: element.path + (element.end ? '$' : ''),
    style: {
      paddingLeft: element.path.length * 20,
      ...style,
    },
  };
}

interface ElementProps {
  element: JsonNode;
  height: number;
};

function Element({element, height}: ElementProps) {
  const props = genElementProps(element, height);

  if (element.end) {
    return (
      <div {...props}>
        <JsonBracket type={element.type} closing={!!element.end} />
        {!element.isLastChild && <JsonComma />}
      </div>
    );
  }

  if (element.type === 'object')
    return (
      <div {...props}>
        <JsonObject element={element} />
      </div>
    );
  if (element.type === 'array')
    return (
      <div {...props}>
        <JsonArray element={element} />
      </div>
    );

  return (
    <div {...props}>
      <JsonScalar element={element} />
    </div>
  );
}

const JsonBracket = ({type, closing}: {
  type: 'array' | 'object',
  closing: boolean,
}) => (
  <span className={`json-bracket json-bracket-${type}`}>
    {(type === 'array' ? '[]' : '{}')[closing ? 1 : 0]}
  </span>
);

const JsonComma = () => (
  <span className="json-comma">,</span>
);

const JsonColon = () => (
  <span className="json-colon">:</span>
);

const JsonField = ({name}: {name: string}) => (
  <span className="json-field">{name}</span>
);

const JsonValue = ({value}: {value: any}) => (
  <span className="json-value">
    {typeof value === 'string' ? `"${value}"` : value}
  </span>
);

const JsonScalar = ({element}: { element: JsonNode }) => (
  <>
    <JsonField name={element.path[element.path.length - 1]} />
    <JsonColon />
    <JsonValue value={element.value} />
    {!element.isLastChild && <JsonComma />}
  </>
);

/** array or object */
const JsonNested = ({element}: {element: JsonNode}) => {
  const field = element.path[element.path.length - 1];
  const isRoot = !!element.path.length;
  return (
    <>
      {isRoot &&
        <>
          <JsonField name={field} />
          <JsonColon />
        </>
      }
      <JsonBracket type={element.type} closing={false} />
      {element.childrenCount === 0 &&
        <JsonBracket type={element.type} closing={true} />}
    </>
  );
};

const JsonArray = JsonNested;
const JsonObject = JsonNested;
