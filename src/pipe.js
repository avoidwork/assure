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
