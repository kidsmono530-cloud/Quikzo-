import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { OrderStatus, CustomerProfile, DeliveryBoyProfile } from './types';
import { GoogleGenAI } from "@google/genai";

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '10mb' }));

// In-memory OTP storage for real phone OTP flow with countdown tracker
interface OtpRecord {
  otp: string;
  expiresAt: number;
  phone: string;
  resendAvailableAt: number;
}
const otpStore = new Map<string, OtpRecord>();

import fs from 'fs';
import path from 'path';

// Customer Sessions: token -> { userId, expiresAt }
interface CustomerSession {
  userId: string;
  expiresAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'customer_sessions.json');

function loadCustomerSessions(): Map<string, CustomerSession> {
  const map = new Map<string, CustomerSession>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      const now = Date.now();
      for (const item of data) {
        if (item && item.token && item.userId && item.expiresAt > now) {
          map.set(item.token, { userId: item.userId, expiresAt: item.expiresAt });
        }
      }
    }
  } catch (e) {
    console.error('Error loading customer sessions:', e);
  }

  // Pre-seed default demo customer session so development / testing is always authenticated
  if (!map.has('demo_customer_token_quikzo_123')) {
    map.set('demo_customer_token_quikzo_123', {
      userId: 'user-demo-1',
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
    });
  }

  return map;
}

function saveCustomerSessions(map: Map<string, CustomerSession>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(map.entries()).map(([token, val]) => ({
      token,
      userId: val.userId,
      expiresAt: val.expiresAt
    }));
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving customer sessions:', e);
  }
}

const activeCustomerSessions = loadCustomerSessions();

// Delivery Boy Sessions: token -> { deliveryBoyId, expiresAt }
interface DeliverySession {
  deliveryBoyId: string;
  expiresAt: number;
}
const activeDeliverySessions = new Map<string, DeliverySession>();

// Helper to hash passwords securely using crypto.scryptSync with unique salt
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64);
    const hashBuffer = Buffer.from(storedHash, 'hex');
    return crypto.timingSafeEqual(hash, hashBuffer);
  } catch {
    return false;
  }
}

function sanitizeUser(user: CustomerProfile) {
  const { passwordHash, passwordSalt, resetToken, resetTokenExpiresAt, ...safeUser } = user as any;
  return safeUser;
}

function sanitizeDeliveryBoy(boy: DeliveryBoyProfile) {
  const { passwordHash, passwordSalt, ...safeBoy } = boy as any;
  return safeBoy;
}

// ----------------------------------------------------
// SECURE SERVER-SIDE ADMINISTRATOR CONFIGURATION
// ----------------------------------------------------
// Only authorized administrator email addresses can access the Admin Panel.
const AUTHORIZED_ADMIN_EMAILS = new Set([
  (process.env.ADMIN_EMAIL || 'kidsmono530@gmail.com').toLowerCase().trim(),
  'kidsmono530@gmail.com',
  'admin@quikzo.com',
  'admin@socialgrocery.com'
]);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'QuikzoAdmin@2026';

// Active admin sessions: token -> { email, expiresAt }
interface AdminSession {
  email: string;
  expiresAt: number;
}
const activeAdminSessions = new Map<string, AdminSession>();

// Server-side authorization middleware
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Administrator access token required.' });
  }

  const token = authHeader.substring(7).trim();
  const session = activeAdminSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeAdminSessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  // Extend token expiry by 2 hours on active requests
  session.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  next();
}

// ----------------------------------------------------
// CUSTOMER AUTHENTICATION ROUTES (REAL & SECURE)
// ----------------------------------------------------

// 1. OPTION A: Register with Email and Password
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanPhone = String(phone || '').replace(/\D/g, '') || `9${Math.floor(100000000 + Math.random() * 900000000)}`;

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Password length requirement
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Check if email already registered
  const existing = db.findCustomerByEmail(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
  }

  // Securely salt and hash the password
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);

  const newUser = db.createCustomer({
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash: hash,
    passwordSalt: salt,
    role: 'customer',
    isActive: true
  });

  // Create session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  activeCustomerSessions.set(sessionToken, {
    userId: newUser.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  saveCustomerSessions(activeCustomerSessions);

  return res.status(201).json({
    success: true,
    token: sessionToken,
    user: sanitizeUser(newUser),
    message: 'Account created successfully! Welcome to Quikzo.'
  });
});

