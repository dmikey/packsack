class TestClass {
  foo() {
    console.log('foo');
  }
};
let testclass = <TestClass/>;
let instance = new testclass.elementName();
instance.foo();