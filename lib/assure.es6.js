/**
 * assure
 *
 * @copyright 2016 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @link http://avoidwork.github.io/assure/
 * @version 1.1.0
 */
(function (global) {
let deferred, promise;

const delay = (function () {
	if (typeof process !== "undefined") {
		return process.nextTick;
	} else if (typeof setImmediate !== "undefined") {
		return setImmediate;
	} else {
		return function (arg) {
			setTimeout(arg, 0);
		};
	}
}());

function each (obj, fn) {
	const nth = obj.length;
	let i = -1;

	while (++i < nth) {
		if (fn.call(obj, obj[i], i) === false) {
			break;
		}
	}

	return obj;
}

function pipe (parent, child) {
	return parent.then(function (arg) {
		child.resolve(arg);
	}, function (e) {
		child.reject(e);
	});
}

function reset (obj) {
	obj.onAlways = [];
	obj.onDone = [];
	obj.onFail = [];
}

const state = {
	PENDING: 0,
	FAILURE: 1,
	SUCCESS: 2
};

function valid (obj, fn) {
	return !obj.isResolved() && !obj.isRejected() && typeof fn === "function";
}

/**
 * @class Promise
 * @private
 */
class Promise {
	constructor () {
		this.deferred = false;
		this.handlers = [];
		this.state = state.PENDING;
		this.value = null;
	}

	process () {
		let success, value;

		this.deferred = false;

		if (this.state !== state.PENDING) {
			value = this.value;
			success = this.state === state.SUCCESS;

			each(this.handlers.slice(), i => {
				let callback = i[success ? "success" : "failure"],
						child = i.promise,
						result;

				if (!callback || typeof callback !== "function") {
					if (value && typeof value.then === "function") {
						pipe(value, child);
					} else if (success) {
						child.resolve(value);
					} else {
						child.reject(value);
					}

					return;
				}

				if (!callback.ran) {
					try {
						result = callback(value);
						callback.ran = true;
						callback.result = result;
					} catch (e) {
						callback.ran = true;
						callback.result = e;
						child.reject(e);

						return;
					}
				} else {
					result = callback.result;
				}

				if (result && typeof result.then === "function") {
					pipe(result, child);
				} else if (!(result instanceof Error)) {
					child.resolve(result);
				} else {
					child.reject(result);
				}
			});
		}

		return this;
	}

	reject (arg) {
		if (this.state > state.PENDING) {
			return this;
		}

		this.value = arg;
		this.state = state.FAILURE;

		if (!this.deferred) {
			this.deferred = true;
			delay(() => {
				this.process();
			});
		}

		return this;
	}

	resolve (arg) {
		if (this.state > state.PENDING) {
			return this;
		}

		this.value = arg;
		this.state = state.SUCCESS;

		if (!this.deferred) {
			this.deferred = true;
			delay(() => {
				this.process();
			});
		}

		return this;
	}

	then (success, failure) {
		let child = new Promise();

		this.handlers.push({success: success, failure: failure, promise: child});

		if (this.state > state.PENDING && !this.deferred) {
			this.deferred = true;
			delay(() => {
				this.process();
			});
		}

		return child;
	}
}

/**
 * @class Deferred
 * @private
 */
class Deferred {
	constructor () {
		this.promise = promise();
		this.onDone = [];
		this.onAlways = [];
		this.onFail = [];
		this.bootstrap();
	}

	always (arg) {
		if (valid(this, arg)) {
			this.onAlways.push(arg);
		}

		return this;
	}

	bootstrap () {
		this.promise.then(arg => {
			delay(() => {
				each(["onDone", "onAlways"], array => {
					each(this[array], i => {
						i(arg);
					});
				});

				reset(this);
			});
		}, e => {
			delay(() => {
				each(["onFail", "onAlways"], array => {
					each(this[array], i => {
						i(e);
					});
				});

				reset(this);
			});
		});
	}

	done (arg) {
		if (valid(this, arg)) {
			this.onDone.push(arg);
		}

		return this;
	}

	fail (arg) {
		if (valid(this, arg)) {
			this.onFail.push(arg);
		}

		return this;
	}

	isRejected () {
		return this.promise.state === state.FAILURE;
	}

	isResolved () {
		return this.promise.state === state.SUCCESS;
	}

	reject (arg) {
		this.promise.reject(arg);

		return this;
	}

	resolve (arg) {
		this.promise.resolve(arg);

		return this;
	}

	state () {
		return this.promise.state;
	}

	then (success, failure) {
		return this.promise.then(success, failure);
	}
}

deferred = function () {
	return new Deferred();
};

deferred.when = function (...args) {
	var defer = deferred(),
		i = 0,
		nth;

	// Did we receive an Array? if so it overrides any other arguments
	if (args[0] instanceof Array) {
		args = args[0];
	}

	nth = args.length;

	if (nth === 0) {
		defer.resolve(null);
	} else {
		each(args, p => {
			p.then(() => {
				if (++i === nth && !defer.isResolved()) {
					if (args.length > 1) {
						defer.resolve(args.map(obj => {
							return obj.value || obj.promise.value;
						}));
					} else {
						defer.resolve(args[0].value || args[0].promise.value);
					}
				}
			}, function () {
				if (!defer.isResolved()) {
					if (args.length > 1) {
						defer.reject(args.map(obj => {
							return obj.value || obj.promise.value;
						}));
					} else {
						defer.reject(args[0].value || args[0].promise.value);
					}
				}
			});
		});
	}

	return defer;
};

promise = function () {
	return new Promise();
};


// Node, AMD & window supported
if (typeof exports !== "undefined") {
	module.exports = deferred;
} else if (typeof define === "function") {
	define(function () {
		return deferred;
	});
} else {
	global.assure = deferred;
}
}(typeof window !== "undefined" ? window : global));
