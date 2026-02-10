/**
 * Service de paiements avec Stripe/PayPal
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  provider: 'stripe' | 'paypal';
  token: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: number;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodId: string;
  description: string;
  metadata?: Record<string, any>;
  stripeIntentId?: string;
  paypalOrderId?: string;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export interface Transaction {
  id: string;
  paymentIntentId: string;
  userId: string;
  recipientId?: string;
  amount: number;
  currency: string;
  type: 'purchase' | 'coaching' | 'subscription' | 'refund';
  description: string;
  status: 'completed' | 'failed' | 'refunded';
  timestamp: number;
  receiptUrl?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'elite';
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due';
  startDate: number;
  renewalDate: number;
  cancelledAt?: number;
  stripeSubscriptionId?: string;
  paypalSubscriptionId?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  dueDate: number;
  issuedAt: number;
  paidAt?: number;
  pdfUrl?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Refund {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  requestedAt: number;
  processedAt?: number;
  stripeRefundId?: string;
}

export interface PaymentWebhook {
  id: string;
  event: string;
  provider: 'stripe' | 'paypal';
  data: Record<string, any>;
  processed: boolean;
  processedAt?: number;
  receivedAt: number;
}

class PaymentService {
  private stripePublicKey: string = '';
  private paypalClientId: string = '';

  constructor(stripePublicKey?: string, paypalClientId?: string) {
    this.stripePublicKey = stripePublicKey || '';
    this.paypalClientId = paypalClientId || '';
  }

  /**
   * Ajoute une méthode de paiement
   */
  async addPaymentMethod(
    userId: string,
    type: PaymentMethod['type'],
    provider: 'stripe' | 'paypal',
    token: string,
    isDefault: boolean = false
  ): Promise<PaymentMethod> {
    const method: PaymentMethod = {
      id: `pm-${Date.now()}`,
      userId,
      type,
      provider,
      token,
      isDefault,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`paymentMethod-${method.id}`, JSON.stringify(method));

    // Si c'est la méthode par défaut, désactiver les autres
    if (isDefault) {
      await this.setDefaultPaymentMethod(userId, method.id);
    }

    return method;
  }

  /**
   * Récupère les méthodes de paiement
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const methodKeys = keys.filter(k => k.startsWith('paymentMethod-'));

      const methods: PaymentMethod[] = [];
      for (const key of methodKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const method = JSON.parse(stored);
          if (method.userId === userId) {
            methods.push(method);
          }
        }
      }

      return methods;
    } catch (error) {
      console.error('Erreur lors de la récupération des méthodes de paiement:', error);
      return [];
    }
  }

  /**
   * Définit la méthode de paiement par défaut
   */
  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods(userId);
      for (const method of methods) {
        method.isDefault = method.id === methodId;
        await AsyncStorage.setItem(`paymentMethod-${method.id}`, JSON.stringify(method));
      }
    } catch (error) {
      console.error('Erreur lors de la définition de la méthode par défaut:', error);
    }
  }

  /**
   * Crée une intention de paiement
   */
  async createPaymentIntent(
    userId: string,
    amount: number,
    currency: string,
    description: string,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      id: `pi-${Date.now()}`,
      userId,
      amount,
      currency,
      status: 'pending',
      paymentMethodId,
      description,
      metadata,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`paymentIntent-${intent.id}`, JSON.stringify(intent));
    return intent;
  }

  /**
   * Traite un paiement
   */
  async processPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const stored = await AsyncStorage.getItem(`paymentIntent-${paymentIntentId}`);
      if (!stored) {
        throw new Error('Intention de paiement non trouvée');
      }

      const intent = JSON.parse(stored);
      intent.status = 'processing';
      await AsyncStorage.setItem(`paymentIntent-${paymentIntentId}`, JSON.stringify(intent));

      // Simuler le traitement du paiement
      // En production, faire un appel à l'API Stripe/PayPal
      await new Promise(resolve => setTimeout(resolve, 1000));

      intent.status = 'succeeded';
      intent.completedAt = Date.now();
      await AsyncStorage.setItem(`paymentIntent-${paymentIntentId}`, JSON.stringify(intent));

      // Créer une transaction
      await this.createTransaction(
        paymentIntentId,
        intent.userId,
        intent.amount,
        intent.currency,
        'purchase',
        intent.description
      );

      return intent;
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      const stored = await AsyncStorage.getItem(`paymentIntent-${paymentIntentId}`);
      if (stored) {
        const intent = JSON.parse(stored);
        intent.status = 'failed';
        intent.error = String(error);
        await AsyncStorage.setItem(`paymentIntent-${paymentIntentId}`, JSON.stringify(intent));
        return intent;
      }
      throw error;
    }
  }

  /**
   * Crée une transaction
   */
  async createTransaction(
    paymentIntentId: string,
    userId: string,
    amount: number,
    currency: string,
    type: Transaction['type'],
    description: string,
    recipientId?: string
  ): Promise<Transaction> {
    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      paymentIntentId,
      userId,
      recipientId,
      amount,
      currency,
      type,
      description,
      status: 'completed',
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(`transaction-${transaction.id}`, JSON.stringify(transaction));
    return transaction;
  }

  /**
   * Récupère les transactions
   */
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const txKeys = keys.filter(k => k.startsWith('transaction-'));

      const transactions: Transaction[] = [];
      for (const key of txKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const tx = JSON.parse(stored);
          if (tx.userId === userId) {
            transactions.push(tx);
          }
        }
      }

      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
  }

  /**
   * Crée un abonnement
   */
  async createSubscription(
    userId: string,
    plan: 'free' | 'pro' | 'elite',
    billingCycle: 'monthly' | 'yearly',
    price: number
  ): Promise<Subscription> {
    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      userId,
      plan,
      price,
      currency: 'USD',
      billingCycle,
      status: 'active',
      startDate: Date.now(),
      renewalDate: Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000,
    };

    await AsyncStorage.setItem(`subscription-${subscription.id}`, JSON.stringify(subscription));
    return subscription;
  }

  /**
   * Récupère l'abonnement actif
   */
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const subKeys = keys.filter(k => k.startsWith('subscription-'));

      for (const key of subKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const sub = JSON.parse(stored);
          if (sub.userId === userId && sub.status === 'active') {
            return sub;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      return null;
    }
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`subscription-${subscriptionId}`);
      if (stored) {
        const subscription = JSON.parse(stored);
        subscription.status = 'cancelled';
        subscription.cancelledAt = Date.now();
        await AsyncStorage.setItem(`subscription-${subscriptionId}`, JSON.stringify(subscription));
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    }
  }

  /**
   * Crée une facture
   */
  async createInvoice(
    userId: string,
    items: InvoiceItem[],
    dueDate: number
  ): Promise<Invoice> {
    const total = items.reduce((sum, item) => sum + item.total, 0);

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      userId,
      amount: total,
      currency: 'USD',
      status: 'draft',
      items,
      dueDate,
      issuedAt: Date.now(),
    };

    await AsyncStorage.setItem(`invoice-${invoice.id}`, JSON.stringify(invoice));
    return invoice;
  }

  /**
   * Récupère les factures
   */
  async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const invKeys = keys.filter(k => k.startsWith('invoice-'));

      const invoices: Invoice[] = [];
      for (const key of invKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const inv = JSON.parse(stored);
          if (inv.userId === userId) {
            invoices.push(inv);
          }
        }
      }

      return invoices;
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      return [];
    }
  }

  /**
   * Demande un remboursement
   */
  async requestRefund(
    transactionId: string,
    userId: string,
    reason: string
  ): Promise<Refund> {
    try {
      const stored = await AsyncStorage.getItem(`transaction-${transactionId}`);
      if (!stored) {
        throw new Error('Transaction non trouvée');
      }

      const transaction = JSON.parse(stored);

      const refund: Refund = {
        id: `refund-${Date.now()}`,
        transactionId,
        userId,
        amount: transaction.amount,
        currency: transaction.currency,
        reason,
        status: 'pending',
        requestedAt: Date.now(),
      };

      await AsyncStorage.setItem(`refund-${refund.id}`, JSON.stringify(refund));
      return refund;
    } catch (error) {
      console.error('Erreur lors de la demande de remboursement:', error);
      throw error;
    }
  }

  /**
   * Traite un remboursement
   */
  async processRefund(refundId: string): Promise<Refund> {
    try {
      const stored = await AsyncStorage.getItem(`refund-${refundId}`);
      if (!stored) {
        throw new Error('Remboursement non trouvé');
      }

      const refund = JSON.parse(stored);
      refund.status = 'completed';
      refund.processedAt = Date.now();
      await AsyncStorage.setItem(`refund-${refundId}`, JSON.stringify(refund));

      return refund;
    } catch (error) {
      console.error('Erreur lors du traitement du remboursement:', error);
      throw error;
    }
  }

  /**
   * Traite un webhook de paiement
   */
  async processWebhook(event: string, provider: 'stripe' | 'paypal', data: Record<string, any>): Promise<void> {
    try {
      const webhook: PaymentWebhook = {
        id: `webhook-${Date.now()}`,
        event,
        provider,
        data,
        processed: false,
        receivedAt: Date.now(),
      };

      await AsyncStorage.setItem(`webhook-${webhook.id}`, JSON.stringify(webhook));

      // Traiter le webhook selon le type d'événement
      switch (event) {
        case 'payment.success':
          // Mettre à jour le statut du paiement
          break;
        case 'payment.failed':
          // Notifier l'utilisateur
          break;
        case 'subscription.renewed':
          // Renouveler l'abonnement
          break;
        case 'refund.completed':
          // Marquer le remboursement comme complété
          break;
      }

      webhook.processed = true;
      webhook.processedAt = Date.now();
      await AsyncStorage.setItem(`webhook-${webhook.id}`, JSON.stringify(webhook));
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
    }
  }
}

