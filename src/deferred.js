/**
 * Deferred factory
 *
 * @method factory
 * @return {Object} Deferred
 */
var deferred = function () {
	return new Deferred();
};

/**
 * Accepts Deferreds or Promises as arguments or an Array
 *
 * @method when
 * @return {Object} Deferred
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
				if ( ++i === nth && !defer.isResolved()) {
					if ( args.length > 1 ) {
						defer.resolve( args.map( function ( obj ) {
							return obj.value || obj.promise.value;
						}));
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
						}));
					}
					else {
						defer.reject( args[0].value || args[0].promise.value );
					}
				}
			});
		});
	}

	return defer;
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
			each( self.onDone, function ( i ) {
				i( arg );
			});

			each( self.onAlways, function ( i ) {
				i( arg );
			});

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		});
	}, function ( arg ) {
		delay( function () {
			each( self.onFail, function ( i ) {
				i( arg );
			});

			each( self.onAlways, function ( i ) {
				i( arg );
			});

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		});
	});
}

// Setting constructor loop
Deferred.prototype.constructor = Deferred;

/**
 * Registers a function to execute after Promise is reconciled
 *
 * @method always
 * @param  {Function} arg Function to execute
 * @return {Object}       Deferred
 */
Deferred.prototype.always = function ( arg ) {
	if ( typeof arg !== "function" ) {
		throw new Error( label.invalidArguments );
	}

	if ( this.isResolved() ) {
		throw new Error( label.promiseResolved.replace( "{{outcome}}", this.promise.outcome ) );
	}

	this.onAlways.push( arg );

	return this;
};

/**
 * Registers a function to execute after Promise is resolved
 *
 * @method done
 * @param  {Function} arg Function to execute
 * @return {Object}       Deferred
 */
Deferred.prototype.done = function ( arg ) {
	if ( typeof arg !== "function" ) {
		throw new Error( label.invalidArguments );
	}

	if ( this.isResolved() ) {
		throw new Error( label.promiseResolved.replace( "{{outcome}}", this.promise.outcome ) );
	}

	this.onDone.push( arg );

	return this;
};

/**
 * Registers a function to execute after Promise is rejected
 *
 * @method fail
 * @param  {Function} arg Function to execute
 * @return {Object}       Deferred
 */
Deferred.prototype.fail = function ( arg ) {
	if ( typeof arg !== "function" ) {
		throw new Error( label.invalidArguments );
	}

	if ( this.isRejected() ) {
		throw new Error( label.promiseResolved.replace( "{{outcome}}", this.promise.outcome ) );
	}

	this.onFail.push( arg );

	return this;
};

/**
 * Determines if Deferred is rejected
 *
 * @method isRejected
 * @return {Boolean} `true` if rejected
 */
Deferred.prototype.isRejected = function () {
	return ( this.promise.state === promise.state.FAILURE );
};

/**
 * Determines if Deferred is resolved
 *
 * @method isResolved
 * @return {Boolean} `true` if resolved
 */
Deferred.prototype.isResolved = function () {
	return ( this.promise.state === promise.state.SUCCESS );
};

/**
 * Rejects the Promise
 *
 * @method reject
 * @param  {Mixed} arg Rejection outcome
 * @return {Object}    Deferred
 */
Deferred.prototype.reject = function ( arg ) {
	this.promise.reject.call( this.promise, arg );

	return this;
};

/**
 * Resolves the Promise
 *
 * @method resolve
 * @param  {Mixed} arg Resolution outcome
 * @return {Object}    Deferred
 */
Deferred.prototype.resolve = function ( arg ) {
	this.promise.resolve.call( this.promise, arg );

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
