# CoachIA - Liste des tâches

## Phase 1: Structure de base et configuration
- [x] Mettre à jour la palette de couleurs dans theme.config.js
- [x] Créer les types TypeScript pour les modèles de données (User, Skill, Badge, ChatMessage, etc.)
- [x] Configurer AsyncStorage pour la persistance locale
- [x] Créer le service de stockage (storage.ts) avec les fonctions CRUD
- [x] Implémenter l'écran Onboarding (3 slides swipables)
- [x] Configurer la navigation Tab Bar (Home, Profil, Paramètres)
- [x] Créer le composant SkillCard
- [x] Créer l'écran Home (Sélection de compétence) avec grille de cartes

## Phase 2: Session de coaching (Chat IA)
- [x] Créer le composant ChatBubble (messages IA et utilisateur)
- [x] Créer le composant QuickReply (suggestions de réponses)
- [x] Implémenter l'écran Session de coaching (Chat)
- [x] Créer l'endpoint backend /api/ai/chat pour intégration OpenAI
- [x] Implémenter la logique d'envoi/réception de messages
- [x] Ajouter l'indicateur de frappe (typing indicator)
- [x] Implémenter le scroll automatique vers le dernier message
- [x] Sauvegarder l'historique de chat dans AsyncStorage
- [x] Gérer les états de chargement et d'erreur

## Phase 3: Système de gamification
- [x] Implémenter le système de calcul XP
- [x] Implémenter la logique de niveau (level up)
- [x] Créer la logique de déblocage de badges
- [x] Implémenter le système de streak (jours consécutifs)
- [x] Créer le composant ProgressCircle (cercle de progression animé)
- [x] Créer le composant BadgeItem
- [x] Ajouter les notifications de déblocage de badge avec haptics
- [x] Implémenter la barre de progression globale sur Home

## Phase 4: Profil et progression
- [x] Créer l'écran Profil avec statistiques utilisateur
- [x] Afficher les badges débloqués en grille
- [x] Afficher la progression par compétence
- [ ] Créer le composant StatCard pour les statistiques
- [ ] Implémenter le modal de détails de badge
- [ ] Ajouter les animations de progression

## Phase 5: Paramètres
- [x] Créer l'écran Paramètres
- [x] Créer le composant SettingRow
- [x] Implémenter le sélecteur de thème (Light/Dark/Auto)
- [x] Implémenter le toggle de notifications
- [x] Sauvegarder les préférences dans AsyncStorage
- [x] Ajouter la section "À propos" avec version de l'app

## Phase 6: Branding et assets
- [x] Générer le logo de l'application avec l'IA
- [x] Mettre à jour app.config.ts avec le nom et le logo
- [x] Copier le logo dans tous les emplacements requis (icon, splash, favicon, android)

## Phase 7: Polish et finalisation
- [x] Ajouter les animations et transitions (react-native-reanimated)
- [x] Implémenter les haptics pour les interactions clés
- [x] Ajouter les états de chargement partout
- [x] Gérer les cas d'erreur avec messages utilisateur
- [x] Tester le mode sombre complet
- [x] Tester le flow complet de bout en bout
- [x] Écrire les tests unitaires pour la logique métier (XP, badges)
- [x] Optimiser les performances (FlatList, mémoïsation)
- [x] Vérifier l'accessibilité (contraste, taille de touche)

## Phase 8: Documentation et livraison
- [x] Créer la documentation utilisateur
- [x] Créer le premier checkpoint
- [x] Livrer l'application au client

## Phase 9: Défis hebdomadaires
- [x] Créer les types TypeScript pour les défis
- [x] Implémenter la logique de génération de défis
- [x] Créer l'écran Défis avec liste et détails
- [x] Ajouter le système de progression des défis
- [x] Implémenter les récompenses bonus pour défis completés
- [x] Ajouter les notifications de défi completé
- [x] Créer le tableau de classement des défis

