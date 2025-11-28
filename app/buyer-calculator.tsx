
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function BuyerCalculatorScreen() {
  const router = useRouter();
  const [purchasePrice, setPurchasePrice] = useState('');
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [hasConcessionCard, setHasConcessionCard] = useState(false);
  const [legalFees, setLegalFees] = useState('1500');
  const [mortgageAmount, setMortgageAmount] = useState('');

  const calculateLandTransferFee = (price: number): number => {
    // Simplified calculation based on Victorian land transfer fees
    if (price <= 25000) return 110;
    if (price <= 130000) return 110 + ((price - 25000) / 1000) * 2.46;
    if (price <= 960000) return 368.30 + ((price - 130000) / 1000) * 5.06;
    return 4568.10 + ((price - 960000) / 1000) * 5.06;
  };

  const calculateStampDuty = (price: number, firstHome: boolean, concession: boolean): number => {
    // Simplified stamp duty calculation
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

  const calculateMortgageRegistration = (amount: number): number => {
    if (amount <= 0) return 0;
    return 119.90;
  };

  const price = parseFloat(purchasePrice) || 0;
  const mortgage = parseFloat(mortgageAmount) || 0;
  const legal = parseFloat(legalFees) || 0;

  const landTransferFee = calculateLandTransferFee(price);
  const stampDuty = calculateStampDuty(price, isFirstHomeBuyer, hasConcessionCard);
  const mortgageReg = calculateMortgageRegistration(mortgage);
  const caveatFee = 119.90;

  const totalCosts = landTransferFee + stampDuty + mortgageReg + caveatFee + legal;

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
        <Text style={styles.headerTitle}>Buyer Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={commonStyles.card}>
          <Text style={commonStyles.label}>Purchase Price ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter purchase price"
            keyboardType="numeric"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
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

          <Text style={commonStyles.label}>Mortgage Amount ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter mortgage amount (optional)"
            keyboardType="numeric"
            value={mortgageAmount}
            onChangeText={setMortgageAmount}
          />

          <Text style={commonStyles.label}>Legal Fees ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter legal fees"
            keyboardType="numeric"
            value={legalFees}
            onChangeText={setLegalFees}
          />
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Cost Breakdown</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Land Transfer Fee</Text>
            <Text style={styles.resultValue}>${landTransferFee.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Stamp Duty</Text>
            <Text style={styles.resultValue}>${stampDuty.toFixed(2)}</Text>
          </View>

          {mortgage > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Mortgage Registration</Text>
              <Text style={styles.resultValue}>${mortgageReg.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Caveat Lodgement</Text>
            <Text style={styles.resultValue}>${caveatFee.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Legal Fees</Text>
            <Text style={styles.resultValue}>${legal.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Costs</Text>
            <Text style={styles.totalValue}>${totalCosts.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount Required</Text>
            <Text style={styles.totalValue}>${(price + totalCosts).toFixed(2)}</Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.textSecondary}>
            * These calculations are estimates only. Actual costs may vary. 
            Please consult with a conveyancer or solicitor for exact figures.
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.text,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.primary,
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
