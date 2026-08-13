export type CommerceEventAggregate = {
  productId: string | null;
  checkoutStarts: number | string | null;
  paidEvents: number | string | null;
};

export type CommerceTransactionAggregate = {
  productId: string;
  paidOrders: number | string | null;
  revenueCents: number | string | null;
};

export type ProductCommerceMetric = {
  productId: string;
  checkoutStarts: number;
  paidEvents: number;
  paidOrders: number;
  revenueCents: number;
  conversionRate: number;
};

/** Agrège des données anonymisées sans jamais retourner les identifiants utilisateur. */
export function buildCommerceMetrics(
  events: CommerceEventAggregate[],
  transactions: CommerceTransactionAggregate[],
) {
  const byProduct = new Map<string, Omit<ProductCommerceMetric, "productId" | "conversionRate">>();

  for (const event of events) {
    if (!event.productId) continue;
    byProduct.set(event.productId, {
      checkoutStarts: Number(event.checkoutStarts ?? 0),
      paidEvents: Number(event.paidEvents ?? 0),
      paidOrders: 0,
      revenueCents: 0,
    });
  }

  for (const transaction of transactions) {
    const current = byProduct.get(transaction.productId) ?? {
      checkoutStarts: 0,
      paidEvents: 0,
      paidOrders: 0,
      revenueCents: 0,
    };
    current.paidOrders = Number(transaction.paidOrders ?? 0);
    current.revenueCents = Number(transaction.revenueCents ?? 0);
    byProduct.set(transaction.productId, current);
  }

  const products: ProductCommerceMetric[] = Array.from(byProduct, ([productId, value]) => ({
    productId,
    ...value,
    conversionRate: value.checkoutStarts > 0 ? value.paidEvents / value.checkoutStarts : 0,
  }));

  const totalCheckoutStarts = products.reduce((sum, product) => sum + product.checkoutStarts, 0);
  const totalConfirmedEvents = products.reduce((sum, product) => sum + product.paidEvents, 0);
  const totalRevenueCents = products.reduce((sum, product) => sum + product.revenueCents, 0);
  const paidOrders = products.reduce((sum, product) => sum + product.paidOrders, 0);

  return {
    products,
    totalCheckoutStarts,
    totalConfirmedEvents,
    totalRevenueCents,
    paidOrders,
    conversionRate: totalCheckoutStarts > 0 ? totalConfirmedEvents / totalCheckoutStarts : 0,
    averageOrderValueCents: paidOrders > 0 ? Math.round(totalRevenueCents / paidOrders) : 0,
  };
}
