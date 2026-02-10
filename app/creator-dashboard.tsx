/**
 * Écran du dashboard créateur
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { getCreatorProfile, getCreatorStats, getCreatorContent } from '@/lib/creator-dashboard';
import type { CreatorProfile, CreatorStats } from '@/lib/types-creator';

export default function CreatorDashboardScreen() {
  const colors = useColors();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'earnings'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      // Simuler l'ID utilisateur (en production, utiliser l'authentification)
      const userId = 'user-123';
      
      const profileData = await getCreatorProfile(userId);
      if (profileData) {
        setProfile(profileData);
        const statsData = await getCreatorStats(profileData.id);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données créateur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground">Chargement...</Text>
      </ScreenContainer>
    );
  }

  if (!profile || !stats) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground mb-4">Pas de profil créateur trouvé</Text>
        <TouchableOpacity 
          className="bg-primary px-6 py-3 rounded-full"
          onPress={() => {
            // Naviguer vers la création de profil
          }}
        >
          <Text className="text-background font-semibold">Créer un profil</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* En-tête du profil */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-16 h-16 rounded-full bg-primary mr-4 items-center justify-center"
            >
              <Text className="text-2xl text-background font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">{profile.name}</Text>
              <Text className="text-sm text-muted">{profile.specialties.join(', ')}</Text>
              {profile.verified && (
                <Text className="text-xs text-success font-semibold">✓ Vérifié</Text>
              )}
            </View>
          </View>
          <Text className="text-sm text-muted mb-3">{profile.bio}</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-lg font-bold text-foreground">{profile.rating.toFixed(1)}</Text>
              <Text className="text-xs text-muted">Note</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-foreground">{profile.reviewCount}</Text>
              <Text className="text-xs text-muted">Avis</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-foreground">{profile.followerCount}</Text>
              <Text className="text-xs text-muted">Followers</Text>
            </View>
          </View>
        </View>

        {/* Onglets */}
        <View className="flex-row mb-4 bg-surface rounded-lg p-1">
          {['overview', 'content', 'earnings'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 rounded-md ${
                activeTab === tab ? 'bg-primary' : ''
              }`}
            >
              <Text 
                className={`text-center text-sm font-semibold ${
                  activeTab === tab ? 'text-background' : 'text-foreground'
                }`}
              >
                {tab === 'overview' ? 'Aperçu' : tab === 'content' ? 'Contenu' : 'Revenus'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <View>
            {/* Statistiques principales */}
            <View className="grid grid-cols-2 gap-4 mb-4">
              <StatCard 
                title="Ventes totales" 
                value={stats.totalSales.toString()}
                color={colors.primary}
              />
              <StatCard 
                title="Revenus" 
                value={`$${stats.totalRevenue.toFixed(2)}`}
                color={colors.success}
              />
              <StatCard 
                title="Vues" 
                value={stats.totalViews.toString()}
                color={colors.primary}
              />
              <StatCard 
                title="Taux de conversion" 
                value={`${stats.conversionRate.toFixed(1)}%`}
                color={colors.warning}
              />
            </View>

            {/* Contenu le plus vendu */}
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">Top contenu</Text>
              {stats.topContent.length > 0 ? (
                stats.topContent.slice(0, 3).map(content => (
                  <View key={content.id} className="mb-3 pb-3 border-b border-border last:border-b-0">
                    <Text className="font-semibold text-foreground">{content.title}</Text>
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-xs text-muted">{content.sales} ventes</Text>
                      <Text className="text-xs text-muted">${content.price}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-muted">Aucun contenu publié</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'content' && (
          <View>
            <TouchableOpacity className="bg-primary rounded-lg p-4 mb-4">
              <Text className="text-center text-background font-semibold">+ Créer un contenu</Text>
            </TouchableOpacity>
            {/* Liste des contenus */}
            <View className="bg-surface rounded-2xl p-4">
              <Text className="text-lg font-bold text-foreground mb-3">Mes contenus</Text>
              {stats.topContent.length > 0 ? (
                stats.topContent.map(content => (
                  <View key={content.id} className="mb-3 pb-3 border-b border-border last:border-b-0">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{content.title}</Text>
                        <Text className="text-xs text-muted mt-1">{content.category}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-semibold text-foreground">${content.price}</Text>
                        <Text className="text-xs text-muted">{content.sales} ventes</Text>
                      </View>
                    </View>
                    <View className="flex-row mt-2 gap-2">
                      <TouchableOpacity className="flex-1 bg-primary/10 rounded py-2">
                        <Text className="text-center text-xs text-primary font-semibold">Éditer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 bg-error/10 rounded py-2">
                        <Text className="text-center text-xs text-error font-semibold">Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-muted">Aucun contenu créé</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'earnings' && (
          <View>
            {/* Revenus du mois */}
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-2">Revenus ce mois</Text>
              <Text className="text-3xl font-bold text-success mb-2">
                ${stats.thisMonthRevenue.toFixed(2)}
              </Text>
              <Text className="text-sm text-muted">{stats.thisMonthSales} ventes</Text>
            </View>

            {/* Ventes récentes */}
            <View className="bg-surface rounded-2xl p-4 mb-4">
              <Text className="text-lg font-bold text-foreground mb-3">Ventes récentes</Text>
              {stats.recentSales.length > 0 ? (
                stats.recentSales.slice(-5).reverse().map(sale => (
                  <View key={sale.id} className="mb-3 pb-3 border-b border-border last:border-b-0">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{sale.contentTitle}</Text>
                        <Text className="text-xs text-muted mt-1">
                          {new Date(sale.timestamp).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-success">${sale.amount}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-muted">Aucune vente</Text>
              )}
            </View>

            {/* Bouton de retrait */}
            <TouchableOpacity className="bg-primary rounded-lg p-4 mb-4">
              <Text className="text-center text-background font-semibold">Demander un retrait</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Composant StatCard
 */
function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <View className="bg-surface rounded-lg p-4 flex-1">
      <Text className="text-xs text-muted mb-2">{title}</Text>
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
