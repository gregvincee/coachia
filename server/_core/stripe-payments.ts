// server/_core/stripe-payments.ts
// ✅ Service de paiements Stripe pour CoachIA

import Stripe from 'stripe';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

/**
 * Service de paiements Stripe
 * Gère les abonnements, les paiements ponctuels et les webhooks
 */
export class StripePaymentService {
  private stripe: Stripe;

  // Plans d'abonnement CoachIA
  private plans: Record<string, SubscriptionPlan> = {
    free: {
      id: 'price_free',
      name: 'Gratuit',
      price: 0,
      currency: 'usd',
      interval: 'month',
      features: [
        'Accès aux 6 compétences de base',
        '5 sessions de coaching par mois',
        'Gamification basique',
        'Communauté',
      ],
    },
    pro: {
      id: 'price_pro_monthly',
      name: 'Pro',
      price: 799, // $7.99
      currency: 'usd',
      interval: 'month',
      features: [
        'Accès illimité aux compétences',
        'Coaching illimité',
        'Défis hebdomadaires premium',
        'Leaderboard exclusif',
        'Support prioritaire',
        'Export de progression',
      ],
    },
    elite: {
      id: 'price_elite_monthly',
      name: 'Elite',
      price: 1499, // $14.99
      currency: 'usd',
      interval: 'month',
      features: [
        'Tout du plan Pro',
        'Coaching en direct avec experts',
        'Contenu exclusif premium',
        'Marketplace de contenu',
        'Dashboard créateur',
        'Partage de revenus (70/30)',
      ],
    },
  };

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }

  /**
   * Crée un client Stripe
   */
  async createCustomer(userId: string, email: string, name: string) {
    return await this.stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
  }

  /**
   * Crée une intention de paiement pour un achat ponctuel
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en cents
      currency,
      payment_method_types: ['card'],
      metadata,
    });

    return {
      clientSecret: paymentIntent.client_secret || '',
      amount,
      currency,
    };
  }

  /**
   * Crée un abonnement pour un utilisateur
   */
  async createSubscription(
    customerId: string,
    planId: 'pro' | 'elite'
  ) {
    const plan = this.plans[planId];

    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const subscription = await (this.stripe.subscriptions as any).create({
      customer: customerId,
      items: [
        {
          price: plan.id,
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      plan: planId,
    };
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(subscriptionId: string) {
    const subscription = await (this.stripe.subscriptions as any).del(subscriptionId);

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    };
  }

  /**
   * Récupère les détails d'un abonnement
   */
  async getSubscription(subscriptionId: string) {
    const subscription = await (this.stripe.subscriptions as any).retrieve(
      subscriptionId
    );

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      plan: subscription.items.data[0]?.price?.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  /**
   * Récupère l'historique des paiements d'un client
   */
  async getPaymentHistory(customerId: string, limit: number = 10) {
    const charges = await this.stripe.charges.list({
      customer: customerId,
      limit,
    });

    return charges.data.map((charge: Stripe.Charge) => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      status: charge.status,
      description: charge.description,
      created: new Date(charge.created * 1000),
    }));
  }

  /**
   * Traite un webhook Stripe
   */
  async handleWebhook(body: string, signature: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          return this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);

        case 'payment_intent.payment_failed':
          return this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);

        case 'customer.subscription.created':
          return this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);

        case 'customer.subscription.updated':
          return this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);

        case 'customer.subscription.deleted':
          return this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

        case 'invoice.paid':
          return this.handleInvoicePaid(event.data.object as Stripe.Invoice);

        case 'invoice.payment_failed':
          return this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  /**
   * Gère les paiements réussis
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('✅ Payment succeeded:', paymentIntent.id);
    
    return {
      type: 'payment.succeeded',
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      metadata: paymentIntent.metadata,
    };
  }

  /**
   * Gère les paiements échoués
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.error('❌ Payment failed:', paymentIntent.id);
    
    return {
      type: 'payment.failed',
      paymentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
    };
  }

  /**
   * Gère la création d'abonnement
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    console.log('✅ Subscription created:', subscription.id);
    
    return {
      type: 'subscription.created',
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
    };
  }

  /**
   * Gère la mise à jour d'abonnement
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log('✅ Subscription updated:', subscription.id);
    
    return {
      type: 'subscription.updated',
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  /**
   * Gère la suppression d'abonnement
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    console.log('✅ Subscription deleted:', subscription.id);
    
    return {
      type: 'subscription.deleted',
      subscriptionId: subscription.id,
      customerId: subscription.customer,
    };
  }

  /**
   * Gère les factures payées
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    console.log('✅ Invoice paid:', invoice.id);
    
    return {
      type: 'invoice.paid',
      invoiceId: invoice.id,
      amount: invoice.amount_paid / 100,
    };
  }

  /**
   * Gère les factures non payées
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.error('❌ Invoice payment failed:', invoice.id);
    
    return {
      type: 'invoice.payment_failed',
      invoiceId: invoice.id,
      customerId: invoice.customer,
    };
  }

  /**
   * Récupère les plans disponibles
   */
  getPlans() {
    return {
      free: this.plans.free,
      pro: this.plans.pro,
      elite: this.plans.elite,
    };
  }

  /**
   * Crée une session de checkout Stripe
   */
  async createCheckoutSession(
    customerId: string,
    planId: 'pro' | 'elite',
    successUrl: string,
    cancelUrl: string
  ) {
    const plan = this.plans[planId];

    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }
}

// Instance singleton
let stripeInstance: StripePaymentService | null = null;

export function getStripeService(): StripePaymentService {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    stripeInstance = new StripePaymentService(secretKey);
  }

  return stripeInstance;
}