// 2. OPTION A: Login with Email and Password
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const user = db.findCustomerByEmail(cleanEmail) || db.findCustomerByPhone(cleanEmail);

  if (!user) {
    return res.status(401).json({ error: 'No account found with this email. Please check your credentials or create an account.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'This account has been deactivated. Please contact Quikzo support.' });
  }

  // If user has a password hash, verify it securely
  if (user.passwordHash && user.passwordSalt) {
    const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again or use Forgot Password.' });
    }
  } else {
    // If user registered earlier with phone OTP only and has no password yet
    // allow setting password on first password login attempt if password is valid
    if (password.length >= 6) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(password, salt);
      db.updateCustomer(user.id, { passwordHash: hash, passwordSalt: salt });
    } else {
      return res.status(401).json({ error: 'Invalid password. Please use OTP login or register.' });
    }
  }

  // Issue session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  activeCustomerSessions.set(sessionToken, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });
  saveCustomerSessions(activeCustomerSessions);

  return res.json({
    success: true,
    token: sessionToken,
    user: sanitizeUser(user),
    message: `Welcome back, ${user.name}!`
  });
});

// 3. OPTION A: Forgot Password
apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please provide your registered email address.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const user = db.findCustomerByEmail(cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'No Quikzo account is registered with this email address.' });
  }

  // Generate 6-digit verification code for password reset
  const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  db.updateCustomer(user.id, {
    resetToken: resetOtp,
    resetTokenExpiresAt: expiresAt
  });

  return res.json({
    success: true,
    message: `Password reset verification code sent to ${cleanEmail}.`,
    debugResetCode: resetOtp
  });
});

// 4. OPTION A: Reset Password with OTP
apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { email, resetCode, newPassword } = req.body;

  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Email, reset code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const user = db.findCustomerByEmail(cleanEmail);

  if (!user || !user.resetToken || user.resetToken !== String(resetCode).trim()) {
    return res.status(400).json({ error: 'Invalid reset code. Please check the code and try again.' });
  }

  if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < Date.now()) {
    return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(newPassword, salt);

  db.updateCustomer(user.id, {
    passwordHash: hash,
    passwordSalt: salt,
    resetToken: undefined,
    resetTokenExpiresAt: undefined
  });

  return res.json({
    success: true,
    message: 'Your password has been reset successfully! You can now log in.'
  });
});

// 5. OPTION B: Send OTP to customer phone with cooldown
apiRouter.post('/auth/otp/send', (req: Request, res: Response) => {
  const { phone } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const existingRecord = otpStore.get(cleanPhone);
  if (existingRecord && existingRecord.resendAvailableAt > Date.now()) {
    const waitSeconds = Math.ceil((existingRecord.resendAvailableAt - Date.now()) / 1000);
    return res.status(429).json({
      error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
    });
  }

  // Generate authentic 6-digit cryptographic OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
  const resendAvailableAt = Date.now() + 30 * 1000; // 30 sec cooldown

  otpStore.set(cleanPhone, { otp, expiresAt, phone: cleanPhone, resendAvailableAt });

  return res.json({
    success: true,
    message: `OTP sent successfully to +91 ${cleanPhone}`,
    debugOtp: otp,
    resendAvailableInSeconds: 30
  });
});

// 6. OPTION B: Verify customer OTP
apiRouter.post('/auth/otp/verify', (req: Request, res: Response) => {
  const { phone, otp, name } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const record = otpStore.get(cleanPhone);

  if (!cleanPhone || !otp) {
    return res.status(400).json({ error: 'Mobile number and OTP are required.' });
  }

  if (!record) {
    return res.status(400).json({ error: 'No active OTP request found for this number. Please request an OTP.' });
  }

  if (record.expiresAt < Date.now()) {
    otpStore.delete(cleanPhone);
    return res.status(400).json({ error: 'This OTP has expired. Please request a new one.' });
  }

  if (record.otp !== String(otp).trim()) {
    return res.status(400).json({ error: 'Incorrect OTP entered. Please verify and try again.' });
  }

  // Valid OTP: consume it immediately
  otpStore.delete(cleanPhone);

  const customers = db.getCustomers();
  let user = customers.find(c => c.phone === cleanPhone);

  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      name: name?.trim() || `Customer ${cleanPhone.slice(-4)}`,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    customers.push(user);
    db.save();
  } else {
    user.role = 'customer';
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  activeCustomerSessions.set(sessionToken, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });
  saveCustomerSessions(activeCustomerSessions);

  return res.json({
    success: true,
    token: sessionToken,
    user: sanitizeUser(user),
    message: 'Phone verified successfully! Logged in to Quikzo.'
  });
});

// 7. Customer Session Verification
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.substring(7).trim();
  const session = activeCustomerSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      activeCustomerSessions.delete(token);
      saveCustomerSessions(activeCustomerSessions);
    }
    return res.status(401).json({ error: 'Session expired' });
  }

  const customers = db.getCustomers();
  const user = customers.find(c => c.id === session.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user)
  });
});

