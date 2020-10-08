import React, { useEffect, useMemo, useRef } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { debounce } from '../../utils';
import { observable } from 'mobx';
import { JsonNode, jsonToElements } from '../../utils/json-to-nodes';
import { JsonElement } from '../json-element';

interface Props {
  json: Record<string, any>;
  matches: Array<string[]>;
}

export default (props: Props) => {
  const state = useLocalStore(() => ({
    /**
     * elements array can be huge and we don't need for it to be
     * observable since we won't be mutating it.
     * */
    shallow: observable({
      elements: new Array<JsonNode>(),
      visible: new Array<JsonNode>(),
    }, {}, { deep: false }),
    elHeight: 24,
    height: 0,
    _left: 0,
    _right: 0,
    matchedPaths: new Set<string>(),

    get elements() { return state.shallow.elements; },
    set elements(value: JsonNode[]) { state.shallow.elements = value; },

    get visible() { return state.shallow.visible; },
    set visible(value: JsonNode[]) {
      state.shallow.visible = [...value];
    },

    get left() { return state._left; },
    set left(value: number) {
      state._left = Math.max(0, value);
    },

    get right() { return state._right; },
    set right(value: number) {
      state._right = Math.max(0, value);
    },

    get firstVisible() {
      return state.visible[0];
    },

    get lastVisible() {
      return state.visible[state.visible.length - 1];
    },

    get windowStart() {
      if (!state.firstVisible) return -1;
      return state.firstVisible.index;
    },

    get windowEnd() {
      if (!state.lastVisible) return -1;
      return state.lastVisible.index;
    },

    get scrollTop() {
      return state.left * state.elHeight;
    },

    get scrollBottom() {
      return state.right * state.elHeight;
    },

    get elCount() {
      return Math.ceil(state.height / state.elHeight);
    },

    findNodeIndex(path: string[], elements?: JsonNode[]) {
      elements = elements || state.elements;
      const pathStr = path.toString();

      for (let i = 0; i < elements!.length; ++i) {
        const cur = elements![i];
        const curPathStr = cur.path.toString();
        if (curPathStr === pathStr)
          return i;
        if (!pathStr.startsWith(curPathStr))
          i += cur.childrenCount || 0;
      }

      return -1;
    },

    findNode(path: string[], elements?: JsonNode[]) {
      elements = elements || state.elements;
      return elements[state.findNodeIndex(path, elements)];
    },

    setJson(json: any) {
      function matches(this: JsonNode) {
        return this.path.some((_, i, path) => {
          return state.matchedPaths.has(
            path.slice(0, i + 1).toString()
          );
        }) || state.matchedPaths.has('');
      }

      const elements = jsonToElements(json);

      elements.forEach(element => {
        element.expandedChildrenCount = element.childrenCount;
        Object.defineProperty(element, 'matches', {
          get: matches,
        });
      });

      state.elements = elements;
      state.setHeight(state.height);
    },

    resetMatches() {
      state.matchedPaths.clear();
    },

    setMatch(path: string[], flag = true) {
      if (flag) state.matchedPaths.add(path.toString());
      else state.matchedPaths.delete(path.toString());
    },

    setHeight(height: number) {
      state.height = height;
      state.left = 0;
      state.right = state.elements.length;
      state.visible = [];
      state.moveNext(state.elCount)
      // TODO: handle height change
    },

    setScrollTop(scrollTop: number) {
      const deltaY = Math.abs(scrollTop - state.scrollTop);

      if (scrollTop < state.scrollTop)
        return state.movePrev(Math.ceil(deltaY / state.elHeight));
      else
        return state.moveNext(Math.floor(deltaY / state.elHeight));
    },

    moveNext(steps = 1) {
      if (steps <= 0) return;
      let {
        left, right, elCount,
        visible, lastVisible, elements,
        windowEnd: index,
      } = state;

      if (lastVisible && lastVisible.collapsed && !lastVisible.end)
        index += lastVisible.childrenCount!;

      for (let i = 0; i < steps && index < elements.length - 1; ++i) {
        const element = elements[++index];
        if (element.collapsed && element.end) continue;

        --right;
        if (visible.length >= elCount) {
          visible = visible.slice(1);
          ++left;
        }
        visible.push(element)

        if (element.collapsed)
          index += element.childrenCount!;
      }
      Object.assign(state, { left, right, visible });
    },

    movePrev(steps = 1) {
      if (steps <= 0) return;
      let { left, right, elCount, visible, elements } = state;
      let index = state.windowStart;

      for (let i = 0; i < steps && index > 0; ++i) {
        --index;
        while (elements[index].collapsed && elements[index].end) {
          index -= elements[index].childrenCount!;
        }
        const element = elements[index];

        left = Math.max(left - 1, 0);
        ++right;
        visible = [
          element,
          ...visible.slice(0, visible.length >= elCount ? -1 : elCount),
        ];
      }
      Object.assign(state, { left, right, visible });
    },

    setCollapsed(index: number, flag: boolean) {
      const element = state.elements[index];
      const endIndex = index + element.childrenCount!;
      state.elements[index].collapsed = flag;
      state.elements[endIndex].collapsed = flag;
      const expandedCount = element.expandedChildrenCount!;

      if (flag) {
        state.right -= expandedCount;
      } else {
        state.right += expandedCount;
      }

      for (
        let path = element.path.slice(0, -1), count = expandedCount;
        path.length > 0;
        path = path.slice(0, -1), ++count
      ) {
        const parent = state.findNode(path);
        const delta = (flag ? -1 : 1) * count;

        parent.expandedChildrenCount! += delta;
        state.elements[
          parent.index + parent.childrenCount!
        ].expandedChildrenCount! += delta;
      }

      const { visible } = state;
      state.right += visible.length - 1;
      state.visible = visible.slice(0, 1);
      state.moveNext(state.elCount - 1);

      // when user collapses node on last page, moveNext can't fill the
      // entire visible array. It needs to movePrev as well and scroll
      // up, so that whole view is filled with nodes.
      const countDiff = state.elCount - state.visible.length;
      state.movePrev(countDiff);
      state.right -= countDiff * 2;
    },

    collapse(index: number) {
      return state.setCollapsed(index, true);
    },

    expand(index: number) {
      return state.setCollapsed(index, false);
    }
  }));

  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resetHeight = debounce(() => {
      state.setHeight(viewRef.current!.clientHeight || 0);
    }, 200);
    const resetScroll = (e: any) => {
      state.setScrollTop(e.target.scrollTop);
    };
    resetHeight();
    state.setJson(props.json)

    window.addEventListener('resize', resetHeight);
    viewRef.current!.addEventListener('scroll', resetScroll);
    return () => {
      window.removeEventListener('resize', resetHeight);
      viewRef.current!.removeEventListener('scroll', resetScroll);
    };
  }, [props.json]);

  useMemo(() => {
    state.resetMatches();
    props.matches.forEach(path => state.setMatch(path));
  }, [props.matches]);

  return useObserver(() => {
    return (
      <div className="json-view">
        <div ref={viewRef} style={{ height: "100%", overflow: 'auto' }}>
          <div style={{ height: state.scrollTop }}></div>
          <Elements
            elements={state.visible}
            eachHeight={state.elHeight}
            onCollapse={state.collapse}
            onExpand={state.expand} />
          <div style={{ height: state.scrollBottom }}></div>
        </div>
      </div>
    );
  });
};

function Elements(props: {
  elements: JsonNode[],
  eachHeight: number,
  onCollapse: (index: number) => void,
  onExpand: (index: number) => void,
}) {
  return (
    <>{
      props.elements.map(element => JsonElement({
        element,
        height: props.eachHeight,
        onCollapse: props.onCollapse,
        onExpand: props.onExpand,
      }))
    }</>
  );
}
