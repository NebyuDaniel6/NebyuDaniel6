import { NextResponse } from "next/server";
import { createPaymentService } from "@/domain/payments";
import type { PaymentProviderId } from "@/domain/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    provider: PaymentProviderId;
    orderId: string;
    amountEtb: number;
    customerId: string;
    description: string;
  };

  const service = createPaymentService();
  const transaction = await service.charge(body.provider, {
    orderId: body.orderId,
    amountEtb: body.amountEtb,
    currency: "ETB",
    customerId: body.customerId,
    description: body.description,
  });

  return NextResponse.json({
    transactionId: transaction.id,
    status: transaction.status,
    providerRef: transaction.providerRef,
  });
}
