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
      "use strict";var _=require("1");var _2=require("3");
    },function (module, exports, require) {
      "use strict";var _=require("2");
    },function (module, exports, require) {
      "use strict";exports.__esModule=true;var file={};console.log("alert from deep file");exports.file=file;
    },function (module, exports, require) {
      "use strict";exports.__esModule=true;var file={};console.log("alert from shallow file");exports.file=file;
    }])