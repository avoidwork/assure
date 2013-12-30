/**
 * assure
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2013 Jason Mulligan
 * @license BSD-3 <https://raw.github.com/avoidwork/assure/master/LICENSE>
 * @link http://avoidwork.github.io/assure/
 * @module assure
 * @version 1.0.4
 */
( function ( global ) {
"use strict";

/**
 * Deferred factory
 *
 * @method deferred
 * @return {Object} Deferred instance
 */
function deferred () {
	return new Deferred();
}

/**
 * Accepts Deferreds or Promises as arguments or an Array
 *
 * @method when
 * @return {Object} Deferred instance
 */
deferred.when = function () {
	var i     = 0,
	    defer = deferred(),
	    args  = [].slice.call( arguments ),
	    nth;

	// Did we receive an Array? if so it overrides any other arguments
	if ( args[0] instanceof Array ) {
		args = args[0];
	}

	// How many instances to observe?
	nth = args.length;

	// None, end on next tick
	if ( nth === 0 ) {
		defer.resolve( null );
	}
	// Setup and wait
	else {
		each( args, function ( p ) {
			p.then( function () {
				if ( ++i === nth && !defer.isResolved() ) {
					if ( args.length > 1 ) {
						defer.resolve( args.map( function ( obj ) {
							return obj.value || obj.promise.value;
						} ) );
					}
					else {
						defer.resolve( args[0].value || args[0].promise.value );
					}
				}
			}, function () {
				if ( !defer.isResolved() ) {
					if ( args.length > 1 ) {
						defer.reject( args.map( function ( obj ) {
							return obj.value || obj.promise.value;
						} ) );
					}
					else {
						defer.reject( args[0].value || args[0].promise.value );
					}
				}
			} );
		} );
	}

	return defer;
};

/**
 * Deferred factory
 *
 * @method Deferred
 * @constructor
 * @private
 */
function Deferred () {
	var self      = this;

	this.promise  = promise();
	this.onDone   = [];
	this.onAlways = [];
	this.onFail   = [];

	// Setting handlers to execute Arrays of Functions
	this.promise.then( function ( arg ) {
		delay( function () {
			each( self.onDone, function ( i ) {
				i( arg );
			} );

			each( self.onAlways, function ( i ) {
				i( arg );
			} );

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		} );
	}, function ( arg ) {
		delay( function () {
			each( self.onFail, function ( i ) {
				i( arg );
			} );

			each( self.onAlways, function ( i ) {
				i( arg );
			} );

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		} );
	} );
}

// Setting constructor loop
Deferred.prototype.constructor = Deferred;

/**
 * Registers a function to execute after Promise is reconciled
 *
 * @method always
 * @param  {Function} arg Function to execute
 * @return {Object}       Deferred instance
 */
Deferred.prototype.always = function ( arg ) {
	if ( !this.isResolved() && !this.isRejected() && typeof arg == "function" ) {
		this.onAlways.push( arg );
	}

	return this;
};

/**
 * Registers a function to execute after Promise is resolved
 *
 * @method done
 * @param  {Function} arg Function to execute
 * @return {Object}       Deferred instance
 */
Deferred.prototype.done = function ( arg ) {
	if ( !this.isResolved() && !this.isRejected() && typeof arg == "function" ) {
		this.onDone.push( arg );
	}

	return this;
};

/**
 * Registers a function to execute after Promise is rejected
 *
 * @method fail
 * @param  {Function} arg Function to execute
 * @return {Object}       Deferred instance
 */
Deferred.prototype.fail = function ( arg ) {
	if ( !this.isResolved() && !this.isRejected() && typeof arg == "function" ) {
		this.onFail.push( arg );
	}

	return this;
};

/**
 * Determines if Deferred is rejected
 *
 * @method isRejected
 * @return {Boolean} `true` if rejected
 */
Deferred.prototype.isRejected = function () {
	return ( this.promise.state === state.FAILURE );
};

/**
 * Determines if Deferred is resolved
 *
 * @method isResolved
 * @return {Boolean} `true` if resolved
 */
Deferred.prototype.isResolved = function () {
	return ( this.promise.state === state.SUCCESS );
};

/**
 * Rejects the Promise
 *
 * @method reject
 * @param  {Mixed} arg Rejection outcome
 * @return {Object}    Deferred instance
 */
Deferred.prototype.reject = function ( arg ) {
	this.promise.reject( arg );

	return this;
};

/**
 * Resolves the Promise
 *
 * @method resolve
 * @param  {Mixed} arg Resolution outcome
 * @return {Object}    Deferred instance
 */
Deferred.prototype.resolve = function ( arg ) {
	this.promise.resolve( arg );

	return this;
};

/**
 * Gets the state of the Promise
 *
 * @method state
 * @return {Number} Describes the state
 */
Deferred.prototype.state = function () {
	return this.promise.state;
};

/**
 * Registers handler(s) for the Promise
 *
 * @method then
 * @param  {Function} success Executed when/if promise is resolved
 * @param  {Function} failure [Optional] Executed when/if promise is broken
 * @return {Object}           New Promise instance
 */
Deferred.prototype.then = function ( success, failure ) {
	return this.promise.then( success, failure );
};

/**
 * Strategy for detemining async method
 *
 * @type {Function}
 * @private
 * @return {Function} Async method
 */
var delay = function () {
	if ( typeof setImmediate != "undefined" ) {
		return setImmediate;
	}
	else if ( typeof process != "undefined" ) {
		return process.nextTick;
	}
	else {
		return function ( arg ) {
			setTimeout( arg, 0 );
		};
	}
}();

/**
 * Iterates obj and executes fn
 *
 * Parameters for fn are 'value', 'index'
 *
 * @method each
 * @private
 * @param  {Array}    obj Array to iterate
 * @param  {Function} fn  Function to execute on index values
 * @return {Array}        Array
 */
function each ( obj, fn ) {
	var nth = obj.length,
	    i   = -1;

	while ( ++i < nth ) {
		if ( fn.call( obj, obj[i], i ) === false ) {
			break;
		}
	}

	return obj;
}

/**
 * Pipes a reconciliation from `parent` to `child`
 *
 * @method pipe
 * @private
 * @param  {Object} parent Promise
 * @param  {Object} child  Promise
 * @return {Undefined}     undefined
 */
function pipe ( parent, child ) {
	parent.then( function ( arg ) {
		child.resolve( arg );
	}, function ( e ) {
		child.reject( e );
	} );
}

/**
 * Promise factor
 *
 * @method promise
 * @private
 * @return {Object} Promise instance
 */
function promise () {
	return new Promise();
}

/**
 * Promise
 *
 * @method Promise
 * @private
 * @constructor
 */
function Promise () {
	this.deferred = false;
	this.handlers = [];
	this.state    = state.PENDING;
	this.value    = null;
}

// Setting constructor loop
Promise.prototype.constructor = Promise;

/**
 * Processes `handlers` queue
 *
 * @method process
 * @return {Object} Promise instance
 */
Promise.prototype.process = function() {
	var success, value;

	this.deferred = false;

	if ( this.state === state.PENDING ) {
		return this;
	}

	value   = this.value;
	success = this.state === state.SUCCESS;

	each( this.handlers.slice(), function ( i ) {
		var callback = i[success ? "success" : "failure" ],
		    child    = i.promise,
		    result;

		if ( !callback || typeof callback != "function" ) {
			if ( value && typeof value.then == "function" ) {
				pipe( value, child );
			}
			else {
				if ( success ) {
					child.resolve( value );
				} else {
					child.reject( value );
				}
			}

			return;
		}

		try {
			result = callback( value );
		}
		catch ( e ) {
			child.reject( e );

			return;
		}

		if ( result && typeof result.then == "function" ) {
			pipe( result, promise );
		}
		else {
			child.resolve( result );
		}
	} );

	return this;
};

/**
 * Breaks a Promise
 *
 * @method reject
 * @param  {Mixed} arg Promise value
 * @return {Object}    Promise instance
 */
Promise.prototype.reject = function ( arg ) {
	var self = this;

	if ( this.state > state.PENDING ) {
		return this;
	}

	this.value = arg;
	this.state = state.FAILURE;

	if ( !this.deferred ) {
		delay( function () {
			self.process();
		} );

		this.deferred = true;
	}

	return this;
};

/**
 * Resolves a Promise
 *
 * @method resolve
 * @param  {Mixed} arg Promise value
 * @return {Object}    Promise instance
 */
Promise.prototype.resolve = function ( arg ) {
	var self = this;

	if ( this.state > state.PENDING ) {
		return this;
	}

	this.value = arg;
	this.state = state.SUCCESS;

	if ( !this.deferred ) {
		delay( function () {
			self.process();
		} );

		this.deferred = true;
	}

	return this;
};

/**
 * Registers handler(s) for a Promise
 *
 * @method then
 * @param  {Function} success [Optional] Success handler for eventual value
 * @param  {Function} failure [Optional] Failure handler for eventual value
 * @return {Object}           New Promise instance
 */
Promise.prototype.then = function ( success, failure ) {
	var self  = this,
	    child = new Promise();

	this.handlers.push( {
		success : success,
		failure : failure,
		promise : child
	} );

	if ( this.state > state.PENDING && !this.deferred ) {
		delay( function () {
			self.process();
		} );

		this.deferred = true;
	}

	return child;
};

/**
 * States of a Promise
 *
 * @private
 * @type {Object}
 */
var state = {
	PENDING : 0,
	FAILURE : 1,
	SUCCESS : 2
};


// Node, AMD & window supported
if ( typeof exports != "undefined" ) {
	module.exports = deferred;
}
else if ( typeof define == "function" ) {
	define( function () {
		return deferred;
	} );
}
else {
	global.assure = deferred;
}
} )( this );
