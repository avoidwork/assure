var assure             = require( "../lib/assure.js" ),
    promisesAplusTests = require( "promises-aplus-tests" ),
    adapter            = {};

adapter.resolved = function ( value ) {
	var promise = assure().promise;

	promise.resolve( value );

	return promise;
};

adapter.rejected = function ( error ) {
	var promise = assure().promise;

	promise.reject( error );

	return promise;
};

adapter.deferred = function () {
	var promise = assure().promise;

	return {
		promise : promise,
		resolve : promise.resolve.bind( promise ),
		reject  : promise.reject.bind( promise )
	};
};

promisesAplusTests( adapter, function ( err ) {
    // All done; output is in the console. Or check `err` for number of failures.
} );