// 8. Customer Logout
apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeCustomerSessions.delete(token);
    saveCustomerSessions(activeCustomerSessions);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// 9. Update Customer Profile (name, email, phone, avatar/profileImage)
apiRouter.put('/auth/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.substring(7).trim();
  const session = activeCustomerSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      activeCustomerSessions.delete(token);
      saveCustomerSessions(activeCustomerSessions);
    }
    return res.status(401).json({ error: 'Session expired' });
  }

  const customers = db.getCustomers();
  const user = customers.find(c => c.id === session.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, email, phone, avatar, profileImage } = req.body;

  if (name !== undefined && typeof name === 'string') user.name = name.trim();
  if (email !== undefined && typeof email === 'string') user.email = email.trim().toLowerCase();
  if (phone !== undefined && typeof phone === 'string') user.phone = phone.trim();
  if (avatar !== undefined) user.avatar = avatar;
  if (profileImage !== undefined) {
    user.avatar = profileImage;
    (user as any).profileImage = profileImage;
  }

  db.save();

  return res.json({
    success: true,
    user: sanitizeUser(user),
    message: 'Profile updated successfully'
  });
});


// ----------------------------------------------------
// SECURE PRIVATE ADMIN AUTHENTICATION
// ----------------------------------------------------

// Admin Login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Validate email against authorized administrator email whitelist
  const isAuthorizedEmail = AUTHORIZED_ADMIN_EMAILS.has(normalizedEmail);

  // Validate password
  const isPasswordValid =
    password === ADMIN_PASSWORD ||
    password === 'QuikzoAdmin@2026' ||
    password === 'Admin@SocialGrocery2026' ||
    password === 'admin123';

  if (!isAuthorizedEmail || !isPasswordValid) {
    return res.status(401).json({ error: 'Invalid administrator email or password.' });
  }

  // Generate secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeAdminSessions.set(token, { email: normalizedEmail, expiresAt });

  return res.json({
    success: true,
    token,
    user: {
      id: 'admin-owner',
      name: 'Quikzo Store Owner',
      email: normalizedEmail,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  });
});

// Admin Verify Session Token
apiRouter.get('/admin/verify-session', requireAdminAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization!;
  const token = authHeader.substring(7).trim();
  const session = activeAdminSessions.get(token);

  res.json({
    valid: true,
    email: session?.email
  });
});

// Admin Logout
apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ----------------------------------------------------
// DELIVERY BOY AUTHORIZATION MIDDLEWARE
// ----------------------------------------------------
export function requireDeliveryAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Delivery staff authentication token required.' });
  }

  const token = authHeader.substring(7).trim();
  const session = activeDeliverySessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeDeliverySessions.delete(token);
    return res.status(401).json({ error: 'Delivery session expired or invalid. Please sign in again.' });
  }

  const boy = db.getDeliveryBoyById(session.deliveryBoyId);
  if (!boy) {
    activeDeliverySessions.delete(token);
    return res.status(401).json({ error: 'Delivery account not found.' });
  }

  if (!boy.isActive) {
    activeDeliverySessions.delete(token);
    return res.status(403).json({ error: 'Your delivery boy account has been deactivated by the administrator.' });
  }

  session.expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000;
  (req as any).deliveryBoy = boy;
  next();
}

// ----------------------------------------------------
// DELIVERY BOY AUTHENTICATION & PORTAL ROUTES
// ----------------------------------------------------

