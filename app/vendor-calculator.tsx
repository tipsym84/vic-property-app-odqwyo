
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface CommissionTier {
  id: string;
  fromPrice: string;
  toPrice: string;
  rate: string;
}

export default function VendorCalculatorScreen() {
  const router = useRouter();
  const [salePrice, setSalePrice] = useState('');
  const [advertisingCosts, setAdvertisingCosts] = useState('2000');
  const [legalFees, setLegalFees] = useState('1200');
  const [mortgageBalance, setMortgageBalance] = useState('');
  
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([
    { id: '1', fromPrice: '0', toPrice: '500000', rate: '2.5' },
    { id: '2', fromPrice: '500000', toPrice: '1000000', rate: '2.0' },
  ]);

  const calculateCommission = (price: number): number => {
    let totalCommission = 0;
    
    const sortedTiers = [...commissionTiers].sort((a, b) => 
      parseFloat(a.fromPrice) - parseFloat(b.fromPrice)
    );
    
    for (const tier of sortedTiers) {
      const from = parseFloat(tier.fromPrice) || 0;
      const to = parseFloat(tier.toPrice) || Infinity;
      const rate = parseFloat(tier.rate) || 0;
      
      if (price > from) {
        const applicableAmount = Math.min(price, to) - from;
        if (applicableAmount > 0) {
          totalCommission += (applicableAmount * rate) / 100;
        }
      }
    }
    
    return totalCommission;
  };

  const price = parseFloat(salePrice) || 0;
  const commission = calculateCommission(price);
  const advertising = parseFloat(advertisingCosts) || 0;
  const legal = parseFloat(legalFees) || 0;
  const mortgage = parseFloat(mortgageBalance) || 0;
  const dischargeFee = mortgage > 0 ? 350 : 0;

  const totalCosts = commission + advertising + legal + dischargeFee;
  const netProceeds = price - totalCosts - mortgage;

  const addCommissionTier = () => {
    const newId = (commissionTiers.length + 1).toString();
    const lastTier = commissionTiers[commissionTiers.length - 1];
    const newFrom = lastTier ? lastTier.toPrice : '0';
    
    setCommissionTiers([
      ...commissionTiers,
      { id: newId, fromPrice: newFrom, toPrice: '', rate: '' }
    ]);
  };

  const updateCommissionTier = (id: string, field: keyof CommissionTier, value: string) => {
    setCommissionTiers(commissionTiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const removeCommissionTier = (id: string) => {
    if (commissionTiers.length > 1) {
      setCommissionTiers(commissionTiers.filter(tier => tier.id !== id));
    }
  };

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
        </View>

        <View style={commonStyles.card}>
          <View style={styles.sectionHeader}>
            <Text style={commonStyles.subtitle}>Agent Commission Tiers</Text>
            <TouchableOpacity onPress={addCommissionTier} style={styles.addButton}>
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {commissionTiers.map((tier, index) => (
            <React.Fragment key={index}>
            <View key={tier.id} style={styles.tierContainer}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierLabel}>Tier {index + 1}</Text>
                {commissionTiers.length > 1 && (
                  <TouchableOpacity onPress={() => removeCommissionTier(tier.id)}>
                    <IconSymbol
                      ios_icon_name="trash"
                      android_material_icon_name="delete"
                      size={20}
                      color={colors.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.tierRow}>
                <View style={styles.tierInputContainer}>
                  <Text style={styles.tierInputLabel}>From ($)</Text>
                  <TextInput
                    style={[commonStyles.input, styles.tierInput]}
                    placeholder="0"
                    keyboardType="numeric"
                    value={tier.fromPrice}
                    onChangeText={(value) => updateCommissionTier(tier.id, 'fromPrice', value)}
                  />
                </View>
                
                <View style={styles.tierInputContainer}>
                  <Text style={styles.tierInputLabel}>To ($)</Text>
                  <TextInput
                    style={[commonStyles.input, styles.tierInput]}
                    placeholder="500000"
                    keyboardType="numeric"
                    value={tier.toPrice}
                    onChangeText={(value) => updateCommissionTier(tier.id, 'toPrice', value)}
                  />
                </View>
                
                <View style={styles.tierInputContainer}>
                  <Text style={styles.tierInputLabel}>Rate (%)</Text>
                  <TextInput
                    style={[commonStyles.input, styles.tierInput]}
                    placeholder="2.5"
                    keyboardType="numeric"
                    value={tier.rate}
                    onChangeText={(value) => updateCommissionTier(tier.id, 'rate', value)}
                  />
                </View>
              </View>
            </View>
            </React.Fragment>
          ))}
        </View>

        <View style={commonStyles.card}>
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
            <Text style={styles.resultLabel}>Agent Commission</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    padding: 4,
  },
  tierContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tierInputContainer: {
    flex: 1,
  },
  tierInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tierInput: {
    marginVertical: 0,
    fontSize: 14,
    paddingVertical: 8,
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
