export type Locale = "en" | "am";
export type CurrencyCode = "ETB" | "USD" | "KES" | "AED" | "GBP";
export type UserRole = "customer" | "admin" | "rider";

export type Occasion =
  | "birthday"
  | "romantic"
  | "anniversary"
  | "congratulations"
  | "apology"
  | "just_because"
  | "sympathy"
  | "thank_you"
  | "thinking_of_you"
  | "i_love_you";

export type FlowerType =
  | "roses"
  | "lilies"
  | "tulips"
  | "sunflowers"
  | "mixed"
  | "seasonal";

export type DateType =
  | "birthday"
  | "anniversary"
  | "first_date"
  | "wedding"
  | "graduation"
  | "custom";

export type ReminderOffset = 30 | 14 | 7 | 3 | 1 | 0;

export type InventoryStatus = "in_stock" | "low" | "out";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DeliveryType = "send_now" | "today" | "scheduled";

export type SubscriptionFrequency = "weekly" | "biweekly" | "monthly";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type PaymentProviderId = "telebirr" | "chapa" | "card" | "international";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

export type NotificationType =
  | "important_date"
  | "order_update"
  | "delivery_update"
  | "subscription"
  | "promotional";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  preferredLanguage: Locale;
  favoriteFlowers: FlowerType[];
  favoriteColors: string[];
  typicalBudgetEtb: number;
  avatarUrl?: string;
}

export interface Person {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  emoji: string;
  favoriteFlowers: FlowerType[];
  favoriteColors: string[];
  notes?: string;
  addressId?: string;
  createdAt: string;
}

export interface ImportantDate {
  id: string;
  personId: string;
  userId: string;
  type: DateType;
  customLabel?: string;
  month: number;
  day: number;
  year?: number;
  repeatsAnnually: boolean;
  reminderOffsets: ReminderOffset[];
}

export interface Address {
  id: string;
  userId: string;
  personId?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  placeId?: string;
  instructions?: string;
  isDefault: boolean;
}

export interface Bouquet {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceEtb: number;
  flowerType: FlowerType;
  occasions: Occasion[];
  colors: string[];
  imageUrl: string;
  imageAlt: string;
  availableToday: boolean;
  deliveryMinutesMin: number;
  deliveryMinutesMax: number;
  inventoryStatus: InventoryStatus;
}

export interface FlowerStem {
  id: string;
  name: string;
  stemCount: number;
  unit: "stems" | "bunches";
  color?: string;
}

export interface OrderItem {
  id: string;
  bouquetId: string;
  name: string;
  quantity: number;
  unitPriceEtb: number;
}

export interface Order {
  id: string;
  userId: string;
  personId?: string;
  addressId: string;
  items: OrderItem[];
  message?: string;
  isSurprise: boolean;
  deliveryType: DeliveryType;
  scheduledFor?: string;
  deliveryWindow?: string;
  status: OrderStatus;
  flowersTotalEtb: number;
  deliveryFeeEtb: number;
  totalEtb: number;
  currency: CurrencyCode;
  paymentProvider?: PaymentProviderId;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  riderId?: string;
  status: OrderStatus;
  estimatedArrival?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  confirmationPhotoUrl?: string;
  notes?: string;
}

export interface Rider {
  id: string;
  userId: string;
  firstName: string;
  photoUrl: string;
  isAvailable: boolean;
  vehicleType: "bike" | "scooter" | "car";
}

export interface Subscription {
  id: string;
  userId: string;
  personId: string;
  addressId: string;
  frequency: SubscriptionFrequency;
  budgetEtb: number;
  flowerPreference: FlowerType | "surprise";
  deliveryDay: number;
  surpriseMe: boolean;
  status: SubscriptionStatus;
  nextDeliveryDate: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  importantDates: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  subscriptionReminders: boolean;
  promotional: boolean;
}

export interface PaymentMethod {
  id: string;
  provider: PaymentProviderId;
  label: string;
  last4?: string;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  provider: PaymentProviderId;
  providerRef: string;
  amountEtb: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  createdAt: string;
}

export interface RecommendationReason {
  bouquetId: string;
  headline: string;
  reason: string;
}

export interface RecommendationInput {
  occasion?: Occasion;
  person?: Person;
  budgetEtb?: number;
  query?: string;
  colors?: string[];
  flowerTypes?: FlowerType[];
}

export interface CheckoutDraft {
  bouquetId: string;
  personId?: string;
  addressId?: string;
  message: string;
  deliveryType: DeliveryType;
  scheduledFor?: string;
  deliveryWindow?: string;
  isSurprise: boolean;
  paymentProvider: PaymentProviderId;
}

export const REMINDER_OFFSETS: ReminderOffset[] = [30, 14, 7, 3, 1, 0];

export const DEFAULT_REMINDER_OFFSETS: ReminderOffset[] = [7];

export const OCCASIONS: Occasion[] = [
  "just_because",
  "i_love_you",
  "apology",
  "birthday",
  "anniversary",
  "congratulations",
  "thinking_of_you",
];

export const SHOP_OCCASIONS: Occasion[] = [
  "birthday",
  "romantic",
  "anniversary",
  "congratulations",
  "apology",
  "just_because",
  "sympathy",
  "thank_you",
];

export const FLOWER_TYPES: FlowerType[] = [
  "roses",
  "lilies",
  "tulips",
  "sunflowers",
  "mixed",
  "seasonal",
];

export const DATE_TYPES: DateType[] = [
  "birthday",
  "anniversary",
  "first_date",
  "wedding",
  "graduation",
  "custom",
];

export const PRICE_BANDS = [
  { id: "under_1000", min: 0, max: 999 },
  { id: "1000_1500", min: 1000, max: 1500 },
  { id: "1500_2500", min: 1500, max: 2500 },
  { id: "2500_5000", min: 2500, max: 5000 },
  { id: "premium", min: 5001, max: Number.POSITIVE_INFINITY },
] as const;

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
