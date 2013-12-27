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
