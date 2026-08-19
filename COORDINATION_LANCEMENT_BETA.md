# Plan de coordination — lancement bêta CoachIA

**Objectif :** organiser le passage de la version actuelle à une bêta fermée utile, sans activer Stripe tant que le parcours produit n’est pas validé. Ce document complète le kit de lancement existant : il définit les décisions, responsabilités et critères à réunir ensemble avant une publication plus large.

> **Principe de pilotage :** ne pas confondre une application techniquement prête avec une offre validée. La bêta doit répondre, dans l’ordre, à trois questions : les freelances comprennent-ils la promesse, terminent-ils une première session, puis reviennent-ils ?

## 1. État de départ

| Domaine | Disponible aujourd’hui | À organiser ensemble |
|---|---|---|
| Produit | Coaching IA, gamification, Store consultable, PWA, écran de feedback local | Définir le cas d’usage principal à démontrer pendant la bêta |
| Distribution | Prévisualisation et build PWA | Choisir un nom de domaine et publier une version web durable avant l’installation PWA par les testeurs |
| Paiements | Catalogue, portefeuille, attribution et Stripe en attente | Décider quand activer Stripe test, puis fournir les clés au moment choisi |
| Données | Tableau de bord admin, alertes, feedback local exportable | Fixer le rituel hebdomadaire de lecture des indicateurs et des retours |
| Support | Kit d’invitation et écran de feedback | Choisir un canal de réponse unique : adresse e-mail, groupe privé ou messagerie dédiée |

## 2. Décisions à prendre avant d’inviter les testeurs

| Décision | Proposition de départ | Décideur | Résultat attendu |
|---|---|---|---|
| **Cible bêta** | 30 freelances ou créateurs qui préparent régulièrement des messages, offres ou pitchs clients | Vous | Une description courte du testeur idéal et une liste de premiers contacts |
| **Promesse unique** | « Clarifiez un message ou un pitch client en 10 minutes avec CoachIA » | Vous et nous | Une phrase identique dans l’invitation, l’onboarding et la page d’accès |
| **Durée du test** | 10 jours, avec relance à J+1, J+3 et J+7 | Nous préparons les textes ; vous les envoyez | Un calendrier de suivi simple |
| **Canal de support** | Une adresse e-mail dédiée ou un petit groupe privé | Vous | Un seul endroit où répondre aux blocages urgents |
| **Règle de confidentialité** | Ne demander ni données clients sensibles, ni informations de paiement, ni captures de conversations confidentielles | Ensemble | Une consigne claire dans l’invitation et le support |
| **Publication PWA** | Publier la version PWA sur un domaine stable avant de demander l’installation | Vous, après checkpoint | Un lien HTTPS durable testable dans Safari et Chrome |

## 3. Plan d’exécution de la bêta fermée

| Période | Action | Responsable | Indicateur de décision |
|---|---|---|---|
| **Préparation (2–3 jours)** | Confirmer cible, promesse, canal de support et version publiée | Ensemble | Lien PWA valide et message d’invitation finalisé |
| **Jours 1–2** | Inviter 30 personnes, expliquer le test de 10 jours et demander une première session | Vous | 10 réponses positives ou plus |
| **Jours 3–4** | Vérifier les installations, aider les personnes bloquées et rappeler l’objectif de la première session | Vous ; nous corrigeons les blocages signalés | Au moins 60 % des inscrits terminent une session |
| **Jours 5–7** | Lire les feedbacks exportés, regrouper les problèmes par thème et choisir trois améliorations maximum | Ensemble | Les trois problèmes les plus fréquents sont connus |
| **Jours 8–10** | Mesurer les retours, les sessions répétées et l’intérêt pour une offre payante future | Ensemble | Décision : itérer, élargir la bêta ou préparer Stripe test |

## 4. Indicateurs à suivre sans Stripe

| Indicateur | Méthode de suivi | Seuil initial de travail | Décision associée |
|---|---|---:|---|
| Invités ayant répondu | Liste de recrutement | 10 réponses positives sur 30 invitations | Revoir la cible ou le message si le seuil n’est pas atteint |
| Première session terminée | Retour direct des testeurs et tableau admin lorsque disponible | 60 % des inscrits | Simplifier l’onboarding ou le premier exercice si le seuil est bas |
| Retour après 7 jours | Message de suivi et activité observée | 25 % des testeurs actifs | Renforcer la micro-victoire, les défis et les rappels si le seuil est bas |
| Note moyenne | Écran « Donner mon avis bêta » | 4/5 ou plus | Lire les verbatims si la moyenne est inférieure |
| Problèmes récurrents | Exports des feedbacks | Trois thèmes maximum à corriger par cycle | Ne pas ajouter de fonctionnalités avant de traiter les blocages dominants |

## 5. Ce qui attend volontairement après la bêta initiale

| Élément | Pourquoi attendre | Condition pour démarrer |
|---|---|---|
| Stripe réel | Éviter de vendre avant d’avoir validé le parcours et la demande | Premiers signaux de rétention et choix de l’offre payante phare |
| Publicité ou acquisition payante | Ne pas financer l’acquisition tant que l’activation n’est pas prouvée | Activation et retour à 7 jours satisfaisants |
| Élargissement à plusieurs niches | Risque de brouiller la proposition de valeur | Une niche initiale montre une utilisation répétée |
| Automatisation avancée du support | Inutile avant de connaître les questions récurrentes | Au moins 20 retours ou demandes réelles analysés |

## 6. Première réunion de coordination

Cette réunion peut durer 30 minutes. L’objectif est d’en ressortir avec cinq décisions fermes :

1. la **cible exacte** et le nombre de personnes à inviter ;
2. la **promesse unique** retenue ;
3. le **canal de support** utilisé pendant 10 jours ;
4. la **date de publication PWA** et le lien à transmettre ;
5. la **date de revue** des premiers retours.

Une fois ces cinq décisions prises, nous pouvons préparer les messages J+1, J+3 et J+7, puis traiter les problèmes produits à partir de retours réels. Stripe reste hors périmètre jusqu’à votre feu vert.
