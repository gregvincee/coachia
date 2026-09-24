# Préparation Stripe de CoachIA

CoachIA est préparé pour tester les micro-achats sans clé live et sans attribuer de crédit avant confirmation serveur.

## Variables à renseigner uniquement côté serveur

Utiliser les secrets du projet WebDev ou un environnement local non versionné :

```bash
COACHIA_STRIPE_SECRET_KEY=sk_test_...
COACHIA_STRIPE_WEBHOOK_SECRET=whsec_...
```

Les anciennes variables `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` restent acceptées pour compatibilité, mais les noms `COACHIA_*` sont recommandés pour éviter les collisions avec d'autres intégrations.

## Parcours de test

1. Créer ou ouvrir un compte Stripe en **mode test**.
2. Renseigner une clé secrète commençant par `sk_test_` dans les secrets serveur.
3. Exposer l'endpoint `POST /api/payments/stripe-webhook` dans la configuration Stripe.
4. Activer au minimum l'événement `payment_intent.succeeded`.
5. Copier la signature `whsec_...` du webhook dans `COACHIA_STRIPE_WEBHOOK_SECRET`.
6. Ouvrir le Store connecté sur le Web et utiliser une carte de test Stripe, jamais une carte réelle.
7. Vérifier que le paiement confirme le produit, crédite le portefeuille une seule fois et apparaît dans le dashboard administrateur.

L'API publique du catalogue expose uniquement `configured`, `mode` et `webhookConfigured`. Elle ne renvoie jamais une clé, un secret ou un identifiant de paiement sensible.

## États affichés dans le Store

| État | Signification | Action |
| --- | --- | --- |
| `not_configured` | Aucune clé serveur n'est fournie | Le Store reste consultable, le checkout est bloqué |
| `test` | Une clé `sk_test_` ou `rk_test_` est active | Les achats peuvent être simulés sans débit réel |
| `live` | Une clé de production est active | À utiliser uniquement après validation de la bêta |
| `invalid` | Une valeur ne ressemble pas à une clé Stripe supportée | Corriger le secret avant tout checkout |

## Garde-fous

Le prix vient toujours du catalogue serveur. L'utilisateur authentifié doit correspondre à la metadata du PaymentIntent. Le webhook est signé par Stripe et l'attribution est idempotente par `PaymentIntent`, afin qu'une répétition du webhook ne crédite jamais deux fois le portefeuille.

Les achats numériques mobiles devront être reliés à Apple In-App Purchase ou Google Play Billing avant une publication native. Le checkout Stripe hébergé reste réservé au Web dans cette version.
