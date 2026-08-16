import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { SEED_ADMIN, SEED_PRODUCTS } from '../src/data/seedData.js';
import { ORDER_STATUS, ROLES, TOPUP_STATUS } from '../src/utils/constants.js';
import { genLicenseKey } from '../src/utils/formatters.js';

const scryptAsync = promisify(crypto.scrypt);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

await loadEnv(path.join(rootDir, '.env'));

const PORT = Number(process.env.PORT || 8787);
const APP_ORIGIN = process.env.APP_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_DAYS = 7;
const MAX_BODY_BYTES = 12 * 1024 * 1024;

const serviceAccount = await loadServiceAccount();
const projectId = serviceAccount.project_id;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
const firestoreRoot = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const authHits = new Map();
let cachedAccessToken = null;

await ensureSeedData();

const server = http.createServer(async (req, res) => {
  try {
    setSecurityHeaders(res);
    if (req.method === 'OPTIONS') return send(res, 204);

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (!url.pathname.startsWith('/api')) return serveStatic(req, res, url.pathname);
    if (!isAllowedOrigin(req)) return sendJson(res, 403, { error: 'Nguồn yêu cầu không hợp lệ.' });
    if (isMutating(req.method) && !isSafeContentType(req)) {
      return sendJson(res, 415, { error: 'Định dạng dữ liệu gửi lên không hợp lệ.' });
    }

    const body = isMutating(req.method) ? await readJson(req) : {};
    const route = matchRoute(req.method, url.pathname);
    if (!route) return sendJson(res, 404, { error: 'Không tìm thấy API.' });

    req.params = route.params;
    req.query = url.searchParams;
    req.body = body;
    req.user = await getRequestUser(req);

    return await route.handler(req, res);
  } catch (err) {
    const status = err.statusCode || 500;
    if (status >= 500) console.error(err);
    return sendJson(res, status, { error: err.publicMessage || err.message || 'Server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`ToolStore API listening on http://localhost:${PORT}`);
  console.log(`Firebase project: ${projectId}, bucket: ${storageBucket}`);
});

async function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return parseServiceAccount(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'),
      'FIREBASE_SERVICE_ACCOUNT_BASE64'
    );
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return parseServiceAccount(
      await fs.readFile(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'),
      'FIREBASE_SERVICE_ACCOUNT_PATH'
    );
  }

  throw new Error('Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_BASE64, or FIREBASE_SERVICE_ACCOUNT_PATH.');
}

function parseServiceAccount(raw, source) {
  try {
    const account = JSON.parse(raw);
    if (typeof account.private_key === 'string') {
      account.private_key = account.private_key.replace(/\\n/g, '\n');
    }
    if (!account.project_id || !account.client_email || !account.private_key) {
      throw new Error('project_id, client_email, and private_key are required.');
    }
    return account;
  } catch (err) {
    throw new Error(`Invalid ${source}: ${err.message}`);
  }
}

const routes = [
  ['GET', '/api/health', health],
  ['POST', '/api/auth/register', rateLimited(register)],
  ['POST', '/api/auth/login', rateLimited(login)],
  ['POST', '/api/auth/logout', logout],
  ['GET', '/api/auth/me', me],
  ['GET', '/api/users', requireAdmin(listUsers)],
  ['GET', '/api/products', listProducts],
  ['GET', '/api/products/:id', getProduct],
  ['POST', '/api/products', requireAdmin(createProduct)],
  ['PATCH', '/api/products/:id', requireAdmin(updateProduct)],
  ['DELETE', '/api/products/:id', requireAdmin(deleteProduct)],
  ['POST', '/api/products/:id/views', incrementProductViews],
  ['GET', '/api/orders', requireAuth(listOrders)],
  ['POST', '/api/orders/checkout', requireAuth(checkout)],
  ['PATCH', '/api/orders/:id/approve', requireAdmin(approveOrder)],
  ['PATCH', '/api/orders/:id/reject', requireAdmin(rejectOrder)],
  ['GET', '/api/media', requireAdmin(listMedia)],
  ['POST', '/api/media/url', requireAdmin(addMediaUrl)],
  ['POST', '/api/media/upload', requireAdmin(uploadMedia)],
  ['DELETE', '/api/media/:id', requireAdmin(deleteMedia)],
  ['GET', '/api/billing', getBilling],
  ['PUT', '/api/billing', requireAdmin(updateBilling)],
  ['GET', '/api/topups', requireAuth(listTopUps)],
  ['POST', '/api/topups', requireAuth(createTopUp)],
  ['PATCH', '/api/topups/:id/approve', requireAdmin(approveTopUp)],
  ['PATCH', '/api/topups/:id/reject', requireAdmin(rejectTopUp)],
];

async function health(req, res) {
  return sendJson(res, 200, { ok: true, projectId });
}

async function register(req, res) {
  const fullName = cleanString(req.body.fullName, 80);
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!fullName || !email || !password) throw badRequest('Vui lòng nhập đầy đủ thông tin.');
  if (password.length < 6) throw badRequest('Mật khẩu phải có ít nhất 6 ký tự.');
  if (await findUserByEmail(email)) throw badRequest('Email này đã được đăng ký.');

  const user = {
    id: genId('user'),
    fullName,
    email,
    passwordHash: await hashPassword(password),
    role: ROLES.USER,
    balance: 0,
    createdAt: nowIso(),
  };
  await setDoc(`users/${user.id}`, user);
  setSessionCookie(res, user);
  return sendJson(res, 201, { user: publicUser(user) });
}

async function login(req, res) {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized('Email hoặc mật khẩu không đúng.');
  }
  setSessionCookie(res, user);
  return sendJson(res, 200, { user: publicUser(user) });
}

