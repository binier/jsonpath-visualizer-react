import React from 'react';
import './json-element.css';
import { JsonNode } from "../../utils/json-to-nodes";
import { ExpandButton } from '../expand-button';
import { CollapseButton } from '../collapse-button';

type FullProps<T = { [key: string]: any }> = T & React.HTMLProps<any>;

function genElementProps(
  element: JsonNode,
  height: number,
  style: React.CSSProperties = {}
): FullProps {
  return {
    key: element.path + (element.end ? '$' : ''),
    style: {
      height,
      position: 'relative',
      marginLeft: element.path.length * 20,
      ...style,
    },
  };
}

interface JsonNestedProps {
  element: JsonNode;
  onCollapse: (index: number) => void;
  onExpand: (index: number) => void;
}

interface ElementProps extends JsonNestedProps {
  height: number;
};

export default function (
  { element, height, onCollapse, onExpand }: ElementProps
) {
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
        <JsonObject {...{ element, onCollapse, onExpand }} />
      </div>
    );
  if (element.type === 'array')
    return (
      <div {...props}>
        <JsonArray {...{ element, onCollapse, onExpand }} />
      </div>
    );

  return (
    <div {...props}>
      <JsonScalar element={element} />
    </div>
  );
}

const JsonBracket = ({ type, closing }: {
  type: 'array' | 'object',
  closing: boolean,
}) => (
    <span className={`json-bracket json-bracket-${type}`}>
      {(type === 'array' ? '[]' : '{}')[closing ? 1 : 0]}
    </span>
  );

const JsonSpread = () => (
  <span className="json-spread">...</span>
);

const JsonComma = () => (
  <span className="json-comma">,</span>
);

const JsonColon = () => (
  <span className="json-colon">:</span>
);

const JsonField = ({ name }: { name: string }) => (
  <span className="json-field">{name}</span>
);

const JsonValue = ({ type, value }: { type: string, value: any }) => (
  <span className={`json-value json-value-${type}`}>
    {typeof value === 'string' ? `"${value}"` : value}
  </span>
);

const JsonScalar = ({ element }: { element: JsonNode }) => (
  <>
    <JsonField name={element.path[element.path.length - 1]} />
    <JsonColon />
    <JsonValue type={element.type} value={element.value} />
    {!element.isLastChild && <JsonComma />}
  </>
);

/** array or object */
const JsonNested = ({ element, onCollapse, onExpand }: JsonNestedProps) => {
  const field = element.path[element.path.length - 1];
  const isRoot = !element.path.length;
  return (
    <>
      {!isRoot &&
        <>
          {element.childrenCount! > 0 &&
            (element.collapsed
              ? <ExpandButton onClick={() => onExpand(element.index)} />
              : <CollapseButton onClick={() => onCollapse(element.index)} />
            )
          }
          <JsonField name={field} />
          <JsonColon />
        </>
      }
      <JsonBracket type={element.type} closing={false} />
      {element.collapsed && <JsonSpread />}
      {(element.childrenCount === 0 || element.collapsed) &&
        <JsonBracket type={element.type} closing={true} />}
    </>
  );
};

const JsonArray = JsonNested;
const JsonObject = JsonNested;
