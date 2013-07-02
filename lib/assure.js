/**
 * assure
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2013 Jason Mulligan
 * @license BSD-3 <https://raw.github.com/avoidwork/assure/master/LICENSE>
 * @link http://avoidwork.github.io/assure/
 * @module assure
 * @version 0.0.4
 */
(function ( global ) {

/**
 * Deferreds
 *
 * @class deferred
 */
var deferred = {
	/**
	 * Deferred factory
	 *
	 * @method factory
	 * @return {Object} Deferred
	 */
	factory : function () {
		return new Deferred();
	},

	// Inherited by deferreds
	methods : {
		/**
		 * Registers a function to execute after Promise is reconciled
		 *
		 * @method always
		 * @param  {Function} arg Function to execute
		 * @return {Object}       Deferred
		 */
		always : function ( arg ) {
			if ( typeof arg !== "function" ) {
				throw new Error( label.invalidArguments );
			}

			if ( this.promise.resolved() ) {
				throw new Error( label.promiseResolved.replace( "{{outcome}}", this.promise.outcome ) );
			}

			this.onAlways.push( arg );

			return this;
		},

		/**
		 * Registers a function to execute after Promise is resolved
		 *
		 * @method done
		 * @param  {Function} arg Function to execute
		 * @return {Object}       Deferred
		 */
		done : function ( arg ) {
			if ( typeof arg !== "function" ) {
				throw new Error( label.invalidArguments );
			}

			if ( this.promise.resolved() ) {
				throw new Error( label.promiseResolved.replace( "{{outcome}}", this.promise.outcome ) );
			}

			this.onDone.push( arg );

			return this;
		},

		/**
		 * Registers a function to execute after Promise is rejected
		 *
		 * @method fail
		 * @param  {Function} arg Function to execute
		 * @return {Object}       Deferred
		 */
		fail : function ( arg ) {
			if ( typeof arg !== "function" ) {
				throw new Error( label.invalidArguments );
			}

			if ( this.promise.resolved() ) {
				throw new Error( label.promiseResolved.replace( "{{outcome}}", this.promise.outcome ) );
			}

			this.onFail.push( arg );

			return this;
		},

		/**
		 * Determines if Deferred is rejected
		 *
		 * @method isRejected
		 * @return {Boolean} `true` if rejected
		 */
		isRejected : function () {
			return ( this.promise.state === promise.state.broken );
		},

		/**
		 * Determines if Deferred is resolved
		 *
		 * @method isResolved
		 * @return {Boolean} `true` if resolved
		 */
		isResolved : function () {
			return ( this.promise.state === promise.state.resolved );
		},

		/**
		 * Rejects the Promise
		 *
		 * @method reject
		 * @param  {Mixed} arg Rejection outcome
		 * @return {Object}    Deferred
		 */
		reject : function ( arg ) {
			this.promise.reject.call( this.promise, arg );

			return this;
		},

		/**
		 * Resolves the Promise
		 *
		 * @method resolve
		 * @param  {Mixed} arg Resolution outcome
		 * @return {Object}    Deferred
		 */
		resolve : function ( arg ) {
			this.promise.resolve.call( this.promise, arg );

			return this;
		},

		/**
		 * Gets the state of the Promise
		 *
		 * @method state
		 * @return {String} Describes the state
		 */
		state : function () {
			return this.promise.state;
		},

		/**
		 * Registers handler(s) for the Promise
		 *
		 * @method then
		 * @param  {Function} success Executed when/if promise is resolved
		 * @param  {Function} failure [Optional] Executed when/if promise is broken
		 * @return {Object}           New Promise instance
		 */
		then : function ( success, failure ) {
			return this.promise.then( success, failure );
		}
	}
};


/**
 * Deferred factory
 *
 * @class Deferred
 * @namespace abaaso
 * @return {Object} Instance of Deferred
 */
function Deferred () {
	var self      = this;

	this.promise  = promise.factory();
	this.onDone   = [];
	this.onAlways = [];
	this.onFail   = [];

	// Setting handlers to execute Arrays of Functions
	this.promise.then( function ( arg ) {
		delay( function () {
			self.onDone.forEach( function ( i ) {
				i( arg );
			});

			self.onAlways.forEach( function ( i ) {
				i( arg );
			});

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		});
	}, function ( arg ) {
		delay( function () {
			self.onFail.forEach( function ( i ) {
				i( arg );
			});

			self.onAlways.forEach( function ( i ) {
				i( arg );
			});

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		});
	});
}

// Setting prototype & constructor loop
Deferred.prototype = deferred.methods;
Deferred.prototype.constructor = Deferred;

/**
 * Strategy for detemining async method
 *
 * @return {Function} Async method
 */
var delay = ( function () {
	if ( typeof setImmediate !== "undefined" ) {
		return setImmediate;
	}
	else if ( typeof process !== "undefined" ) {
		return process.nextTick;
	}
	else {
		return function ( arg ) {
			setTimeout( arg, 0 );
		};
	}
})();

var label = {
	invalidArguments : "Invalid arguments",
	promiseResolved  : "The promise has been resolved: {{outcome}}"
};

/**
 * Promises/A+ implementation
 *
 * @class promise
 */
var promise = {
	/**
	 * Promise factory
	 *
	 * @method factory
	 * @return {Object} Instance of promise
	 */
	factory : function () {
		return new Promise();
	},

	// Caching if this function is available
	freeze : (function () {
		return ( typeof Object.freeze === "function" );
	})(),

	// Inherited by promises
	methods : {
		/**
		 * Breaks a Promise
		 *
		 * @method reject
		 * @param  {Mixed} arg Promise outcome
		 * @return {Object} Promise
		 */
		reject : function ( arg ) {
			var self = this;

			delay( function () {
				promise.resolve.call( self, promise.state.broken, arg );
			});

			return this;
		},

		/**
		 * Promise is resolved
		 *
		 * @method resolve
		 * @param  {Mixed} arg Promise outcome
		 * @return {Object}    Promise
		 */
		resolve : function ( arg ) {
			var self = this;

			delay( function () {
				promise.resolve.call( self, promise.state.resolved, arg );
			});

			return this;
		},

		/**
		 * Returns a boolean indicating state of the Promise
		 *
		 * @method resolved
		 * @return {Boolean} `true` if resolved
		 */
		resolved : function () {
			return ( this.state === promise.state.broken || this.state === promise.state.resolved );
		},

		/**
		 * Registers handler(s) for a Promise
		 *
		 * @method then
		 * @param  {Function} success Executed when/if promise is resolved
		 * @param  {Function} failure [Optional] Executed when/if promise is broken
		 * @return {Object}           New Promise instance
		 */
		then : function ( success, failure ) {
			var self     = this,
			    deferred = promise.factory(),
			    fn;

			fn = function ( yay ) {
				var handler = yay ? success : failure,
				    error   = yay ? false   : true,
				    result;

				try {
					result = handler.call( undefined, self.outcome );
					error  = false;
				}
				catch ( e ) {
					result = e;
					error  = true;

					if ( result !== undefined && !( result instanceof Error ) ) {
						// Encoding Array or Object as a JSON string for transmission
						if ( typeof result === "object" ) {
							result = JSON.stringify( result );
						}

						// Casting to an Error to fix context
						result = new Error( result );
					}
				}
				finally {
					// Not a Promise, passing result & chaining if applicable
					if ( !( result instanceof Promise ) ) {
						// This is clearly a mistake on the dev's part
						if ( error && result === undefined ) {
							throw new Error( label.invalidArguments );
						}
						else {
							deferred[!error ? "resolve" : "reject"]( result || self.outcome );
						}
					}
					// Assuming a `pending` state until `result` is resolved
					else {
						self.state        = promise.state.pending;
						self.outcome      = null;
						result.parentNode = self;
						result.then( function ( arg ) {
							self.childNodes.forEach( function ( i ) {
								i.resolve( arg );
							});
						}, function ( e ) {
							self.childNodes.forEach( function ( i ) {
								i.reject( e );
							});
						});
					}

					return result;
				}
			};

			if ( typeof success === "function" ) {
				promise.vouch.call( self, promise.state.resolved, function () {
					return fn( true );
				});
			}

			if ( typeof failure === "function" ) {
				promise.vouch.call( self, promise.state.broken, function () {
					return fn( false );
				});
			}

			// Setting references
			deferred.parentNode = self;
			self.childNodes.push( deferred );

			return deferred;
		}
	},

	/**
	 * Resolves a Promise (fulfilled or failed)
	 *
	 * @method resolve
	 * @param  {String} state State to resolve
	 * @param  {String} val   Value to set
	 * @return {Object}       Promise instance
	 */
	resolve : function ( state, val ) {
		var handler = state === promise.state.broken ? "error" : "fulfill",
		    self    = this,
		    pending = false,
		    error   = false,
		    purge   = [],
		    i, reason, result;

		if ( this.state !== promise.state.pending ) {
			// Walking "forward" from a reverse chain or a fork, we've already been here...
			if ( ( this.parentNode !== null && this.parentNode.state === promise.state.resolved ) || this.childNodes.length > 0 ) {
				return;
			}
			else {
				throw new Error( label.promiseResolved.replace( "{{outcome}}", this.outcome ) );
			}
		}

		this.state   = state;
		this.outcome = val;

		// The state & outcome can mutate here
		this[handler].forEach( function ( fn, idx ) {
			result = fn.call( self, val );
			purge.push( idx );

			if ( result instanceof Promise ) {
				pending      = true;
				self.outcome = null;
				self.state   = promise.state.pending;

				return false;
			}
			else if ( result instanceof Error ) {
				error  = true;
				reason = result;
				state  = promise.state.broken;
			}
		});

		if ( !pending ) {
			this.error   = [];
			this.fulfill = [];

			// Possible jump to 'resolve' logic
			if ( !error ) {
				result = reason;
				state  = promise.state.resolved;
			}

			// Reverse chaining
			if ( this.parentNode !== null && this.parentNode.state === promise.state.pending ) {
				this.parentNode[state === promise.state.resolved ? "resolve" : "reject"]( result || this.outcome );
			}

			// Freezing promise
			if ( promise.freeze ) {
				Object.freeze( this );
			}

			return this;
		}
		else {
			// Removing handlers that have run
			i = purge.length;
			while ( i-- ) {
				self[handler].splice( i, 1 );
			}

			return result;
		}
	},

	// States of a promise
	state : {
		broken   : "rejected",
		pending  : "pending",
		resolved : "fulfilled"
	},

	/**
	 * Vouches for a state
	 *
	 * @method vouch
	 * @param  {String}   state Promise descriptor
	 * @param  {Function} fn    Function to execute
	 * @return {Object}         Promise instance
	 */
	vouch : function ( state, fn ) {
		if ( state === "" ) {
			throw new Error( label.invalidArguments );
		}

		if ( this.state === promise.state.pending ) {
			this[state === promise.state.resolved ? "fulfill" : "error"].push( fn );
		}
		else if ( this.state === state ) {
			fn( this.outcome );
		}

		return this;
	}
};

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


// Node, AMD & window supported
if ( typeof exports !== "undefined" ) {
	module.exports = deferred.factory;
}
else if ( typeof define === "function" ) {
	define( function () {
		return deferred.factory;
	});
}
else {
	global.assure = deferred.factory;
}
})( this );
