export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  walletBalance?: number;
  cartItems?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string[];
  price: number;
  offerPrice: number;
  images: string[];
  category: string;
  subcategory: string;
  tags: string[];
  quantity: number;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  houseNumber: string;
  floorNumber: string;
  roadNumber: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
  coordinates?: { lat: number; lng: number };
}

export interface OrderItem {
  product: Product;
  quantity: number;
  _id: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  address: Address;
  status: string;
  paymentType: "COD" | "Online";
  isPaid: boolean;
  deliveryStatus: "unassigned" | "assigned" | "picked-up" | "in-transit" | "delivered" | "cancelled";
  deliveryAssignment?: DeliveryAssignment;
  couponCode?: string;
  discountAmount?: number;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryMan {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar: string;
  isActive: boolean;
  totalEarnings: number;
  totalDeliveries: number;
  currentOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAssignment {
  _id: string;
  orderId: string | Order;
  deliveryManId: string | DeliveryMan;
  status: "assigned" | "picked-up" | "in-transit" | "delivered" | "cancelled";
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  image: string;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  unassignedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  totalDeliveryMen: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  onDutyDeliveryMen: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total?: number;
  page?: number;
  limit?: number;
}
