import { describe, expect, it } from 'vitest';

import { getCorrectionDifficultyLevel, getMissionCorrectionExample } from '../lib/mission-correction-examples';

const diagnosisWithScores = (score: number) => ({
  capabilityScores: { prompting: score, verification: score, reasoning: score, automation: score },
});

describe('exemples de correction adaptatifs', () => {
  it('choisit un niveau guidé, ciblé ou approfondi selon la capacité la plus faible', () => {
    expect(getCorrectionDifficultyLevel(diagnosisWithScores(20))).toBe('guided');
    expect(getCorrectionDifficultyLevel(diagnosisWithScores(50))).toBe('targeted');
    expect(getCorrectionDifficultyLevel(diagnosisWithScores(78))).toBe('advanced');
  });

  it('fournit un exemple distinct pour chaque mission et niveau', () => {
    expect(getMissionCorrectionExample('create', diagnosisWithScores(20)).levelLabel).toBe('Niveau guidé');
    expect(getMissionCorrectionExample('solve', diagnosisWithScores(50)).title).toContain('décision vérifiable');
    expect(getMissionCorrectionExample('build', diagnosisWithScores(80)).takeaway).toContain('données sont incomplètes');
  });
});
