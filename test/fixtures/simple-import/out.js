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
      "use strict";var _=require("1");console.log(_.index2);
    },function (module, exports, require) {
      "use strict";exports.__esModule=true;var index2={foo:"baz"};exports.index2=index2;
    }])