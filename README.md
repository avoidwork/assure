# assure

Promises/A+ micro library to help with asynchronous work flow. The deferred methods match jQuery's when possible for convenience and familiarity, but under the hood it is a Promises/A+ spec!

[![build status](https://secure.travis-ci.org/avoidwork/assure.png)](http://travis-ci.org/avoidwork/assure)

**Example**

```
var deferred = assure();

deferred.done(function (arg) {
	console.log("Outcome: " + arg);
});

deferred.always(function (arg) {
	...
});
```

## What is Supported?

* AMD loaders (require.js, cujo.js, etc.)
* node.js (npm install assure)
* script tag

## How do I use this?

Promises (deferreds/futures/etc.) are a way to create a tangible connection between `now` and an eventual outcome. Promises are a good pattern for asynchronous I/O, such as API interaction, AJAX operations, etc., by providing optional `success` & `failure` handling.

A `then()` will return a ***new*** Promise which is in a hierarchal relationship. When a "parent" is reconciled, it's "children" inherit the outcome.

## API

### always
#### Method

Registers a function to execute after Promise is reconciled

	param  {Function} arg Function to execute
	return {Object}       Deferred

**Example**

```
var deferred = assure();

deferred.always(function() {
	console.log("This is always going to run");
});
```

### done
#### Method

Registers a function to execute after Promise is resolved

	param  {Function} arg Function to execute
	return {Object}       Deferred

**Example**

```
var deferred = assure();

deferred.done(function() {
	console.log("This is going to run if Promise is resolved");
});
```

### fail
#### Method

Registers a function to execute after Promise is rejected

	param  {Function} arg Function to execute
	return {Object}       Deferred

**Example**

```
var deferred = assure();

deferred.fail(function() {
	console.log("This is going to run if Promise is rejected");
});
```

### isRejected
#### Method

Determines if Deferred is rejected

	return {Boolean} `true` if rejected

**Example**

```
var deferred = assure();

deferred.isRejected(); // false, it's brand new!
```

### isResolved
#### Method

Determines if Deferred is resolved

	return {Boolean} `true` if resolved

**Example**

```
var deferred = assure();

deferred.isResolved(); // false, it's brand new!
```

### reject
#### Method
Breaks a Promise

	param  {Mixed} arg Promise outcome
	return {Object}    Promise

***Example***

```
var deferred = assure();

deferred.then(null, function (e) {
	console.error(e);
});

deferred.reject("rejected");
```

### resolve
#### Method
Promise is resolved

	param  {Mixed} arg Promise outcome
	return {Object}    Promise

***Example***

```
var deferred = assure();

deferred.then(function (arg) {
	console.log(arg);
});

deferred.resolve("resolved");
```

### state
#### Method

Gets the state of the Promise

	return {String} Describes the state

**Example**

```
var deferred = assure();

deferred.state(); // `pending`
```

### then
#### Method
Registers handler(s) for a Promise

	param  {Function} success Executed when/if promise is resolved
	param  {Function} failure [Optional] Executed when/if promise is broken
	return {Object}           New Promise instance

***Example***

```
var deferred = assure();

deferred.then(function (arg) {
	console.log("Promise succeeded!");
}, function (e) {
	console.error("Promise failed!");
});

deferred.resolve("resolved");
```

### when
#### Method
Accepts Deferreds or Promises as arguments or an Array

	return {Object} Deferred

***Example***

```
var d1 = assure(),
    d2 = assure(),
    d3 = assure();

...

assure.when(d1,d2,d3).then(function (values) {
	...
});
```

## License
Copyright (c) 2013 Jason Mulligan  
Licensed under the BSD-3 license.
