const assert = require('assert');
const gatherer = require('../src/gatherer');
const path = require('path');
const jsonloader = require('../src/internal-loaders/jsonloader');

  describe('basic gather tests', function() {
    it('should return a dependency tree with main entry no deps', function() {
      const fixturePath = path.join(__dirname,'./fixtures/basic');
      const gathered = gatherer(fixturePath);
      assert.equal(gathered.filePath, fixturePath);
      assert.equal(gathered.dependencies instanceof Array, true);
      assert.equal(gathered.dependencies.length, 0)
    });

    it('should return a dependency tree with main entry and one child', function() {
      const fixturePath = path.join(__dirname,'./fixtures/simple-import');
      const gathered = gatherer(fixturePath);
      const dependency = gathered.dependencies[0];
      assert.equal(dependency.file, './index2');
    });

    it('should return a cache with 4(four) files, and a nested depenedency', function() {
      const fixturePath = path.join(__dirname,'./fixtures/same-import-name');
      const gathered = gatherer(fixturePath);
      assert.equal(gathered.dependencies[0].dependencies.length, 1);
      assert.equal(gathered.dependencies.length, 2);
      assert.equal(Object.keys(gathered.cache).length, 4);
    });

    it('should return a cache with a json file in the pathCache', function() {
      const fixturePath = path.join(__dirname,'./fixtures/json-test');
      const gathered = gatherer(fixturePath);

      const jsonFixturePath = path.join(__dirname,'./fixtures/json-test/test.json');
      assert.equal(typeof gathered.pathCache[jsonFixturePath], 'object');
    });
  });