## Phase 10: Notifications push
- [x] Configurer expo-notifications
- [x] Implémenter l'enregistrement du token de notification
- [x] Créer le service de notifications backend
- [x] Ajouter les notifications de rappel quotidien
- [x] Ajouter les notifications de streak en danger
- [x] Ajouter les notifications de défi disponible
- [x] Implémenter le contrôle des préférences de notifications

## Phase 11: Système de parrainage et communauté
- [x] Créer les types pour les parrainages
- [x] Générer les codes de parrainage uniques
- [x] Implémenter le partage de codes (QR, lien)
- [x] Créer l'écran Communauté avec leaderboard
- [x] Ajouter les défis entre amis
- [x] Implémenter le système de points de parrainage
- [x] Créer l'écran Invitations et amis

## Phase 12: Monétisation premium
- [x] Configurer les types d'abonnement
- [x] Implémenter le paywall avec Stripe/RevenueCat
- [x] Créer l'écran Premium avec offres
- [x] Ajouter les contenus exclusifs premium
- [x] Implémenter la vérification de l'accès premium
- [x] Créer les packs coaching personnalisés
- [x] Ajouter les analytics de conversion

## Phase 13: Données avancées et analytics
- [x] Créer le service d'analytics
- [x] Implémenter le tracking des événements
- [x] Créer l'écran Statistiques détaillées
- [x] Ajouter l'export de progression (PDF/CSV)
- [x] Implémenter les recommandations IA personnalisées
- [x] Créer les rapports de progression hebdomadaires
- [x] Ajouter les insights et tendances


## Phase 14: Améliorations UX/Animations
- [x] Ajouter des animations d'entrée/sortie aux écrans
- [x] Implémenter les gestes swipe et drag-drop
- [x] Ajouter les transitions de page fluides
- [x] Créer des micro-interactions pour les boutons
- [x] Ajouter les animations de progression (progress bars)
- [x] Implémenter les skeleton loaders
- [x] Ajouter les haptics avancés

## Phase 15: Fonctionnalités sociales
- [x] Créer le système de chat en temps réel
- [x] Ajouter les groupes d'étude
- [x] Implémenter le système de mentorat
- [x] Créer les notifications sociales
- [x] Ajouter le système de commentaires
- [x] Implémenter les réactions (likes, emojis)

## Phase 16: Intégrations externes
- [x] Intégrer Google Calendar
- [x] Ajouter l'export email
- [x] Connecter Slack/Discord
- [x] Ajouter l'authentification OAuth (Google, Apple)
- [x] Intégrer les webhooks

## Phase 17: IA avancée
- [ ] Créer des prompts contextuels sophistiqués
- [ ] Ajouter les recommandations ML personnalisées
- [ ] Implémenter la détection de sentiment
- [ ] Ajouter la génération de contenu IA
- [ ] Créer les chemins d'apprentissage adaptatifs

## Phase 18: Performance et scalabilité
- [ ] Implémenter le caching intelligent
- [ ] Ajouter la synchronisation offline-first
- [ ] Optimiser les images et assets
- [ ] Ajouter la pagination et virtualisation
- [ ] Implémenter le code splitting

## Phase 19: Monétisation avancée
- [ ] Ajouter les publicités ciblées
- [ ] Créer la marketplace de contenu
- [ ] Ajouter le coaching en direct
- [ ] Implémenter les abonnements flexibles
- [ ] Ajouter les bundles promotionnels

## Phase 20: Accessibilité et multi-langue
- [ ] Ajouter le support multi-langue (i18n)
- [ ] Implémenter l'accessibilité complète (WCAG)
- [ ] Ajouter le support du lecteur d'écran
- [ ] Implémenter le contraste amélioré
- [ ] Ajouter les raccourcis clavier

## Phase 21: Micro-paiements rentables
- [x] Corriger et fiabiliser les dépendances Stripe et Expo côté serveur
- [x] Créer une intention de paiement sécurisée pour chaque micro-achat
- [x] Attribuer les droits d’achat à partir des webhooks Stripe vérifiés
- [x] Synchroniser les crédits de sessions et les quotas de l’utilisateur
- [x] Mesurer les événements de conversion et les revenus par produit
- [x] Tester les refus, doublons et confirmations de paiement

