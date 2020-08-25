import React, { useEffect } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { debounce } from '../../utils';
import { observable } from 'mobx';
import { JsonNode, jsonToElements } from '../../utils/json-to-nodes';
import { JsonElement } from '../json-element';

interface Props {
  json: Record<string, any>;
}

const getEl = () => document.getElementById('json-view');

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
      return (state.left - 1) * state.elHeight;
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
      let { index, left, right, visible, elCount, elements } = state;
      for (let i = 0; i < steps; ++i) {
        if (index >= elements.length) break;
        ++left;
        --right;
        visible = [
          ...visible.slice(index > elCount ? 1 : 0),
          elements[index++],
        ];
      }
      Object.assign(state, { index, left, right, visible });
    },

    movePrev(steps = 1) {
      let { index, left, right, visible, elements } = state;
      for (let i = 0; i < steps; ++i) {
        if (index <= visible.length) break;
        --left;
        ++right;
        visible = [
          elements[--index - visible.length],
          ...visible.slice(0, -1),
        ];
      }
      Object.assign(state, { index, left, right, visible });
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
      <div className="json-view">
        <div id="json-view" style={{ height: "100%", overflow: 'auto' }}>
          <div style={{ height: state.scrollTop }}></div>
          <Elements elements={state.visible} eachHeight={state.elHeight} />
          <div style={{ height: state.scrollBottom }}></div>
        </div>
      </div>
    );
  });
};

function Elements(props: { elements: JsonNode[], eachHeight: number }) {
  return (
    <>{
      props.elements.map(element => JsonElement({
        element,
        height: props.eachHeight,
      }))
    }</>
  );
}
