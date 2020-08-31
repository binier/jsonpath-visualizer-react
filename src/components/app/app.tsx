import React, {useState, useEffect, useCallback} from 'react';
import { JSONPath } from 'jsonpath-plus';
import { JsonView } from '../json-view';
import { debounce, sampleJson } from '../../utils';


export default function () {
  const [json] = useState(sampleJson(1000));
  const [jsonPath, setJsonPath] = useState('');
  const [matches, setMatches] = useState([] as Array<string[]>);

  const onJsonPathInput = useCallback(debounce((value: string) => {
    setJsonPath(value);
  }, 400), []);

  useEffect(() => {
    try {
      setMatches(
        JSONPath({
            json,
            path: jsonPath,
            resultType: 'path',
          })
          .map((x: string) => (JSONPath as any).toPathArray(x))
          .map((x: string[]) => x.slice(1))
      );
    } catch(e) { }
  }, [json, jsonPath]);

  return (
    <div className="w-full p-2 mx-auto mt-2 md:w-5/6">
      <div className="relative w-full">
        <input
          placeholder="json path..."
          className="w-full px-3 py-1 mb-3 border rounded shadow md:w-2/6 focus:outline-none focus:shadow-outline"
          onChange={e => onJsonPathInput(e.target.value)} />
        <div className="mb-2 text-right md:absolute md:right-0 md:top-0 md:mt-1">
          <span className="ml-2 italic text-gray-600">
            found: {matches.length}
          </span>
        </div>
        <JsonView json={json} matches={matches}></JsonView>
      </div>
    </div>
  );
};
