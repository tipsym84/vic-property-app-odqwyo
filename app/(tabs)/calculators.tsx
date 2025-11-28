
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function CalculatorsScreen() {
  const router = useRouter();

  const calculators = [
    {
      id: 'buyer',
      title: 'Buyer Calculator',
      description: 'Calculate all costs for purchasing property',
      icon: 'home',
      route: '/buyer-calculator',
      color: colors.primary,
    },
    {
      id: 'vendor',
      title: 'Vendor Calculator',
      description: 'Calculate all costs for selling property',
      icon: 'sell',
      route: '/vendor-calculator',
      color: colors.secondary,
    },
    {
      id: 'auction',
      title: 'AuctionGuru',
      description: 'Real-time bidding calculator',
      icon: 'gavel',
      route: '/auction-guru',
      color: colors.accent,
    },
    {
      id: 'reverse',
      title: 'Reverse Calculator',
      description: 'Calculate required sale price from desired net proceeds',
      icon: 'swap-horiz',
      route: '/reverse-calculator',
      color: colors.success,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Calculators</Text>
          <Text style={styles.subtitle}>
            Choose a calculator to estimate your property transaction costs
          </Text>
        </View>

        {calculators.map((calc) => (
          <TouchableOpacity
            key={calc.id}
            style={[commonStyles.card, styles.calculatorCard]}
            onPress={() => router.push(calc.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: calc.color + '20' }]}>
              <IconSymbol
                ios_icon_name={calc.icon}
                android_material_icon_name={calc.icon}
                size={32}
                color={calc.color}
              />
            </View>
            <View style={styles.calculatorContent}>
              <Text style={styles.calculatorTitle}>{calc.title}</Text>
              <Text style={styles.calculatorDescription}>{calc.description}</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))}

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>About Our Calculators</Text>
          <Text style={commonStyles.text}>
            Our calculators use the latest Victorian government fee schedules and regulations 
            to provide accurate estimates of your property transaction costs.
          </Text>
          <Text style={[commonStyles.text, { marginTop: 12 }]}>
            All calculations are estimates only. Please consult with a conveyancer or 
            solicitor for exact figures.
          </Text>
        </View>

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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  calculatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calculatorContent: {
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  calculatorDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});
