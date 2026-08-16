export async function apiRequest(path, options = {}) {
  const { body, headers, ...rest } = options;
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ API. Vui lòng kiểm tra backend đang chạy ở cổng 8787 rồi thử lại.');
  }

  const text = await response.text();
  const data = text ? safeJson(text) : {};

  if (!response.ok) {
    throw new Error(data.error || defaultErrorMessage(response.status));
  }

  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function defaultErrorMessage(status) {
  if (status === 400) return 'Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại.';
  if (status === 401) return 'Bạn cần đăng nhập lại để tiếp tục.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy dữ liệu cần xử lý.';
  if (status >= 500) return 'Máy chủ đang gặp lỗi, vui lòng thử lại sau.';
  return 'Không thể xử lý yêu cầu, vui lòng thử lại.';
}
