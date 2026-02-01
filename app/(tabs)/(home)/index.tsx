
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
          <Text style={styles.subheading}>Get the figures that matter for your……</Text>
        </View>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard]}
          onPress={() => handleFeaturePress('/buy')}
        >
          <View style={[styles.featureIcon, { backgroundColor: '#f5f5f5' }]}>
            <IconSymbol 
              ios_icon_name="gavel" 
              android_material_icon_name="gavel" 
              size={32} 
              color="#424242"
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Purchase</Text>
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
          <View style={[styles.featureIcon, { backgroundColor: '#f5f5f5' }]}>
            <IconSymbol 
              ios_icon_name="dollarsign.circle" 
              android_material_icon_name="attach-money" 
              size={32} 
              color="#424242"
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Sale</Text>
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
  subheading: {
    fontSize: 18,
    color: colors.textSecondary,
    fontFamily: 'CourierPrime_400Regular',
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
  },
  bottomPadding: {
    height: 20,
  },
});
