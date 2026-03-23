class RateLimit {
	static #entries = new Map();

	static set(key, value, expirationMs) {
		if (!key || typeof key !== "string") {
			throw new Error("RateLimit key must be a non-empty string");
		}

		if (!Number.isFinite(expirationMs) || expirationMs <= 0) {
			throw new Error("RateLimit expiration must be a positive number in milliseconds");
		}

		const expiresAt = Date.now() + expirationMs;
		this.#entries.set(key, {
			value,
			expiresAt
		});

		return {
			key,
			value,
			expiresAt
		};
	}

	static isExpired(key, value) {
		const entry = this.#entries.get(key);
		if (!entry) {
			return true;
		}

		if (entry.value !== value) {
			return true;
		}

		const expired = Date.now() >= entry.expiresAt;
		if (expired) {
			this.#entries.delete(key);
		}

		return expired;
	}

	static get(key) {
		const entry = this.#entries.get(key);
		if (!entry) {
			return null;
		}

		if (Date.now() >= entry.expiresAt) {
			this.#entries.delete(key);
			return null;
		}

		return {
			key,
			value: entry.value,
			expiresAt: entry.expiresAt
		};
	}

	static clearExpired() {
		const now = Date.now();
		for (const [key, entry] of this.#entries.entries()) {
			if (now >= entry.expiresAt) {
				this.#entries.delete(key);
			}
		}
	}

	static delete(key) {
		return this.#entries.delete(key);
	}
}

export default RateLimit;
