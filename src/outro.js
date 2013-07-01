
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
