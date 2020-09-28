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

const JsonRow = ({props, matches, children}: React.PropsWithChildren<{
  props: FullProps,
  matches: boolean
}>) => (
  <div {...props} className={'json-row' + (matches ? ' json-matches' : '')}>
    {children}
  </div>
);

const JsonRowElement = (
  { element, onCollapse, onExpand }: Omit<ElementProps, 'height'>
) => {
  if (element.end)
    return (
      <>
        <JsonBracket type={element.type} closing={!!element.end} />
        {!element.isLastChild && <JsonComma />}
      </>
    );

  if (element.type === 'object')
    return (<JsonObject {...{ element, onCollapse, onExpand }} />);
  if (element.type === 'array')
    return (<JsonArray {...{ element, onCollapse, onExpand }} />);

  return (<JsonScalar element={element} />);
};

export default function (
  { element, height, onCollapse, onExpand }: ElementProps
) {
  const props = genElementProps(element, height);

  return (
    <JsonRow key={props.key} props={props} matches={!!element.matches}>
      <JsonRowElement
        element={element}
        onCollapse={onCollapse}
        onExpand={onExpand}
      />
    </JsonRow>
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
    {typeof value === 'string' ? `"${value}"` : `${value}`}
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
