const delay = (function () {
	if (typeof process !== "undefined") {
		return process.nextTick;
	} else if (typeof setImmediate !== "undefined") {
		return setImmediate;
	} else {
		return function (arg) {
			setTimeout(arg, 0);
		};
	}
}());

function each (obj, fn) {
	const nth = obj.length;
	let i = -1;

	while (++i < nth) {
		if (fn.call(obj, obj[i], i) === false) {
			break;
		}
	}

	return obj;
}

function pipe (parent, child) {
	const isPromise = typeof child.resolve === "function";

	return parent.then(function (arg) {
		child.resolve(arg);
	}, function (e) {
		child.reject(e);
	});
}

function reset (obj) {
	obj.onAlways = [];
	obj.onDone = [];
	obj.onFail = [];
}

const state = {
	PENDING: 0,
	FAILURE: 1,
	SUCCESS: 2
};

function valid (obj, fn) {
	return !obj.isResolved() && !obj.isRejected() && typeof fn === "function";
}
