/**
 * @class Deferred
 * @private
 */
class Deferred {
	constructor () {
		this.promise = promise();
		this.onDone = [];
		this.onAlways = [];
		this.onFail = [];
		this.bootstrap();
	}

	always (arg) {
		if (valid(this, arg)) {
			this.onAlways.push(arg);
		}

		return this;
	}

	bootstrap () {
		this.promise.then(arg => {
			delay(() => {
				each(["onDone", "onAlways"], array => {
					each(this[array], i => {
						i(arg);
					});
				});

				reset(this);
			});
		}, e => {
			delay(() => {
				each(["onFail", "onAlways"], array => {
					each(this[array], i => {
						i(e);
					});
				});

				reset(this);
			});
		});
	}

	done (arg) {
		if (valid(this, arg)) {
			this.onDone.push(arg);
		}

		return this;
	}

	fail (arg) {
		if (valid(this, arg)) {
			this.onFail.push(arg);
		}

		return this;
	}

	isRejected () {
		return this.promise.state === state.FAILURE;
	}

	isResolved () {
		return this.promise.state === state.SUCCESS;
	}

	reject (arg) {
		this.promise.reject(arg);

		return this;
	}

	resolve (arg) {
		this.promise.resolve(arg);

		return this;
	}

	state () {
		return this.promise.state;
	}

	then (success, failure) {
		return this.promise.then(success, failure);
	}
}
