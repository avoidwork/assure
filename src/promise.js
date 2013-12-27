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
