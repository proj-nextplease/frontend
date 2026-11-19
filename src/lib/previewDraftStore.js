/**
 * Chuyển bản nháp portfolio sang tab "Xem trước".
 *
 * Tab xem trước là một tab mới nên không dùng chung bộ nhớ với trang sửa;
 * phải cất bản nháp vào trình duyệt rồi tab kia lấy ra. Trước đây cất vào
 * localStorage — chỉ ~5MB mỗi trang web, mà bản nháp chứa nguyên mọi ảnh
 * minh chứng / ảnh bìa / PDF dạng base64. Vài ảnh chụp điện thoại là đầy, và
 * người dùng nhận lỗi "Bản preview quá lớn".
 *
 * Giờ cất vào IndexedDB: hạn mức hàng trăm MB, và lưu thẳng object (không
 * phải JSON.stringify ra một chuỗi khổng lồ). Chỉ giữ MỘT bản nháp mới nhất.
 * Trình duyệt không có IndexedDB (hiếm) thì quay về localStorage như cũ.
 */

const DB_NAME = 'fonlio-portfolio-preview';
const STORE = 'drafts';
const LEGACY_PREFIX = 'nextplease:portfolio-preview:';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB không khả dụng'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Giao dịch IndexedDB bị huỷ'));
  });
}

function clearLegacy() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/** Cất bản nháp, xoá mọi bản cũ. Ném lỗi nếu không cất được ở đâu cả. */
export async function savePreviewDraft(id, payload) {
  // Bản cũ trong localStorage (từ phiên bản trước) chiếm hạn mức vô ích.
  clearLegacy();
  try {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      store.clear();
      store.put({ id, payload, createdAt: Date.now() });
      await done(tx);
      return;
    } finally {
      db.close();
    }
  } catch (err) {
    // Không có IndexedDB: thử localStorage — vẫn được với hồ sơ ít ảnh.
    try {
      localStorage.setItem(`${LEGACY_PREFIX}${id}`, JSON.stringify(payload));
    } catch {
      throw err;
    }
  }
}

/**
 * Lấy bản nháp theo id; không có id thì lấy bản mới nhất.
 * @returns {Promise<object|null>}
 */
export async function loadPreviewDraft(id) {
  try {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const rows = await new Promise((resolve, reject) => {
        const req = id ? store.get(id) : store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const row = id ? rows : (rows || []).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (row?.payload) return row.payload;
    } finally {
      db.close();
    }
  } catch {
    /* thử localStorage bên dưới */
  }
  try {
    if (id) {
      const raw = localStorage.getItem(`${LEGACY_PREFIX}${id}`);
      return raw ? JSON.parse(raw) : null;
    }
    let latestKey = null;
    let latest = 0;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_PREFIX)) {
        const t = parseInt(key.slice(LEGACY_PREFIX.length), 10) || 0;
        if (t > latest) { latest = t; latestKey = key; }
      }
    }
    const raw = latestKey ? localStorage.getItem(latestKey) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Cất bản nháp rồi mở tab xem trước.
 *
 * Cất XONG rồi mới mở: nếu mở trước, ở những trình duyệt mở link ngay trong
 * tab hiện tại (trình duyệt trong app Zalo / Facebook…), trang sửa bị thay
 * thế giữa chừng và việc cất bị huỷ. Cất vào IndexedDB chỉ mất vài trăm ms nên
 * thường vẫn còn trong "thời gian được phép mở popup" sau cú bấm; nếu trình
 * duyệt vẫn chặn, trả về `opened: false` để nơi gọi đưa link cho người dùng
 * tự bấm.
 *
 * @returns {Promise<{ opened: boolean, url: string }>} reject nếu không cất được
 */
export async function openPreviewTab(payload, theme) {
  const id = String(Date.now());
  await savePreviewDraft(id, payload);
  const url = `/portfolio/preview?draft=${id}&theme=${theme || ''}`;
  // Không dùng 'noopener': với nó window.open luôn trả null nên không biết
  // popup có bị chặn không. Thay vào đó cắt liên kết ngược ngay sau khi mở.
  const win = window.open(url, '_blank');
  if (win) {
    try {
      win.opener = null;
    } catch {
      /* ignore */
    }
  }
  return { opened: Boolean(win), url };
}