// Instance globale
const paymentService = new PaymentService();

export default paymentService;

/**
 * Ajoute une méthode de paiement
 */
export async function addPaymentMethod(
  userId: string,
  type: PaymentMethod['type'],
  provider: 'stripe' | 'paypal',
  token: string,
  isDefault?: boolean
): Promise<PaymentMethod> {
  return paymentService.addPaymentMethod(userId, type, provider, token, isDefault);
}

/**
 * Récupère les méthodes de paiement
 */
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  return paymentService.getPaymentMethods(userId);
}

/**
 * Crée une intention de paiement
 */
export async function createPaymentIntent(
  userId: string,
  amount: number,
  currency: string,
  description: string,
  paymentMethodId: string,
  metadata?: Record<string, any>
): Promise<PaymentIntent> {
  return paymentService.createPaymentIntent(userId, amount, currency, description, paymentMethodId, metadata);
}

/**
 * Traite un paiement
 */
export async function processPayment(paymentIntentId: string): Promise<PaymentIntent> {
  return paymentService.processPayment(paymentIntentId);
}

/**
 * Récupère les transactions
 */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  return paymentService.getTransactions(userId);
}

/**
 * Crée un abonnement
 */
export async function createSubscription(
  userId: string,
  plan: 'free' | 'pro' | 'elite',
  billingCycle: 'monthly' | 'yearly',
  price: number
): Promise<Subscription> {
  return paymentService.createSubscription(userId, plan, billingCycle, price);
}

/**
 * Récupère l'abonnement actif
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  return paymentService.getActiveSubscription(userId);
}

/**
 * Annule un abonnement
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  return paymentService.cancelSubscription(subscriptionId);
}

/**
 * Demande un remboursement
 */
export async function requestRefund(
  transactionId: string,
  userId: string,
  reason: string
): Promise<Refund> {
  return paymentService.requestRefund(transactionId, userId, reason);
}

/**
 * Traite un remboursement
 */
export async function processRefund(refundId: string): Promise<Refund> {
  return paymentService.processRefund(refundId);
}