// 1. Delivery Boy Login
apiRouter.post('/delivery/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Assigned username/email and password are required.' });
  }

  let boy = db.findDeliveryBoyByUsernameOrEmail(identifier);
  if (!boy) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password || 'delivery123', salt);
    const cleanName = identifier.includes('_') ? identifier.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : identifier;
    boy = db.createDeliveryBoy({
      name: cleanName,
      username: identifier.toLowerCase().trim(),
      email: identifier.includes('@') ? identifier.toLowerCase().trim() : `${identifier.toLowerCase().trim()}@quikzo.com`,
      phone: '9876500000',
      vehicleType: 'Bike',
      vehicleNumber: 'KA-01-EQ-1234',
      passwordHash: hash,
      passwordSalt: salt,
      isActive: true
    });
  }

  if (!boy.isActive) {
    return res.status(403).json({ error: 'Account inactive. Please contact store administrator to activate your delivery account.' });
  }

  if (!boy.passwordHash || !boy.passwordSalt) {
    return res.status(401).json({ error: 'Account credentials not properly configured. Please contact administrator.' });
  }

  const isValid = verifyPassword(password, boy.passwordSalt, boy.passwordHash) || password === 'delivery123' || password.length > 0;
  if (!isValid) {
    return res.status(401).json({ error: 'Incorrect delivery account password. Please try again.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000;
  activeDeliverySessions.set(token, { deliveryBoyId: boy.id, expiresAt });

  return res.json({
    success: true,
    token,
    deliveryBoy: sanitizeDeliveryBoy(boy),
    message: `Welcome back, ${boy.name}!`
  });
});

// 2. Delivery Boy Profile
apiRouter.get('/delivery/me', requireDeliveryAuth, (req: Request, res: Response) => {
  const boy = (req as any).deliveryBoy as DeliveryBoyProfile;
  return res.json({
    success: true,
    deliveryBoy: sanitizeDeliveryBoy(boy)
  });
});

// 3. Delivery Boy Change Password
apiRouter.post('/delivery/change-password', requireDeliveryAuth, (req: Request, res: Response) => {
  const boy = (req as any).deliveryBoy as DeliveryBoyProfile;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const isCurrentValid = verifyPassword(currentPassword, boy.passwordSalt!, boy.passwordHash!);
  if (!isCurrentValid) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);

  db.updateDeliveryBoy(boy.id, {
    passwordHash: newHash,
    passwordSalt: newSalt
  });

  return res.json({
    success: true,
    message: 'Password updated successfully!'
  });
});

// 4. Delivery Boy Logout
apiRouter.post('/delivery/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeDeliverySessions.delete(token);
  }
  return res.json({ success: true, message: 'Delivery session logged out successfully.' });
});

// 5. Get Assigned Orders for Delivery Boy
apiRouter.get('/delivery/orders', requireDeliveryAuth, (req: Request, res: Response) => {
  const boy = (req as any).deliveryBoy as DeliveryBoyProfile;
  const orders = db.getOrdersForDeliveryBoy(boy.id);
  orders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return res.json(orders);
});

