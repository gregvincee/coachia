# Audit conformité, accessibilité et équité — CoachIA

**Date de l’audit : 24 septembre 2026**  
**Périmètre :** application Expo/React Native, export web/PWA, parcours bêta, diagnostic IA, collecte de la liste d’attente, écrans de paiement préparatoires et tableau de bord administrateur.

## Conclusion

CoachIA dispose maintenant d’un **socle technique de conformité** : les parcours bêta affichent la confidentialité, les conditions d’utilisation et les engagements d’IA responsable ; les contrôles principaux ont un nom accessible ; les textes de la palette luxe présentent un contraste mesuré supérieur aux seuils WCAG AA usuels ; les scores sont séparés de l’XP ; les métriques administratives restent agrégées ; et le diagnostic IA est présenté comme un outil pédagogique, non comme une décision sur une personne.

Il serait toutefois inexact de déclarer CoachIA **parfaitement conforme ou juridiquement prêt pour tous les pays**. La conformité dépend de l’identité de l’exploitant, du pays des utilisateurs, des fournisseurs réellement utilisés, des conditions commerciales et d’une validation juridique. Le lancement public doit rester bloqué tant que les éléments marqués « requis avant public » ne sont pas complétés.

## Vérifications réalisées

| Domaine | Résultat | Preuve ou correction |
|---|---|---|
| Tests et typage | Validé | **124 tests passent, 1 test est ignoré ; TypeScript passe.** Ajout de `tests/compliance-baseline.test.ts`. |
| Contraste visuel | Validé sur les tokens inspectés | Ivoire sur obsidienne : 17,76:1 ; argent sur obsidienne : 9,62:1 ; champagne clair sur obsidienne : 12,54:1 ; obsidienne sur champagne : 10,02:1. Les boutons champagne n’utilisent plus du texte blanc à faible contraste. |
| Noms accessibles | Partiellement validé | Les champs e-mail, cases de consentement, boutons principaux, images de marque et messages de statut du parcours bêta ont des labels ou des régions live. Un audit manuel avec lecteur d’écran et clavier reste requis sur toutes les routes. |
| Confidentialité bêta | Validé avec limites déclarées | La collecte e-mail, la finalité, la séparation des métriques, le retrait et les limites de la version actuelle sont expliqués dans `/privacy`. |
| Conditions d’utilisation | Ajouté | Nouvelle page `/terms` : limites de l’IA, contenu interdit, âge cible, paiements futurs, disponibilité, équité et responsabilité. Elle doit être relue par un juriste avant publication commerciale. |
| Équité et IA responsable | Ajouté | Nouvelle page `/responsible-ai` : non-discrimination, limites linguistiques et de style, droit à la reprise, accommodations et interdiction d’utiliser un score seul pour une décision importante. |
| Protection des comptes | Non complet | Le retrait de la liste d’attente est automatisé. L’export et la suppression complète d’un compte utilisateur ne sont pas encore disponibles. |
| Identité légale | Partiellement renseigné | L’adresse de confidentialité et de support fournie est **vragelab@gmail.com**. Le nom légal de l’exploitant, la juridiction, l’adresse postale, le canal de réclamation formel et les responsables des traitements doivent encore être renseignés. |
| Paiements | Non actif | Stripe est préparé mais aucun paiement réel ne doit être activé avant la publication des prix, taxes, remboursements, conditions de vente et support. |
| Évaluation d’équité | Non complet | Les garanties sont documentées, mais il manque encore des tests avec des utilisateurs présentant des niveaux de langue, d’accessibilité et de contexte différents. |

## Confidentialité et droits des personnes

La page bêta respecte une logique de minimisation : elle demande une adresse e-mail seulement pour l’invitation, normalise l’adresse côté serveur, exige un consentement explicite et évite de révéler si une adresse est inscrite lors du retrait. Les métriques administratives sont agrégées et le contenu détaillé des retours bêta reste local jusqu’au partage volontaire.

