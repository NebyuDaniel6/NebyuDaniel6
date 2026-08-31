"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, formatISO } from "date-fns";
import {
  ADDRESSES,
  BOUQUETS,
  DELIVERIES,
  DELIVERY_FEE_ETB,
  DEMO_ADMIN,
  DEMO_RIDER_USER,
  DEMO_USER,
  EXTRA_DEMAND_DATES,
  IMPORTANT_DATES,
  INVENTORY,
  NOTIFICATIONS,
  ORDERS,
  PAYMENT_METHODS,
  PEOPLE,
  RIDERS,
  SUBSCRIPTIONS,
} from "./seed";
import type {
  Address,
  AppNotification,
  Bouquet,
  CheckoutDraft,
  Delivery,
  FlowerStem,
  ImportantDate,
  Locale,
  Order,
  OrderStatus,
  PaymentMethod,
  Person,
  ReminderOffset,
  Rider,
  Subscription,
  UserProfile,
  UserRole,
} from "@/domain/types";
import { createPaymentService } from "@/domain/payments";
import { createNotification } from "@/domain/notifications";

const payments = createPaymentService();

export interface AbebaState {
  locale: Locale;
  session: UserProfile | null;
  people: Person[];
  dates: ImportantDate[];
  addresses: Address[];
  bouquets: Bouquet[];
  inventory: FlowerStem[];
  orders: Order[];
  deliveries: Delivery[];
  riders: Rider[];
  subscriptions: Subscription[];
  notifications: AppNotification[];
  paymentMethods: PaymentMethod[];
  demandDates: ImportantDate[];
  checkout: CheckoutDraft | null;
  lastOrderId?: string;

  setLocale: (locale: Locale) => void;
  signIn: (role: UserRole) => void;
  signOut: () => void;

  addPerson: (person: Omit<Person, "id" | "userId" | "createdAt">) => string;
  addDate: (date: Omit<ImportantDate, "id" | "userId">) => void;
  addAddress: (address: Omit<Address, "id" | "userId">) => string;

  setCheckout: (draft: CheckoutDraft | null) => void;
  placeOrder: () => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignRider: (orderId: string, riderId: string) => void;
  riderAdvance: (orderId: string, status: OrderStatus, photoUrl?: string) => void;
  markSurprise: (orderId: string, isSurprise: boolean) => void;

  addSubscription: (sub: Omit<Subscription, "id" | "userId" | "createdAt" | "status">) => void;
  upsertBouquet: (bouquet: Bouquet) => void;
  setStemCount: (id: string, stemCount: number) => void;
  markNotificationRead: (id: string) => void;
}

function profileFor(role: UserRole): UserProfile {
  if (role === "admin") return DEMO_ADMIN;
  if (role === "rider") return DEMO_RIDER_USER;
  return DEMO_USER;
}

