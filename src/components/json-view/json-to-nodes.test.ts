import { jsonToElements } from './json-to-nodes';

const buildElements = () => jsonToElements({
  users: [
    { name: 'user1', age: '100', notes: ['abc', 'def'] },
    { name: 'user2', age: '200', notes: ['ghi', 'jkl'] },
  ],
});

describe('json to elemets test', () => {
  it('calculates childrenCount correctly', () => {
    const elements = buildElements();
    expect(elements[0].childrenCount).toEqual(17);
    expect(elements[1].childrenCount).toEqual(7);
    expect(elements[2].childrenCount).toEqual(0);
    expect(elements[4].childrenCount).toEqual(3);
  });
});
