
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalculatorsScreen() {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    checkUnlockStatus();
  }, []);

  const checkUnlockStatus = async () => {
    try {
      const savedAgent = await AsyncStorage.getItem('agentInfo');
      const hasPaid = await AsyncStorage.getItem('hasPaid');
      const storedAgentCode = await AsyncStorage.getItem('agentCode');
      
      if (savedAgent || hasPaid || storedAgentCode) {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.log('Error checking unlock status:', error);
    }
  };

  const handleCalculatorPress = (route: string, title: string) => {
    if (!isUnlocked) {
      Alert.alert(
        'App Locked',
        'Please enter an agent code or purchase the app to access this feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    console.log('Navigating to calculator:', route);
    router.push(route as any);
  };

  const calculators = [
    {
      id: 'auction',
      title: 'AuctionGuru',
      description: 'Real-time bidding calculator with cash needed analysis',
      icon: 'gavel',
      route: '/auction-guru',
      color: colors.secondary,
    },
    {
      id: 'buyer',
      title: 'Buyer Calculator',
      description: 'Calculate all costs for purchasing property',
      icon: 'home',
      route: '/buyer-calculator',
      color: colors.primary,
    },
    {
      id: 'max-purchase',
      title: 'Maximum Purchase Price',
      description: 'Calculate the maximum property price you can afford',
      icon: 'trending-up',
      route: '/max-purchase-calculator',
      color: colors.success,
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
      id: 'reverse',
      title: 'Reverse Calculator',
      description: 'Calculate required sale price from desired net proceeds',
      icon: 'swap-horiz',
      route: '/reverse-calculator',
      color: colors.accent,
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

        {!isUnlocked && (
          <View style={[commonStyles.card, styles.lockCard]}>
            <IconSymbol 
              ios_icon_name="lock.fill" 
              android_material_icon_name="lock" 
              size={32} 
              color={colors.secondary}
            />
            <Text style={styles.lockText}>
              Enter an agent code on the Profile tab to unlock all calculators.
            </Text>
          </View>
        )}

        {calculators.map((calc, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[commonStyles.card, styles.calculatorCard, !isUnlocked && styles.lockedCard]}
              onPress={() => handleCalculatorPress(calc.route, calc.title)}
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
          </React.Fragment>
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
  lockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingVertical: 16,
  },
  lockText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  calculatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedCard: {
    opacity: 0.5,
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
