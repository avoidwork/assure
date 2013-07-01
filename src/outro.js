
// Node, AMD & window supported
if ( typeof exports !== "undefined" ) {
	module.exports = promise.factory;
}
else if ( typeof define === "function" ) {
	define( function () {
		return promise.factory;
	});
}
else {
	global.assure = promise.factory;
}
})( this );
