# Déploiement GitHub et domaine personnalisé de CoachIA

## Architecture retenue

GitHub Pages héberge uniquement l’export web statique Expo de CoachIA. Le backend tRPC, l’authentification, les diagnostics IA, la base de données et les webhooks Stripe doivent rester sur un serveur HTTPS séparé. GitHub Pages est un hébergeur de fichiers HTML, CSS et JavaScript ; il ne peut pas exécuter le serveur Node de CoachIA.

Le workflow `.github/workflows/deploy-pages.yml` installe les dépendances, exécute le typage et les tests, construit `dist`, puis publie cet artefact avec GitHub Pages.

## Variables publiques du dépôt

Dans **Settings → Secrets and variables → Actions → Variables**, ajouter les variables non secrètes suivantes :

| Variable | Rôle |
| --- | --- |
| `COACHIA_API_BASE_URL` | URL HTTPS permanente du backend CoachIA, sans `/api/trpc` |
| `COACHIA_OAUTH_PORTAL_URL` | URL du portail OAuth |
| `COACHIA_OAUTH_SERVER_URL` | URL du serveur OAuth si nécessaire |
| `COACHIA_APP_ID` | Identifiant public de l’application |
| `COACHIA_OWNER_OPEN_ID` | Identifiant public utile aux écrans propriétaires |
| `COACHIA_OWNER_NAME` | Nom public du propriétaire |

Les clés Stripe secrètes ne doivent jamais être placées dans GitHub Pages ni dans le bundle web. Elles restent dans l’environnement serveur : `COACHIA_STRIPE_SECRET_KEY` et `COACHIA_STRIPE_WEBHOOK_SECRET`.

## Dépôt et domaine

Pour un site utilisateur GitHub, le dépôt doit suivre le format `<nom-utilisateur>.github.io`. Pour un site de projet, l’URL par défaut contient le nom du dépôt. Le domaine personnalisé peut ensuite être configuré dans les réglages **Pages** du dépôt et chez le registrar DNS.

Avant publication, le propriétaire doit fournir :

1. le nom GitHub exact et le dépôt cible ;
2. le domaine racine ou le sous-domaine souhaité ;
3. l’URL HTTPS permanente du backend ;
4. les valeurs publiques OAuth nécessaires au build.

Le fichier `CNAME` ne doit pas être inventé à l’avance : il sera ajouté avec le domaine confirmé. La configuration du domaine dans GitHub Pages reste obligatoire même si un fichier `CNAME` est présent.

## DNS à préparer après confirmation du domaine

Pour un sous-domaine comme `app.exemple.com`, créer généralement un enregistrement `CNAME` vers `<nom-utilisateur>.github.io`. Pour un domaine racine, utiliser les enregistrements recommandés par GitHub Pages pour le dépôt concerné, puis activer HTTPS dans les réglages Pages. Les valeurs exactes dépendent du domaine et du registrar.

## Limite importante

Le déploiement GitHub Pages ne déplace pas automatiquement le backend. Si `COACHIA_API_BASE_URL` pointe vers une URL temporaire de preview, l’application publiée dépendra de cette preview et ne sera pas une production durable. Il faut donc confirmer l’hébergement permanent de l’API avant le lancement public.
