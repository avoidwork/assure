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
