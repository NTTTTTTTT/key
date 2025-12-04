// File: functions/api/admin.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const file = url.searchParams.get("file");

  if (!file) {
    return new Response("-- Thiếu file", { status: 400 });
  }

  const apiUrl = `https://ntt-key.pages.dev/Key/${file}`;

  try {
    const githubRes = await fetch(apiUrl);

    if (!githubRes.ok) {
      return new Response("-- Không tìm thấy file", { status: 404 });
    }

    const json = await githubRes.json();
    const { time1, time2, key } = json;

    if (!time1 || !time2 || !key) {
      return new Response("-- Thiếu nội dung JSON", { status: 400 });
    }

    const lua =
      `if os.time() >= ${time1} and os.time() <= ${time2} then\n` +
      `  _G.index_key = "${key}"\n` +
      `else\n` +
      `  _G.expired = true\n` +
      `end`;

    return new Response(lua, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  } catch (err) {
    return new Response("-- Lỗi xử lý nội dung", { status: 500 });
  }
}
