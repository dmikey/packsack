(function (modules) {
    const moduleCache = {};
    function require(id) {
      if(moduleCache[id]) {
        return moduleCache[id];
      }
      const fn = modules[id];
      const module={},exports={};
      fn(module, exports,(id)=>require(id));
      moduleCache[id] = exports
      return exports;
    }
    require(0);
   })([function (module, exports, require) {
      "use strict";console.log("hello");
    }])