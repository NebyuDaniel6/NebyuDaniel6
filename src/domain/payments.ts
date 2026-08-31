import type {
  PaymentProviderId,
  PaymentStatus,
  PaymentTransaction,
} from "./types";

export interface PaymentIntent {
  orderId: string;
  amountEtb: number;
  currency: string;
  customerId: string;
  description: string;
}

export interface PaymentSession {
  id: string;
  provider: PaymentProviderId;
  redirectUrl?: string;
  clientSecret?: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  id: PaymentProviderId;
  displayName: string;
  initiate(intent: PaymentIntent): Promise<PaymentSession>;
  verify(providerRef: string): Promise<PaymentStatus>;
}

function wait(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function session(
  provider: PaymentProviderId,
  intent: PaymentIntent,
): PaymentSession {
  return {
    id: `${provider}_${intent.orderId}_${Date.now()}`,
    provider,
    status: "processing",
  };
}

export class TelebirrProvider implements PaymentProvider {
  id = "telebirr" as const;
  displayName = "Telebirr";

  async initiate(intent: PaymentIntent) {
    await wait();
    return session(this.id, intent);
  }

  async verify() {
    await wait();
    return "succeeded" as const;
  }
}

export class ChapaProvider implements PaymentProvider {
  id = "chapa" as const;
  displayName = "Chapa";

  async initiate(intent: PaymentIntent) {
    await wait();
    return session(this.id, intent);
  }

  async verify() {
    await wait();
    return "succeeded" as const;
  }
}

export class CardProvider implements PaymentProvider {
  id = "card" as const;
  displayName = "Card";

  async initiate(intent: PaymentIntent) {
    await wait();
    return session(this.id, intent);
  }

  async verify() {
    await wait();
    return "succeeded" as const;
  }
}

export class InternationalProvider implements PaymentProvider {
  id = "international" as const;
  displayName = "International";

  async initiate(intent: PaymentIntent) {
    await wait();
    return session(this.id, intent);
  }

  async verify() {
    await wait();
    return "succeeded" as const;
  }
}

export class PaymentService {
  private providers = new Map<PaymentProviderId, PaymentProvider>();

  constructor(providers: PaymentProvider[]) {
    for (const provider of providers) {
      this.providers.set(provider.id, provider);
    }
  }

  list() {
    return [...this.providers.values()].map((provider) => ({
      id: provider.id,
      name: provider.displayName,
    }));
  }

  async charge(providerId: PaymentProviderId, intent: PaymentIntent) {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Unknown payment provider: ${providerId}`);
    }

    const started = await provider.initiate(intent);
    const verified = await provider.verify(started.id);

    const transaction: PaymentTransaction = {
      id: crypto.randomUUID(),
      orderId: intent.orderId,
      provider: providerId,
      providerRef: started.id,
      amountEtb: intent.amountEtb,
      currency: "ETB",
      status: verified,
      createdAt: new Date().toISOString(),
    };

    return transaction;
  }
}

export function createPaymentService() {
  return new PaymentService([
    new TelebirrProvider(),
    new ChapaProvider(),
    new CardProvider(),
    new InternationalProvider(),
  ]);
}

export const PAYMENT_PROVIDERS: Array<{
  id: PaymentProviderId;
  name: string;
  hint: string;
}> = [
  { id: "telebirr", name: "Telebirr", hint: "Pay with your Telebirr wallet" },
  { id: "chapa", name: "Chapa", hint: "Local cards and mobile money" },
  { id: "card", name: "Card", hint: "Visa, Mastercard" },
  { id: "international", name: "International", hint: "Ready for future providers" },
];
