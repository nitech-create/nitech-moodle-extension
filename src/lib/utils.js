export function isUndefined(value){
  return typeof value === 'undefined';
}

export function injectScript(code){
  const script = document.createElement('script');
  script.textContent = code;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}