async function logout(req, res) {
  res.setHeader('Set-Cookie', buildSessionCookie('', 0));
  return sendJson(res, 200, { ok: true });
}

async function me(req, res) {
  if (!req.user) return sendJson(res, 200, { user: null });
  return sendJson(res, 200, { user: publicUser(req.user) });
}

async function listUsers(req, res) {
  const users = (await listCollection('users'))
    .map(publicUser)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return sendJson(res, 200, { users });
}

async function listProducts(req, res) {
  const products = (await listCollection('products')).sort((a, b) => (b.views || 0) - (a.views || 0));
  return sendJson(res, 200, { products });
}

async function getProduct(req, res) {
  const product = await getDoc(`products/${req.params.id}`);
  if (!product) throw notFound('Không tìm thấy sản phẩm.');
  return sendJson(res, 200, { product });
}

async function createProduct(req, res) {
  const product = normalizeProduct(req.body, genId('p'));
  await setDoc(`products/${product.id}`, product);
  return sendJson(res, 201, { product });
}

async function updateProduct(req, res) {
  const existing = await getDoc(`products/${req.params.id}`);
  if (!existing) throw notFound('Không tìm thấy sản phẩm.');
  const product = normalizeProduct({ ...existing, ...req.body }, existing.id);
  await setDoc(`products/${product.id}`, product);
  return sendJson(res, 200, { product });
}

async function deleteProduct(req, res) {
  await deleteDoc(`products/${req.params.id}`);
  return sendJson(res, 200, { ok: true });
}

async function incrementProductViews(req, res) {
  const product = await getDoc(`products/${req.params.id}`);
  if (!product) return sendJson(res, 200, { ok: true });
  await setDoc(`products/${product.id}`, { ...product, views: Number(product.views || 0) + 1 });
  return sendJson(res, 200, { ok: true });
}

async function listOrders(req, res) {
  const all = await listCollection('orders');
  const orders = (req.user.role === ROLES.ADMIN ? all : all.filter((o) => o.userId === req.user.id))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return sendJson(res, 200, { orders });
}

