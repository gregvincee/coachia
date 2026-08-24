import type { MissionDiagnosis, MissionTrackId } from './mission-engine';

export type CorrectionDifficultyLevel = 'guided' | 'targeted' | 'advanced';

export interface MissionCorrectionExample {
  level: CorrectionDifficultyLevel;
  levelLabel: string;
  levelGuidance: string;
  title: string;
  before: string;
  after: string;
  takeaway: string;
}

type CorrectionExampleVariant = Omit<MissionCorrectionExample, 'level'>;

const CORRECTION_EXAMPLES: Record<MissionTrackId, Record<CorrectionDifficultyLevel, CorrectionExampleVariant>> = {
  create: {
    guided: {
      levelLabel: 'Niveau guidé',
      levelGuidance: 'Commencez par compléter une structure simple avant de chercher un style plus original.',
      title: 'Poser les quatre fondations d’un contenu',
      before: '« Écris un post LinkedIn sur mon offre. »',
      after: '« Écris un post LinkedIn de 100 mots. Sujet : mon offre aide les freelances à préparer leurs briefs. Public : freelances débutants. Ton : direct. Termine par une question. »',
      takeaway: 'Pour démarrer, rendez visibles le sujet, le public, le format et le ton.',
    },
    targeted: {
      levelLabel: 'Niveau ciblé',
      levelGuidance: 'Votre structure existe déjà : ajoutez maintenant une contrainte utile et un critère de qualité.',
      title: 'Transformer une demande vague en brief exploitable',
      before: '« Écris un post LinkedIn sur mon offre. »',
      after: '« Rédige un post LinkedIn de 120 mots pour des freelances créatifs. Objectif : leur faire comprendre que mon offre réduit le temps de préparation client. Utilise un ton direct, une accroche avec un problème concret et termine par une question. N’invente aucun résultat chiffré. »',
      takeaway: 'Une création devient plus fiable lorsque le contexte, le public, le format, le ton et les limites sont visibles dans la demande.',
    },
    advanced: {
      levelLabel: 'Niveau approfondi',
      levelGuidance: 'Votre demande est déjà structurée : demandez une comparaison et un contrôle éditorial avant de choisir.',
      title: 'Comparer des angles créatifs sans perdre le contrôle',
      before: '« Écris un post LinkedIn de 120 mots pour des freelances. »',
      after: '« Propose trois angles de post LinkedIn de 120 mots pour des freelances créatifs, puis recommande le plus crédible pour présenter une offre qui réduit le temps de brief. Explique ce choix en une phrase, évite les chiffres non vérifiables et vérifie que le ton reste direct. »',
      takeaway: 'À ce niveau, l’IA ne produit pas seulement : elle compare, justifie et vérifie avec vous.',
    },
  },
  solve: {
    guided: {
      levelLabel: 'Niveau guidé',
      levelGuidance: 'Ne cherchez pas la réponse parfaite : forcez d’abord l’IA à vous présenter des options claires.',
      title: 'Obtenir des options plutôt qu’un conseil unique',
      before: '« Quelle relance dois-je envoyer à ce client ? »',
      after: '« Un client ne répond pas à ma proposition. Propose deux relances courtes : une directe et une plus douce. Pour chacune, explique dans quel cas je dois l’utiliser. »',
      takeaway: 'Pour résoudre, commencez par rendre les options comparables.',
    },
    targeted: {
      levelLabel: 'Niveau ciblé',
      levelGuidance: 'Vous comparez déjà des options : rendez maintenant les risques et hypothèses explicitement vérifiables.',
      title: 'Passer d’une réponse unique à une décision vérifiable',
      before: '« Quelle relance dois-je envoyer à ce client ? »',
      after: '« À partir de ce contexte, propose deux relances distinctes. Pour chacune, indique le bénéfice, le risque et le signe qui me permettra de choisir. Signale les hypothèses que tu fais sur le client avant de conclure. »',
      takeaway: 'Résoudre avec l’IA consiste à comparer des options, rendre les hypothèses visibles et choisir avec un critère.',
    },
    advanced: {
      levelLabel: 'Niveau approfondi',
      levelGuidance: 'Votre raisonnement est solide : testez maintenant votre décision contre plusieurs scénarios plausibles.',
      title: 'Choisir une action avec un test de scénario',
      before: '« Compare ces deux relances et recommande la meilleure. »',
      after: '« Compare ces deux relances pour un client silencieux. Évalue-les dans trois scénarios : intéressé mais occupé, hésitant sur le prix, ou non prioritaire. Pour chaque scénario, donne le risque, le signal à observer et la prochaine action. N’affirme rien qui ne soit pas déduit du contexte fourni. »',
      takeaway: 'Un raisonnement avancé prépare aussi ce qui changera la décision.',
    },
  },
  build: {
    guided: {
      levelLabel: 'Niveau guidé',
      levelGuidance: 'Décrivez un seul enchaînement simple avant d’essayer d’automatiser toutes les étapes.',
      title: 'Dessiner un workflow en trois étapes',
      before: '« Automatise mes briefs clients avec l’IA. »',
      after: '« Quand un brief client arrive, extrais les besoins dans une fiche, crée un brouillon de réponse, puis demande-moi de valider le brouillon avant tout envoi. »',
      takeaway: 'Un workflow commence par un déclencheur, des étapes et une validation.',
    },
    targeted: {
      levelLabel: 'Niveau ciblé',
      levelGuidance: 'Votre séquence existe : ajoutez un contrôle humain clair sur les informations qui comptent.',
      title: 'Rendre un workflow répétable et contrôlable',
      before: '« Automatise mes briefs clients avec l’IA. »',
      after: '« Quand un nouveau brief arrive, extrais les besoins dans une fiche, génère un brouillon de réponse, puis bloque l’envoi tant qu’une personne n’a pas validé le ton, le prix et les informations sensibles. Termine par une liste de contrôles à effectuer. »',
      takeaway: 'Un bon workflow précise le déclencheur, les étapes, le contrôle humain et le résultat attendu.',
    },
    advanced: {
      levelLabel: 'Niveau approfondi',
      levelGuidance: 'Votre workflow est contrôlé : prévoyez désormais les erreurs, la reprise et la traçabilité.',
      title: 'Prévoir les échecs et la reprise du workflow',
      before: '« Crée un workflow pour traiter les briefs et faire valider la réponse. »',
      after: '« Quand un brief arrive, extrais les besoins, génère un brouillon et demande une validation humaine sur le ton, le prix et les informations sensibles. Si une donnée manque, crée une question de clarification au lieu de poursuivre. Conserve la décision de validation et indique comment reprendre le flux après un refus. »',
      takeaway: 'Un workflow avancé sait quoi faire lorsque les données sont incomplètes ou que le contrôle échoue.',
    },
  },
};

export function getCorrectionDifficultyLevel(diagnosis: Pick<MissionDiagnosis, 'capabilityScores'>): CorrectionDifficultyLevel {
  const weakestScore = Math.min(...Object.values(diagnosis.capabilityScores));
  if (weakestScore < 35) return 'guided';
  if (weakestScore < 65) return 'targeted';
  return 'advanced';
}

export function getMissionCorrectionExample(missionId: MissionTrackId, diagnosis: Pick<MissionDiagnosis, 'capabilityScores'>): MissionCorrectionExample {
  const level = getCorrectionDifficultyLevel(diagnosis);
  return { level, ...CORRECTION_EXAMPLES[missionId][level] };
}
