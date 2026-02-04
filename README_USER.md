# CoachIA - Micro-coaching Instantané

**Développez vos compétences avec l'intelligence artificielle**

CoachIA est une application mobile de micro-coaching personnalisé qui vous accompagne dans votre développement personnel et professionnel grâce à l'intelligence artificielle.

---

## 🎯 Concept

CoachIA propose un **coaching IA instantané** sur des compétences ciblées. Choisissez une compétence, démarrez une session de coaching conversationnelle, et progressez à votre rythme avec un système de gamification motivant.

### Compétences disponibles

- **Prise de parole** : Développez votre aisance à l'oral et gérez votre trac
- **Écriture créative** : Libérez votre créativité et améliorez votre style
- **Productivité** : Optimisez votre temps et vos méthodes de travail
- **Communication** : Améliorez vos relations interpersonnelles
- **Leadership** : Développez votre capacité à inspirer et guider
- **Gestion du temps** : Maîtrisez votre emploi du temps et vos priorités

---

## ✨ Fonctionnalités principales

### 1. Onboarding interactif
- Introduction en 3 slides swipables
- Présentation claire du concept et des bénéfices
- Démarrage rapide sans inscription

### 2. Sélection de compétence
- Grille de cartes visuelles avec icônes et couleurs
- Description claire de chaque compétence
- Navigation intuitive vers les sessions de coaching

### 3. Session de coaching IA
- **Chat conversationnel** avec un coach IA personnalisé
- **Suggestions de réponses rapides** pour faciliter l'interaction
- **Historique de conversation** sauvegardé localement
- **Indicateur de frappe** pour une expérience fluide
- **Scroll automatique** vers les nouveaux messages

### 4. Système de gamification
- **XP et niveaux** : Gagnez de l'expérience à chaque interaction
- **Badges** : Débloquez des récompenses pour vos accomplissements
- **Streak** : Maintenez une série de jours consécutifs
- **Progression par compétence** : Suivez votre évolution dans chaque domaine

### 5. Profil utilisateur
- **Statistiques globales** : Sessions, streak, badges, compétences
- **Cercle de progression** animé avec niveau actuel
- **Grille de badges** avec icônes et catégories (bronze, argent, or, platine)
- **Progression détaillée** par compétence avec barres de progression

### 6. Paramètres
- **Thème** : Clair, Sombre, ou Automatique
- **Notifications** : Activer/désactiver les rappels
- **Informations** : Version de l'application

---

## 🎮 Système de gamification

### XP et niveaux
- **+10 XP** par message envoyé
- **+50 XP** par session complétée
- **+100 XP** pour un streak de 7 jours
- **+25 XP** par badge débloqué

### Badges disponibles

| Badge | Nom | Condition | Catégorie |
|-------|-----|-----------|-----------|
| 🎯 | Premier pas | Compléter 1 session | Bronze |
| 💬 | Bavard | Envoyer 50 messages | Argent |
| 🔥 | Assidu | Streak de 7 jours | Or |
| 🎨 | Polyvalent | Essayer 3 compétences | Argent |
| 🏆 | Expert | Niveau 5 dans une compétence | Or |
| 🏃 | Marathonien | 30 sessions complétées | Platine |
| 🦉 | Noctambule | Session après 22h | Bronze |
| 🐦 | Lève-tôt | Session avant 7h | Bronze |

---

## 🎨 Design et UX

### Palette de couleurs
- **Primary** : Violet (#8B5CF6) - Accent principal
- **Background** : Blanc (light) / Gris foncé (dark)
- **Surface** : Gris clair (light) / Gris moyen (dark)
- **Foreground** : Noir (light) / Blanc (dark)
- **Muted** : Gris moyen pour textes secondaires
- **Border** : Bordures subtiles
- **Success** : Vert pour validations
- **Warning** : Orange pour alertes
- **Error** : Rouge pour erreurs

### Interactions
- **Haptic feedback** sur les actions importantes (iOS/Android)
- **Animations subtiles** avec react-native-reanimated
- **Press states** visuels sur tous les boutons
- **Transitions fluides** entre les écrans

### Accessibilité
- **Contrastes élevés** pour la lisibilité
- **Tailles de touche** adaptées (minimum 44x44 points)
- **Support du mode sombre** complet
- **Textes lisibles** avec lineHeight adapté

---

## 🛠️ Architecture technique

### Stack technologique
- **React Native 0.81** avec Expo SDK 54
- **TypeScript 5.9** pour la sécurité des types
- **NativeWind 4** (Tailwind CSS pour React Native)
- **React Native Reanimated 4** pour les animations
- **AsyncStorage** pour la persistance locale
- **tRPC** pour l'API backend
- **Backend Node.js** avec intégration OpenAI

### Structure des données
- **UserProfile** : Profil utilisateur avec XP, niveau, streak
- **Skill** : Compétences avec métadonnées
- **Badge** : Badges avec conditions de déblocage
- **ChatMessage** : Messages de conversation avec rôle et contenu
- **SkillProgress** : Progression par compétence
- **AppSettings** : Préférences utilisateur

### Persistance
Toutes les données sont stockées localement avec AsyncStorage :
- Profil utilisateur
- Historique de chat par compétence
- Badges débloqués
- Progression par compétence
- Paramètres de l'application

---

## 🚀 Utilisation

### Première utilisation
1. **Onboarding** : Découvrez le concept en 3 slides
2. **Sélection** : Choisissez une compétence à développer
3. **Coaching** : Démarrez une conversation avec le coach IA
4. **Progression** : Gagnez de l'XP et débloquez des badges

### Session de coaching
1. Tapez votre message ou utilisez les suggestions rapides
2. Le coach IA répond avec des conseils personnalisés
3. Continuez la conversation pour approfondir
4. Votre progression est automatiquement sauvegardée

### Suivi de progression
1. Consultez votre **Profil** pour voir vos statistiques
2. Visualisez vos **badges** débloqués
3. Suivez votre **progression** dans chaque compétence
4. Maintenez votre **streak** pour des bonus XP

---

## 🎯 Modèle économique (Freemium)

### Version gratuite
- Accès à toutes les compétences
- Sessions de coaching illimitées
- Système de gamification complet
- Sauvegarde locale des données

### Version Premium (7-10$/mois)
- Prompts IA avancés et personnalisés
- Analyses de progression détaillées
- Contenu exclusif et challenges privés
- Coaching personnalisé sur mesure
- Synchronisation multi-appareils

---

## 📱 Compatibilité

- **iOS** : iPhone et iPad (iOS 13+)
- **Android** : Smartphones et tablettes (Android 5.0+)
- **Web** : Version web responsive (navigateurs modernes)

---

## 🔒 Confidentialité

- **Données locales** : Toutes les données sont stockées sur votre appareil
- **Pas de compte requis** : Utilisation anonyme sans inscription
- **Privacy by design** : Aucune collecte de données personnelles
- **Chiffrement** : Communications sécurisées avec l'API IA

---

## 📞 Support

Pour toute question ou suggestion :
- **Email** : support@coachia.app
- **Site web** : https://coachia.app
- **Version** : 1.0.0

---

## 🙏 Remerciements

CoachIA a été développé avec passion pour vous aider à développer vos compétences de manière accessible et motivante. Merci de votre confiance !

**Développez-vous, progressez, réussissez avec CoachIA ! 🚀**