async function checkout(req, res) {
  const product = await getDoc(`products/${cleanString(req.body.productId, 120)}`);
  if (!product) throw notFound('Không tìm thấy sản phẩm.');
  const pkg = (product.packages || []).find((item) => item.id === req.body.packageId);
  if (!pkg) throw badRequest('Gói sản phẩm không hợp lệ.');

  const user = await getDoc(`users/${req.user.id}`);
  if (!user) throw unauthorized('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
  if (Number(user.balance || 0) < Number(pkg.price || 0)) {
    const balance = Number(user.balance || 0);
    const price = Number(pkg.price || 0);
    throw badRequest(`Số dư không đủ. Bạn đang có ${formatMoney(balance)}, cần ${formatMoney(price)}, còn thiếu ${formatMoney(price - balance)}. Vui lòng nạp tiền và chờ admin duyệt.`);
  }

  const nextUser = { ...user, balance: Number(user.balance || 0) - Number(pkg.price || 0) };
  const order = {
    id: genId('order'),
    userId: user.id,
    userEmail: user.email,
    productId: product.id,
    productName: product.name,
    packageId: pkg.id,
    packageName: pkg.name,
    price: Number(pkg.price || 0),
    licenseKey: genLicenseKey(),
    status: ORDER_STATUS.PENDING,
    createdAt: nowIso(),
    activatedAt: null,
    adminNote: '',
  };

  await setDoc(`users/${user.id}`, nextUser);
  await setDoc(`orders/${order.id}`, order);
  return sendJson(res, 201, { order, user: publicUser(nextUser) });
}

async function approveOrder(req, res) {
  const order = await updateOrderStatus(req.params.id, ORDER_STATUS.ACTIVE, req.body.note || 'Admin da kich hoat key.');
  return sendJson(res, 200, { order });
}

async function rejectOrder(req, res) {
  const order = await updateOrderStatus(req.params.id, ORDER_STATUS.REJECTED, req.body.note || 'Admin tu choi kich hoat.');
  return sendJson(res, 200, { order });
}

async function listMedia(req, res) {
  const media = (await listCollection('media')).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return sendJson(res, 200, { media });
}

async function addMediaUrl(req, res) {
  const url = cleanString(req.body.url, 2000);
  if (!/^https?:\/\//i.test(url)) throw badRequest('URL ảnh không hợp lệ.');
  const item = {
    id: genId('media'),
    name: cleanString(req.body.name, 120) || 'Anh tu duong dan',
    url,
    alt: cleanString(req.body.alt, 120),
    storagePath: '',
    createdAt: nowIso(),
  };
  await setDoc(`media/${item.id}`, item);
  return sendJson(res, 201, { media: item });
}

async function uploadMedia(req, res) {
  const name = cleanFileName(req.body.name || 'image');
  const contentType = cleanString(req.body.type, 80) || 'image/png';
  if (!contentType.startsWith('image/')) throw badRequest('Chỉ cho phép tải tệp ảnh.');
  const base64 = String(req.body.dataBase64 || '');
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) throw badRequest('Tệp ảnh rỗng hoặc không hợp lệ.');

  const storagePath = `media/${Date.now()}-${crypto.randomUUID()}-${name}`;
  const url = await uploadToStorage(storagePath, buffer, contentType);
  const item = {
    id: genId('media'),
    name,
    url,
    alt: name,
    storagePath,
    createdAt: nowIso(),
  };
  await setDoc(`media/${item.id}`, item);
  return sendJson(res, 201, { media: item });
}

async function deleteMedia(req, res) {
  const item = await getDoc(`media/${req.params.id}`);
  if (item?.storagePath) await deleteFromStorage(item.storagePath).catch((err) => console.warn(err.message));
  await deleteDoc(`media/${req.params.id}`);
  return sendJson(res, 200, { ok: true });
}

async function getBilling(req, res) {
  return sendJson(res, 200, { billing: await getBillingConfig() });
}

async function updateBilling(req, res) {
  const billing = {
    ...await getBillingConfig(),
    bankName: cleanString(req.body.bankName, 120),
    accountNumber: cleanString(req.body.accountNumber, 80),
    accountName: cleanString(req.body.accountName, 120),
    qrImageUrl: cleanString(req.body.qrImageUrl, 2000),
    transferNotePrefix: cleanString(req.body.transferNotePrefix, 40) || 'NAP',
    updatedAt: nowIso(),
  };
  await setDoc('settings/billing', billing);
  return sendJson(res, 200, { billing });
}

async function listTopUps(req, res) {
  const all = await listCollection('topups');
  const topups = (req.user.role === ROLES.ADMIN ? all : all.filter((item) => item.userId === req.user.id))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return sendJson(res, 200, { topups });
}

async function createTopUp(req, res) {
  const amount = Number(req.body.amount || 0);
  if (!Number.isFinite(amount) || amount < 10000) throw badRequest('Số tiền nạp tối thiểu là 10.000đ.');
  const billing = await getBillingConfig();
  const topup = {
    id: genId('topup'),
    userId: req.user.id,
    userEmail: req.user.email,
    amount,
    transferCode: `${billing.transferNotePrefix || 'NAP'}-${req.user.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    status: TOPUP_STATUS.PENDING,
    note: cleanString(req.body.note, 300),
    createdAt: nowIso(),
    reviewedAt: null,
    adminNote: '',
  };
  await setDoc(`topups/${topup.id}`, topup);
  return sendJson(res, 201, { topup });
}

async function approveTopUp(req, res) {
  const topup = await getDoc(`topups/${req.params.id}`);
  if (!topup) throw notFound('Không tìm thấy yêu cầu nạp tiền.');
  if (topup.status !== TOPUP_STATUS.PENDING) throw badRequest('Yêu cầu này đã được xử lý.');

  const user = await getDoc(`users/${topup.userId}`);
  if (!user) throw notFound('Không tìm thấy người dùng.');
  const nextUser = { ...user, balance: Number(user.balance || 0) + Number(topup.amount || 0) };
  const nextTopup = {
    ...topup,
    status: TOPUP_STATUS.APPROVED,
    reviewedAt: nowIso(),
    adminNote: cleanString(req.body.note, 300) || 'Admin da xac nhan chuyen khoan.',
  };
  await setDoc(`users/${user.id}`, nextUser);
  await setDoc(`topups/${topup.id}`, nextTopup);
  return sendJson(res, 200, { topup: nextTopup, user: publicUser(nextUser) });
}

async function rejectTopUp(req, res) {
  const topup = await getDoc(`topups/${req.params.id}`);
  if (!topup) throw notFound('Không tìm thấy yêu cầu nạp tiền.');
  if (topup.status !== TOPUP_STATUS.PENDING) throw badRequest('Yêu cầu này đã được xử lý.');
  const nextTopup = {
    ...topup,
    status: TOPUP_STATUS.REJECTED,
    reviewedAt: nowIso(),
    adminNote: cleanString(req.body.note, 300) || 'Admin tu choi yeu cau nap tien.',
  };
  await setDoc(`topups/${topup.id}`, nextTopup);
  return sendJson(res, 200, { topup: nextTopup });
}

async function updateOrderStatus(id, status, note) {
  const order = await getDoc(`orders/${id}`);
  if (!order) throw notFound('Không tìm thấy đơn hàng.');
  const next = {
    ...order,
    status,
    adminNote: cleanString(note, 300),
    activatedAt: status === ORDER_STATUS.ACTIVE ? nowIso() : order.activatedAt,
  };
  await setDoc(`orders/${id}`, next);
  return next;
}

async function ensureSeedData() {
  const users = await listCollection('users');
  if (users.length === 0) {
    const admin = {
      ...SEED_ADMIN,
      passwordHash: await hashPassword(SEED_ADMIN.password),
      createdAt: nowIso(),
    };
    delete admin.password;
    await setDoc(`users/${admin.id}`, admin);
  }

  const products = await listCollection('products');
  if (products.length === 0) {
    for (const product of SEED_PRODUCTS) {
      await setDoc(`products/${product.id}`, product);
    }
  }

  if (!(await getDoc('settings/billing'))) {
    await setDoc('settings/billing', {
      bankName: '',
      accountNumber: '',
      accountName: '',
      qrImageUrl: '',
      transferNotePrefix: 'NAP',
      updatedAt: nowIso(),
    });
  }
}

async function getBillingConfig() {
  return await getDoc('settings/billing') || {
    bankName: '',
    accountNumber: '',
    accountName: '',
    qrImageUrl: '',
    transferNotePrefix: 'NAP',
  };
}

function normalizeProduct(input, id) {
  const price = Number(input.price || input.packages?.[0]?.price || 0);
  return {
    id,
    name: cleanString(input.name, 160),
    category: cleanString(input.category, 60) || 'facebook',
    views: Number(input.views || 0),
    shortDesc: cleanString(input.shortDesc, 500),
    description: cleanString(input.description, 5000),
    imageUrl: cleanString(input.imageUrl, 2000),
    packages: Array.isArray(input.packages) && input.packages.length
      ? input.packages.map((pkg, index) => ({
          id: cleanString(pkg.id, 60) || `pkg_${index + 1}`,
          name: cleanString(pkg.name, 120) || 'Goi tieu chuan',
          desc: cleanString(pkg.desc, 400),
          price: Number(pkg.price || price || 0),
          best: Boolean(pkg.best),
        }))
      : [{ id: 'std', name: 'Goi tieu chuan', desc: 'Goi mac dinh', price }],
  };
}

async function findUserByEmail(email) {
  if (!email) return null;
  const rows = await queryCollection('users', 'email', email);
  return rows[0] || null;
}

function publicUser(user) {
  if (!user) return null;
  const { password, passwordHash, ...safe } = user;
  return safe;
}

function requireAuth(handler) {
  return async (req, res) => {
    if (!req.user) throw unauthorized('Bạn cần đăng nhập để tiếp tục.');
    return handler(req, res);
  };
}

function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (req.user.role !== ROLES.ADMIN) throw forbidden('Bạn không có quyền quản trị.');
    return handler(req, res);
  });
}

function rateLimited(handler) {
  return async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
    const key = `${ip}:${new URL(req.url, 'http://local').pathname}`;
    const now = Date.now();
    const hit = authHits.get(key) || { count: 0, resetAt: now + 60_000 };
    if (now > hit.resetAt) {
      hit.count = 0;
      hit.resetAt = now + 60_000;
    }
    hit.count += 1;
    authHits.set(key, hit);
    if (hit.count > 20) throw tooManyRequests('Thu qua nhieu lan, vui long doi mot chut.');
    return handler(req, res);
  };
}

async function getRequestUser(req) {
  const token = parseCookies(req.headers.cookie || '').ts_session;
  if (!token) return null;
  try {
    const payload = verifyJwt(token);
    return await getDoc(`users/${payload.sub}`);
  } catch {
    return null;
  }
}

function setSessionCookie(res, user) {
  const token = signJwt({
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400,
  });
  res.setHeader('Set-Cookie', buildSessionCookie(token, SESSION_DAYS * 86400));
}

function buildSessionCookie(token, maxAge) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `ts_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(hash).toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (!stored?.startsWith('scrypt$')) return false;
  const [, salt, original] = stored.split('$');
  const hash = await scryptAsync(password, salt, 64);
  const a = Buffer.from(original, 'hex');
  const b = Buffer.from(hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function signJwt(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyJwt(token) {
  const [header, body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (!sig || sig.length !== expected.length) throw unauthorized();
  if (!crypto.timingSafeEqual(Buffer.from(sig || ''), Buffer.from(expected))) throw unauthorized();
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) throw unauthorized();
  return payload;
}

async function getAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.token;
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const jwt = [
    base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
    base64url(JSON.stringify(claim)),
  ].join('.');
  const signature = crypto.createSign('RSA-SHA256').update(jwt).sign(serviceAccount.private_key, 'base64url');
  const assertion = `${jwt}.${signature}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || 'Cannot get Firebase access token.');
  cachedAccessToken = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return cachedAccessToken.token;
}

async function firebaseFetch(url, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (response.status === 404) return null;
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.error?.message || `Firebase request failed: ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function listCollection(collection) {
  const data = await firebaseFetch(`${firestoreRoot}/${encodePath(collection)}?pageSize=1000`);
  return (data?.documents || []).map(fromDocument);
}

async function queryCollection(collection, field, value) {
  const data = await firebaseFetch(`${firestoreRoot}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: 'EQUAL',
            value: toFirestoreValue(value),
          },
        },
        limit: 10,
      },
    }),
  });
  return (data || []).filter((row) => row.document).map((row) => fromDocument(row.document));
}

async function getDoc(docPath) {
  const data = await firebaseFetch(`${firestoreRoot}/${encodePath(docPath)}`);
  return data ? fromDocument(data) : null;
}

async function setDoc(docPath, value) {
  return firebaseFetch(`${firestoreRoot}/${encodePath(docPath)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(value) }),
  });
}

async function deleteDoc(docPath) {
  await firebaseFetch(`${firestoreRoot}/${encodePath(docPath)}`, { method: 'DELETE' });
}

async function uploadToStorage(objectPath, buffer, contentType) {
  const token = crypto.randomUUID();
  const boundary = `----toolstore-${crypto.randomBytes(8).toString('hex')}`;
  const metadata = {
    name: objectPath,
    contentType,
    metadata: { firebaseStorageDownloadTokens: token },
  };
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  await firebaseFetch(`https://storage.googleapis.com/upload/storage/v1/b/${storageBucket}/o?uploadType=multipart`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

async function deleteFromStorage(objectPath) {
  await firebaseFetch(`https://storage.googleapis.com/storage/v1/b/${storageBucket}/o/${encodeURIComponent(objectPath)}`, { method: 'DELETE' });
}

function toFirestoreFields(value) {
  return Object.fromEntries(Object.entries(value || {}).map(([key, item]) => [key, toFirestoreValue(item)]));
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  return { stringValue: String(value) };
}

function fromDocument(document) {
  const value = fromFirestoreFields(document.fields || {});
  value.id ||= document.name.split('/').pop();
  return value;
}

function fromFirestoreFields(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

function fromFirestoreValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue.fields || {});
  if ('timestampValue' in value) return value.timestampValue;
  return null;
}

function matchRoute(method, pathname) {
  const parts = pathname.split('/').filter(Boolean);
  for (const [routeMethod, pattern, handler] of routes) {
    if (routeMethod !== method) continue;
    const patternParts = pattern.split('/').filter(Boolean);
    if (parts.length !== patternParts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < patternParts.length; i += 1) {
      if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(parts[i]);
      else if (patternParts[i] !== parts[i]) ok = false;
    }
    if (ok) return { handler, params };
  }
  return null;
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Du lieu gui len qua lon.'), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw badRequest('Dữ liệu gửi lên không đúng định dạng JSON.');
  }
}

async function serveStatic(req, res, pathname) {
  const distDir = path.join(rootDir, 'dist');
  const filePath = pathname === '/' ? path.join(distDir, 'index.html') : path.join(distDir, pathname);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(distDir)) return send(res, 403);
  try {
    const stat = await fs.stat(resolved);
    const file = stat.isDirectory() ? path.join(resolved, 'index.html') : resolved;
    const data = await fs.readFile(file);
    res.setHeader('Content-Type', contentType(file));
    return send(res, 200, data);
  } catch {
    try {
      const data = await fs.readFile(path.join(distDir, 'index.html'));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return send(res, 200, data);
    } catch {
      return sendJson(res, 404, { error: 'Frontend chưa được build. Hãy chạy npm run dev cho Vite hoặc npm run build.' });
    }
  }
}

function sendJson(res, status, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return send(res, status, JSON.stringify(data));
}

function send(res, status, body = '') {
  res.statusCode = status;
  res.end(body);
}

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    if (['localhost', '127.0.0.1'].includes(parsed.hostname)) return true;
    const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
    const host = forwardedHost || req.headers.host || '';
    if (parsed.host === host) return true;
  } catch {
    return false;
  }
  const hostOrigin = `http://${req.headers.host}`;
  return origin === hostOrigin || origin === APP_ORIGIN;
}