La transparence est maintenant correcte pour la bêta, mais elle ne suffit pas encore pour un lancement commercial. Il faut ajouter une procédure vérifiable pour l’accès, la correction, l’export et la suppression des données de compte. Il faut également fixer une durée de conservation exacte, documenter les fournisseurs qui traitent les données, préciser les transferts éventuels et publier un canal de réclamation. Ces éléments dépendent du pays ciblé et doivent être confirmés par un professionnel compétent.

La version actuelle indique que la bêta est destinée aux personnes de 18 ans et plus. Cette règle doit rester cohérente dans le marketing, l’onboarding, les invitations et les conditions finales. Si des mineurs doivent être acceptés plus tard, il faudra concevoir un consentement parental et une politique spécifique avant de les inviter.

## Accessibilité

Les contrôles principaux du parcours public ont été nommés avec `accessibilityLabel`, `accessibilityRole` et `accessibilityState` lorsque cela était nécessaire. Les messages de validation et d’erreur utilisent une région live dans les écrans de lancement et de retrait. Les surfaces champagne utilisent maintenant du texte obsidienne, ce qui améliore fortement le contraste.

La conformité WCAG ne peut pas être déclarée sur la seule base de tests statiques. Avant lancement, il faut encore tester le parcours `/launch`, `/privacy`, `/terms`, `/responsible-ai`, `/onboarding`, `/mission/[missionId]`, `/profile` et `/store` avec navigation clavier, zoom, lecteur d’écran, ordre de focus, reflow mobile et réduction des animations. Il faut également vérifier les états désactivés, les messages de quota et les écrans d’erreur réseau.

## Équité du diagnostic IA

Le moteur sépare désormais la maîtrise réelle de l’XP et évalue quatre capacités identiques pour les utilisateurs : prompting, vérification, raisonnement et automatisation. Le prompt serveur demande une correction bienveillante et exige une nouvelle tentative autonome. Le score mesure une tentative démontrée, pas l’effort, l’identité ou la valeur de la personne.

Une limite importante demeure : le repli local repose sur des marqueurs textuels en français. Il peut donc sous-évaluer une formulation correcte utilisant des synonymes, une autre variété de français, une orthographe atypique ou un outil d’assistance. Le diagnostic IA ne doit pas servir à prendre une décision d’emploi, d’admission, de crédit, d’assurance ou d’accès à un droit. La page IA responsable l’explique explicitement.

Avant le lancement, il faut constituer un petit jeu de tests non identifiants comprenant plusieurs longueurs de texte, niveaux de français, styles d’écriture et usages d’outils d’assistance. Les résultats doivent être comparés par mission et par capacité. Toute différence inexpliquée doit entraîner une correction du moteur ou une réduction de la portée du score.

## Actions obligatoires avant lancement public

1. Renseigner l’identité légale de l’exploitant, la juridiction, l’adresse postale et le canal de réclamation ; le contact confidentialité/support `vragelab@gmail.com` est maintenant publié.
2. Ajouter l’export et la suppression du compte, puis tester la suppression des données associées et des journaux nécessaires.
3. Fixer les durées de conservation et documenter les fournisseurs de base de données, cache, e-mail, stockage, hébergement et IA.
4. Réaliser un audit manuel clavier et lecteur d’écran sur mobile et web, puis corriger les écarts constatés.
5. Exécuter le test d’équité avec un panel bêta diversifié et documenter les résultats sans conserver de catégories sensibles inutiles.
6. Avant Stripe, publier les prix, taxes applicables, conditions de vente, politique de remboursement, support et traitement des échecs de paiement.
7. Vérifier que le backend permanent, le domaine, HTTPS, les cookies de session, les sauvegardes et la procédure d’incident sont prêts.
8. Faire relire les textes finaux par un juriste dans les juridictions réellement ciblées.

## Références

[1]: https://www.w3.org/TR/WCAG22/ "Web Content Accessibility Guidelines (WCAG) 2.2"

[2]: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-privacy-act-and-pipeda/ "Office of the Privacy Commissioner of Canada — Privacy laws in Canada"

[3]: https://www.cnil.fr/fr/definition/protection-des-donnees-des-la-conception "CNIL — Protection des données dès la conception"
