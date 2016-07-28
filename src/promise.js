/**
 * @class Promise
 * @private
 */
class Promise {
	constructor () {
		this.deferred = false;
		this.handlers = [];
		this.state = state.PENDING;
		this.value = null;
	}

	process () {
		let success, value;

		this.deferred = false;

		if (this.state !== state.PENDING) {
			value = this.value;
			success = this.state === state.SUCCESS;

			each(this.handlers.slice(), i => {
				let callback = i[success ? "success" : "failure"],
						child = i.promise,
						result;

				if (!callback || typeof callback !== "function") {
					if (value && typeof value.then === "function") {
						pipe(value, child);
					} else if (success) {
						child.resolve(value);
					} else {
						child.reject(value);
					}

					return;
				}

				if (!callback.ran) {
					try {
						result = callback(value);
						callback.ran = true;
						callback.result = result;
					} catch (e) {
						callback.ran = true;
						callback.result = e;
						child.reject(e);

						return;
					}
				} else {
					result = callback.result;
				}

				if (result && typeof result.then === "function") {
					pipe(result, child);
				} else if (!(result instanceof Error)) {
					child.resolve(result);
				} else {
					child.reject(result);
				}
			});
		}

		return this;
	}

	reject (arg) {
		if (this.state > state.PENDING) {
			return this;
		}

		this.value = arg;
		this.state = state.FAILURE;

		if (!this.deferred) {
			this.deferred = true;
			delay(() => {
				this.process();
			});
		}

		return this;
	}

	resolve (arg) {
		if (this.state > state.PENDING) {
			return this;
		}

		this.value = arg;
		this.state = state.SUCCESS;

		if (!this.deferred) {
			this.deferred = true;
			delay(() => {
				this.process();
			});
		}

		return this;
	}

	then (success, failure) {
		let child = new Promise();

		this.handlers.push({success: success, failure: failure, promise: child});

		if (this.state > state.PENDING && !this.deferred) {
			this.deferred = true;
			delay(() => {
				this.process();
			});
		}

		return child;
	}
}