## Phase 22: Tableau de bord administrateur
- [x] Protéger l’accès aux métriques par le rôle administrateur
- [x] Exposer les indicateurs de revenus, ventes et conversion par produit
- [x] Créer l’écran mobile du tableau de bord avec filtres de période
- [x] Afficher les performances par produit et les états sans données
- [x] Tester les autorisations et les calculs de synthèse

## Phase 23: COACHIA ALERT ENGINE
- [x] Définir les contrats décisionnels, seuils et niveaux d’alerte
- [x] Mesurer les coûts IA journaliers et appliquer la protection Free à 90 %
- [x] Instrumenter les statistiques cache Redis et alerter sous 50 % sur 24 h
- [x] Comparer la conversion checkout par produit sur deux périodes de 7 jours
- [x] Exposer les alertes aux seuls administrateurs et les afficher dans le dashboard
- [x] Tester les seuils, le volume minimal et les exemptions Pro/Elite

## Phase 24: Lancement bêta et paiements
- [ ] Configurer Stripe en mode test puis valider le webhook et l’attribution des achats
- [ ] Préparer une page d’inscription, les politiques minimales et le message de la bêta
- [ ] Recruter une première cohorte ciblée et recueillir les consentements
- [ ] Mesurer activation, rétention, checkout, paiement et coût IA par cohorte
- [ ] Décider les améliorations prioritaires à partir des données du premier mois

## Phase 25: PWA CoachIA
- [x] Préparer les métadonnées, icônes et le manifeste d’installation
- [x] Ajouter un service worker avec cache de démarrage et page hors ligne
- [x] Enregistrer le service worker et informer des mises à jour disponibles
- [x] Tester le build web et la configuration PWA pour la bêta mobile

## Phase 26: Feedback bêta
- [x] Définir le modèle de feedback et les catégories de retour
- [x] Créer l’écran de feedback accessible depuis les paramètres
- [x] Enregistrer localement les feedbacks et proposer une copie exportable
- [x] Tester la validation et la persistance du parcours de feedback

## Phase 27: Coordination du lancement bêta
- [ ] Confirmer la cible initiale, la promesse et l’offre bêta
- [ ] Organiser le recrutement, les consentements et le canal de support
- [ ] Préparer les décisions de publication PWA et de configuration Stripe
- [ ] Définir les critères de passage entre bêta fermée et lancement public

## Phase 28: Suivi de cohorte bêta
- [x] Définir les indicateurs d’invitation, activation, rétention et feedback
- [x] Ajouter les agrégats de cohorte réservés à l’administration
- [x] Afficher les métriques et seuils de décision dans le dashboard
- [x] Tester les métriques de cohorte et les autorisations administratives

## Phase 29: Accueil bêta guidé
- [x] Définir les étapes de test et les jalons d’activation de la bêta
- [x] Créer l’écran d’accueil bêta accessible depuis les paramètres
- [x] Conserver localement la progression des étapes de test
- [x] Tester le guidage et la persistance de l’accueil bêta

## Phase 30: Célébration des jalons bêta
- [x] Définir une célébration courte compatible avec les préférences d’accessibilité
- [x] Afficher l’animation et le retour haptique lors d’un nouveau jalon validé
- [x] Tester la célébration sans perturber la progression persistante

## Phase 31: Logo CoachIA
- [x] Définir une direction visuelle distinctive pour l’icône CoachIA
- [x] Générer un logo carré adapté aux stores mobiles
- [x] Décliner le logo pour l’icône, le splash screen, le favicon et Android
- [x] Mettre à jour la configuration de branding de l’application

## Phase 32: Monogramme C∆I
- [x] Concevoir un monogramme minimal avec le triangle comme signe distinctif
- [x] Décliner le monogramme pour mobile, Android et PWA
- [x] Vérifier la lisibilité du logo C∆I à petite taille
- [x] Mettre à jour les références de branding associées

