export default function loadFeature(features, environment, url) {
  if(!Array.isArray(features)) {
    return;
  }

  const loadOrder = features.filter(feature => {
    return feature.config.target == 'any' || feature.config.target == environment || new RegExp(feature.config.target).test(url);
  });

  console.log(features);

  const loaded = [];
  const loadStarted = [];
  const load = function() {
    for(const feature of loadOrder) {
      if(!loadStarted.includes(feature.config.name) && feature.config.preload.every((feature) => loaded.includes(feature))) {
        console.log("Loading feature: ", feature);
        loadStarted.push(feature.config.name);

        // Promiseとして解決
        loaded.push(feature.config.name);
        Promise.resolve(feature.func)
          .then(() => {
            load();
          });
      }
    }
  }
  load();
}