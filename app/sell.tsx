
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { saveNumericValue, loadNumericValue, saveToggleValue, loadToggleValue, SELL_KEYS } from '@/utils/localStorage';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useProperty } from '@/contexts/PropertyContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { netProceeds, setNetProceeds } = useProperty();

  const [salePrice, setSalePrice] = useState('');
  const [customIncrement, setCustomIncrement] = useState('');
  const [selectedIncrement, setSelectedIncrement] = useState(10000);
  const [advertisingCosts, setAdvertisingCosts] = useState('');
  const [legalFees, setLegalFees] = useState('');
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([]);
  const [debtItems, setDebtItems] = useState<DebtItem[]>([]);
  const [mortgageToBeRepaid, setMortgageToBeRepaid] = useState(false);
  const [mortgageRepaidInFull, setMortgageRepaidInFull] = useState(true);
  const [partialRepaymentAmount, setPartialRepaymentAmount] = useState('');
  const [useSaleFunds, setUseSaleFunds] = useState(false);

  const totalDebt = useMemo(() => {
    return debtItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
  }, [debtItems]);

  const totalCommission = useMemo(() => {
    const price = parseFloat(salePrice) || 0;
    if (price === 0 || commissionTiers.length === 0) return 0;

    let commission = 0;
    let remainingPrice = price;

    const sortedTiers = [...commissionTiers].sort((a, b) => {
      const fromA = parseFloat(a.fromPrice) || 0;
      const fromB = parseFloat(b.fromPrice) || 0;
      return fromA - fromB;
    });

    sortedTiers.forEach((tier, index) => {
      const from = parseFloat(tier.fromPrice) || 0;
      const to = tier.toPrice ? parseFloat(tier.toPrice) : (index === sortedTiers.length - 1 ? price : Infinity);
      const rate = parseFloat(tier.rate) / 100 || 0;

      if (remainingPrice > from) {
        const applicableAmount = Math.min(remainingPrice, to) - from;
        if (applicableAmount > 0) {
          commission += applicableAmount * rate;
          remainingPrice -= applicableAmount;
        }
      }
    });

    return commission;
  }, [salePrice, commissionTiers]);

  const netProceedsValue = useMemo(() => {
    const price = parseFloat(salePrice) || 0;
    const advertising = parseFloat(advertisingCosts) || 0;
    const legal = parseFloat(legalFees) || 0;
    const commission = totalCommission;

    let debtToDeduct = 0;
    if (mortgageToBeRepaid) {
      if (mortgageRepaidInFull) {
        debtToDeduct = totalDebt;
      } else {
        debtToDeduct = parseFloat(partialRepaymentAmount) || 0;
      }
    }

    return price - advertising - legal - commission - debtToDeduct;
  }, [salePrice, advertisingCosts, legalFees, totalCommission, mortgageToBeRepaid, mortgageRepaidInFull, partialRepaymentAmount, totalDebt]);

  useEffect(() => {
    setNetProceeds(netProceedsValue);
  }, [netProceedsValue, setNetProceeds]);

  useEffect(() => {
    if (useSaleFunds) {
      setUseSaleFundsForPurchase(true);
    } else {
      setUseSaleFundsForPurchase(false);
    }
  }, [useSaleFunds]);

  const setUseSaleFundsForPurchase = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('useSaleFundsForPurchase', JSON.stringify(value));
      console.log('Set useSaleFundsForPurchase:', value);
    } catch (error) {
      console.error('Error saving useSaleFundsForPurchase:', error);
    }
  };

  const saveSellScreenStructure = useCallback(async () => {
    try {
      await AsyncStorage.setItem('sell_commissionTiers', JSON.stringify(commissionTiers));
      await AsyncStorage.setItem('sell_debtItems', JSON.stringify(debtItems));
      console.log('Saved sell screen structure');
    } catch (error) {
      console.error('Error saving sell screen structure:', error);
    }
  }, [commissionTiers, debtItems]);

  useEffect(() => {
    saveSellScreenStructure();
  }, [debtItems, commissionTiers]);

  const loadAllNumericValues = useCallback(async () => {
    const loadedSalePrice = await loadNumericValue(SELL_KEYS.SALE_PRICE, '');
    const loadedCustomIncrement = await loadNumericValue(SELL_KEYS.CUSTOM_INCREMENT, '');
    const loadedAdvertising = await loadNumericValue(SELL_KEYS.ADVERTISING_COSTS, '');
    const loadedLegalFees = await loadNumericValue(SELL_KEYS.LEGAL_FEES, '');
    const loadedPartialRepayment = await loadNumericValue(SELL_KEYS.PARTIAL_REPAYMENT, '');

    setSalePrice(loadedSalePrice);
    setCustomIncrement(loadedCustomIncrement);
    setAdvertisingCosts(loadedAdvertising);
    setLegalFees(loadedLegalFees);
    setPartialRepaymentAmount(loadedPartialRepayment);

    console.log('Loaded numeric values:', {
      salePrice: loadedSalePrice,
      advertising: loadedAdvertising,
      legalFees: loadedLegalFees,
      partialRepayment: loadedPartialRepayment
    });
  }, []);

  const loadAllToggleValues = useCallback(async () => {
    const loadedMortgageToBeRepaid = await loadToggleValue(SELL_KEYS.MORTGAGE_TO_BE_REPAID, false);
    const loadedMortgageRepaidInFull = await loadToggleValue(SELL_KEYS.MORTGAGE_REPAID_IN_FULL, true);
    const loadedUseSaleFunds = await loadToggleValue(SELL_KEYS.USE_SALE_FUNDS, false);

    setMortgageToBeRepaid(loadedMortgageToBeRepaid);
    setMortgageRepaidInFull(loadedMortgageRepaidInFull);
    setUseSaleFunds(loadedUseSaleFunds);

    console.log('Loaded toggle values:', {
      mortgageToBeRepaid: loadedMortgageToBeRepaid,
      mortgageRepaidInFull: loadedMortgageRepaidInFull,
      useSaleFunds: loadedUseSaleFunds
    });
  }, []);

  const loadSellScreenData = useCallback(async () => {
    try {
      const savedCommissionTiers = await AsyncStorage.getItem('sell_commissionTiers');
      const savedDebtItems = await AsyncStorage.getItem('sell_debtItems');

      if (savedCommissionTiers) {
        const parsedTiers = JSON.parse(savedCommissionTiers);
        setCommissionTiers(parsedTiers);
        console.log('Loaded commission tiers:', parsedTiers);
      } else if (commissionTiers.length === 0) {
        const defaultTiers: CommissionTier[] = [
          { id: '1', fromPrice: '0', toPrice: '', rate: '2.5' }
        ];
        setCommissionTiers(defaultTiers);
        console.log('Initialized default commission tiers');
      }

      if (savedDebtItems) {
        const parsedDebts = JSON.parse(savedDebtItems);
        setDebtItems(parsedDebts);
        console.log('Loaded debt items:', parsedDebts);
      } else if (debtItems.length === 0) {
        const defaultDebts: DebtItem[] = [
          { id: '1', amount: '' }
        ];
        setDebtItems(defaultDebts);
        console.log('Initialized default debt items');
      }
    } catch (error) {
      console.error('Error loading sell screen data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Sell screen focused - loading data');
      loadAllNumericValues();
      loadAllToggleValues();
      loadSellScreenData();
    }, [loadAllNumericValues, loadAllToggleValues, loadSellScreenData])
  );

  useEffect(() => {
    loadAllNumericValues();
    loadAllToggleValues();
    loadSellScreenData();
  }, []);

  const handleMortgageToBeRepaidToggle = async (value: boolean) => {
    setMortgageToBeRepaid(value);
    await saveToggleValue(SELL_KEYS.MORTGAGE_TO_BE_REPAID, value);
    console.log('Mortgage to be repaid:', value);
  };

  const handleMortgageRepaidInFullToggle = async (value: boolean) => {
    setMortgageRepaidInFull(value);
    await saveToggleValue(SELL_KEYS.MORTGAGE_REPAID_IN_FULL, value);
    console.log('Mortgage repaid in full:', value);
  };

  const handleUseSaleFundsToggle = async (value: boolean) => {
    setUseSaleFunds(value);
    await saveToggleValue(SELL_KEYS.USE_SALE_FUNDS, value);
    console.log('Use sale funds for purchase:', value);
  };

  const handlePriceTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setSalePrice(cleaned);
    saveNumericValue(SELL_KEYS.SALE_PRICE, cleaned);
  };

  const handlePriceBlur = () => {
    saveNumericValue(SELL_KEYS.SALE_PRICE, salePrice);
  };

  const adjustPrice = (amount: number) => {
    const currentPrice = parseFloat(salePrice) || 0;
    const newPrice = Math.max(0, currentPrice + amount);
    const newPriceStr = newPrice.toString();
    setSalePrice(newPriceStr);
    saveNumericValue(SELL_KEYS.SALE_PRICE, newPriceStr);
    console.log('Adjusted sale price:', newPriceStr);
  };

  const handleCustomIncrementSubmit = () => {
    const increment = parseFloat(customIncrement);
    if (!isNaN(increment) && increment > 0) {
      setSelectedIncrement(increment);
      saveNumericValue(SELL_KEYS.CUSTOM_INCREMENT, customIncrement);
      console.log('Custom increment set:', increment);
    }
    Keyboard.dismiss();
  };

  const addCommissionTier = () => {
    const newTier: CommissionTier = {
      id: Date.now().toString(),
      fromPrice: '',
      toPrice: '',
      rate: ''
    };
    setCommissionTiers([...commissionTiers, newTier]);
    console.log('Added commission tier');
  };

  const updateCommissionTier = (id: string, field: keyof CommissionTier, value: string) => {
    setCommissionTiers(commissionTiers.map(tier =>
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const removeCommissionTier = (id: string) => {
    setCommissionTiers(commissionTiers.filter(tier => tier.id !== id));
    console.log('Removed commission tier:', id);
  };

  const addDebtItem = () => {
    const newDebt: DebtItem = {
      id: Date.now().toString(),
      amount: ''
    };
    setDebtItems([...debtItems, newDebt]);
    console.log('Added debt item');
  };

  const updateDebtItem = (id: string, amount: string) => {
    setDebtItems(debtItems.map(item =>
      item.id === id ? { ...item, amount } : item
    ));
  };

  const removeDebtItem = (id: string) => {
    setDebtItems(debtItems.filter(item => item.id !== id));
    console.log('Removed debt item:', id);
  };

  const handleIncrementChange = (value: number) => {
    setSelectedIncrement(value);
    console.log('Selected increment:', value);
  };

  const handleAdvertisingChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAdvertisingCosts(cleaned);
    saveNumericValue(SELL_KEYS.ADVERTISING_COSTS, cleaned);
  };

  const handleLegalFeesChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setLegalFees(cleaned);
    saveNumericValue(SELL_KEYS.LEGAL_FEES, cleaned);
  };

  const handlePartialRepaymentChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPartialRepaymentAmount(cleaned);
    saveNumericValue(SELL_KEYS.PARTIAL_REPAYMENT, cleaned);
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScroll={Keyboard.dismiss}
          scrollEventThrottle={16}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Sale Calculator</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sale Price</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.priceInput}
                value={salePrice}
                onChangeText={handlePriceTextChange}
                onBlur={handlePriceBlur}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.incrementButtons}>
              <TouchableOpacity
                style={styles.incrementButton}
                onPress={() => adjustPrice(-selectedIncrement)}
              >
                <Text style={styles.incrementButtonText}>-{formatMoney(selectedIncrement)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.incrementButton}
                onPress={() => adjustPrice(selectedIncrement)}
              >
                <Text style={styles.incrementButtonText}>+{formatMoney(selectedIncrement)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.incrementSelector}>
              {[1000, 5000, 10000, 25000, 50000].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.incrementOption,
                    selectedIncrement === value && styles.incrementOptionSelected
                  ]}
                  onPress={() => handleIncrementChange(value)}
                >
                  <Text style={[
                    styles.incrementOptionText,
                    selectedIncrement === value && styles.incrementOptionTextSelected
                  ]}>
                    {formatMoney(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customIncrementContainer}>
              <TextInput
                style={styles.customIncrementInput}
                value={customIncrement}
                onChangeText={setCustomIncrement}
                onSubmitEditing={handleCustomIncrementSubmit}
                keyboardType="numeric"
                placeholder="Custom increment"
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                style={styles.customIncrementButton}
                onPress={handleCustomIncrementSubmit}
              >
                <Text style={styles.customIncrementButtonText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advertising Costs</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={advertisingCosts}
                onChangeText={handleAdvertisingChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal Fees</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={legalFees}
                onChangeText={handleLegalFeesChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agent Commission</Text>
              <TouchableOpacity onPress={addCommissionTier} style={styles.addButton}>
                <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {commissionTiers.map((tier, index) => (
              <View key={tier.id} style={styles.tierContainer}>
                <View style={styles.tierRow}>
                  <View style={styles.tierInputGroup}>
                    <Text style={styles.tierLabel}>From</Text>
                    <View style={styles.tierInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.tierInput}
                        value={tier.fromPrice}
                        onChangeText={(text) => updateCommissionTier(tier.id, 'fromPrice', text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      />
                    </View>
                  </View>
                  <View style={styles.tierInputGroup}>
                    <Text style={styles.tierLabel}>To</Text>
                    <View style={styles.tierInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.tierInput}
                        value={tier.toPrice}
                        onChangeText={(text) => updateCommissionTier(tier.id, 'toPrice', text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        placeholder="Max"
                        placeholderTextColor={colors.textSecondary}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      />
                    </View>
                  </View>
                  <View style={styles.tierInputGroup}>
                    <Text style={styles.tierLabel}>Rate</Text>
                    <View style={styles.tierInputContainer}>
                      <TextInput
                        style={styles.tierInput}
                        value={tier.rate}
                        onChangeText={(text) => updateCommissionTier(tier.id, 'rate', text.replace(/[^0-9.]/g, ''))}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      />
                      <Text style={styles.percentSymbol}>%</Text>
                    </View>
                  </View>
                  {commissionTiers.length > 1 && (
                    <TouchableOpacity onPress={() => removeCommissionTier(tier.id)} style={styles.removeButton}>
                      <IconSymbol ios_icon_name="minus.circle.fill" android_material_icon_name="remove-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <View style={styles.commissionTotal}>
              <Text style={styles.commissionTotalLabel}>Total Commission:</Text>
              <Text style={styles.commissionTotalValue}>{formatMoney(totalCommission)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={styles.sectionTitle}>Mortgage to be Repaid?</Text>
              <Switch
                value={mortgageToBeRepaid}
                onValueChange={handleMortgageToBeRepaidToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {mortgageToBeRepaid && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Mortgage Balance / Other Debt</Text>
                  <TouchableOpacity onPress={addDebtItem} style={styles.addButton}>
                    <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add-circle" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {debtItems.map((item) => (
                  <View key={item.id} style={styles.debtItemContainer}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.input}
                        value={item.amount}
                        onChangeText={(text) => updateDebtItem(item.id, text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                    {debtItems.length > 1 && (
                      <TouchableOpacity onPress={() => removeDebtItem(item.id)} style={styles.removeButton}>
                        <IconSymbol ios_icon_name="minus.circle.fill" android_material_icon_name="remove-circle" size={24} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <View style={styles.debtTotal}>
                  <Text style={styles.debtTotalLabel}>Total Debt:</Text>
                  <Text style={styles.debtTotalValue}>{formatMoney(totalDebt)}</Text>
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Repaid in Full?</Text>
                  <Switch
                    value={mortgageRepaidInFull}
                    onValueChange={handleMortgageRepaidInFullToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>

                {!mortgageRepaidInFull && (
                  <View style={styles.partialRepaymentContainer}>
                    <Text style={styles.partialRepaymentLabel}>Partial Repayment Amount</Text>
                    <View style={styles.inputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.input}
                        value={partialRepaymentAmount}
                        onChangeText={handlePartialRepaymentChange}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={styles.sectionTitle}>Use Sale Funds for Purchase?</Text>
              <Switch
                value={useSaleFunds}
                onValueChange={handleUseSaleFundsToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          <View style={styles.calculationSection}>
            <Text style={styles.calculationTitle}>Net Proceeds</Text>
            <View style={styles.calculationBreakdown}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Sale Price</Text>
                <Text style={styles.calculationValue}>{formatMoney(parseFloat(salePrice) || 0)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Advertising Costs</Text>
                <Text style={styles.calculationValueNegative}>-{formatMoney(parseFloat(advertisingCosts) || 0)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Legal Fees</Text>
                <Text style={styles.calculationValueNegative}>-{formatMoney(parseFloat(legalFees) || 0)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Agent Commission</Text>
                <Text style={styles.calculationValueNegative}>-{formatMoney(totalCommission)}</Text>
              </View>
              {mortgageToBeRepaid && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>
                    {mortgageRepaidInFull ? 'Mortgage Balance / Other Debt' : 'Partial Repayment'}
                  </Text>
                  <Text style={styles.calculationValueNegative}>
                    -{formatMoney(mortgageRepaidInFull ? totalDebt : (parseFloat(partialRepaymentAmount) || 0))}
                  </Text>
                </View>
              )}
              <View style={styles.calculationDivider} />
              <View style={styles.calculationRow}>
                <Text style={styles.calculationTotalLabel}>Net Proceeds</Text>
                <Text style={styles.calculationTotalValue}>{formatMoney(netProceedsValue)}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  incrementButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  incrementButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  incrementButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
  incrementSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  incrementOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  incrementOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  incrementOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  incrementOptionTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  customIncrementContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  customIncrementInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customIncrementButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  customIncrementButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
  },
  addButton: {
    padding: 4,
  },
  tierContainer: {
    marginBottom: 12,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  tierInputGroup: {
    flex: 1,
  },
  tierLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tierInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  percentSymbol: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  removeButton: {
    padding: 4,
  },
  commissionTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commissionTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  commissionTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
  },
  debtItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  debtTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  debtTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  debtTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  partialRepaymentContainer: {
    marginTop: 12,
  },
  partialRepaymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  calculationSection: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calculationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  calculationBreakdown: {
    gap: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  calculationValueNegative: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  calculationDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  calculationTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  calculationTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
