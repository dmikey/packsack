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
      "use strict";var _=require("1");var _2=_interopRequireDefault(_);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}console.log(_2.default);
    },function (module, exports, require) {
      "use strict";exports.__esModule=true;exports.default={"some":"foo"};
    }])