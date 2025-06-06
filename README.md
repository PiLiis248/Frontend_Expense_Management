````markdown
## 🚀 Bắt đầu với nhánh `sub-branch`

Dự án này sử dụng nhánh `sub-branch` để phát triển thay vì nhánh mặc định `master`. Vui lòng làm theo các bước dưới đây để làm việc trên nhánh đúng.

---

### ✅ 1. Chuẩn bị thư mục và clone repository

(Bạn có thể) tạo một thư mục trống trên máy để chứa dự án. Sau đó mở Git Bash hoặc terminal trong thư mục đó.

Nếu bạn chưa clone repo, hãy chạy:

```bash
git clone https://github.com/Piliis248/Frontend_Expense_Management.git
cd Frontend_Expense_Management
````

---

### ✅ 2. Chuyển sang nhánh `sub-branch`

Để chuyển sang nhánh phát triển, chạy:

```bash
git fetch origin
git checkout sub-branch
```

Xác nhận bạn đang ở đúng nhánh bằng lệnh:

```bash
git branch
```

Bạn sẽ thấy dấu hoa thị (\*) bên cạnh `sub-branch` như sau:

```
  master
* sub-branch
```

---

### ✅ 3. Bắt đầu làm việc

Bạn có thể làm việc như bình thường:

* Lấy code mới nhất:

  ```bash
  git pull
  ```

* Thêm và commit thay đổi:

  ```bash
  git add .
  git commit -m "Nội dung commit của bạn"
  ```

* Đẩy thay đổi lên nhánh `sub-branch`:

  ```bash
  git push
  ```

---

### 📌 Lưu ý

* Hãy đảm bảo mọi thay đổi của bạn đều được đẩy lên nhánh `sub-branch`.
* Khi tạo Pull Request (PR), hãy chắc chắn chọn nhánh đích là `sub-branch`, **không phải** `master`.
* Bạn có thể kiểm tra nhánh hiện tại bất kỳ lúc nào bằng lệnh:

  ```bash
  git branch
  ```
