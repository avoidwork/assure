deferred = function () {
	return new Deferred();
};

deferred.when = function (...args) {
	var defer = deferred(),
		i = 0,
		nth;

	// Did we receive an Array? if so it overrides any other arguments
	if (args[0] instanceof Array) {
		args = args[0];
	}

	nth = args.length;

	if (nth === 0) {
		defer.resolve(null);
	} else {
		each(args, p => {
			p.then(() => {
				if (++i === nth && !defer.isResolved()) {
					if (args.length > 1) {
						defer.resolve(args.map(obj => {
							return obj.value || obj.promise.value;
						}));
					} else {
						defer.resolve(args[0].value || args[0].promise.value);
					}
				}
			}, function () {
				if (!defer.isResolved()) {
					if (args.length > 1) {
						defer.reject(args.map(obj => {
							return obj.value || obj.promise.value;
						}));
					} else {
						defer.reject(args[0].value || args[0].promise.value);
					}
				}
			});
		});
	}

	return defer;
};

promise = function () {
	return new Promise();
};
