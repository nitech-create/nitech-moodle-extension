const utils = {
  isUndefined: null,
};

utils.isUndefined = value => {
  return typeof value === 'undefined';
};

export default utils;
