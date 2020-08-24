import React from 'react';
import { JsonView } from '../json-view';

function sampleJson(count: number) {
  const rAge = () => Math.floor(Math.random() * 100);
  const nextUser = (() => {
    let i = 0;
    return () => ({ name: 'user' + ++i, age: rAge() });
  })();
  return {
    result: {
      users: [...Array(count)].map(_ => nextUser()),
    },
  };
}

export default function () {
  const json = sampleJson(1000);
  return (
    <div className="w-full p-2">
      <div className="text-center">
        <JsonView json={json}></JsonView>
      </div>
    </div>
  );
};
