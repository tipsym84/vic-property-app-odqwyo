
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStampDuty, calculateLandTransferFee, UserProfile } from '@/utils/stampDutyCalculations';

export default function MaxPurchaseCalculatorScreen() {
  const router = useRouter();
  const [savings, setSavings] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [estimatedOtherCosts, setEstimatedOtherCosts] = useState('3000');
  const [concessionAlertShown, setConcessionAlertShown] = useState(false);

  // User profile from AsyncStorage
  const [userProfile, setUserProfile] = useState<UserProfile>({
    isPrimaryResidence: true,
    isFirstHomeBuyer: false,
    isConcessionCardHolder: false,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const primaryResidence = await AsyncStorage.getItem('isPrimaryResidence');
      const firstHomeBuyer = await AsyncStorage.getItem('isFirstHomeBuyer');
      const concessionCard = await AsyncStorage.getItem('isConcessionCardHolder');
      
      setUserProfile({
        isPrimaryResidence: primaryResidence === 'true',
        isFirstHomeBuyer: firstHomeBuyer === 'true',
        isConcessionCardHolder: concessionCard === 'true',
      });
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };

  const showConcessionAlert = () => {
    if (!concessionAlertShown) {
      Alert.alert(
        'Important Notice',
        'This calculation applies to contracts signed on or after 1 July 2023. If your contract was signed before this date please seek legal advice.',
        [{ text: 'OK' }]
      );
      setConcessionAlertShown(true);
    }
  };

  const calculateMaxPurchasePrice = (): number => {
    const availableFunds = (parseFloat(savings) || 0) + (parseFloat(loanAmount) || 0);
    const otherCosts = parseFloat(estimatedOtherCosts) || 0;
    
    let estimatedPrice = availableFunds - otherCosts;
    let iterations = 0;
    const maxIterations = 20;
    
    while (iterations < maxIterations) {
      const stampDuty = calculateStampDuty(estimatedPrice, userProfile, showConcessionAlert);
      const landTransferFee = calculateLandTransferFee(estimatedPrice);
      const mortgageReg = parseFloat(loanAmount) > 0 ? 119.90 : 0;
      const caveatFee = 119.90;
      
      const totalCosts = stampDuty + landTransferFee + mortgageReg + caveatFee + otherCosts;
      const calculatedPrice = availableFunds - totalCosts;
      
      if (Math.abs(calculatedPrice - estimatedPrice) < 100) {
        return Math.max(0, calculatedPrice);
      }
      
      estimatedPrice = calculatedPrice;
      iterations++;
    }
    
    return Math.max(0, estimatedPrice);
  };

  const maxPrice = calculateMaxPurchasePrice();
  const stampDuty = calculateStampDuty(maxPrice, userProfile, showConcessionAlert);
  const landTransferFee = calculateLandTransferFee(maxPrice);
  const mortgageReg = parseFloat(loanAmount) > 0 ? 119.90 : 0;
  const caveatFee = 119.90;
  const otherCosts = parseFloat(estimatedOtherCosts) || 0;
  const totalCosts = stampDuty + landTransferFee + mortgageReg + caveatFee + otherCosts;

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maximum Purchase Price</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={commonStyles.card}>
          <View style={styles.profileBanner}>
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="account-circle"
              size={24}
              color={colors.primary}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>Using your profile settings:</Text>
              <Text style={styles.profileValue}>
                {userProfile.isPrimaryResidence ? 'Primary Residence' : 'Not Primary Residence'}
                {userProfile.isFirstHomeBuyer && ' • First Home Buyer'}
                {userProfile.isConcessionCardHolder && ' • Concession Card'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Calculate Your Budget</Text>
          <Text style={commonStyles.textSecondary}>
            Enter your available funds to calculate the maximum property price you can afford, 
            including all government fees and costs.
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.label}>Your Savings ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter your total savings"
            keyboardType="numeric"
            value={savings}
            onChangeText={setSavings}
          />

          <Text style={commonStyles.label}>Loan Amount ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter approved loan amount"
            keyboardType="numeric"
            value={loanAmount}
            onChangeText={setLoanAmount}
          />

          <Text style={commonStyles.label}>Estimated Other Costs ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Legal fees, inspections, etc."
            keyboardType="numeric"
            value={estimatedOtherCosts}
            onChangeText={setEstimatedOtherCosts}
          />
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Your Maximum Budget</Text>
          
          <View style={styles.priceHighlight}>
            <Text style={styles.priceLabel}>Maximum Purchase Price</Text>
            <Text style={styles.priceValue}>${maxPrice.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.breakdownTitle}>Breakdown</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Available Funds</Text>
            <Text style={styles.resultValue}>
              ${((parseFloat(savings) || 0) + (parseFloat(loanAmount) || 0)).toLocaleString()}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Maximum Purchase Price</Text>
            <Text style={styles.resultValue}>${maxPrice.toLocaleString()}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Stamp Duty</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${stampDuty.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Land Transfer Fee</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${landTransferFee.toFixed(2)}</Text>
          </View>

          {mortgageReg > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Mortgage Registration</Text>
              <Text style={[styles.resultValue, styles.costValue]}>-${mortgageReg.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Caveat Lodgement</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${caveatFee.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Other Costs</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${otherCosts.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Costs</Text>
            <Text style={[styles.totalValue, styles.costValue]}>${totalCosts.toFixed(2)}</Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.textSecondary}>
            * This calculation provides an estimate of the maximum property price you can afford 
            based on your available funds. Actual costs may vary. Please consult with a conveyancer 
            or financial advisor for personalized advice.
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  resultsCard: {
    backgroundColor: colors.highlight,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  priceHighlight: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  costValue: {
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomPadding: {
    height: 20,
  },
});
