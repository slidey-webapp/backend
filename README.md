# Hướng dẫn cài đặt mã nguồn Backend

## Chuẩn bị môi trường

Để chuẩn bị môi trường cho phần Backend của hệ thống, tạo một file mới cùng cấp với thư mục `src` tên là `.env` và copy nội dung của file `.env.example` vào

## Cài đặt các thư viện

Mở terminal tại thư mục chứa mã nguồn và thực thi lệnh `yarn install` để cài đặt các thư viện cần thiết cho hệ thống.

## Biên dịch và thực thi mã nguồn

Sau khi chuẩn bị môi trường và cài đặt các thư viện cần thiết, biên dịch và thực thi mã nguồn bằng các thực hiện lệnh `yarn dev` hoặc `npm run dev`.

Sau khi thấy dòng `App listening at http://localhost:5000` xuất hiện trên terminal tức là mã nguồn đã được biên dịch và thực thi thành công. Lúc này phần Backend của hệ thống sẽ chạy ở http://localhost:5000
