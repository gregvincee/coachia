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