function isSafeContentType(req) {
  const type = req.headers['content-type'] || '';
  return !type || type.startsWith('application/json');
}

function isMutating(method) {
  return ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
}

function parseCookies(raw) {
  return Object.fromEntries(raw.split(';').filter(Boolean).map((pair) => {
    const index = pair.indexOf('=');
    return [pair.slice(0, index).trim(), decodeURIComponent(pair.slice(index + 1).trim())];
  }));
}

function cleanEmail(value) {
  return cleanString(value, 180).trim().toLowerCase();
}

function cleanString(value, max = 500) {
  return String(value || '').replace(/\0/g, '').trim().slice(0, max);
}

function cleanFileName(value) {
  return cleanString(value, 160).replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatMoney(amount = 0) {
  return `${Number(amount || 0).toLocaleString('vi-VN')}đ`;
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function encodePath(value) {
  return value.split('/').map(encodeURIComponent).join('/');
}

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function loadEnv(file) {
  return fs.readFile(file, 'utf8').then((raw) => {
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^"|"$/g, '');
      process.env[key] ||= value;
    });
  }).catch(() => {});
}

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.publicMessage = message;
  return err;
}

function badRequest(message) { return httpError(400, message); }
function unauthorized(message = 'Phien dang nhap khong hop le.') { return httpError(401, message); }
function forbidden(message) { return httpError(403, message); }
function notFound(message) { return httpError(404, message); }
function tooManyRequests(message) { return httpError(429, message); }
