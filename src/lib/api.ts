import {
  Category,
  Product,
  Banner,
  Address,
  Order,
  Coupon,
  StoreSettings,
  Recipe,
  InventoryMovement,
  CustomerProfile,
  DeliveryBoyProfile,
  OrderStatus
} from '../types';

const API_BASE = '/api';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('social_grocery_admin_token');
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('social_grocery_admin_token', token);
    } else {
      localStorage.removeItem('social_grocery_admin_token');
    }
  } catch {}
}

function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  if (token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ----------------------------------------------------
// CATEGORIES
// ----------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  return handleResponse<Category[]>(res);
}

export async function createCategory(cat: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cat)
  });
  return handleResponse<Category>(res);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse<Category>(res);
}

export async function deleteCategory(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse<{ success: boolean }>(res);
}

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------
export async function getProducts(params?: {
  categoryId?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isSuperDeal?: boolean;
  isHealthEssential?: boolean;
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: string;
}): Promise<Product[]> {
  const url = new URL(`${window.location.origin}${API_BASE}/products`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        url.searchParams.append(k, String(v));
      }
    });
  }
  const res = await fetch(url.toString());
  return handleResponse<Product[]>(res);
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  return handleResponse<Product>(res);
}

export async function createProduct(prod: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(prod)
  });
  return handleResponse<Product>(res);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse<Product>(res);
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse<{ success: boolean }>(res);
}

export async function adjustStock(productId: string, quantityChange: number, reason: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${productId}/adjust-stock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantityChange, reason })
  });
  return handleResponse<Product>(res);
}

// ----------------------------------------------------
// BANNERS
// ----------------------------------------------------
export async function getBanners(): Promise<Banner[]> {
  const res = await fetch(`${API_BASE}/banners`);
  return handleResponse<Banner[]>(res);
}

export async function getAllBanners(): Promise<Banner[]> {
  const res = await fetch(`${API_BASE}/admin/banners`, {
    headers: getAuthHeaders()
  });
  return handleResponse<Banner[]>(res);
}

export async function createBanner(banner: Partial<Banner>): Promise<Banner> {
  const res = await fetch(`${API_BASE}/banners`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(banner)
  });
  return handleResponse<Banner>(res);
}

export async function updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
  const res = await fetch(`${API_BASE}/banners/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse<Banner>(res);
}

export async function deleteBanner(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/banners/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse<{ success: boolean }>(res);
}

// ----------------------------------------------------
// RECIPES
// ----------------------------------------------------
export async function getRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${API_BASE}/recipes`);
  return handleResponse<Recipe[]>(res);
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${API_BASE}/admin/recipes`, {
    headers: getAuthHeaders()
  });
  return handleResponse<Recipe[]>(res);
}

export async function createRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(recipe)
  });
  return handleResponse<Recipe>(res);
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse<Recipe>(res);
}

export async function deleteRecipe(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse<{ success: boolean }>(res);
}

// ----------------------------------------------------
// COUPONS
// ----------------------------------------------------
export async function getCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE}/coupons`);
  return handleResponse<Coupon[]>(res);
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE}/admin/coupons`, {
    headers: getAuthHeaders()
  });
  return handleResponse<Coupon[]>(res);
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal })
  });
  return handleResponse(res);
}

export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const res = await fetch(`${API_BASE}/coupons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(coupon)
  });
  return handleResponse<Coupon>(res);
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
  const res = await fetch(`${API_BASE}/coupons/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse<Coupon>(res);
}

export async function deleteCoupon(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/coupons/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse<{ success: boolean }>(res);
}

// ----------------------------------------------------
// ADDRESSES
// ----------------------------------------------------
export async function getAddresses(userId: string): Promise<Address[]> {
  const res = await fetch(`${API_BASE}/addresses?userId=${encodeURIComponent(userId)}`);
  return handleResponse<Address[]>(res);
}

export async function createAddress(addr: Partial<Address>): Promise<Address> {
  const res = await fetch(`${API_BASE}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addr)
  });
  return handleResponse<Address>(res);
}

export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
  const res = await fetch(`${API_BASE}/addresses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return handleResponse<Address>(res);
}

export async function deleteAddress(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/addresses/${id}`, { method: 'DELETE' });
  return handleResponse<{ success: boolean }>(res);
}

// ----------------------------------------------------
// ORDERS
// ----------------------------------------------------
export async function getOrders(userId?: string): Promise<Order[]> {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = userId ? `${API_BASE}/orders?userId=${encodeURIComponent(userId)}` : `${API_BASE}/orders`;
  const res = await fetch(url, { headers });
  return handleResponse<Order[]>(res);
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  return handleResponse<Order>(res);
}

