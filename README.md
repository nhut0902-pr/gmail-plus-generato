# Trình Tạo Email Nâng Cao (PWA Edition)

Một ứng dụng web tiến bộ (PWA) mạnh mẽ giúp bạn tạo ra hàng loạt các email "ảo" (alias) từ một địa chỉ Gmail gốc. Tất cả email gửi đến các địa chỉ ảo này đều sẽ được chuyển về hộp thư chính của bạn.

Công cụ này giờ đây có thể được "cài đặt" lên màn hình chính và hoạt động ngay cả khi không có kết nối mạng!

## 🚀 Demo Trực tiếp

[Bấm vào đây để xem demo trực tiếp](https://nhut0902-pr.github.io/gmail-plus-generato/)

*(Lưu ý: Thay thế liên kết này bằng URL của riêng bạn sau khi deploy.)*

## 🖼️ Ảnh chụp màn hình

**Cực kỳ quan trọng:** Hãy chụp lại màn hình giao diện mới của ứng dụng (bao gồm cả modal hướng dẫn hoặc modal QR) và cập nhật hình ảnh dưới đây!

![Giao diện mới của Trình Tạo Email](https://via.placeholder.com/600x400.png?text=Cập+nhật+ảnh+chụp+màn+hình+ở+đây)

## ✨ Tính năng Nổi bật

### Chức năng Cốt lõi
- **Tạo Email Ảo:** Tạo email với dấu `+` (`user+alias@`) hoặc dấu `.` (`user.alias@`).
- **Tùy chỉnh Linh hoạt:** Sử dụng tiền tố tùy chọn và lựa chọn hậu tố ngẫu nhiên (`shop_aB3xZ`).
- **Bao gồm Email Gốc:** Tùy chọn thêm cả địa chỉ email gốc vào danh sách kết quả.

### Trải nghiệm Người dùng Nâng cao
- **(MỚI) Chế độ PWA (Progressive Web App):**
    - **Cài đặt lên Màn hình chính:** Thêm ứng dụng vào desktop hoặc màn hình điện thoại để truy cập nhanh.
    - **Hoạt động Offline:** Các chức năng cốt lõi vẫn hoạt động ngay cả khi không có kết nối internet.
- **(MỚI) Lưu Cài đặt Người dùng:** Tự động lưu lại các lựa chọn (email, số lượng, tiền tố) của bạn cho lần truy cập sau.
- **(MỚI) Xác thực Form Thông minh:** Hiển thị lỗi trực tiếp, rõ ràng ngay bên dưới ô nhập liệu không hợp lệ.
- **(MỚI) Tích hợp Hướng dẫn:** Nút trợ giúp `(?)` giải thích chi tiết cách hoạt động của email alias cho người dùng mới.
- **Giao diện Sáng/Tối:** Tự động lưu lại chế độ hiển thị bạn đã chọn.
- **Xem trước Trực tiếp:** Hình dung kết quả ngay khi bạn đang nhập liệu.

### Tương tác với Kết quả
- **(MỚI) Danh sách Kết quả Tương tác:**
    - **Sao chép Từng Email:** Nút copy riêng cho mỗi email trong danh sách.
    - **Tạo Mã QR cho từng Email:** Hiển thị mã QR để bạn quét và sử dụng email trên điện thoại một cách dễ dàng.
- **Sao chép Tất cả & Xuất file .txt:** Các công cụ tiện ích để làm việc với toàn bộ danh sách.

## 🛠️ Công nghệ Sử dụng

- **HTML5:** Cấu trúc ngữ nghĩa và các thẻ meta cho PWA.
- **CSS3:** Thiết kế responsive, Chế độ Tối, và hiệu ứng cho các thành phần UI mới.
- **JavaScript (ES6+):** Xử lý toàn bộ logic ứng dụng, bao gồm:
    - Thao tác DOM.
    - `localStorage` để lưu cài đặt.
    - Tích hợp thư viện `qrcode.js` để tạo mã QR.
- **Progressive Web App (PWA):**
    - **Web App Manifest (`manifest.json`):** Định nghĩa cách ứng dụng xuất hiện và hoạt động khi được cài đặt.
    - **Service Workers (`sw.js`):** Cho phép ứng dụng hoạt động offline bằng cách lưu trữ cache tài nguyên.

## ⚙️ Cài đặt và Chạy tại local

1.  **Clone repository về máy:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    ```
2.  **Đi đến thư mục của dự án:**
    ```bash
    cd your-repo-name
    ```
3.  **Chạy một server local (QUAN TRỌNG):**
    Do dự án này sử dụng Service Worker (cho PWA), bạn **không thể** mở file `index.html` trực tiếp. Bạn cần chạy nó qua một server local.
    - **Nếu có Node.js:**
      ```bash
      # Cài đặt live-server nếu bạn chưa có
      npm install -g live-server
      # Chạy server
      live-server
      ```
    - **Nếu có Python:**
      ```bash
      # Python 3
      python -m http.server
      # Python 2
      python -m SimpleHTTPServer
      ```
    - **Sử dụng extension trên VS Code:** Tìm và cài đặt extension "Live Server", sau đó nhấn nút "Go Live".

4.  Mở trình duyệt và truy cập vào địa chỉ server local (thường là `http://127.0.0.1:8080` hoặc `http://127.0.0.1:5500`).

### Cài đặt như một ứng dụng (PWA)
Trên các trình duyệt hỗ trợ (Chrome, Edge, Safari trên mobile), bạn sẽ thấy một biểu tượng "cài đặt" trong thanh địa chỉ. Nhấp vào đó sẽ thêm ứng dụng vào màn hình chính/desktop của bạn để truy cập nhanh chóng.

## 📖 Cách Sử dụng

1.  **Nhập thông tin** vào các ô email, số lượng, tiền tố.
2.  **Sử dụng các tùy chọn nâng cao** nếu cần.
3.  Nhấn **"Tạo Email"**.
4.  Trong danh sách kết quả, bạn có thể:
    - Nhấn icon **Copy** <i class="fas fa-copy"></i> để sao chép một email.
    - Nhấn icon **QR Code** <i class="fas fa-qrcode"></i> để hiển thị mã QR và quét bằng điện thoại.
5.  Nhấn vào nút **"?"** ở góc trên để xem hướng dẫn chi tiết về email alias.

## 📝 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT.

## 💖 Lời cảm ơn

Phát triển bởi **Nhut0902pr**.
