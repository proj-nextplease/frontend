import { getJobs } from './jobApi.js';

/**
 * Tiny in-memory cache so the jobs list can be prefetched (e.g. from the home
 * page) and read instantly on the Jobs page. Lives for the session; a fresh
 * page load starts empty.
 */

let cache = null;      // resolved raw jobs array
let inflight = null;   // in-flight fetch promise (dedupes concurrent calls)

const DEFAULT_PARAMS = { limit: 60 };

/** Start (or reuse) a background fetch. Safe to call repeatedly. */
export function prefetchJobs(params = DEFAULT_PARAMS) {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = getJobs(params)
    .then((data) => {
      cache = Array.isArray(data) ? data : [];
      inflight = null;
      return cache;
    })
    .catch((err) => {
      inflight = null; // allow a later retry
      throw err;
    });
  return inflight;
}

/** Synchronous peek — returns the cached raw jobs, or null if not loaded yet. */
export function getCachedJobs() {
  return cache;
}

/** Resolve with the jobs, using the cache / in-flight fetch when available. */
export function loadJobs(params = DEFAULT_PARAMS) {
  return cache ? Promise.resolve(cache) : prefetchJobs(params);
}
