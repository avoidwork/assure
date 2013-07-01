/**
 * Promise factory
 *
 * @class Promise
 * @return {Object} Instance of Promise
 */
function Promise () {
	this.childNodes = [];
	this.error      = [];
	this.fulfill    = [];
	this.parentNode = null;
	this.outcome    = null;
	this.state      = promise.state.pending;
}

// Setting prototype & constructor loop
Promise.prototype = promise.methods;
Promise.prototype.constructor = Promise;