export const useAbebaStore = create<AbebaState>()(
  persist(
    (set, get) => ({
      locale: "en",
      session: DEMO_USER,
      people: PEOPLE,
      dates: IMPORTANT_DATES,
      addresses: ADDRESSES,
      bouquets: BOUQUETS,
      inventory: INVENTORY,
      orders: ORDERS,
      deliveries: DELIVERIES,
      riders: RIDERS,
      subscriptions: SUBSCRIPTIONS,
      notifications: NOTIFICATIONS,
      paymentMethods: PAYMENT_METHODS,
      demandDates: EXTRA_DEMAND_DATES,
      checkout: null,

      setLocale: (locale) => set({ locale }),
      signIn: (role) => set({ session: profileFor(role) }),
      signOut: () => set({ session: null }),

      addPerson: (person) => {
        const id = crypto.randomUUID();
        const userId = get().session?.id ?? DEMO_USER.id;
        set({
          people: [
            ...get().people,
            { ...person, id, userId, createdAt: new Date().toISOString() },
          ],
        });
        return id;
      },

      addDate: (date) => {
        const userId = get().session?.id ?? DEMO_USER.id;
        set({
          dates: [
            ...get().dates,
            { ...date, id: crypto.randomUUID(), userId },
          ],
        });
      },

      addAddress: (address) => {
        const id = crypto.randomUUID();
        const userId = get().session?.id ?? DEMO_USER.id;
        set({
          addresses: [...get().addresses, { ...address, id, userId }],
        });
        return id;
      },

      setCheckout: (draft) => set({ checkout: draft }),

      placeOrder: async () => {
        const { checkout, session, bouquets, addresses, people } = get();
        if (!checkout || !session) throw new Error("Nothing to send.");

        const bouquet = bouquets.find((item) => item.id === checkout.bouquetId);
        if (!bouquet || bouquet.inventoryStatus === "out") {
          throw new Error("That bouquet is no longer available.");
        }

        const address =
          addresses.find((item) => item.id === checkout.addressId) ??
          addresses.find((item) => item.personId === checkout.personId) ??
          addresses[0];
        if (!address) throw new Error("Add a delivery address first.");

        const orderId = `ord-${Date.now()}`;
        const transaction = await payments.charge(checkout.paymentProvider, {
          orderId,
          amountEtb: bouquet.priceEtb + DELIVERY_FEE_ETB,
          currency: "ETB",
          customerId: session.id,
          description: bouquet.name,
        });

        if (transaction.status !== "succeeded") {
          throw new Error("Payment could not be verified.");
        }

        const person = people.find((item) => item.id === checkout.personId);
        const order: Order = {
          id: orderId,
          userId: session.id,
          personId: checkout.personId,
          addressId: address.id,
          items: [
            {
              id: crypto.randomUUID(),
              bouquetId: bouquet.id,
              name: bouquet.name,
              quantity: 1,
              unitPriceEtb: bouquet.priceEtb,
            },
          ],
          message: checkout.message || undefined,
          isSurprise: checkout.isSurprise,
          deliveryType: checkout.deliveryType,
          scheduledFor: checkout.scheduledFor,
          deliveryWindow:
            checkout.deliveryWindow ??
            (checkout.deliveryType === "send_now"
              ? `Today · ${bouquet.deliveryMinutesMin}–${bouquet.deliveryMinutesMax} min`
              : checkout.deliveryType === "today"
                ? "Today"
                : checkout.scheduledFor),
          status: "confirmed",
          flowersTotalEtb: bouquet.priceEtb,
          deliveryFeeEtb: DELIVERY_FEE_ETB,
          totalEtb: bouquet.priceEtb + DELIVERY_FEE_ETB,
          currency: "ETB",
          paymentProvider: checkout.paymentProvider,
          paymentStatus: "succeeded",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const delivery: Delivery = {
          id: `del-${orderId}`,
          orderId,
          status: "confirmed",
          estimatedArrival: formatISO(addDays(new Date(), 0)).replace(
            /T.*/,
            "T18:15:00.000Z",
          ),
        };

        const notification = createNotification({
          userId: session.id,
          type: "order_update",
          title: "Order confirmed",
          body: person
            ? `${person.name}'s flowers are being prepared.`
            : "Your flowers are being prepared.",
          actionLabel: "Track",
          actionHref: `/orders/${orderId}`,
        });

        set({
          orders: [order, ...get().orders],
          deliveries: [delivery, ...get().deliveries],
          notifications: [notification, ...get().notifications],
          checkout: null,
          lastOrderId: orderId,
        });

        return order;
      },

      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                  deliveredAt:
                    status === "delivered"
                      ? new Date().toISOString()
                      : order.deliveredAt,
                }
              : order,
          ),
          deliveries: get().deliveries.map((delivery) =>
            delivery.orderId === orderId ? { ...delivery, status } : delivery,
          ),
        });
      },

      assignRider: (orderId, riderId) => {
        set({
          deliveries: get().deliveries.map((delivery) =>
            delivery.orderId === orderId ? { ...delivery, riderId } : delivery,
          ),
        });
      },

      riderAdvance: (orderId, status, photoUrl) => {
        get().updateOrderStatus(orderId, status);
        set({
          deliveries: get().deliveries.map((delivery) =>
            delivery.orderId === orderId
              ? {
                  ...delivery,
                  status,
                  confirmationPhotoUrl: photoUrl ?? delivery.confirmationPhotoUrl,
                  pickedUpAt:
                    status === "out_for_delivery"
                      ? new Date().toISOString()
                      : delivery.pickedUpAt,
                  deliveredAt:
                    status === "delivered"
                      ? new Date().toISOString()
                      : delivery.deliveredAt,
                }
              : delivery,
          ),
        });
      },

      markSurprise: (orderId, isSurprise) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId ? { ...order, isSurprise } : order,
          ),
        });
      },

      addSubscription: (sub) => {
        const userId = get().session?.id ?? DEMO_USER.id;
        set({
          subscriptions: [
            ...get().subscriptions,
            {
              ...sub,
              id: crypto.randomUUID(),
              userId,
              status: "active",
              createdAt: new Date().toISOString(),
            },
          ],
        });
      },

      upsertBouquet: (bouquet) => {
        const exists = get().bouquets.some((item) => item.id === bouquet.id);
        set({
          bouquets: exists
            ? get().bouquets.map((item) => (item.id === bouquet.id ? bouquet : item))
            : [bouquet, ...get().bouquets],
        });
      },

      setStemCount: (id, stemCount) => {
        set({
          inventory: get().inventory.map((item) =>
            item.id === id ? { ...item, stemCount } : item,
          ),
        });
      },

      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((item) =>
            item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
          ),
        });
      },
    }),
    {
      name: "abeba-demo-v2",
      partialize: (state) => ({
        locale: state.locale,
        session: state.session,
        people: state.people,
        dates: state.dates,
        addresses: state.addresses,
        bouquets: state.bouquets,
        inventory: state.inventory,
        orders: state.orders,
        deliveries: state.deliveries,
        subscriptions: state.subscriptions,
        notifications: state.notifications,
        lastOrderId: state.lastOrderId,
      }),
    },
  ),
);

export function useHydratedStore<T>(
  selector: (state: AbebaState) => T,
  fallback: T,
) {
  const value = useAbebaStore(selector);
  return value ?? fallback;
}

export type { ReminderOffset };