export async function createOrder(payload: {
  userId: string;
  customerName: string;
  customerPhone: string;
  items: { productId: string; quantity: number }[];
  couponCode?: string;
  deliveryAddress: Address;
  paymentMethod: 'Cash on Delivery' | 'Online Payment';
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<Order>(res);
}

// Customer cancels own order
export async function cancelOrder(orderId: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return handleResponse<Order>(res);
}

// Admin updates order status
export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, note })
  });
  return handleResponse<Order>(res);
}

// ----------------------------------------------------
// STORE SETTINGS
// ----------------------------------------------------
export async function getSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  return handleResponse<StoreSettings>(res);
}

export async function updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });
  return handleResponse<StoreSettings>(res);
}

// ----------------------------------------------------
// ADMIN DASHBOARD & INVENTORY
// ----------------------------------------------------
export async function getAdminDashboard(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: getAuthHeaders()
  });
  return handleResponse<any>(res);
}

export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  const res = await fetch(`${API_BASE}/admin/inventory-movements`, {
    headers: getAuthHeaders()
  });
  return handleResponse<InventoryMovement[]>(res);
}

export async function getAdminCustomers(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/customers`, {
    headers: getAuthHeaders()
  });
  return handleResponse<any[]>(res);
}

// ----------------------------------------------------
// AUTHENTICATION (CUSTOMER & ADMIN)
// ----------------------------------------------------

export function getCustomerToken(): string | null {
  try {
    const token = localStorage.getItem('quikzo_customer_token');
    if (token) return token;
    // Fallback for default demo account user-demo-1
    const storedUser = localStorage.getItem('quikzo_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.id === 'user-demo-1') {
        localStorage.setItem('quikzo_customer_token', 'demo_customer_token_quikzo_123');
        return 'demo_customer_token_quikzo_123';
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function setCustomerToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('quikzo_customer_token', token);
    } else {
      localStorage.removeItem('quikzo_customer_token');
    }
  } catch {}
}

export async function loginWithEmail(email: string, password: string): Promise<{ success: boolean; token: string; user: CustomerProfile; message?: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse<{ success: boolean; token: string; user: CustomerProfile; message?: string }>(res);
  if (data.token) {
    setCustomerToken(data.token);
  }
  return data;
}

export async function registerWithEmail(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ success: boolean; token: string; user: CustomerProfile; message?: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await handleResponse<{ success: boolean; token: string; user: CustomerProfile; message?: string }>(res);
  if (data.token) {
    setCustomerToken(data.token);
  }
  return data;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string; debugResetCode?: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(res);
}

export async function resetPassword(payload: {
  email: string;
  resetCode: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string; debugOtp?: string; resendAvailableInSeconds?: number }> {
  const res = await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  return handleResponse(res);
}

export async function verifyOtp(phone: string, otp: string, name?: string): Promise<{ success: boolean; token: string; user: CustomerProfile }> {
  const res = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp, name })
  });
  const data = await handleResponse<{ success: boolean; token: string; user: CustomerProfile }>(res);
  if (data.token) {
    setCustomerToken(data.token);
  }
  return data;
}

export async function getCurrentUser(): Promise<CustomerProfile | null> {
  const token = getCustomerToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      setCustomerToken(null);
      return null;
    }
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function customerLogout(): Promise<void> {
  const token = getCustomerToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch {}
  }
  setCustomerToken(null);
}

export async function updateCustomerProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  profileImage?: string;
}): Promise<{ success: boolean; user: CustomerProfile }> {
  const token = getCustomerToken();
  if (!token) {
    const err: any = new Error('Please sign in to upload your profile photo.');
    err.code = 'NOT_AUTHENTICATED';
    throw err;
  }
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err: any = new Error(data.error || 'Failed to update profile');
    if (res.status === 401) {
      err.code = 'NOT_AUTHENTICATED';
    }
    throw err;
  }
  return res.json();
}


// Secure Private Admin Auth
export async function adminLogin(email: string, password: string): Promise<{ success: boolean; token: string; user: CustomerProfile }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse<{ success: boolean; token: string; user: CustomerProfile }>(res);
  if (data.token) {
    setAdminToken(data.token);
  }
  return data;
}

export async function verifyAdminSession(): Promise<{ valid: boolean; email?: string }> {
  const token = getAdminToken();
  if (!token) return { valid: false };

  try {
    const res = await fetch(`${API_BASE}/admin/verify-session`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      setAdminToken(null);
      return { valid: false };
    }
    return res.json();
  } catch {
    setAdminToken(null);
    return { valid: false };
  }
}

export async function adminLogout(): Promise<void> {
  const token = getAdminToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch {}
  }
  setAdminToken(null);
}

// ----------------------------------------------------
// DELIVERY BOY API METHODS
// ----------------------------------------------------

export function getDeliveryToken(): string | null {
  try {
    return localStorage.getItem('quikzo_delivery_token');
  } catch {
    return null;
  }
}

export function setDeliveryToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('quikzo_delivery_token', token);
    } else {
      localStorage.removeItem('quikzo_delivery_token');
    }
  } catch {}
}

function getDeliveryAuthHeaders() {
  const token = getDeliveryToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function deliveryLogin(
  identifier: string,
  password: string
): Promise<{ success: boolean; token: string; deliveryBoy: DeliveryBoyProfile }> {
  const res = await fetch(`${API_BASE}/delivery/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await handleResponse<{ success: boolean; token: string; deliveryBoy: DeliveryBoyProfile }>(res);
  if (data.token) {
    setDeliveryToken(data.token);
  }
  return data;
}