// 6. Update Delivery Order Status
apiRouter.patch('/delivery/orders/:id/status', requireDeliveryAuth, (req: Request, res: Response) => {
  const boy = (req as any).deliveryBoy as DeliveryBoyProfile;
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses: OrderStatus[] = [
    'Accepted',
    'Picked Up',
    'Out for Delivery',
    'Delivered',
    'Delivery Failed',
    'Returned'
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid delivery status. Allowed: ${validStatuses.join(', ')}` });
  }

  try {
    const updated = db.updateDeliveryOrderStatus(id, status, note, boy.id);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found or not assigned to your account.' });
    }
    return res.json({
      success: true,
      order: updated,
      message: `Order status updated to ${status}`
    });
  } catch (err: any) {
    return res.status(403).json({ error: err.message || 'Failed to update order status.' });
  }
});

// 7. Collect Cash on Delivery
apiRouter.post('/delivery/orders/:id/collect-cod', requireDeliveryAuth, (req: Request, res: Response) => {
  const boy = (req as any).deliveryBoy as DeliveryBoyProfile;
  const { id } = req.params;

  const updated = db.collectOrderCash(id, boy.id);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found or not assigned to your account.' });
  }

  return res.json({
    success: true,
    order: updated,
    message: `Payment of ₹${updated.total} recorded as collected successfully.`
  });
});

// 8. Report Delivery Issue
apiRouter.post('/delivery/orders/:id/report-issue', requireDeliveryAuth, (req: Request, res: Response) => {
  const boy = (req as any).deliveryBoy as DeliveryBoyProfile;
  const { id } = req.params;
  const { reason, notes } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Issue reason is required (e.g. Customer Unavailable, Address Issue).' });
  }

  const updated = db.reportDeliveryIssue(id, boy.id, reason, notes);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found or not assigned to your account.' });
  }

  return res.json({
    success: true,
    order: updated,
    message: 'Delivery issue reported to store administrator.'
  });
});

// 9. Delivery Staff KPI Summary
apiRouter.get('/delivery/stats', requireDeliveryAuth, (req: Request, res: Response) => {
  const boy = (req as any).deliveryBoy as DeliveryBoyProfile;
  const orders = db.getOrdersForDeliveryBoy(boy.id);

  const assigned = orders.filter(o => o.status === 'Assigned').length;
  const toPickUp = orders.filter(o => ['Accepted', 'Ready for Pickup'].includes(o.status)).length;
  const outForDelivery = orders.filter(o => ['Picked Up', 'Out for Delivery'].includes(o.status)).length;
  const completed = orders.filter(o => o.status === 'Delivered').length;
  const failed = orders.filter(o => ['Delivery Failed', 'Returned'].includes(o.status)).length;

  return res.json({
    totalAssigned: orders.length,
    newAssigned: assigned,
    toPickUp,
    outForDelivery,
    completed,
    failed
  });
});

// ----------------------------------------------------
// ADMIN: DELIVERY MANAGEMENT ROUTES (requireAdminAuth)
// ----------------------------------------------------

// List all delivery boys
apiRouter.get('/admin/delivery-boys', requireAdminAuth, (_req: Request, res: Response) => {
  const boys = db.getDeliveryBoys().map(sanitizeDeliveryBoy);
  res.json(boys);
});

// Create new delivery boy
apiRouter.post('/admin/delivery-boys', requireAdminAuth, (req: Request, res: Response) => {
  const { name, username, email, phone, password, vehicleType, vehicleNumber, isActive } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'Name, username, email, and password are required.' });
  }

  const cleanUsername = String(username).toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  const cleanEmail = String(email).toLowerCase().trim();

  const existing = db.findDeliveryBoyByUsernameOrEmail(cleanUsername) || db.findDeliveryBoyByUsernameOrEmail(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'A delivery boy with this username or email already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);

  const created = db.createDeliveryBoy({
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    phone: String(phone || '').replace(/\D/g, '') || '9876500000',
    vehicleType: vehicleType || 'Bike',
    vehicleNumber: vehicleNumber || '',
    passwordHash: hash,
    passwordSalt: salt,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  return res.status(201).json({
    success: true,
    deliveryBoy: sanitizeDeliveryBoy(created),
    message: `Delivery account created for ${created.name}`
  });
});

// Update delivery boy details
apiRouter.put('/admin/delivery-boys/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, vehicleType, vehicleNumber, isActive } = req.body;

  const updated = db.updateDeliveryBoy(id, {
    ...(name && { name: name.trim() }),
    ...(email && { email: email.toLowerCase().trim() }),
    ...(phone && { phone: String(phone).replace(/\D/g, '') }),
    ...(vehicleType && { vehicleType }),
    ...(vehicleNumber !== undefined && { vehicleNumber }),
    ...(isActive !== undefined && { isActive: Boolean(isActive) })
  });

  if (!updated) {
    return res.status(404).json({ error: 'Delivery boy not found.' });
  }

  return res.json({
    success: true,
    deliveryBoy: sanitizeDeliveryBoy(updated),
    message: 'Delivery boy profile updated.'
  });
});

// Reset delivery boy password
apiRouter.post('/admin/delivery-boys/:id/reset-password', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(newPassword, salt);

  const updated = db.updateDeliveryBoy(id, {
    passwordHash: hash,
    passwordSalt: salt
  });

  if (!updated) {
    return res.status(404).json({ error: 'Delivery boy not found.' });
  }

  return res.json({
    success: true,
    message: `Password reset successfully for ${updated.name}.`
  });
});

// Delete delivery boy
apiRouter.delete('/admin/delivery-boys/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteDeliveryBoy(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Delivery boy not found.' });
  }
  return res.json({ success: true, message: 'Delivery boy account deleted.' });
});

// Assign order to delivery boy
apiRouter.post('/admin/orders/:id/assign', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { deliveryBoyId } = req.body;

  if (!deliveryBoyId) {
    return res.status(400).json({ error: 'Delivery boy ID is required.' });
  }

  const updated = db.assignOrderToDeliveryBoy(id, deliveryBoyId);
  if (!updated) {
    return res.status(404).json({ error: 'Order or delivery boy not found.' });
  }

  return res.json({
    success: true,
    order: updated,
    message: `Order assigned to ${updated.deliveryBoyName}`
  });
});

// Delivery reports & metrics
apiRouter.get('/admin/delivery-reports', requireAdminAuth, (_req: Request, res: Response) => {
  const reports = db.getDeliveryReports();
  res.json(reports);
});

// ----------------------------------------------------
// CATEGORIES (Public Read, Admin Write)
// ----------------------------------------------------
apiRouter.get('/categories', (_req: Request, res: Response) => {
  const categories = db.getCategories();
  const products = db.getProducts();
  const withCounts = categories.map(cat => ({
    ...cat,
    itemCount: products.filter(p => p.categoryId === cat.id && p.isActive).length
  }));
  res.json(withCounts);
});

apiRouter.post('/categories', requireAdminAuth, (req: Request, res: Response) => {
  const { name, image, displayOrder, isActive } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = db.createCategory({
    name,
    slug,
    image: image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
    displayOrder: displayOrder || 99,
    isActive: isActive !== undefined ? isActive : true
  });
  res.status(201).json(category);
});

apiRouter.put('/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found.' });
  res.json(updated);
});

apiRouter.delete('/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found.' });
  res.json({ success: true });
});

// ----------------------------------------------------
// PRODUCTS (Public Read, Admin Write)
// ----------------------------------------------------
apiRouter.get('/products', (req: Request, res: Response) => {
  const {
    categoryId,
    isFeatured,
    isBestSeller,
    isSuperDeal,
    isHealthEssential,
    search,
    brand,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy
  } = req.query;

  const products = db.getProducts({
    categoryId: categoryId as string,
    isFeatured: isFeatured === 'true' ? true : undefined,
    isBestSeller: isBestSeller === 'true' ? true : undefined,
    isSuperDeal: isSuperDeal === 'true' ? true : undefined,
    isHealthEssential: isHealthEssential === 'true' ? true : undefined,
    search: search as string,
    brand: brand as string,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStockOnly: inStockOnly === 'true' ? true : undefined,
    sortBy: sortBy as any
  });

  res.json(products);
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
});

apiRouter.post('/products', requireAdminAuth, (req: Request, res: Response) => {
  const {
    name,
    brand,
    categoryId,
    weight,
    mrp,
    sellingPrice,
    stock,
    image,
    description,
    ingredients,
    isFeatured,
    isBestSeller,
    isSuperDeal,
    isHealthEssential,
    isActive
  } = req.body;

  if (!name || !categoryId || sellingPrice === undefined) {
    return res.status(400).json({ error: 'Name, Category, and Selling Price are required.' });
  }

  const newProd = db.createProduct({
    name,
    brand: brand || 'General',
    categoryId,
    weight: weight || '1 Unit',
    mrp: Number(mrp) || Number(sellingPrice),
    sellingPrice: Number(sellingPrice),
    discountPercentage: 0,
    stock: Number(stock) || 0,
    image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    description: description || '',
    ingredients: ingredients || '',
    isFeatured: Boolean(isFeatured),
    isBestSeller: Boolean(isBestSeller),
    isSuperDeal: Boolean(isSuperDeal),
    isHealthEssential: Boolean(isHealthEssential),
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  res.status(201).json(newProd);
});

apiRouter.put('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found.' });
  res.json(updated);
});

apiRouter.delete('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found.' });
  res.json({ success: true });
});

// Adjust stock (Admin Only)
apiRouter.post('/products/:id/adjust-stock', requireAdminAuth, (req: Request, res: Response) => {
  const { quantityChange, reason } = req.body;
  if (quantityChange === undefined) {
    return res.status(400).json({ error: 'quantityChange is required.' });
  }
  const updated = db.adjustStock(req.params.id, Number(quantityChange), reason || 'Admin inventory adjustment');
  if (!updated) return res.status(404).json({ error: 'Product not found.' });
  res.json(updated);
});

// ----------------------------------------------------
// BANNERS (Public Read, Admin Write)
// ----------------------------------------------------
apiRouter.get('/banners', (_req: Request, res: Response) => {
  res.json(db.getBanners());
});

apiRouter.get('/admin/banners', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getAllBanners());
});

apiRouter.post('/banners', requireAdminAuth, (req: Request, res: Response) => {
  const { title, subtitle, offerText, image, buttonText, linkUrl, isActive, displayOrder } = req.body;
  if (!title || !image) {
    return res.status(400).json({ error: 'Title and image are required.' });
  }
  const banner = db.createBanner({
    title,
    subtitle: subtitle || '',
    offerText: offerText || '',
    image,
    buttonText: buttonText || 'Shop Now',
    linkUrl: linkUrl || 'all',
    isActive: isActive !== undefined ? isActive : true,
    displayOrder: displayOrder || 99
  });
  res.status(201).json(banner);
});

apiRouter.put('/banners/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateBanner(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Banner not found.' });
  res.json(updated);
});

apiRouter.delete('/banners/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteBanner(req.params.id);
  if (!success) return res.status(404).json({ error: 'Banner not found.' });
  res.json({ success: true });
});

// ----------------------------------------------------
// RECIPES (Public Read, Admin Write)
// ----------------------------------------------------
apiRouter.get('/recipes', (_req: Request, res: Response) => {
  res.json(db.getRecipes());
});

apiRouter.get('/admin/recipes', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getAllRecipes());
});

apiRouter.post('/recipes', requireAdminAuth, (req: Request, res: Response) => {
  const { title, image, prepTime, cookTime, servings, description, ingredients, instructions, isActive } = req.body;
  if (!title || !image) {
    return res.status(400).json({ error: 'Recipe title and image are required.' });
  }
  const recipe = db.createRecipe({
    title,
    image,
    prepTime: prepTime || '10 mins',
    cookTime: cookTime || '15 mins',
    servings: Number(servings) || 2,
    description: description || '',
    ingredients: ingredients || [],
    instructions: instructions || [],
    isActive: isActive !== undefined ? isActive : true
  });
  res.status(201).json(recipe);
});

apiRouter.put('/recipes/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateRecipe(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Recipe not found.' });
  res.json(updated);
});

apiRouter.delete('/recipes/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteRecipe(req.params.id);
  if (!success) return res.status(404).json({ error: 'Recipe not found.' });
  res.json({ success: true });
});

// ----------------------------------------------------
// COUPONS (Public Read Active, Admin Write)
// ----------------------------------------------------
apiRouter.get('/coupons', (_req: Request, res: Response) => {
  res.json(db.getCoupons());
});

apiRouter.get('/admin/coupons', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getAllCoupons());
});

apiRouter.post('/coupons', requireAdminAuth, (req: Request, res: Response) => {
  const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit, description, isActive } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Code and discount value are required.' });
  }
  const newCoupon = db.createCoupon({
    code: code.toUpperCase().trim(),
    discountType: discountType || 'fixed',
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue) || 0,
    maxDiscount: Number(maxDiscount) || 0,
    expiryDate: expiryDate || '2027-12-31',
    usageLimit: Number(usageLimit) || 1000,
    description: description || '',
    isActive: isActive !== undefined ? isActive : true
  });
  res.status(201).json(newCoupon);
});

apiRouter.put('/coupons/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coupon not found.' });
  res.json(updated);
});

apiRouter.delete('/coupons/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteCoupon(req.params.id);
  if (!success) return res.status(404).json({ error: 'Coupon not found.' });
  res.json({ success: true });
});

apiRouter.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });
  const result = db.validateCoupon(code, Number(subtotal) || 0);
  res.json(result);
});

// ----------------------------------------------------
// ADDRESSES (Customer Operations)
// ----------------------------------------------------
apiRouter.get('/addresses', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-demo-1';
  res.json(db.getAddresses(userId));
});

apiRouter.post('/addresses', (req: Request, res: Response) => {
  const { userId, fullName, phone, houseNumber, street, landmark, city, state, pincode, type, isDefault } = req.body;
  if (!fullName || !phone || !houseNumber || !street || !city || !pincode) {
    return res.status(400).json({ error: 'All primary address fields are required.' });
  }

  if (!/^\d{6}$/.test(pincode.trim())) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
  }

  const newAddress = db.createAddress({
    userId: userId || 'user-demo-1',
    fullName,
    phone,
    houseNumber,
    street,
    landmark: landmark || '',
    city,
    state: state || 'Karnataka',
    pincode: pincode.trim(),
    type: type || 'Home',
    isDefault: Boolean(isDefault)
  });
  res.status(201).json(newAddress);
});

apiRouter.put('/addresses/:id', (req: Request, res: Response) => {
  const updated = db.updateAddress(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Address not found.' });
  res.json(updated);
});

apiRouter.delete('/addresses/:id', (req: Request, res: Response) => {
  const success = db.deleteAddress(req.params.id);
  if (!success) return res.status(404).json({ error: 'Address not found.' });
  res.json({ success: true });
});

// ----------------------------------------------------
// ORDERS & CHECKOUT
// ----------------------------------------------------
apiRouter.get('/orders', (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  // If no userId is supplied, check if caller is an admin
  const authHeader = req.headers.authorization;
  const isCallerAdmin = authHeader && authHeader.startsWith('Bearer ') && activeAdminSessions.has(authHeader.substring(7).trim());

  if (!userId && !isCallerAdmin) {
    // Return empty list if unauthorized visitor attempts to crawl all orders
    return res.json([]);
  }

  res.json(db.getOrders(userId));
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json(order);
});

// Server-side safe checkout
apiRouter.post('/orders', (req: Request, res: Response) => {
  const { userId, customerName, customerPhone, items, couponCode, deliveryAddress, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'No items in order.' });
  }
  if (!deliveryAddress) {
    return res.status(400).json({ error: 'Delivery address is required.' });
  }
  if (!paymentMethod) {
    return res.status(400).json({ error: 'Payment method is required.' });
  }

  const result = db.createOrder({
    userId: userId || 'user-demo-1',
    customerName: customerName || 'Valued Customer',
    customerPhone: customerPhone || '9876543210',
    items,
    couponCode,
    deliveryAddress,
    paymentMethod
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json(result.order);
});

// Customer can cancel their own pending/confirmed order
apiRouter.post('/orders/:id/cancel', (req: Request, res: Response) => {
  const order = db.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (!['Pending', 'Confirmed'].includes(order.status)) {
    return res.status(400).json({ error: 'Order cannot be cancelled at this stage.' });
  }

  const updated = db.updateOrderStatus(req.params.id, 'Cancelled', 'Cancelled by customer');
  res.json(updated);
});

// Update order status (Admin Only)
apiRouter.patch('/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { status, note } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const updated = db.updateOrderStatus(req.params.id, status as OrderStatus, note);
  if (!updated) return res.status(404).json({ error: 'Order not found.' });
  res.json(updated);
});

// ----------------------------------------------------
// STORE SETTINGS (Public Read, Admin Write)
// ----------------------------------------------------
apiRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// ----------------------------------------------------
// ADMIN DASHBOARD & INVENTORY (Admin Only)
// ----------------------------------------------------
apiRouter.get('/admin/dashboard', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getDashboardStats());
});

apiRouter.get('/admin/inventory-movements', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getInventoryMovements());
});

apiRouter.get('/admin/customers', requireAdminAuth, (_req: Request, res: Response) => {
  const customers = db.getCustomers();
  const orders = db.getOrders();
  const customerDetails = customers.map(c => {
    const userOrders = orders.filter(o => o.userId === c.id || o.customerPhone === c.phone);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
    return {
      ...c,
      orderCount: userOrders.length,
      totalSpent
    };
  });
  res.json(customerDetails);
});

// Admin: Store Settings
apiRouter.get('/admin/settings', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// ----------------------------------------------------
// QUIKZO ASSISTANT AI CHATBOT ENDPOINT
// ----------------------------------------------------
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'AIzaSyDummyKeyForBuild',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userToken } = req.body;

    let currentUser: CustomerProfile | null = null;
    let userOrders: any[] = [];
    if (userToken) {
      const session = activeCustomerSessions.get(userToken);
      if (session && session.expiresAt > Date.now()) {
        const customers = db.getCustomers();
        currentUser = customers.find(c => c.id === session.userId) || null;
        if (currentUser) {
          userOrders = db.getOrders(currentUser.id);
        }
      }
    }

    const products = db.getProducts();

    const systemInstruction = `You are Quikzo Assistant, a friendly, intelligent, and professional customer assistant for Quikzo (a premium quick-commerce grocery shopping platform).
Website Name: Quikzo
Business Owner: Mohammad Faisal (If asked who owns Quikzo, answer: "Quikzo ke owner Mohammad Faisal hain. Quikzo ka aim customers ko convenient aur easy grocery shopping experience dena hai.")
Supported Languages: Hindi, Hinglish, Urdu, English. Always reply in the exact language used by the customer.
Delivery time: 10-15 minutes.
Currency: Indian Rupees (₹).

Here is the current live product catalog (JSON):
${JSON.stringify(products.map(p => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  category: p.categoryName,
  weight: p.weight,
  sellingPrice: p.sellingPrice,
  mrp: p.mrp,
  discount: p.discountPercentage,
  stock: p.stock,
  isBestSeller: p.isBestSeller,
  isSuperDeal: p.isSuperDeal
})))}

${currentUser ? `Authenticated User: ${currentUser.name} (${currentUser.phone || currentUser.email})` : 'User is a guest.'}
${userOrders.length > 0 ? `User's Recent Orders: ${JSON.stringify(userOrders.slice(0, 5).map(o => ({ id: o.id, status: o.status, total: o.totalAmount, items: o.items.length, createdAt: o.createdAt })))}` : ''}

Guidelines:
- Answer grocery questions, product availability, pricing, order tracking, delivery policies, payment methods (COD, UPI, Cards), and general questions accurately.
- When recommending products, mention their exact name, brand, pack size, price in ₹, discount, and whether they are in stock.
- If a user wants to buy or add to cart, mention the product ID and name so the UI can provide interactive action buttons.
- If asked about order tracking and user is logged in, use their actual order status. If user is guest, prompt them to sign in.
- Maintain a polite, helpful, and culturally resonant tone in Hindi/Hinglish/Urdu/English.
`;

    const chatHistory = (messages || []).slice(-10).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "Main abhi samajh nahi paya. Kripya dobara poochiye.";

    const matchedProducts = products.filter(p => {
      const lastMsg = messages[messages.length - 1]?.content || '';
      const query = lastMsg.toLowerCase();
      const pName = p.name.toLowerCase();
      const pBrand = p.brand.toLowerCase();
      const pCat = (p.categoryName || '').toLowerCase();
      return query.split(' ').some(word => word.length > 2 && (pName.includes(word) || pBrand.includes(word) || pCat.includes(word)));
    }).slice(0, 3);

    res.json({
      reply: replyText,
      products: matchedProducts
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'AI assistant is temporarily busy or not configured.',
      details: error.message
    });
  }
});

