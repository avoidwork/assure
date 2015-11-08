"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * assure
 *
 * @copyright 2015 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @link http://avoidwork.github.io/assure/
 * @version 1.1.0
 */
(function (global) {
	var deferred = undefined,
	    promise = undefined;

	var delay = (function () {
		if (typeof process !== "undefined") {
			return process.nextTick;
		} else if (typeof setImmediate !== "undefined") {
			return setImmediate;
		} else {
			return function (arg) {
				setTimeout(arg, 0);
			};
		}
	})();

	function each(obj, fn) {
		var nth = obj.length;
		var i = -1;

		while (++i < nth) {
			if (fn.call(obj, obj[i], i) === false) {
				break;
			}
		}

		return obj;
	}

	function pipe(parent, child) {
		return parent.then(function (arg) {
			child.resolve(arg);
		}, function (e) {
			child.reject(e);
		});
	}

	function reset(obj) {
		obj.onAlways = [];
		obj.onDone = [];
		obj.onFail = [];
	}

	var state = {
		PENDING: 0,
		FAILURE: 1,
		SUCCESS: 2
	};

	function valid(obj, fn) {
		return !obj.isResolved() && !obj.isRejected() && typeof fn === "function";
	}

	/**
  * @class Promise
  * @private
  */

	var Promise = (function () {
		function Promise() {
			_classCallCheck(this, Promise);

			this.deferred = false;
			this.handlers = [];
			this.state = state.PENDING;
			this.value = null;
		}

		_createClass(Promise, [{
			key: "process",
			value: function process() {
				var success = undefined,
				    value = undefined;

				this.deferred = false;

				if (this.state !== state.PENDING) {
					value = this.value;
					success = this.state === state.SUCCESS;

					each(this.handlers.slice(), function (i) {
						var callback = i[success ? "success" : "failure"],
						    child = i.promise,
						    result = undefined;

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

						try {
							result = callback(value);
						} catch (e) {
							child.reject(e);

							return;
						}

						if (result && typeof result.then === "function") {
							pipe(result, promise);
						} else {
							child.resolve(result);
						}
					});
				}

				return this;
			}
		}, {
			key: "reject",
			value: function reject(arg) {
				var _this = this;

				if (this.state > state.PENDING) {
					return this;
				}

				this.value = arg;
				this.state = state.FAILURE;

				if (!this.deferred) {
					this.deferred = true;
					delay(function () {
						_this.process();
					});
				}

				return this;
			}
		}, {
			key: "resolve",
			value: function resolve(arg) {
				var _this2 = this;

				if (this.state > state.PENDING) {
					return this;
				}

				this.value = arg;
				this.state = state.SUCCESS;

				if (!this.deferred) {
					this.deferred = true;
					delay(function () {
						_this2.process();
					});
				}

				return this;
			}
		}, {
			key: "then",
			value: function then(success, failure) {
				var _this3 = this;

				var child = new Promise();

				this.handlers.push({ success: success, failure: failure, promise: child });

				if (this.state > state.PENDING && !this.deferred) {
					this.deferred = true;
					delay(function () {
						_this3.process();
					});
				}

				return child;
			}
		}]);

		return Promise;
	})();

	/**
  * @class Deferred
  * @private
  */

	var Deferred = (function () {
		function Deferred() {
			_classCallCheck(this, Deferred);

			this.promise = promise();
			this.onDone = [];
			this.onAlways = [];
			this.onFail = [];
			this.bootstrap();
		}

		_createClass(Deferred, [{
			key: "always",
			value: function always(arg) {
				if (valid(this, arg)) {
					this.onAlways.push(arg);
				}

				return this;
			}
		}, {
			key: "bootstrap",
			value: function bootstrap() {
				var _this4 = this;

				this.promise.then(function (arg) {
					delay(function () {
						each(["onDone", "onAlways"], function (array) {
							each(_this4[array], function (i) {
								i(arg);
							});
						});

						reset(_this4);
					});
				}, function (e) {
					delay(function () {
						each(["onFail", "onAlways"], function (array) {
							each(_this4[array], function (i) {
								i(e);
							});
						});

						reset(_this4);
					});
				});
			}
		}, {
			key: "done",
			value: function done(arg) {
				if (valid(this, arg)) {
					this.onDone.push(arg);
				}

				return this;
			}
		}, {
			key: "fail",
			value: function fail(arg) {
				if (valid(this, arg)) {
					this.onFail.push(arg);
				}

				return this;
			}
		}, {
			key: "isRejected",
			value: function isRejected() {
				return this.promise.state === state.FAILURE;
			}
		}, {
			key: "isResolved",
			value: function isResolved() {
				return this.promise.state === state.SUCCESS;
			}
		}, {
			key: "reject",
			value: function reject(arg) {
				this.promise.reject(arg);

				return this;
			}
		}, {
			key: "resolve",
			value: function resolve(arg) {
				this.promise.resolve(arg);

				return this;
			}
		}, {
			key: "state",
			value: function state() {
				return this.promise.state;
			}
		}, {
			key: "then",
			value: function then(success, failure) {
				return this.promise.then(success, failure);
			}
		}]);

		return Deferred;
	})();

	deferred = function () {
		return new Deferred();
	};

	deferred.when = function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

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
			each(args, function (p) {
				p.then(function () {
					if (++i === nth && !defer.isResolved()) {
						if (args.length > 1) {
							defer.resolve(args.map(function (obj) {
								return obj.value || obj.promise.value;
							}));
						} else {
							defer.resolve(args[0].value || args[0].promise.value);
						}
					}
				}, function () {
					if (!defer.isResolved()) {
						if (args.length > 1) {
							defer.reject(args.map(function (obj) {
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
})(typeof window !== "undefined" ? window : global);
