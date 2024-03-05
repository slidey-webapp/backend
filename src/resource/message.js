export const UNAUTHORIZED = "UNAUTHORIZED";
export const NOT_FOUND_ACCOUNT = "Không tìm thấy tài khoản nào";
export const INCORRECT_PASSWORD = "Mật khẩu không chính xác";
export const BLOCKED_ACCOUNT = "Tài khoản của bạn đã bị xóa";
export const SEND_VERIFY_EMAIL = (email) =>
    `Một email xác minh đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư đến (hoặc thư mục thư rác) của bạn và làm theo hướng dẫn.`;
export const QUERY_SUCCESS = (name) => `Truy vấn ${name || "dữ liệu"} thành công`;
export const EXISTED_USER = "Tên đăng nhập đã tồn tại";
export const EXISTED_ROLE = "Role với code này đã tồn tại";
export const EXSITED_ACCOUNT_ROLE = "Tài khoản đã có quyền này";
export const EXISTED_GROUP = "Tên nhóm đã được sử dụng";
export const EXISTED_EMAIL = "Địa chỉ email đã được sử dụng";
export const EXISTED_PRESENTATION = "Bản trình bày với tên này đã tồn tại";
export const MISSING_INPUT = (input) => `${input}  không được bỏ trống`;
export const POST_SUCCESS = (action) => `${action} thành công`;
export const QUERY_NOT_FOUND = (name) => `Không tìm thấy ${name} nào`;
export const INVALID_INPUT = (name) => `${name} không hợp lệ`;
export const PERMISSION_NOT_FOUND = "Bạn không có quyền thực hiện hành động này";
export const SEND_EMAIL_SUCCESS = "Gửi email thành công";
export const AUTHENTICATE_FAILED = "AUTHENTICATE_FAILED";
export const PASSWORD_NOT_MATCH = "Mật khẩu và mật khẩu nhập lại không khớp";
export const VERIFY_MAIL_SUBJECT = "Xác thực tài khoản";

export const RESET_PASSWORD_MAIL_SUBJECT = "Đặt lại mật khẩu";
export const GROUP_INVITATION_MAIL_SUBJECT = "Mời tham gia nhóm";
export const CANT_ASSIGN_OWNER = "Không thể đặt người khác làm trưởng nhóm";
export const CANT_REMOVE_YOURSELF = "Bạn không thể xóa chính mình khỏi nhóm";
export const CANT_SEND_INVITATION_TO_YOURSELF = "Bạn không thể gửi lời mời đến chính mình";
export const COLLAB_INVITATION_MAIL_SUBJECT = "Mời tham gia cộng tác";

export const IS_PRESENTING = "Bản trình bày này đang được trình chiếu";
export const EXISTED_PARTICIPANT_NAME = "Tên người dùng này đã được sử dụng trong phiên trình chiếu này";
export const ALREADY_SUBMIT_ANSWER = "Bạn đã trả lời slide này rồi";
export const SERVER_BUSY = "Đã có lỗi xảy ra, vui lòng thử lại sau";
export const TEMPLATE_NOT_FOUND = "Không tìm thấy mẫu có sẵn nào";
