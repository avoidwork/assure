/**
 * Iterates obj and executes fn
 *
 * Parameters for fn are 'value', 'index'
 *
 * @method each
 * @param  {Array}    obj Array to iterate
 * @param  {Function} fn  Function to execute on index values
 * @return {Array}        Array
 */
var each = function ( obj, fn ) {
	var nth = obj.length,
	    i;

	for ( i = 0; i < nth; i++ ) {
		if ( fn.call( obj, obj[i], i ) === false ) {
			break;
		}
	}

	return obj;
};
