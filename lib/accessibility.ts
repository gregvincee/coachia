/**
 * Service d'accessibilité WCAG pour CoachIA
 */

import { AccessibilityInfo } from 'react-native';

export interface AccessibilityConfig {
  screenReaderEnabled: boolean;
  boldTextEnabled: boolean;
  reduceMotionEnabled: boolean;
  highContrastEnabled: boolean;
  fontSizeMultiplier: number; // 1 = normal, 1.5 = 50% plus grand
}

export interface AccessibilityLabel {
  label: string;
  hint?: string;
  role?: 'button' | 'link' | 'header' | 'image' | 'text' | 'checkbox' | 'radio' | 'switch';
}

export interface ColorContrast {
  foreground: string;
  background: string;
  ratio: number; // WCAG ratio
  level: 'AAA' | 'AA' | 'fail';
}

class AccessibilityManager {
  private config: AccessibilityConfig = {
    screenReaderEnabled: false,
    boldTextEnabled: false,
    reduceMotionEnabled: false,
    highContrastEnabled: false,
    fontSizeMultiplier: 1,
  };

  /**
   * Initialise le gestionnaire d'accessibilité
   */
  async initialize(): Promise<void> {
    try {
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      const boldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
      const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();

      this.config.screenReaderEnabled = screenReaderEnabled;
      this.config.boldTextEnabled = boldTextEnabled;
      this.config.reduceMotionEnabled = reduceMotionEnabled;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'accessibilité:', error);
    }
  }

  /**
   * Obtient la configuration d'accessibilité
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration d'accessibilité
   */
  updateConfig(config: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Annonce un message au lecteur d'écran
   */
  async announce(message: string): Promise<void> {
    if (this.config.screenReaderEnabled) {
      try {
        await AccessibilityInfo.announceForAccessibility(message);
      } catch (error) {
        console.error('Erreur lors de l\'annonce:', error);
      }
    }
  }

  /**
   * Calcule le ratio de contraste WCAG
   */
  calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convertit hex en RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Calcule la luminance relative
   */
  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(x => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Vérifie le niveau WCAG
   */
  checkWCAGLevel(ratio: number): 'AAA' | 'AA' | 'fail' {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'fail';
  }

  /**
   * Vérifie les couleurs pour l'accessibilité
   */
  checkColorContrast(foreground: string, background: string): ColorContrast {
    const ratio = this.calculateContrastRatio(foreground, background);
    const level = this.checkWCAGLevel(ratio);

    return {
      foreground,
      background,
      ratio,
      level,
    };
  }

  /**
   * Obtient la taille de police ajustée
   */
  getAdjustedFontSize(baseSize: number): number {
    return baseSize * this.config.fontSizeMultiplier;
  }

  /**
   * Obtient l'opacité pour les animations réduites
   */
  getAnimationDuration(baseDuration: number): number {
    return this.config.reduceMotionEnabled ? 0 : baseDuration;
  }

  /**
   * Crée un label d'accessibilité
   */
  createLabel(
    label: string,
    hint?: string,
    role?: AccessibilityLabel['role']
  ): AccessibilityLabel {
    return { label, hint, role };
  }
}

// Instance globale
const a11y = new AccessibilityManager();

/**
 * Initialise l'accessibilité
 */
export async function initializeAccessibility(): Promise<void> {
  await a11y.initialize();
}

/**
 * Obtient la configuration d'accessibilité
 */
export function getAccessibilityConfig(): AccessibilityConfig {
  return a11y.getConfig();
}

/**
 * Met à jour la configuration d'accessibilité
 */
export function updateAccessibilityConfig(config: Partial<AccessibilityConfig>): void {
  a11y.updateConfig(config);
}

/**
 * Annonce un message au lecteur d'écran
 */
export async function announceForAccessibility(message: string): Promise<void> {
  await a11y.announce(message);
}

/**
 * Vérifie le contraste des couleurs
 */
export function checkColorContrast(foreground: string, background: string): ColorContrast {
  return a11y.checkColorContrast(foreground, background);
}

/**
 * Obtient la taille de police ajustée
 */
export function getAdjustedFontSize(baseSize: number): number {
  return a11y.getAdjustedFontSize(baseSize);
}

/**
 * Obtient la durée d'animation ajustée
 */
export function getAnimationDuration(baseDuration: number): number {
  return a11y.getAnimationDuration(baseDuration);
}

/**
 * Crée un label d'accessibilité
 */
export function createAccessibilityLabel(
  label: string,
  hint?: string,
  role?: AccessibilityLabel['role']
): AccessibilityLabel {
  return a11y.createLabel(label, hint, role);
}

/**
 * Hook React pour l'accessibilité
 */
export function useAccessibility() {
  return {
    config: getAccessibilityConfig(),
    updateConfig: updateAccessibilityConfig,
    announce: announceForAccessibility,
    checkContrast: checkColorContrast,
    getAdjustedFontSize,
    getAnimationDuration,
    createLabel: createAccessibilityLabel,
  };
}

/**
 * Composant wrapper pour l'accessibilité
 */
export const accessibilityProps = (label: AccessibilityLabel) => ({
  accessible: true,
  accessibilityLabel: label.label,
  accessibilityHint: label.hint,
  accessibilityRole: label.role || 'button',
});

/**
 * Palettes de couleurs accessibles
 */
export const accessibleColorPalettes = {
  highContrast: {
    background: '#000000',
    foreground: '#FFFFFF',
    primary: '#FFFF00',
    success: '#00FF00',
    warning: '#FFA500',
    error: '#FF0000',
  },
  normal: {
    background: '#FFFFFF',
    foreground: '#000000',
    primary: '#0066CC',
    success: '#008000',
    warning: '#FF8C00',
    error: '#CC0000',
  },
};

/**
 * Vérifie si toutes les couleurs d'une palette sont accessibles
 */
export function validatePaletteAccessibility(
  palette: Record<string, string>,
  background: string
): boolean {
  return Object.values(palette).every(color => {
    const contrast = checkColorContrast(color, background);
    return contrast.level === 'AA' || contrast.level === 'AAA';
  });
}
