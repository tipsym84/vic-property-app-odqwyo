
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const router = useRouter();

  const handleFeaturePress = (route: string) => {
    console.log('Navigating to:', route);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>VicPropertyGuru</Text>
        </View>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard]}
          onPress={() => handleFeaturePress('/buy')}
        >
          <View style={[styles.featureIcon, { backgroundColor: '#e3f2fd' }]}>
            <IconSymbol 
              ios_icon_name="hammer" 
              android_material_icon_name="gavel" 
              size={32} 
              color="#1976d2"
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Buy</Text>
            <Text style={styles.featureDescription}>
              Real-time bidding calculator to see your true costs
            </Text>
          </View>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron-right" 
            size={24} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard]}
          onPress={() => handleFeaturePress('/sell')}
        >
          <View style={[styles.featureIcon, { backgroundColor: '#e8f5e9' }]}>
            <IconSymbol 
              ios_icon_name="dollarsign.circle" 
              android_material_icon_name="attach-money" 
              size={32} 
              color="#388e3c"
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Sell</Text>
            <Text style={styles.featureDescription}>
              Calculate your net proceeds from selling your property
            </Text>
          </View>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron-right" 
            size={24} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'CourierPrime_700Bold',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'CourierPrime_700Bold',
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'CourierPrime_400Regular',
  },
  bottomPadding: {
    height: 20,
  },
});
