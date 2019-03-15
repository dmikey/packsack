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
      "use strict";function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}var TestClass=function(){function TestClass(){_classCallCheck(this,TestClass)}TestClass.prototype.foo=function foo(){console.log("foo")};return TestClass}();;var testclass={elementName:TestClass,attributes:{},children:[]};var instance=new testclass.elementName;instance.foo();
    }])