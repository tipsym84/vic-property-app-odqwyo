
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function VendorCalculatorScreen() {
  const router = useRouter();
  const [salePrice, setSalePrice] = useState('');
  const [agentCommission, setAgentCommission] = useState('2.5');
  const [advertisingCosts, setAdvertisingCosts] = useState('2000');
  const [legalFees, setLegalFees] = useState('1200');
  const [mortgageBalance, setMortgageBalance] = useState('');

  const price = parseFloat(salePrice) || 0;
  const commission = (price * (parseFloat(agentCommission) || 0)) / 100;
  const advertising = parseFloat(advertisingCosts) || 0;
  const legal = parseFloat(legalFees) || 0;
  const mortgage = parseFloat(mortgageBalance) || 0;
  const dischargeFee = mortgage > 0 ? 350 : 0;

  const totalCosts = commission + advertising + legal + dischargeFee;
  const netProceeds = price - totalCosts - mortgage;

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
        <Text style={styles.headerTitle}>Vendor Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={commonStyles.card}>
          <Text style={commonStyles.label}>Sale Price ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter sale price"
            keyboardType="numeric"
            value={salePrice}
            onChangeText={setSalePrice}
          />

          <Text style={commonStyles.label}>Agent Commission (%)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter commission percentage"
            keyboardType="numeric"
            value={agentCommission}
            onChangeText={setAgentCommission}
          />

          <Text style={commonStyles.label}>Advertising Costs ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter advertising costs"
            keyboardType="numeric"
            value={advertisingCosts}
            onChangeText={setAdvertisingCosts}
          />

          <Text style={commonStyles.label}>Legal Fees ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter legal fees"
            keyboardType="numeric"
            value={legalFees}
            onChangeText={setLegalFees}
          />

          <Text style={commonStyles.label}>Mortgage Balance ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter mortgage balance (optional)"
            keyboardType="numeric"
            value={mortgageBalance}
            onChangeText={setMortgageBalance}
          />
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Cost Breakdown</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Sale Price</Text>
            <Text style={styles.resultValue}>${price.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Agent Commission ({agentCommission}%)</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${commission.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Advertising Costs</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${advertising.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Legal Fees</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${legal.toFixed(2)}</Text>
          </View>

          {mortgage > 0 && (
            <>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Mortgage Discharge Fee</Text>
                <Text style={[styles.resultValue, styles.costValue]}>-${dischargeFee.toFixed(2)}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Mortgage Balance</Text>
                <Text style={[styles.resultValue, styles.costValue]}>-${mortgage.toFixed(2)}</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Costs</Text>
            <Text style={[styles.totalValue, styles.costValue]}>${totalCosts.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Net Proceeds</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>${netProceeds.toFixed(2)}</Text>
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
