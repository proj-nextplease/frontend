import { getJobs } from './jobApi.js';
import { searchQuests } from './questApi.js';

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

/* ── Cơ hội = tin tuyển dụng + quest ──────────────────────────────────────
   Trang /jobs tự giới thiệu là nơi xem "cơ hội việc làm & CLB" và có sẵn tab
   "CLB & Đoàn hội", nhưng trước giờ chỉ gọi GET /jobs. Quest nằm ở bảng riêng
   và endpoint riêng (GET /quests), nên tab CLB luôn trống trừ khi có doanh
   nghiệp nào đó tình cờ mang companyType = 'CLUB'.

   Tách khỏi loadJobs() chứ không sửa thẳng vào đó: trang chủ và phần "tin
   tương tự" ở trang chi tiết đọc trực tiếp các trường của job (jobType,
   compensation…), trộn quest vào sẽ làm hỏng chúng.

   Mỗi phần tử được gắn __kind để nơi dùng biết đường điều hướng: tin tuyển
   dụng đi /jobs/:id, quest đi /quests/:id. */
let oppCache = null;
let oppInflight = null;

export function loadOpportunities(params = DEFAULT_PARAMS) {
  if (oppCache) return Promise.resolve(oppCache);
  if (oppInflight) return oppInflight;

  /* allSettled chứ không all: một endpoint hỏng thì vẫn hiện được phần còn
     lại. Trang trống hoàn toàn vì quest lỗi là cái giá quá đắt. */
  /* searchQuests() không nhận limit — GET /quests trả toàn bộ quest đang OPEN.
     Số quest hiện còn ít nên chấp nhận được; khi nào nhiều thì phải thêm phân
     trang phía server cho chính endpoint đó. */
  oppInflight = Promise.allSettled([getJobs(params), searchQuests()])
    .then(([jobsRes, questsRes]) => {
      const jobs = jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value) ? jobsRes.value : [];
      const quests = questsRes.status === 'fulfilled' && Array.isArray(questsRes.value) ? questsRes.value : [];

      if (jobsRes.status === 'rejected' && questsRes.status === 'rejected') {
        oppInflight = null;
        throw jobsRes.reason;
      }

      oppCache = [
        ...jobs.map((j) => ({ ...j, __kind: 'JOB' })),
        ...quests.map((q) => ({ ...q, __kind: 'QUEST' })),
      ];
      oppInflight = null;
      return oppCache;
    })
    .catch((err) => {
      oppInflight = null;
      throw err;
    });
  return oppInflight;
}

export function getCachedOpportunities() {
  return oppCache;
}
