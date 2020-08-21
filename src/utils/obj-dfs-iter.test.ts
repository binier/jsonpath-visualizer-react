import { ObjDfsIter } from './obj-dfs-iter';

describe('Object DFS Iterator', () => {
  it('object containing null value', () => {
    const res = new ObjDfsIter({ name: null }).nextAll();

    expect(res.length).toEqual(1);
    expect(res[0]).toMatchObject({ key: 'name', value: null });
  });

  it('object containing undefined value', () => {
    const res = new ObjDfsIter({ name: undefined }).nextAll();

    expect(res.length).toEqual(1);
    expect(res[0]).toMatchObject({ key: 'name', value: undefined });
  });

  it('next() outputs in correct order', () => {
    const iter = new ObjDfsIter({
      users: [
        { name: 'user1', age: 22 },
        { name: 'user2', age: 23 },
      ],
      balls: ['ball1', 'ball2'],
    });

    const res = iter.nextAll();
    expect(res.length).toEqual(10);
    expect(res[0].key).toEqual('users');

    expect(res[1].key).toEqual('0');
    expect(res[2]).toMatchObject({ key: 'name', value: 'user1' });
    expect(res[3]).toMatchObject({ key: 'age', value: 22 });

    expect(res[4].key).toEqual('1');
    expect(res[5]).toMatchObject({ key: 'name', value: 'user2' });
    expect(res[6]).toMatchObject({ key: 'age', value: 23 });

    expect(res[7].key).toEqual('balls');

    expect(res[8]).toMatchObject({ key: '0', value: 'ball1' });
    expect(res[9]).toMatchObject({ key: '1', value: 'ball2' });
  });

  it('prev() outputs in correct order', () => {
    const iter = new ObjDfsIter({
      users: [
        { name: 'user1', age: 22 },
        { name: 'user2', age: 23 },
      ],
      balls: ['ball1', 'ball2'],
    }).nextSkipAll();

    const res = iter.prevAll();
    expect(res.length).toEqual(10);
    expect(res[0]).toMatchObject({ key: '1', value: 'ball2' });
    expect(res[1]).toMatchObject({ key: '0', value: 'ball1' });
    expect(res[2].key).toEqual('balls');
    expect(res[3]).toMatchObject({ key: 'age', value: 23 });
    expect(res[4]).toMatchObject({ key: 'name', value: 'user2' });
    expect(res[5].key).toEqual('1');
    expect(res[6]).toMatchObject({ key: 'age', value: 22 });
    expect(res[7]).toMatchObject({ key: 'name', value: 'user1' });
    expect(res[8].key).toEqual('0');
    expect(res[9].key).toEqual('users');
  });

  it('should return correct results when changing iteration directions', () => {
    const iter = new ObjDfsIter({
      users: [
        { name: 'user1', age: 22 },
        { name: 'user2', age: 23 },
      ],
      balls: ['ball1', 'ball2'],
    }).nextSkipAll();

    iter.prevAll(4);
    iter.next();
    expect(iter.prev()).toMatchObject({ key: 'age', value: 23, depth: 2 });
    iter.nextAll(2);
    expect(iter.prev()).toMatchObject({ key: 'balls', value: ['ball1', 'ball2'], depth: 0 });
  });
});
