const assert = require('assert');
const gatherer = require('../src/gatherer');
const path = require('path');

describe('gather entry', function() {
  describe('basic', function() {
    it('should return a dependency tree with main entry', function() {
      const fixturePath = path.join(__dirname,'./fixtures/basic');
      const gathered = gatherer(fixturePath);
      assert.equal(gathered.filePath, fixturePath);
      assert.equal(gathered.dependencies instanceof Array, true);
      assert.equal(gathered.cache.mainFileEntry.ast.type, 'File')
    });
  });

  describe('simple import', function() {
    it('should return a dependency tree with main entry and one child', function() {
      const fixturePath = path.join(__dirname,'./fixtures/simple-import');
      const gathered = gatherer(fixturePath);
      const dependency = gathered.dependencies[0];
      assert.equal(dependency.file, './index2');
    });
  });

  describe('same import name', function() {
    it('should return a cache with 4(four) files', function() {
      const fixturePath = path.join(__dirname,'./fixtures/same-import-name');
      const gathered = gatherer(fixturePath);
      console.log(gathered);
      assert.equal(Object.keys(gathered.cache).length, 4);
    });
  });
});