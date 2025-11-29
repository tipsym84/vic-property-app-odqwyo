
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function MaxPurchaseCalculatorScreen() {
  const router = useRouter();
  const [savings, setSavings] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [hasConcessionCard, setHasConcessionCard] = useState(false);
  const [estimatedOtherCosts, setEstimatedOtherCosts] = useState('3000');

  const calculateMaxPurchasePrice = (): number => {
    const availableFunds = (parseFloat(savings) || 0) + (parseFloat(loanAmount) || 0);
    const otherCosts = parseFloat(estimatedOtherCosts) || 0;
    
    let estimatedPrice = availableFunds - otherCosts;
    let iterations = 0;
    const maxIterations = 20;
    
    while (iterations < maxIterations) {
      const stampDuty = calculateStampDuty(estimatedPrice, isFirstHomeBuyer, hasConcessionCard);
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

  const calculateStampDuty = (price: number, firstHome: boolean, concession: boolean): number => {
    if (firstHome && price <= 600000) return 0;
    if (firstHome && price <= 750000) {
      const dutyFree = 600000;
      const dutyableAmount = price - dutyFree;
      return dutyableAmount * 0.05;
    }
    
    let duty = 0;
    if (price <= 25000) duty = price * 0.014;
    else if (price <= 130000) duty = 350 + (price - 25000) * 0.024;
    else if (price <= 960000) duty = 2870 + (price - 130000) * 0.06;
    else duty = 52670 + (price - 960000) * 0.055;

    if (concession) duty *= 0.5;
    return duty;
  };

  const calculateLandTransferFee = (price: number): number => {
    if (price <= 25000) return 110;
    if (price <= 130000) return 110 + ((price - 25000) / 1000) * 2.46;
    if (price <= 960000) return 368.30 + ((price - 130000) / 1000) * 5.06;
    return 4568.10 + ((price - 960000) / 1000) * 5.06;
  };

  const maxPrice = calculateMaxPurchasePrice();
  const stampDuty = calculateStampDuty(maxPrice, isFirstHomeBuyer, hasConcessionCard);
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

          <View style={styles.switchRow}>
            <Text style={commonStyles.label}>First Home Buyer</Text>
            <Switch
              value={isFirstHomeBuyer}
              onValueChange={setIsFirstHomeBuyer}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={commonStyles.label}>Concession Card Holder</Text>
            <Switch
              value={hasConcessionCard}
              onValueChange={setHasConcessionCard}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
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
