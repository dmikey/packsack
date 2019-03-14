const fs = require('fs')
const path = require('path')
const babelParser = require("@babel/parser");
const babelTraverse = require("babel-traverse");
const t = require('@babel/types');

// these track things that we're going to gather together
// grabbing a bunch of information that we'll eventually pass forward
let moduleCache;
let resolvedModules;
let pathCache;
let pathMap;
let mmModuleCache = [];

/**
 * Gathers the deps for a file, in relation to a parent or absolute entry
 * @param {string} entryFileName
 * @param {string} forParent
 */
function getDependencies(entryFileName, forParent) {

  // for not the file path just might be the raw entryFileName
  let filePath = entryFileName;

  // if it doesn't end with .js, and it doesn't have a relative or absolute
  // pathing specified, it's most likely a node module
  if(filePath.indexOf('.js') < 0 && filePath.indexOf('./') < 0) {
      // node_modules
      // the start of our tree, entry usually goes here
      // this is so short and sweet, because of Node 8.9
      // so that's our minimum target for the bundler.
      // in reality thats really old.
      filePath = require.resolve(entryFileName, {
        paths:[path.join(process.cwd(), 'node_modules')]
      });
  } else {
    if(forParent) {

      // using path for parent to resolve path locations
      // of source files
      let parentPath;

      // omg I repeated code.
      // todo: dry this up, shame on me, but w/e
      if(forParent.indexOf('.js') < 0 && forParent.indexOf('./') < 0) {
        parentPath = path.parse(require.resolve(forParent, {
          paths:[path.join(process.cwd(), 'node_modules')]
        }));
      } else {
        parentPath = path.parse(forParent);
      }

      // if there is no js at the file path
      if(filePath.indexOf('.js') < 0) {
        let checkPath = `${filePath}/index.js`;
        // we'll check if it exists as an index.js file under
        if (!fs.existsSync( path.resolve(`${parentPath.dir}/${checkPath}`))) {
          checkPath = `${filePath}.js`
        }
        filePath = checkPath;
      }

      // resolve the file path of the dependency
      filePath = path.resolve(`${parentPath.dir}/${filePath}`);
    }
  }

  // this is the entry file we're analyizing
  let entryData;
  const dependencies = [];
  try {
    entryData = fs.readFileSync(filePath, "utf-8");

    // little crappy json loader ;-)
    // when we encounter a file that ends in json
    // lets format it so it exports seamlessly with es6
    // this is really how the webpack plugin works too
    if(entryFileName.indexOf('json') > -1) {
      entryData = `export default ${entryData}`;
    }

    // get ast from the entry file, so we can comb it for deps
    let ast = parseToAST(entryData);

    // if we we're passed a parent, then we know we've already started
    // the crawl. if we didn't have a parent, then it's the top level entry
    // for this pack
    if(forParent) {
      moduleCache[entryFileName] = {ast:ast};
    } else {
      moduleCache.mainFileEntry = {ast:ast};
    }

    // put those entries into a pathMap. Later we need to map a bunch of
    // this into anonmyzing packages. Otherwise we'll be leaking details about
    // the user directory, since we pack by absolute path to dedupe.
    pathMap[entryFileName] = filePath;

    if(!pathCache[filePath]) {
      pathCache[filePath] = {ast:ast, moduleId: (mmModuleCache.push(ast) - 1)};
    }


    // traverse the ast, looking for imports to gather again
    babelTraverse.default(ast, {
      ImportDeclaration: ({ node }) => {
        dependencies.push({
          file: node.source.value,
          fileLocation: resolveLocation(node.source.value, filePath),
          requestorPath: filePath
        });

        node.source = t.NumericLiteral(pathCache[filePath].moduleId);
      }
    });
  } catch (e) {

    // things either not existing, or not going through babel (loaders!? lol)
    // really though, there maybe a reason that you reach this block I've tried to
    // infer the most likely scenarios so far
    if (e.message.indexOf('ENOENT') > -1) {
      console.log('file not found >>> ', filePath)
      console.log('requested in ', forParent);
    } else if(e.message.indexOf('Unexpected token') > -1) {
      console.log('no loader for file specified >>> ', filePath)
      console.log('requested in ', forParent);
    } else {
      console.log(e.message)
    }
    process.exit(0)
  }
  return dependencies;
}

/**
 * Parses a string of Javascript contents to a babel AST tree
 * @param {string} fileContents
 */
function parseToAST(fileContents) {
  let ast = babelParser.parse(fileContents, {
    sourceType: "unambiguous",
    "plugins": [ "jsx" ]
  });
  return ast;
}

/**
 * Given two location strings, resolves the path string, or node_module
 * @param {string} toLocation
 * @param {string} fromLocation
 */
function resolveLocation(toLocation, fromLocation) {
  let resolvedPath;
  if(toLocation.indexOf('.js') < 0 && toLocation.indexOf('./') < 0) {
    // this is a node module resolve starting in the commands parent node_modules
    resolvedPath = require.resolve(toLocation, {
      paths:[path.join(process.cwd(), 'node_modules')]
    });
  } else {
    let fromPath = path.parse(fromLocation);
    resolvedPath = path.join(fromPath.dir, toLocation);
  }
  return resolvedPath;
}

function parseTreeDeps(deps, entry) {
  // track resolved modules for circular dep
  // developer will get a callstack exceeded message
  if(resolvedModules[entry]) {
    return
  }
  resolvedModules[entry] = true;
  // loop through and resolve deps
  for(let i = 0; i < deps.length; i++) {
    let subDeps = getDependencies(deps[i].file, entry);
    parseTreeDeps(subDeps, deps[i].fileLocation);
    deps[i].dependencies = subDeps;
  }
}


/**
 * Accepts a string location for an entry to start packaging for distrbution
 * @param {string} entry
 */
module.exports = (entry) => {
  moduleCache = {};
  resolvedModules = {};
  pathCache = {};
  pathMap = {};
  mmModuleCache=[];
  console.log('gathering modules');
  const depTree = {
    filePath: entry,
    dependencies: [],
    cache: moduleCache,
    pathMap: pathMap,
    pathCache: pathCache,
    mmModuleCache:mmModuleCache
  };
  depTree.dependencies = getDependencies(entry);
  parseTreeDeps(depTree.dependencies, entry);
  return depTree
}