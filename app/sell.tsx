
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useProperty } from '@/contexts/PropertyContext';

interface CommissionTier {
  id: string;
  fromPrice: string;
  toPrice: string;
  rate: string;
}

interface DebtItem {
  id: string;
  amount: string;
}

export default function SellScreen() {
  const router = useRouter();
  const { setNetProceeds, setUseSaleFundsForPurchase } = useProperty();
  
  const [mortgageToBeRepaid, setMortgageToBeRepaid] = useState(false);
  const [mortgageRepaidInFull, setMortgageRepaidInFull] = useState(true);
  const [useSaleFunds, setUseSaleFunds] = useState(false);
  
  const [salePrice, setSalePrice] = useState('');
  const [advertisingCosts, setAdvertisingCosts] = useState('2000');
  const [legalFees, setLegalFees] = useState('1200');
  
  const [debtItems, setDebtItems] = useState<DebtItem[]>([
    { id: '1', amount: '' }
  ]);
  const [partialRepaymentAmount, setPartialRepaymentAmount] = useState('');
  
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
  
  const totalDebt = debtItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  let debtToDeduct = 0;
  if (mortgageToBeRepaid) {
    if (mortgageRepaidInFull) {
      debtToDeduct = totalDebt;
    } else {
      debtToDeduct = parseFloat(partialRepaymentAmount) || 0;
    }
  }
  
  const dischargeFee = mortgageToBeRepaid && debtToDeduct > 0 ? 350 : 0;

  const totalCosts = commission + advertising + legal + dischargeFee;
  const netProceedsValue = price - totalCosts - debtToDeduct;

  useEffect(() => {
    console.log('Sell screen: Net proceeds updated to', netProceedsValue);
    setNetProceeds(netProceedsValue);
  }, [netProceedsValue]);

  useEffect(() => {
    console.log('Sell screen: Use sale funds toggle changed to', useSaleFunds);
    setUseSaleFundsForPurchase(useSaleFunds);
  }, [useSaleFunds]);

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

  const addDebtItem = () => {
    const newId = (debtItems.length + 1).toString();
    setDebtItems([...debtItems, { id: newId, amount: '' }]);
  };

  const updateDebtItem = (id: string, amount: string) => {
    setDebtItems(debtItems.map(item => 
      item.id === id ? { ...item, amount } : item
    ));
  };

  const removeDebtItem = (id: string) => {
    if (debtItems.length > 1) {
      setDebtItems(debtItems.filter(item => item.id !== id));
    }
  };

  const formatMoney = (value: number): string => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        <Text style={styles.headerTitle}>Sell</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={commonStyles.card}>
          <View style={styles.toggleSection}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Mortgage to be repaid?</Text>
              <Switch
                value={mortgageToBeRepaid}
                onValueChange={setMortgageToBeRepaid}
                trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                thumbColor={mortgageToBeRepaid ? '#4caf50' : '#f4f3f4'}
              />
            </View>
            
            {mortgageToBeRepaid && (
              <>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Mortgage to be repaid in full?</Text>
                  <Switch
                    value={mortgageRepaidInFull}
                    onValueChange={setMortgageRepaidInFull}
                    trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                    thumbColor={mortgageRepaidInFull ? '#4caf50' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Use available sale funds for your purchase?</Text>
                  <Switch
                    value={useSaleFunds}
                    onValueChange={setUseSaleFunds}
                    trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                    thumbColor={useSaleFunds ? '#4caf50' : '#f4f3f4'}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.label}>Sale Price</Text>
          <View style={styles.inputWithPrefix}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput
              style={[commonStyles.input, styles.inputWithPrefixField]}
              placeholder="Enter sale price"
              keyboardType="numeric"
              value={salePrice}
              onChangeText={setSalePrice}
            />
          </View>
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
            <View style={styles.tierContainer}>
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
          <Text style={commonStyles.label}>Advertising Costs</Text>
          <View style={styles.inputWithPrefix}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput
              style={[commonStyles.input, styles.inputWithPrefixField]}
              placeholder="Enter advertising costs"
              keyboardType="numeric"
              value={advertisingCosts}
              onChangeText={setAdvertisingCosts}
            />
          </View>

          <Text style={commonStyles.label}>Legal Fees</Text>
          <View style={styles.inputWithPrefix}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput
              style={[commonStyles.input, styles.inputWithPrefixField]}
              placeholder="Enter legal fees"
              keyboardType="numeric"
              value={legalFees}
              onChangeText={setLegalFees}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={commonStyles.label}>Mortgage Balance/Other Debt</Text>
            <TouchableOpacity onPress={addDebtItem} style={styles.addButton}>
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {debtItems.map((item, index) => (
            <React.Fragment key={index}>
            <View style={styles.debtItemRow}>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={[commonStyles.input, styles.inputWithPrefixField]}
                  placeholder={`Debt ${index + 1}`}
                  keyboardType="numeric"
                  value={item.amount}
                  onChangeText={(value) => updateDebtItem(item.id, value)}
                />
              </View>
              {debtItems.length > 1 && (
                <TouchableOpacity onPress={() => removeDebtItem(item.id)} style={styles.deleteButton}>
                  <IconSymbol
                    ios_icon_name="minus.circle.fill"
                    android_material_icon_name="remove-circle"
                    size={24}
                    color="#f44336"
                  />
                </TouchableOpacity>
              )}
            </View>
            </React.Fragment>
          ))}

          {mortgageToBeRepaid && !mortgageRepaidInFull && (
            <>
              <Text style={[commonStyles.label, { marginTop: 12 }]}>Amount of loan to be repaid</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={[commonStyles.input, styles.inputWithPrefixField]}
                  placeholder="Enter partial repayment amount"
                  keyboardType="numeric"
                  value={partialRepaymentAmount}
                  onChangeText={setPartialRepaymentAmount}
                />
              </View>
            </>
          )}
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Cost Breakdown</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Sale Price</Text>
            <Text style={styles.resultValue}>${formatMoney(price)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Agent Commission</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${formatMoney(commission)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Advertising Costs</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${formatMoney(advertising)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Legal Fees</Text>
            <Text style={[styles.resultValue, styles.costValue]}>-${formatMoney(legal)}</Text>
          </View>

          {dischargeFee > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Mortgage Discharge Fee</Text>
              <Text style={[styles.resultValue, styles.costValue]}>-${formatMoney(dischargeFee)}</Text>
            </View>
          )}

          {mortgageToBeRepaid && debtItems.map((item, index) => {
            const debtAmount = parseFloat(item.amount) || 0;
            const labelText = `Mortgage/Debt ${index + 1}`;
            
            let displayAmount = 0;
            if (mortgageRepaidInFull) {
              displayAmount = debtAmount;
            } else if (index === 0) {
              displayAmount = parseFloat(partialRepaymentAmount) || 0;
            }
            
            return (
              <React.Fragment key={index}>
              {displayAmount > 0 && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{labelText}</Text>
                  <Text style={[styles.resultValue, styles.costValue]}>-${formatMoney(displayAmount)}</Text>
                </View>
              )}
              </React.Fragment>
            );
          })}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Costs</Text>
            <Text style={[styles.totalValue, styles.costValue]}>${formatMoney(totalCosts)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Net Proceeds</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>${formatMoney(netProceedsValue)}</Text>
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
    fontFamily: 'CourierPrime_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  toggleSection: {
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
    flex: 1,
    marginRight: 12,
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
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginVertical: 8,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingLeft: 12,
    fontFamily: 'CourierPrime_700Bold',
  },
  inputWithPrefixField: {
    flex: 1,
    borderWidth: 0,
    marginVertical: 0,
  },
  debtItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deleteButton: {
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
    fontFamily: 'CourierPrime_700Bold',
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
    fontFamily: 'CourierPrime_700Bold',
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
    fontFamily: 'CourierPrime_700Bold',
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
    fontFamily: 'CourierPrime_400Regular',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
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
    fontFamily: 'CourierPrime_700Bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'CourierPrime_700Bold',
  },
  bottomPadding: {
    height: 20,
  },
});
