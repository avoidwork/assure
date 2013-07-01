[![build status](https://secure.travis-ci.org/avoidwork/assure.png)](http://travis-ci.org/avoidwork/assure)
# assure

Promises/A+ micro library to help with asynchronous work flow.

## What is Supported?

* AMD loaders (require.js, cujo.js, etc.)
* node.js (npm install assure)
* script tag

## How do I use this?

Promises (deferreds/futures/etc.) are a way to create a tangible connection between `now` and an eventual outcome. Promises are a good pattern for asynchronous I/O, such as API interaction, AJAX operations, etc., by providing optional `success` & `failure` handling.

Promise reconciliation is asynchronous, allowing you to chain multiple Promises together in a hierarchy, for resolution. If a `Promise` returns a new `Promise` from a handler, you've effectively branched during reconciliation, like a T, which puts the "parent" of the new `Promise` into a pending state, which can only be reconciled from the branch.

A `then()` will return a ***new*** Promise which is in a hierarchal relationship. When a "parent" is reconciled, it's "children" inherit the outcome. Promise chains can be resolved from either end.

## API

### reject
#### Method
Breaks a Promise

	@param  {Mixed} arg Promise outcome
	@return {Object}    Promise

***Example***

```javascript
var p = assure();

p.then(null, function (e) {
	console.error(e);
});

p.reject("rejected");
```

### resolve
#### Method
Promise is resolved

	@param  {Mixed} arg Promise outcome
	@return {Object}    Promise

***Example***

```javascript
var p = assure();

p.then(function (arg) {
	console.log(arg);
});

p.resolve("resolved");
```

### resolved
#### Method
Returns a boolean indicating state of the Promise

	@return {Boolean} `true` if resolved

***Example***

```javascript
var p = assure();

p.then(function (arg) {
	console.log(p.resolved());
});

p.resolve("resolved");
```

### then
#### Method
Registers handler(s) for a Promise

	@param  {Function} success Executed when/if promise is resolved
	@param  {Function} failure [Optional] Executed when/if promise is broken
	@return {Object}           New Promise instance

***Example***

```javascript
var p = assure();

p.then(function (arg) {
	console.log("Promise succeeded!");
}, function (e) {
	console.error("Promise failed!");
});

p.resolve("resolved");
```

## License

assure is licensed under BSD-3 https://raw.github.com/avoidwork/assure/master/LICENSE

### Copyright

Copyright (c) 2013, Jason Mulligan <jason.mulligan@avoidwork.com>