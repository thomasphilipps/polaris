/**
 * Dev-only dice cheat: queues forced 1d20 results (for testing specific
 * outcomes — success, critical, failure, critical failure — without rolling
 * dozens of times to hit the case you're after). Consumed one value at a
 * time, FIFO, by rollD20() in roll-resolver.mjs.
 *
 * The public API (forceNextD20/clearForcedRolls) is only exposed to the
 * console in non-production builds — see polaris.mjs. Once
 * process.env.NODE_ENV is inlined as "production" by rollup-plugin-replace,
 * terser eliminates that dead branch (and the now-unreachable exposure)
 * entirely from the production bundle.
 */
const queue = [];

/**
 * Queues one or more forced results for the next 1d20 roll(s), in order.
 * @param {...number} values
 */
export function forceNextD20(...values) {
  queue.push(...values);
}

/** Clears any pending forced results. */
export function clearForcedRolls() {
  queue.length = 0;
}

/**
 * Consumes the next queued forced value, if any.
 * @returns {number|null}
 */
export function consumeForcedD20() {
  return queue.length ? queue.shift() : null;
}
