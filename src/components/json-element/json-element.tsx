import React from 'react';
import { JsonNode } from "../../utils/json-to-nodes";

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

export default function ({ element, height }: ElementProps) {
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

const JsonBracket = ({ type, closing }: {
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

const JsonField = ({ name }: { name: string }) => (
  <span className="json-field">{name}</span>
);

const JsonValue = ({ value }: { value: any }) => (
  <span className="json-value">
    {typeof value === 'string' ? `"${value}"` : value}
  </span>
);

const JsonScalar = ({ element }: { element: JsonNode }) => (
  <>
    <JsonField name={element.path[element.path.length - 1]} />
    <JsonColon />
    <JsonValue value={element.value} />
    {!element.isLastChild && <JsonComma />}
  </>
);

/** array or object */
const JsonNested = ({ element }: { element: JsonNode }) => {
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
