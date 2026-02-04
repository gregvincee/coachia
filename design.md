# Design de l'Application CoachIA

## Vue d'ensemble
Application mobile de micro-coaching IA personnalisé pour développer des compétences spécifiques (prise de parole, écriture, productivité) avec gamification et feedback en temps réel. Interface conversationnelle minimaliste, UX épurée, orientation portrait mobile (9:16), usage à une main.

## Palette de couleurs
- **Primary (Accent)**: #6366F1 (Indigo moderne, évoque l'IA et l'innovation)
- **Background Light**: #FFFFFF
- **Background Dark**: #0F0F1A (Bleu très foncé, élégant)
- **Surface Light**: #F8F9FB
- **Surface Dark**: #1A1A2E
- **Foreground Light**: #1E293B
- **Foreground Dark**: #F1F5F9
- **Muted Light**: #64748B
- **Muted Dark**: #94A3B8
- **Success**: #10B981 (Vert moderne)
- **Warning**: #F59E0B
- **Error**: #EF4444

## Liste des écrans

### 1. Onboarding (première utilisation)
**Contenu**: 3 slides swipables expliquant le concept
- Slide 1: "Développez vos compétences avec l'IA" + illustration
- Slide 2: "Coaching personnalisé instantané" + illustration
- Slide 3: "Progressez et débloquez des récompenses" + illustration
- Bouton "Commencer" en bas

**Fonctionnalité**: Navigation par swipe horizontal, skip possible, stockage AsyncStorage pour ne pas réafficher

### 2. Sélection de compétence (Home)
**Contenu**: 
- Header: Logo + titre "CoachIA" + icône paramètres (top-right)
- Sous-titre: "Quelle compétence voulez-vous développer aujourd'hui ?"
- Grille de cartes de compétences (2 colonnes):
  * Prise de parole (icône micro)
  * Écriture créative (icône plume)
  * Productivité (icône éclair)
  * Communication (icône bulle)
  * Leadership (icône étoile)
  * Gestion du temps (icône horloge)
- Barre de progression globale en bas: niveau actuel + XP

**Fonctionnalité**: Tap sur carte → écran Session de coaching. ScrollView si plus de 6 compétences.

### 3. Session de coaching (Chat IA)
**Contenu**:
- Header: Titre de la compétence + bouton retour + icône info
- Zone de messages (chat conversationnel):
  * Messages IA: bulle gris clair (light) / gris foncé (dark), alignée gauche, avatar IA
  * Messages utilisateur: bulle primary (indigo), alignée droite
  * Suggestions de réponses rapides (chips horizontaux scrollables)
- Input en bas: champ texte + bouton envoyer
- Indicateur de frappe quand l'IA répond

**Fonctionnalité**: 
- Envoi de message → appel API OpenAI via backend
- Suggestions contextuelles générées par l'IA
- Scroll automatique vers le dernier message
- Sauvegarde de l'historique dans AsyncStorage (ou DB si cloud sync activé)

### 4. Profil & Progression
**Contenu**:
- Header: Photo de profil (avatar par défaut) + nom utilisateur
- Statistiques:
  * Niveau global (cercle de progression animé)
  * XP total
  * Jours consécutifs (streak)
  * Sessions complétées
- Section "Badges débloqués": grille de badges (gris si verrouillé, couleur si débloqué)
- Section "Compétences": liste avec barre de progression par compétence
- Bouton "Passer à Premium" (si freemium)

**Fonctionnalité**: 
- Affichage des données de progression
- Tap sur badge → modal avec description
- Tap sur compétence → détails de progression

### 5. Paramètres
**Contenu**:
- Liste de paramètres:
  * Thème (Light/Dark/Auto)
  * Notifications (toggle)
  * Langue (sélecteur)
  * Confidentialité
  * À propos
  * Se déconnecter (si auth activée)
  * Version de l'app

**Fonctionnalité**: 
- Toggle pour activer/désactiver notifications
- Sélecteur de thème avec preview instantané
- Stockage dans AsyncStorage

### 6. Détails de badge (Modal)
**Contenu**:
- Illustration du badge (grande taille)
- Nom du badge
- Description
- Condition de déblocage
- Date de déblocage (si débloqué)
- Bouton "Fermer"

