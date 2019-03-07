const fs = require('fs')
const path = require('path')
const babelParser = require("@babel/parser");
const babelTraverse = require("babel-traverse");

let moduleCache = {};
let resolvedModules = {};

/**
 * Gathers the deps for a file, in relation to a parent or absolute entry
 * @param {string} entryFileName
 * @param {string} forParent
 */
function getDependencies(entryFileName, forParent) {

  let filePath = entryFileName;

  if(filePath.indexOf('.js') < 0 && filePath.indexOf('./') < 0) {
      // node_modules
      // the start of our tree, entry usually goes here
      filePath = require.resolve(entryFileName, {
        paths:[path.join(process.cwd(), 'node_modules')]
      });
  } else {
    if(forParent) {
      // using path for parent to resolve path locations
      // of source files
      let parentPath;
      if(forParent.indexOf('.js') < 0 && forParent.indexOf('./') < 0) {
        parentPath = path.parse(require.resolve(forParent, {
          paths:[path.join(process.cwd(), 'node_modules')]
        }));
      } else {
        parentPath = path.parse(forParent);
      }

      if(filePath.indexOf('.js') < 0) {
        let checkPath = `${filePath}/index.js`;

        if (!fs.existsSync( path.resolve(`${parentPath.dir}/${checkPath}`))) {
          checkPath = `${filePath}.js`
        }
        filePath = checkPath;
      }
      filePath = path.resolve(`${parentPath.dir}/${filePath}`);
    }
  }

  let entryData;
  const dependencies = [];

  try {
    entryData = fs.readFileSync(filePath, "utf-8");

    let ast = parseToAST(entryData);

    if(forParent) {
      moduleCache[entryFileName] = ast;
    } else {
      moduleCache.mainFileEntry = ast;
    }

    babelTraverse.default(ast, {
      ImportDeclaration: ({ node }) => {
        dependencies.push({
          file: node.source.value,
          fileLocation: resolveLocation(node.source.value, filePath),
          requestorPath: filePath
        });
      }
    });
  } catch (e) {
    // things either not existing, or not going through babel (loaders!? lol)

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

module.exports = (entry) => {
  const depTree = {
    filePath: entry,
    dependencies: [],
    cache: moduleCache
  };
  depTree.dependencies = getDependencies(entry);
  parseTreeDeps(depTree.dependencies, entry);
  return depTree
}

