import { createContext, useContext, useEffect } from 'react';

const THEME_STORAGE_KEY = 'nextplease:theme';

/**
 * nextplease chỉ có MỘT bộ màu.
 *
 * Trước đây có công tắc sáng/tối (nút tròn nổi ở góc + nút trong Header cũ).
 * Bộ giao diện mới đã tự là nền tối rồi — các trang marketing lẫn khu vực ứng
 * viên đều dựng trên cùng một mặt phẳng #0b0f0e. Giữ thêm một lớp dark mode
 * chồng lên đó chỉ tạo ra bộ màu thứ hai lệch với thiết kế, tuỳ vào việc người
 * dùng đã bấm công tắc hay chưa — tức là hai trang chủ khác nhau cho hai người.
 *
 * Nên theme bị ghim cứng ở 'light' (nhánh CSS mặc định, cũng chính là nhánh mà
 * toàn bộ thiết kế mới được dựng và kiểm tra trên đó). Provider giờ chỉ còn một
 * việc: đóng đinh data-theme trên <html> và dọn lựa chọn cũ trong localStorage.
 *
 * Hiện KHÔNG còn chỗ nào gọi useTheme(); nó ở lại làm chỗ bám nếu sau này có
 * component cũ cần. Muốn dọn nốt: xoá các khối [data-theme='dark'] còn lại
 * trong index.css rồi xoá hẳn file này.
 */

const THEME = 'light';

const ThemeContext = createContext({ theme: THEME, isDark: false, setTheme: () => {}, toggleTheme: () => {} });

const VALUE = { theme: THEME, isDark: false, setTheme: () => {}, toggleTheme: () => {} };

export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.dataset.theme = THEME;
    document.documentElement.style.colorScheme = THEME;
    // Dọn lựa chọn cũ: ai từng bật dark mode thì key này vẫn nằm trong
    // localStorage, và nếu sau này có code nào đọc lại nó thì bộ màu thứ hai
    // sẽ sống lại.
    try {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      /* Safari chế độ riêng tư chặn localStorage — bỏ qua, không ảnh hưởng gì. */
    }
  }, []);

  return <ThemeContext.Provider value={VALUE}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}