## Phase 33: Wordmark Coach∆I
- [x] Recomposer le logo avec le mot Coach et la signature ∆I
- [x] Décliner le wordmark pour l’accueil et les surfaces de présentation
- [x] Vérifier la lisibilité du nom Coach∆I à petite taille

## Phase 34: Refonte métallique C∆I / Coach∆I
- [x] Traduire la référence noir, argent et bleu électrique dans le système de marque
- [x] Recréer le monogramme C∆I avec une finition métallique
- [x] Recréer le wordmark Coach∆I avec une finition métallique
- [x] Décliner et vérifier les assets pour mobile et PWA

## Phase 35: Interfaces métalliques
- [x] Définir les tokens noir, argent et bleu électrique pour les surfaces clés
- [x] Refonte du tableau de bord administrateur dans le nouveau style
- [x] Refonte des écrans bêta dans le nouveau style
- [x] Vérifier les contrastes, le typage et les parcours existants

## Phase 36: Remplacement global du logo métallique
- [x] Remplacer toutes les références résiduelles de l’ancien logo par le monogramme C∆I métallique

## Phase 37: Store métallique
- [x] Refonte visuelle de l’écran Store dans l’identité noir, argent et bleu électrique sans modifier les parcours d’achat
- [x] Mettre à jour l’en-tête, les filtres, les cartes produit et le bloc de paiement responsable dans le style métallique

## Phase 38: Logo visible dans l’accueil
- [x] Intégrer le monogramme métallique C∆I sur l’écran d’accueil CoachIA

## Phase 39: Optimisation mobile de l’en-tête
- [x] Vérifier et ajuster l’affichage du logo C∆I et de l’en-tête sur les écrans de téléphone

## Phase 40: Logo dès l’onboarding
- [x] Afficher le monogramme métallique C∆I dès la première étape de l’onboarding

## Phase 41: Vérification du pictogramme violet visible
- [x] Identifier l’origine du pictogramme violet visible dans le conteneur mobile et remplacer toute référence applicative résiduelle
- [x] Synchroniser la métadonnée d’icône du projet avec le monogramme métallique C∆I

## Phase 42: Affichage sombre CoachIA
- [x] Appliquer un affichage sombre cohérent à l’accueil et à l’onboarding pour valoriser le monogramme C∆I

## Phase 43: Page publique de lancement
- [x] Créer une page de lancement CoachIA en style métallique avec un parcours d’inscription bêta

## Phase 44: Inscription bêta volontaire
- [x] Créer une candidature bêta avec adresse e-mail, consentement explicite et protection contre les doublons
- [x] Relier le formulaire à la page publique de lancement et confirmer l’inscription au testeur

## Phase 45: Confidentialité publique
- [x] Créer une page de confidentialité concise pour l’inscription et le parcours bêta
- [x] Relier cette page au formulaire de candidature bêta

## Phase 46: Retrait de la liste bêta
- [x] Permettre une demande de retrait vérifiable depuis la page de confidentialité
- [x] Supprimer l’adresse de la candidature sans exposer son état dans les métriques

## Phase 47: Invitation de cohorte bêta
- [x] Exposer des indicateurs anonymisés de liste d’attente aux administrateurs
- [x] Ajouter une action d’invitation contrôlée pour la prochaine cohorte

## Phase 48: Message d’invitation bêta
- [x] Rédiger un message d’invitation personnalisé avec lien, parcours de test et retrait
- [x] Préparer des variantes courtes pour courriel et message direct

## Phase 49: Visuels de lancement
- [x] Générer un visuel héros, un visuel social vertical et un visuel carré pour CoachIA

## Phase 50: Moteur de missions IA
- [x] Définir les missions Créer, Résoudre et Construire avec la boucle tentative–diagnostic–correction
- [x] Séparer la maîtrise réelle de l’XP et afficher une carte de capacités IA
- [x] Recentrer l’accueil sur la mission active, la difficulté détectée et la prochaine action

## Phase 51: Diagnostic pédagogique interactif
- [x] Distinguer visuellement le score, la force, la difficulté, la correction et la prochaine tentative
- [x] Ajouter des interactions de consultation et d’application des conseils IA
