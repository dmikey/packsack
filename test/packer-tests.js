const assert = require('assert');
const packer = require('../src/packer');
const gatherer = require('../src/gatherer');
const path = require('path');
const fs = require('fs');
const jsxPlugin = require('@syr/jsx');
const packerOpts = {
  minify: false,
  comments: true,
  presets: [
    ["env", {
      "loose": true,
      "browsers": [">0.25%", "not dead"]
    }]
  ],
  plugins: [
    [jsxPlugin.default, {
      "useVariables": true,
      "useGuid": false
    }]
  ]
};

describe('basic packer tests', function () {
  it('should pack the basic example', function () {
    const fixturePath = path.join(__dirname, './fixtures/basic');
    const gathered = gatherer(fixturePath);
    const packed = packer(gathered, packerOpts);
    const outputFixture = fs.readFileSync(path.join(__dirname, './fixtures/basic/out.js'), "utf-8");
    assert.equal(outputFixture, packed);
  });

  it('should pack the simple example', function () {
    const fixturePath = path.join(__dirname, './fixtures/simple-import');
    const gathered = gatherer(fixturePath);
    const packed = packer(gathered, packerOpts);
    const outputFixture = fs.readFileSync(path.join(__dirname, './fixtures/simple-import/out.js'), "utf-8");
    assert.equal(outputFixture, packed);
  });

  it('should pack the nested name example', function () {
    const fixturePath = path.join(__dirname, './fixtures/same-import-name');
    const gathered = gatherer(fixturePath);
    const packed = packer(gathered, packerOpts);
    const outputFixture = fs.readFileSync(path.join(__dirname, './fixtures/same-import-name/out.js'), "utf-8");
    assert.equal(outputFixture, packed);
  });

  it('should pack the json example', function () {
    const fixturePath = path.join(__dirname, './fixtures/json-test');
    const gathered = gatherer(fixturePath);
    const packed = packer(gathered, packerOpts);
    const outputFixture = fs.readFileSync(path.join(__dirname, './fixtures/json-test/out.js'), "utf-8");
    assert.equal(outputFixture, packed);
  });

  it('should pack the jsx example', function () {
    const fixturePath = path.join(__dirname, './fixtures/jsx-test');
    const gathered = gatherer(fixturePath);
    const packed = packer(gathered, packerOpts);
    const outputFixture = fs.readFileSync(path.join(__dirname, './fixtures/jsx-test/out.js'), "utf-8");
    assert.equal(outputFixture, packed);
  });

  it('should pack the spud example', function () {
    const fixturePath = path.join(__dirname, './fixtures/spud-test');
    const gathered = gatherer(fixturePath);
    const packed = packer(gathered, packerOpts);
    const outputFixture = fs.readFileSync(path.join(__dirname, './fixtures/spud-test/out.js'), "utf-8");
    assert.equal(outputFixture, packed);
  });
});


