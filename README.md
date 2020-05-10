# packsack

[![Build Status](https://travis-ci.org/syrjs/pack.svg?branch=master)](https://travis-ci.org/dmikey/packsack)

Highly opinionated, but super extensible, zero config modern web development bundler, specifically geared toward speed, agility, ease of understanding, and security of your application. 

Start developing an application using out of the box components, and declaritive `jsx` syntax, instead of code.

## install

```
npm i packsack
```

then use it

```
npx psk infile outfolder
```

or include in package.json scripts

```
"scripts": {
    "build": "psk src/index.js dist"
}
```

## features

zero config jsx, es6
build time error checking
jsx app hydration, build more than ui
platform agnostic jsx components
multiple platform rendering targets through decoupled "hydration engine"

## requirements

* Node 12+

