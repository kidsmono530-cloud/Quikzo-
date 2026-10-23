export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName?: string;
  weight: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  stock: number;
  image: string;
  additionalImages?: string[];
  description: string;
  ingredients?: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  isSuperDeal?: boolean;
  isHealthEssential?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  offerText: string;
  image: string;
  buttonText: string;
  linkUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  weight: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  itemTotal: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Assigned'
  | 'Accepted'
  | 'Packed'
  | 'Ready for Pickup'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Delivery Failed'
  | 'Returned'
  | 'Cancelled';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'Cash on Delivery' | 'Online Payment';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  deliveryAddress: Address;
  couponCode?: string;
  estimatedDelivery: string;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  assignedAt?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  deliveryInstructions?: string;
  deliveryIssue?: {
    reason: string;
    notes?: string;
    reportedAt: string;
  };
  codCollectedAt?: string;
  codCollectedBy?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryBoyProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  vehicleType?: 'Bike' | 'Scooter' | 'Electric Vehicle' | 'Bicycle' | 'Other';
  vehicleNumber?: string;
  passwordHash?: string;
  passwordSalt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  description: string;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  supportPhone: string;
  supportEmail: string;
  currencySymbol: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  taxPercentage: number;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  storeOpen: boolean;
  estimatedDeliveryMinutes: string;
  serviceablePincodes: string[];
  donationPaymentLink: string;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  description: string;
  ingredients: {
    name: string;
    quantity: string;
    productId?: string;
  }[];
  instructions: string[];
  isActive: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'order_deduct' | 'order_cancel_restore' | 'admin_restock' | 'admin_adjustment';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  phone: string;
  name: string;
  email?: string;
  passwordHash?: string;
  passwordSalt?: string;
  resetToken?: string;
  resetTokenExpiresAt?: number;
  avatar?: string;
  profileImage?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
}