**Fonctionnalité**: Modal overlay avec animation slide-up, tap outside pour fermer

## Flux utilisateur principaux

### Flux 1: Premier lancement
1. Utilisateur ouvre l'app
2. Écran Onboarding (3 slides)
3. Tap "Commencer"
4. Écran Sélection de compétence (Home)

### Flux 2: Session de coaching
1. Depuis Home, tap sur carte de compétence
2. Écran Session de coaching (Chat IA)
3. Utilisateur envoie un message
4. IA répond avec prompt personnalisé
5. Suggestions de réponses rapides affichées
6. Utilisateur continue la conversation
7. Fin de session → gain XP + notification badge si déblocage
8. Retour à Home

### Flux 3: Consulter progression
1. Depuis Home, tap sur onglet "Profil" (tab bar)
2. Écran Profil & Progression
3. Tap sur badge → Modal détails de badge
4. Fermeture modal → retour Profil

### Flux 4: Modifier paramètres
1. Depuis Home, tap sur icône paramètres (top-right)
2. Écran Paramètres
3. Toggle thème Dark → changement instantané
4. Retour à Home

## Navigation

### Tab Bar (bottom)
- **Home** (icône maison): Sélection de compétence
- **Profil** (icône personne): Profil & Progression
- **Paramètres** (icône engrenage): Paramètres

### Navigation Stack
- Onboarding (première utilisation uniquement, pas dans tab bar)
- Home → Session de coaching (push)
- Profil → Modal badge (modal)
- Home → Paramètres (push depuis icône header)

## Principes de design (Apple HIG)

### Layout
- **Safe Area**: Utiliser ScreenContainer pour tous les écrans
- **Spacing**: Multiples de 4px (4, 8, 12, 16, 24, 32)
- **Padding écran**: 16px (p-4) ou 24px (p-6) selon densité
- **Cards**: Border-radius 16px (rounded-2xl), shadow subtile
- **Buttons**: Border-radius 12px (rounded-xl) pour primaires, rounded-full pour FAB

### Typographie
- **Titres écrans**: text-2xl ou text-3xl, font-bold
- **Sous-titres**: text-base, text-muted
- **Corps de texte**: text-sm, leading-relaxed
- **Boutons**: text-base, font-semibold

### Interactions
- **Press feedback**: Opacity 0.7 pour cartes, scale 0.97 pour boutons primaires
- **Haptics**: Light impact sur tap bouton, Medium sur toggle, Success sur déblocage badge
- **Animations**: Durée 200-300ms, easing ease-in-out
- **Loading**: Spinner centré avec texte "Chargement..." en dessous

### Accessibilité
- Contraste minimum WCAG AA
- Taille de touche minimum 44x44pt
- Labels accessibles pour screen readers
- Support mode sombre complet

## Composants réutilisables à créer

1. **SkillCard**: Carte de compétence avec icône, titre, niveau
2. **ChatBubble**: Bulle de message (IA ou utilisateur)
3. **ProgressCircle**: Cercle de progression animé
4. **BadgeItem**: Badge avec état (locked/unlocked)
5. **StatCard**: Carte de statistique (icône + valeur + label)
6. **QuickReply**: Chip de suggestion de réponse rapide
7. **SettingRow**: Ligne de paramètre avec label + contrôle (toggle/chevron)

## Stockage de données (local AsyncStorage par défaut)

### Clés AsyncStorage
- `@onboarding_completed`: boolean
- `@user_profile`: { name, avatar, level, xp, streak }
- `@skills_progress`: { [skillId]: { level, xp, sessionsCount } }
- `@badges`: { [badgeId]: { unlocked, unlockedAt } }
- `@chat_history`: { [skillId]: [{ role, content, timestamp }] }
- `@settings`: { theme, notifications, language }

### Modèle de données

```typescript
// User
interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  createdAt: Date;
}

// Skill
interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

// Progress
interface SkillProgress {
  skillId: string;
  level: number;
  xp: number;
  sessionsCount: number;
  lastSessionAt?: Date;
}

// Badge
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

// Chat Message
interface ChatMessage {
  id: string;
  skillId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}
```