export async function getCurrentDeliveryBoy(): Promise<DeliveryBoyProfile | null> {
  const token = getDeliveryToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/delivery/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setDeliveryToken(null);
      return null;
    }
    const data = await res.json();
    return data.deliveryBoy || null;
  } catch {
    return null;
  }
}

export async function verifyDeliverySession(): Promise<{ valid: boolean; deliveryBoy?: DeliveryBoyProfile }> {
  const boy = await getCurrentDeliveryBoy();
  return { valid: Boolean(boy), deliveryBoy: boy || undefined };
}

export async function deliveryLogout(): Promise<void> {
  const token = getDeliveryToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/delivery/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
  }
  setDeliveryToken(null);
}

export async function changeDeliveryPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/delivery/change-password`, {
    method: 'POST',
    headers: getDeliveryAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return handleResponse(res);
}

export async function getAssignedDeliveryOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/delivery/orders`, {
    headers: getDeliveryAuthHeaders()
  });
  return handleResponse<Order[]>(res);
}

export async function updateDeliveryOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getDeliveryAuthHeaders(),
    body: JSON.stringify({ status, note })
  });
  return handleResponse(res);
}

export async function collectDeliveryCash(
  orderId: string
): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/collect-cod`, {
    method: 'POST',
    headers: getDeliveryAuthHeaders()
  });
  return handleResponse(res);
}

export async function reportDeliveryIssue(
  orderId: string,
  reason: string,
  notes?: string
): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/report-issue`, {
    method: 'POST',
    headers: getDeliveryAuthHeaders(),
    body: JSON.stringify({ reason, notes })
  });
  return handleResponse(res);
}

export async function getDeliveryStaffStats(): Promise<{
  totalAssigned: number;
  newAssigned: number;
  toPickUp: number;
  outForDelivery: number;
  completed: number;
  failed: number;
}> {
  const res = await fetch(`${API_BASE}/delivery/stats`, {
    headers: getDeliveryAuthHeaders()
  });
  return handleResponse(res);
}

// ----------------------------------------------------
// ADMIN: DELIVERY MANAGEMENT API METHODS
// ----------------------------------------------------

export async function adminGetDeliveryBoys(): Promise<DeliveryBoyProfile[]> {
  const res = await fetch(`${API_BASE}/admin/delivery-boys`, {
    headers: getAuthHeaders()
  });
  return handleResponse<DeliveryBoyProfile[]>(res);
}

export async function adminCreateDeliveryBoy(payload: {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  vehicleType?: string;
  vehicleNumber?: string;
  isActive?: boolean;
}): Promise<{ success: boolean; deliveryBoy: DeliveryBoyProfile; message: string }> {
  const res = await fetch(`${API_BASE}/admin/delivery-boys`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function adminUpdateDeliveryBoy(
  id: string,
  payload: Partial<DeliveryBoyProfile>
): Promise<{ success: boolean; deliveryBoy: DeliveryBoyProfile; message: string }> {
  const res = await fetch(`${API_BASE}/admin/delivery-boys/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function adminResetDeliveryBoyPassword(
  id: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/delivery-boys/${id}/reset-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newPassword })
  });
  return handleResponse(res);
}

export async function adminDeleteDeliveryBoy(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/delivery-boys/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function adminAssignOrder(
  orderId: string,
  deliveryBoyId: string
): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ deliveryBoyId })
  });
  return handleResponse(res);
}

export async function adminGetDeliveryReports(): Promise<{
  totalAssigned: number;
  awaitingPickup: number;
  outForDelivery: number;
  successfullyDelivered: number;
  failedDeliveries: number;
  totalCodCollected: number;
  totalBoys: number;
  activeBoys: number;
}> {
  const res = await fetch(`${API_BASE}/admin/delivery-reports`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}
