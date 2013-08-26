// Inspired by http://swannodette.github.io/2013/08/23/make-no-promises/
var assure = require("./lib/assure"),
    first  = assure(),
    last   = first.promise,
    nth    = 100000,
    i      = -1, s;

while ( ++i < nth ) {
	last = last.then(function(val) {
		return val + 1;
	});
}

last.then (function ( val ) {
	var ms = new Date() - s;

	console.log( "Completed " + val + " in " + ms + "ms" );
	process.exit(0);
});

console.log( "Promises/A+ benchmark - resolving " + nth + " promises" );

s = new Date();
first.resolve(0);
