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
	return ( this.state === state.FAILURE );
};

/**
 * Determines if Deferred is resolved
 *
 * @method isResolved
 * @return {Boolean} `true` if resolved
 */
Deferred.prototype.isResolved = function () {
	return ( this.state === state.SUCCESS );
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
	return this.state;
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
