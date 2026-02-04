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
- [ ] Créer la documentation utilisateur
- [ ] Créer le premier checkpoint
- [ ] Livrer l'application au client
