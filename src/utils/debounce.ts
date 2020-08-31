export function debounce<
  T extends any[]
>(fn: (...args: T) => void, ms: number) {
  let timer: any;
  return (...args: T) => {
    console.log(args)
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
}
