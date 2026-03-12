
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

const SELL_SCREEN_DATA_KEY = 'SELL_SCREEN_DATA';

export default function SellScreen() {
  const router = useRouter();
  const { netProceeds, setNetProceeds, useSaleFundsForPurchase, setUseSaleFundsForPurchase } = useProperty();

  const [salePrice, setSalePrice] = useState('');
  const [advertisingCosts, setAdvertisingCosts] = useState('');
  const [legalFees, setLegalFees] = useState('');
  const [mortgageToBeRepaid, setMortgageToBeRepaid] = useState(false);
  const [mortgageRepaidInFull, setMortgageRepaidInFull] = useState(true);
  const [partialRepaymentAmount, setPartialRepaymentAmount] = useState('');
  const [useSaleFunds, setUseSaleFunds] = useState(false);
  const [customIncrement, setCustomIncrement] = useState('');
  const [selectedIncrement, setSelectedIncrement] = useState(10000);

  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([]);
  const [debtItems, setDebtItems] = useState<DebtItem[]>([]);

  // Hoisted function for saving the entire screen structure
  async function saveSellScreenStructure() {
    try {
      const dataToSave = {
        salePrice,
        advertisingCosts,
        legalFees,
        mortgageToBeRepaid,
        mortgageRepaidInFull,
        partialRepaymentAmount,
        useSaleFunds,
        customIncrement,
        selectedIncrement,
        debtItems: debtItems.map(item => ({ id: item.id, amount: item.amount })),
        commissionTiers: commissionTiers.map(tier => ({
          id: tier.id,
          fromPrice: tier.fromPrice,
          toPrice: tier.toPrice,
          rate: tier.rate,
        })),
      };
      await AsyncStorage.setItem(SELL_SCREEN_DATA_KEY, JSON.stringify(dataToSave));
      console.log('Sell screen structure saved successfully');
    } catch (error) {
      console.error('Failed to save sell screen structure:', error);
    }
  }

  // Load all numeric values from localStorage
  const loadAllNumericValues = useCallback(async () => {
    const loadedSalePrice = await loadNumericValue(SELL_KEYS.SALE_PRICE, '');
    const loadedAdvertising = await loadNumericValue(SELL_KEYS.ADVERTISING_COSTS, '');
    const loadedLegalFees = await loadNumericValue(SELL_KEYS.LEGAL_FEES, '');
    const loadedPartialRepayment = await loadNumericValue(SELL_KEYS.PARTIAL_REPAYMENT, '');

    setSalePrice(loadedSalePrice);
    setAdvertisingCosts(loadedAdvertising);
    setLegalFees(loadedLegalFees);
    setPartialRepaymentAmount(loadedPartialRepayment);
  }, []);

  // Load all toggle values from localStorage
  const loadAllToggleValues = useCallback(async () => {
    const loadedMortgageToBeRepaid = await loadToggleValue(SELL_KEYS.MORTGAGE_TO_BE_REPAID, false);
    const loadedMortgageRepaidInFull = await loadToggleValue(SELL_KEYS.MORTGAGE_REPAID_IN_FULL, true);
    const loadedUseSaleFunds = await loadToggleValue(SELL_KEYS.USE_SALE_FUNDS, false);

    setMortgageToBeRepaid(loadedMortgageToBeRepaid);
    setMortgageRepaidInFull(loadedMortgageRepaidInFull);
    setUseSaleFunds(loadedUseSaleFunds);
  }, []);

  // Load all sell screen data including arrays
  const loadSellScreenData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(SELL_SCREEN_DATA_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        console.log('Loading sell screen data:', data);

        // Load scalar values
        if (data.salePrice !== undefined) setSalePrice(data.salePrice);
        if (data.advertisingCosts !== undefined) setAdvertisingCosts(data.advertisingCosts);
        if (data.legalFees !== undefined) setLegalFees(data.legalFees);
        if (data.mortgageToBeRepaid !== undefined) setMortgageToBeRepaid(data.mortgageToBeRepaid);
        if (data.mortgageRepaidInFull !== undefined) setMortgageRepaidInFull(data.mortgageRepaidInFull);
        if (data.partialRepaymentAmount !== undefined) setPartialRepaymentAmount(data.partialRepaymentAmount);
        if (data.useSaleFunds !== undefined) setUseSaleFunds(data.useSaleFunds);
        if (data.customIncrement !== undefined) setCustomIncrement(data.customIncrement);
        if (data.selectedIncrement !== undefined) setSelectedIncrement(data.selectedIncrement);

        // CRITICAL FIX: Only initialize arrays if they don't exist in stored data AND current state is empty
        if (data.debtItems && data.debtItems.length > 0) {
          console.log('Restoring debtItems from storage:', data.debtItems);
          setDebtItems(data.debtItems);
        } else if (debtItems.length === 0) {
          console.log('Initializing debtItems with default empty row');
          setDebtItems([{ id: '1', amount: '' }]);
        }

        if (data.commissionTiers && data.commissionTiers.length > 0) {
          console.log('Restoring commissionTiers from storage:', data.commissionTiers);
          setCommissionTiers(data.commissionTiers);
        } else if (commissionTiers.length === 0) {
          console.log('Initializing commissionTiers with default empty row');
          setCommissionTiers([{ id: '1', fromPrice: '', toPrice: '', rate: '' }]);
        }
      } else {
        console.log('No stored data found, initializing with defaults only if arrays are empty');
        // Only initialize if current state is empty
        if (debtItems.length === 0) {
          setDebtItems([{ id: '1', amount: '' }]);
        }
        if (commissionTiers.length === 0) {
          setCommissionTiers([{ id: '1', fromPrice: '', toPrice: '', rate: '' }]);
        }
      }
    } catch (error) {
      console.error('Failed to load sell screen data:', error);
      // Fallback to default empty arrays only if current state is empty
      if (debtItems.length === 0) setDebtItems([{ id: '1', amount: '' }]);
      if (commissionTiers.length === 0) setCommissionTiers([{ id: '1', fromPrice: '', toPrice: '', rate: '' }]);
    }
  }, [debtItems.length, commissionTiers.length]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Sell screen focused, loading data');
      loadAllNumericValues();
      loadAllToggleValues();
      loadSellScreenData();
    }, [loadAllNumericValues, loadAllToggleValues, loadSellScreenData])
  );

  // Sync useSaleFunds with PropertyContext
  useEffect(() => {
    setUseSaleFundsForPurchase(useSaleFunds);
  }, [useSaleFunds, setUseSaleFundsForPurchase]);

  // Initialize arrays on first mount only if they're empty
  useEffect(() => {
    if (debtItems.length === 0) {
      console.log('Initial mount: debtItems empty, setting default');
      setDebtItems([{ id: '1', amount: '' }]);
    }
    if (commissionTiers.length === 0) {
      console.log('Initial mount: commissionTiers empty, setting default');
      setCommissionTiers([{ id: '1', fromPrice: '', toPrice: '', rate: '' }]);
    }
  }, []);

  // Save structure whenever arrays change
  useEffect(() => {
    if (debtItems.length > 0 || commissionTiers.length > 0) {
      console.log('Arrays changed, saving structure. debtItems:', debtItems.length, 'commissionTiers:', commissionTiers.length);
      setTimeout(() => saveSellScreenStructure(), 0);
    }
  }, [debtItems, commissionTiers]);

  // Calculate net proceeds
  const netProceedsValue = useMemo(() => {
    const price = parseFloat(salePrice) || 0;
    const advertising = parseFloat(advertisingCosts) || 0;
    const legal = parseFloat(legalFees) || 0;

    // Calculate total commission
    let totalCommission = 0;
    if (commissionTiers.length > 0) {
      commissionTiers.forEach((tier) => {
        const from = parseFloat(tier.fromPrice) || 0;
        const to = parseFloat(tier.toPrice) || Infinity;
        const rate = parseFloat(tier.rate) || 0;

        if (price >= from) {
          const applicableAmount = Math.min(price, to) - from;
          totalCommission += (applicableAmount * rate) / 100;
        }
      });
    }

    // Calculate total debt
    let totalDebt = 0;
    if (mortgageToBeRepaid) {
      if (mortgageRepaidInFull) {
        totalDebt = debtItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      } else {
        totalDebt = parseFloat(partialRepaymentAmount) || 0;
      }
    }

    const proceeds = price - advertising - legal - totalCommission - totalDebt;
    return proceeds;
  }, [salePrice, advertisingCosts, legalFees, commissionTiers, debtItems, mortgageToBeRepaid, mortgageRepaidInFull, partialRepaymentAmount]);

  // Update PropertyContext with calculated net proceeds
  useEffect(() => {
    setNetProceeds(netProceedsValue);
  }, [netProceedsValue, setNetProceeds]);

  // Toggle handlers
  const handleMortgageToBeRepaidToggle = (value: boolean) => {
    console.log('User toggled Mortgage To Be Repaid:', value);
    setMortgageToBeRepaid(value);
    saveToggleValue(SELL_KEYS.MORTGAGE_TO_BE_REPAID, value);
    setTimeout(() => saveSellScreenStructure(), 0);
  };

  const handleMortgageRepaidInFullToggle = (value: boolean) => {
    console.log('User toggled Mortgage Repaid In Full:', value);
    setMortgageRepaidInFull(value);
    saveToggleValue(SELL_KEYS.MORTGAGE_REPAID_IN_FULL, value);
    setTimeout(() => saveSellScreenStructure(), 0);
  };

  const handleUseSaleFundsToggle = (value: boolean) => {
    console.log('User toggled Use Sale Funds:', value);
    setUseSaleFunds(value);
    saveToggleValue(SELL_KEYS.USE_SALE_FUNDS, value);
    setTimeout(() => saveSellScreenStructure(), 0);
  };

  // Price input handlers
  const handlePriceTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setSalePrice(cleaned);
  };

  const handlePriceBlur = () => {
    saveNumericValue(SELL_KEYS.SALE_PRICE, salePrice);
    setTimeout(() => saveSellScreenStructure(), 0);
  };

  const adjustPrice = (amount: number) => {
    console.log('User adjusted price by:', amount);
    const currentPrice = parseFloat(salePrice) || 0;
    const newPrice = Math.max(0, currentPrice + amount);
    setSalePrice(newPrice.toString());
    saveNumericValue(SELL_KEYS.SALE_PRICE, newPrice.toString());
    setTimeout(() => saveSellScreenStructure(), 0);
  };

  const handleCustomIncrementSubmit = () => {
    const value = parseFloat(customIncrement);
    if (!isNaN(value) && value > 0) {
      setSelectedIncrement(value);
      setCustomIncrement('');
      Keyboard.dismiss();
    }
  };

  // Commission tier management
  const addCommissionTier = () => {
    console.log('User added commission tier');
    const lastTier = commissionTiers[commissionTiers.length - 1];
    const newFromPrice = lastTier?.toPrice || '';
    const newId = (Math.max(0, ...commissionTiers.map(t => parseInt(t.id) || 0)) + 1).toString();
    setCommissionTiers([...commissionTiers, { id: newId, fromPrice: newFromPrice, toPrice: '', rate: '' }]);
  };

  const updateCommissionTier = (id: string, field: keyof CommissionTier, value: string) => {
    setCommissionTiers(prev => {
      const updated = prev.map(tier => {
        if (tier.id === id) {
          return { ...tier, [field]: value };
        }
        return tier;
      });

      // Auto-populate next tier's fromPrice when toPrice is set
      if (field === 'toPrice') {
        const currentTierIndex = updated.findIndex(tier => tier.id === id);
        if (currentTierIndex !== -1 && currentTierIndex < updated.length - 1) {
          updated[currentTierIndex + 1].fromPrice = value;
        }
      }

      setTimeout(() => saveSellScreenStructure(), 0);
      return updated;
    });
  };

  const removeCommissionTier = (id: string) => {
    console.log('User removed commission tier:', id);
    if (commissionTiers.length > 1) {
      setCommissionTiers(prev => prev.filter(tier => tier.id !== id));
    }
  };

  // Debt item management
  const addDebtItem = () => {
    console.log('User added debt item');
    const newId = (Math.max(0, ...debtItems.map(d => parseInt(d.id) || 0)) + 1).toString();
    setDebtItems([...debtItems, { id: newId, amount: '' }]);
  };

  const updateDebtItem = (id: string, amount: string) => {
    setDebtItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, amount } : item);
      setTimeout(() => saveSellScreenStructure(), 0);
      return updated;
    });
  };

  const removeDebtItem = (id: string) => {
    console.log('User removed debt item:', id);
    if (debtItems.length > 1) {
      setDebtItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Increment change handler
  const handleIncrementChange = (value: number) => {
    setSelectedIncrement(value);
  };

  // Other input handlers
  const handleAdvertisingChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAdvertisingCosts(cleaned);
    saveNumericValue(SELL_KEYS.ADVERTISING_COSTS, cleaned);
    setTimeout(() => saveSellScreenStructure(), 0);
  };

  const handleLegalFeesChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setLegalFees(cleaned);
    saveNumericValue(SELL_KEYS.LEGAL_FEES, cleaned);
    setTimeout(() => saveSellScreenStructure(), 0);
  };

  const handlePartialRepaymentChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPartialRepaymentAmount(cleaned);
    saveNumericValue(SELL_KEYS.PARTIAL_REPAYMENT, cleaned);
    setTimeout(() => saveSellScreenStructure(), 0);
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
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sell</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Sale Price Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sale Price</Text>
            <View style={styles.priceDisplayContainer}>
              <Text style={styles.priceDisplay}>{formatMoney(parseFloat(salePrice) || 0)}</Text>
            </View>

            <View style={styles.adjustmentButtons}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustPrice(-selectedIncrement)}>
                <Text style={styles.adjustButtonText}>-{formatMoney(selectedIncrement)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustPrice(selectedIncrement)}>
                <Text style={styles.adjustButtonText}>+{formatMoney(selectedIncrement)}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter sale price"
              placeholderTextColor={colors.textSecondary}
              value={salePrice}
              onChangeText={handlePriceTextChange}
              onBlur={handlePriceBlur}
              keyboardType="numeric"
              returnKeyType="done"
            />

            {/* Increment Selector */}
            <View style={styles.incrementSelector}>
              <Text style={styles.incrementLabel}>Adjustment Increment:</Text>
              <View style={styles.incrementButtons}>
                {[1000, 5000, 10000, 25000, 50000].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.incrementButton, selectedIncrement === value && styles.incrementButtonActive]}
                    onPress={() => handleIncrementChange(value)}
                  >
                    <Text style={[styles.incrementButtonText, selectedIncrement === value && styles.incrementButtonTextActive]}>
                      {formatMoney(value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.customIncrementContainer}>
                <TextInput
                  style={styles.customIncrementInput}
                  placeholder="Custom increment"
                  placeholderTextColor={colors.textSecondary}
                  value={customIncrement}
                  onChangeText={setCustomIncrement}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={handleCustomIncrementSubmit}
                />
                <TouchableOpacity style={styles.customIncrementButton} onPress={handleCustomIncrementSubmit}>
                  <Text style={styles.customIncrementButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Agent Commission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agent Commission</Text>
            {commissionTiers.map((tier, index) => (
              <React.Fragment key={tier.id}>
                <View style={styles.tierContainer}>
                  <View style={styles.tierHeader}>
                    <Text style={styles.tierLabel}>Tier {index + 1}</Text>
                    {commissionTiers.length > 1 && (
                      <TouchableOpacity onPress={() => removeCommissionTier(tier.id)}>
                        <IconSymbol ios_icon_name="trash" android_material_icon_name="delete" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.tierRow}>
                    <View style={styles.tierInputContainer}>
                      <Text style={styles.tierInputLabel}>From ($)</Text>
                      <TextInput
                        style={styles.tierInput}
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        value={tier.fromPrice}
                        onChangeText={(text) => updateCommissionTier(tier.id, 'fromPrice', text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        editable={index === 0}
                      />
                    </View>
                    <View style={styles.tierInputContainer}>
                      <Text style={styles.tierInputLabel}>To ($)</Text>
                      <TextInput
                        style={styles.tierInput}
                        placeholder="∞"
                        placeholderTextColor={colors.textSecondary}
                        value={tier.toPrice}
                        onChangeText={(text) => updateCommissionTier(tier.id, 'toPrice', text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.tierInputContainer}>
                      <Text style={styles.tierInputLabel}>Rate (%)</Text>
                      <TextInput
                        style={styles.tierInput}
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        value={tier.rate}
                        onChangeText={(text) => updateCommissionTier(tier.id, 'rate', text.replace(/[^0-9.]/g, ''))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>
              </React.Fragment>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addCommissionTier}>
              <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Tier</Text>
            </TouchableOpacity>
          </View>

          {/* Other Costs Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Costs</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Advertising Costs</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                value={advertisingCosts}
                onChangeText={handleAdvertisingChange}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Legal Fees</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                value={legalFees}
                onChangeText={handleLegalFeesChange}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Mortgage/Debt Section */}
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
                <View style={styles.toggleRow}>
                  <Text style={styles.inputLabel}>Repaid in Full?</Text>
                  <Switch
                    value={mortgageRepaidInFull}
                    onValueChange={handleMortgageRepaidInFullToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>

                {mortgageRepaidInFull ? (
                  <>
                    <Text style={styles.inputLabel}>Mortgage Balance / Other Debt</Text>
                    {debtItems.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <View style={styles.debtItemContainer}>
                          <TextInput
                            style={[styles.input, styles.debtInput]}
                            placeholder="Enter amount"
                            placeholderTextColor={colors.textSecondary}
                            value={item.amount}
                            onChangeText={(text) => updateDebtItem(item.id, text.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                            returnKeyType="done"
                          />
                          {debtItems.length > 1 && (
                            <TouchableOpacity onPress={() => removeDebtItem(item.id)} style={styles.removeDebtButton}>
                              <IconSymbol ios_icon_name="trash" android_material_icon_name="delete" size={20} color={colors.error} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </React.Fragment>
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={addDebtItem}>
                      <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={20} color={colors.primary} />
                      <Text style={styles.addButtonText}>Add Debt</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Partial Repayment Amount</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      placeholderTextColor={colors.textSecondary}
                      value={partialRepaymentAmount}
                      onChangeText={handlePartialRepaymentChange}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                )}
              </>
            )}
          </View>

          {/* Net Proceeds Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Net Proceeds</Text>
            <View style={styles.netProceedsContainer}>
              <Text style={styles.netProceedsAmount}>{formatMoney(netProceedsValue)}</Text>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.inputLabel}>Use sale funds for purchase?</Text>
              <Switch
                value={useSaleFunds}
                onValueChange={handleUseSaleFundsToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  priceDisplayContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  priceDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  adjustmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  adjustButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  incrementSelector: {
    marginTop: 8,
  },
  incrementLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  incrementButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  incrementButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  incrementButtonActive: {
    backgroundColor: colors.primary,
  },
  incrementButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  incrementButtonTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  customIncrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customIncrementInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  customIncrementButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 20,
  },
  customIncrementButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  tierContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  tierInputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tierInput: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  debtItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  debtInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  removeDebtButton: {
    padding: 8,
  },
  netProceedsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  netProceedsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
  },
});