## Gamification

### Système XP
- Session complétée (5+ messages): +50 XP
- Message envoyé: +10 XP
- Streak 7 jours: +100 XP
- Niveau up: seuil = niveau * 200 XP

### Badges
1. **Premier pas**: Compléter première session
2. **Bavard**: Envoyer 50 messages
3. **Assidu**: Streak de 7 jours
4. **Polyvalent**: Essayer 3 compétences différentes
5. **Expert**: Atteindre niveau 5 dans une compétence
6. **Marathonien**: 30 sessions complétées
7. **Noctambule**: Session après 22h
8. **Matinal**: Session avant 7h

### Niveaux
- Niveau 1-5: Débutant (vert)
- Niveau 6-10: Intermédiaire (bleu)
- Niveau 11-20: Avancé (violet)
- Niveau 21+: Expert (or)

## Intégration IA (via backend)

### Endpoint API
`POST /api/ai/chat`

**Body**:
```json
{
  "skillId": "public-speaking",
  "messages": [
    { "role": "user", "content": "Je stresse avant de parler en public" }
  ]
}
```

**Response**:
```json
{
  "message": "Je comprends, c'est très courant. Essayons une technique de respiration...",
  "suggestions": [
    "Dis-moi plus sur ton stress",
    "Donne-moi un exercice pratique",
    "Comment gérer le trac ?"
  ]
}
```

### Prompts système par compétence
- **Prise de parole**: "Tu es un coach en prise de parole. Aide l'utilisateur avec des exercices pratiques, techniques de respiration, et conseils de posture."
- **Écriture créative**: "Tu es un mentor en écriture créative. Propose des exercices d'écriture, analyse de style, et inspiration."
- **Productivité**: "Tu es un coach en productivité. Aide avec la gestion du temps, priorisation, et méthodes comme Pomodoro."

## Monétisation (Freemium)

### Version gratuite
- 10 messages IA par jour
- Accès à 3 compétences
- Badges de base
- Publicité non intrusive (bannière en bas de Home)

### Version Premium (7-10$/mois)
- Messages IA illimités
- Accès à toutes les compétences (9+)
- Tous les badges
- Pas de publicité
- Historique de chat illimité
- Export de progression (PDF)
- Coaching personnalisé avancé

### Écran Paywall
- Modal slide-up depuis Home ou Session
- Titre: "Passez à Premium"
- Liste des avantages avec icônes
- Prix: "7,99€/mois" ou "69,99€/an (économisez 25%)"
- Bouton CTA: "Essai gratuit 7 jours"
- Lien "Restaurer les achats"

## Notes d'implémentation

1. **Pas d'authentification utilisateur** par défaut (local AsyncStorage). Si besoin de cloud sync, activer backend + auth.
2. **API OpenAI**: Appels via backend pour sécuriser la clé API. Backend gère rate limiting et coût.
3. **Offline**: Messages en attente stockés localement, envoyés quand connexion rétablie.
4. **Performance**: FlatList pour historique de chat, virtualisation pour grandes listes.
5. **Animations**: react-native-reanimated pour animations fluides (progress circles, transitions).
6. **Icons**: Utiliser SF Symbols (iOS) via IconSymbol, mappés vers Material Icons (Android/Web).
7. **Tests**: Vitest pour logique métier (calcul XP, déblocage badges), pas de tests E2E pour MVP.

## Roadmap de développement

### Phase 1: Structure de base
- Onboarding screens
- Tab navigation (Home, Profil, Paramètres)
- SkillCard component
- AsyncStorage setup

### Phase 2: Session de coaching
- Chat UI (ChatBubble, input)
- Intégration API backend pour IA
- Suggestions de réponses rapides
- Historique de chat

### Phase 3: Gamification
- Système XP et niveaux
- Badges (définition + déblocage)
- ProgressCircle component
- Notifications de déblocage

### Phase 4: Profil et paramètres
- Écran Profil avec stats
- Écran Paramètres (thème, notifications)
- Modal détails de badge

### Phase 5: Polish et tests
- Animations et haptics
- Gestion des erreurs
- Loading states
- Tests unitaires
- Génération du logo
