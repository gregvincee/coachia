import type { Express, Request, Response } from "express";

import { processStripeWebhook } from "./micro-purchase-service";

/**
 * Le webhook ne doit pas être protégé par la session utilisateur. Stripe
 * l’authentifie cryptographiquement via sa signature et le corps brut.
 */
export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/payments/stripe-webhook",
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"];
      if (typeof signature !== "string") {
        res.status(400).json({ error: "Signature Stripe manquante." });
        return;
      }

      try {
        const result = await processStripeWebhook(req.body, signature);
        res.status(200).json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Webhook invalide.";
        res.status(400).json({ error: message });
      }
    },
  );
}
