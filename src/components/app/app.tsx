import React, { useState, useEffect, useCallback } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { JsonView } from '../json-view';
import { debounce, sampleJson } from '../../utils';
import { UploadJson } from '../upload-json';

interface JsonChooserProps {
  onJson(json: Record<string, any>): void;
  onError(error: any): void;
}

function JsonChooser({ onJson, onError }: JsonChooserProps) {
  const [sampleCount, setSampleCount] = useState(1000);

  const onSampleCountInput = useCallback((value: string) => {
    setSampleCount(Math.abs(parseInt(value)));
  }, [setSampleCount]);

  return (
    <div className="p-2 m-auto text-center text-gray-700 md:w-4/6 lg:w-3/6">
      <div className="mb-4">
        <UploadJson onUpload={onJson} onError={onError} />
      </div>
      OR
      <div className="mt-4 text-left">
        <h2 className="mb-2">Use random JSON</h2>
        <label>
          <div className="text-xs text-gray-600 md:-mb-3">elements count</div>
          <input
            type="text"
            className="w-full px-3 py-1 border rounded shadow md:w-2/6 focus:outline-none focus:shadow-outline"
            value={sampleCount}
            onChange={e => onSampleCountInput(e.target.value)}
          />
        </label>
        <button
          className="w-full px-3 py-1 mt-3 bg-gray-200 border rounded shadow hover:bg-gray-300 md:inline md:w-auto md:ml-3"
          onClick={() => onJson(sampleJson(sampleCount))}
        >
          generate
        </button>
      </div>
    </div>
  );
}

function JsonPathVisualizer({ json }: { json: Record<string, any> }) {
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
  );
}

export default function () {
  const [json, setJson] = useState<Record<string, any>>();

  const handleJsonError = (error: any) => {
    console.log(error);
  };

  return (
    <div className="w-full p-2 mx-auto mt-2 md:w-5/6">
      {!json
      ? (<JsonChooser
          onJson={json => setJson(json)}
          onError={handleJsonError}
        />)
      : (<JsonPathVisualizer key={json as any} json={json} />)
      }
    </div>
  );
};
