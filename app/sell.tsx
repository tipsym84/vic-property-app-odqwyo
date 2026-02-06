
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useProperty } from '@/contexts/PropertyContext';
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
  const { setNetProceeds, setUseSaleFundsForPurchase } = useProperty();
  
  const [mortgageToBeRepaid, setMortgageToBeRepaid] = useState(false);
  const [mortgageRepaidInFull, setMortgageRepaidInFull] = useState(true);
  const [useSaleFunds, setUseSaleFunds] = useState(false);
  
  const [salePrice, setSalePrice] = useState(500000);
  const [salePriceText, setSalePriceText] = useState('500,000');
  const [priceIncrement, setPriceIncrement] = useState(5000);
  const [showCustomIncrementInput, setShowCustomIncrementInput] = useState(false);
  const [customIncrement, setCustomIncrement] = useState('1000');
  
  const [advertisingCosts, setAdvertisingCosts] = useState('');
  const [legalFees, setLegalFees] = useState('');
  
  const [debtItems, setDebtItems] = useState<DebtItem[]>([
    { id: '1', amount: '' }
  ]);
  const [partialRepaymentAmount, setPartialRepaymentAmount] = useState('');
  
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([
    { id: '1', fromPrice: '', toPrice: '', rate: '' },
  ]);

  useEffect(() => {
    loadSellScreenData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Sell screen focused - reloading data');
      loadSellScreenData();
    }, [])
  );

  // Save data whenever it changes
  useEffect(() => {
    saveSellScreenData();
  }, [mortgageToBeRepaid, mortgageRepaidInFull, useSaleFunds, salePrice, priceIncrement, 
      advertisingCosts, legalFees, debtItems, partialRepaymentAmount, commissionTiers]);

  const loadSellScreenData = async () => {
    try {
      console.log('Loading Sell screen data from storage');
      const savedData = await AsyncStorage.getItem('sellScreenData');
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Loaded Sell screen data:', data);
        
        if (data.mortgageToBeRepaid !== undefined) setMortgageToBeRepaid(data.mortgageToBeRepaid);
        if (data.mortgageRepaidInFull !== undefined) setMortgageRepaidInFull(data.mortgageRepaidInFull);
        if (data.useSaleFunds !== undefined) setUseSaleFunds(data.useSaleFunds);
        if (data.salePrice !== undefined) {
          setSalePrice(data.salePrice);
          setSalePriceText(data.salePrice.toLocaleString('en-US'));
        }
        if (data.priceIncrement !== undefined) setPriceIncrement(data.priceIncrement);
        if (data.advertisingCosts !== undefined) setAdvertisingCosts(data.advertisingCosts);
        if (data.legalFees !== undefined) setLegalFees(data.legalFees);
        if (data.debtItems && data.debtItems.length > 0) setDebtItems(data.debtItems);
        if (data.partialRepaymentAmount !== undefined) setPartialRepaymentAmount(data.partialRepaymentAmount);
        if (data.commissionTiers && data.commissionTiers.length > 0) setCommissionTiers(data.commissionTiers);
      }
    } catch (error) {
      console.error('Error loading Sell screen data:', error);
    }
  };

  const saveSellScreenData = async () => {
    try {
      const data = {
        mortgageToBeRepaid,
        mortgageRepaidInFull,
        useSaleFunds,
        salePrice,
        priceIncrement,
        advertisingCosts,
        legalFees,
        debtItems,
        partialRepaymentAmount,
        commissionTiers,
      };
      await AsyncStorage.setItem('sellScreenData', JSON.stringify(data));
      console.log('Saved Sell screen data');
    } catch (error) {
      console.error('Error saving Sell screen data:', error);
    }
  };

  const calculateCommission = (price: number): number => {
    // If only one tier and no from/to values, apply rate to entire sale price
    if (commissionTiers.length === 1) {
      const tier = commissionTiers[0];
      const hasNoRange = !tier.fromPrice && !tier.toPrice;
      if (hasNoRange) {
        const rate = parseFloat(tier.rate) || 0;
        return (price * rate) / 100;
      }
    }

    // Multiple tiers or tiers with ranges
    let totalCommission = 0;
    const sortedTiers = [...commissionTiers].sort((a, b) => 
      (parseFloat(a.fromPrice) || 0) - (parseFloat(b.fromPrice) || 0)
    );
    
    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];
      const from = parseFloat(tier.fromPrice) || 0;
      // If no "to" value and this is the last tier, use sale price as upper limit
      const isLastTier = i === sortedTiers.length - 1;
      const to = tier.toPrice ? parseFloat(tier.toPrice) : (isLastTier ? price : Infinity);
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

  const handlePriceTextChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const numValue = parseFloat(cleanText);
    if (!isNaN(numValue) && numValue >= 0) {
      setSalePrice(numValue);
      const formatted = numValue.toLocaleString('en-US');
      setSalePriceText(formatted);
    } else if (cleanText === '') {
      setSalePrice(0);
      setSalePriceText('');
    }
  };

  const handlePriceBlur = () => {
    const formatted = salePrice.toLocaleString('en-US');
    setSalePriceText(formatted);
    Keyboard.dismiss();
  };

  const adjustPrice = (amount: number) => {
    const newPrice = Math.max(0, salePrice + amount);
    setSalePrice(newPrice);
    const formatted = newPrice.toLocaleString('en-US');
    setSalePriceText(formatted);
  };

  const handleCustomIncrementSubmit = () => {
    const value = parseFloat(customIncrement);
    if (!isNaN(value) && value > 0) {
      setPriceIncrement(value);
      setShowCustomIncrementInput(false);
    } else {
      setShowCustomIncrementInput(false);
    }
  };

  const handleScroll = () => {
    console.log('User scrolled - dismissing keyboard');
    Keyboard.dismiss();
  };

  const handleTapOutside = () => {
    console.log('User tapped outside - dismissing keyboard');
    Keyboard.dismiss();
  };

  const price = salePrice;
  const commission = calculateCommission(price);
  const advertising = parseFloat(advertisingCosts) || 0;
  const legal = parseFloat(legalFees) || 0;
  
  const incrementOptions = [500, 2000, 5000, 10000, 20000, 50000];
  
  const getDynamicFontSize = (value: number): number => {
    const digits = Math.floor(Math.log10(Math.abs(value))) + 1;
    if (digits <= 5) return 48;
    if (digits === 6) return 42;
    if (digits === 7) return 36;
    if (digits === 8) return 32;
    return 28;
  };
  
  // Calculate total debt from all debt items
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
    const newFrom = lastTier && lastTier.toPrice ? lastTier.toPrice : '0';
    
    setCommissionTiers([
      ...commissionTiers,
      { id: newId, fromPrice: newFrom, toPrice: '', rate: '' }
    ]);
  };

  const updateCommissionTier = (id: string, field: keyof CommissionTier, value: string) => {
    const updatedTiers = commissionTiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    );
    
    // Auto-populate next tier's "from" when current tier's "to" is updated
    if (field === 'toPrice' && value) {
      const currentIndex = updatedTiers.findIndex(t => t.id === id);
      if (currentIndex !== -1 && currentIndex < updatedTiers.length - 1) {
        updatedTiers[currentIndex + 1].fromPrice = value;
      }
    }
    
    setCommissionTiers(updatedTiers);
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
    console.log('Updating debt item', id, 'with amount', amount);
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
    <TouchableWithoutFeedback onPress={handleTapOutside}>
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
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
                </>
              )}

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Use available sale funds for your purchase?</Text>
                <Switch
                  value={useSaleFunds}
                  onValueChange={setUseSaleFunds}
                  trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                  thumbColor={useSaleFunds ? '#4caf50' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          <View style={[commonStyles.card, styles.priceCard]}>
            <Text style={styles.priceLabel}>Sale Price</Text>
            <View style={styles.priceInputContainer}>
              <Text style={[styles.dollarSign, { fontSize: getDynamicFontSize(salePrice) }]}>$</Text>
              <TextInput
                style={[styles.priceInput, { fontSize: getDynamicFontSize(salePrice) }]}
                value={salePriceText}
                onChangeText={handlePriceTextChange}
                onBlur={handlePriceBlur}
                keyboardType="numeric"
                selectTextOnFocus
                textAlign="center"
              />
            </View>
            
            <View style={styles.priceControls}>
              <TouchableOpacity 
                style={styles.priceButton}
                onPress={() => adjustPrice(-priceIncrement)}
              >
                <IconSymbol
                  ios_icon_name="minus.circle.fill"
                  android_material_icon_name="remove-circle"
                  size={44}
                  color="#424242"
                />
              </TouchableOpacity>

              <View style={styles.incrementContainer}>
                <Text style={styles.incrementLabel}>Increment</Text>
                <Text style={styles.incrementValue}>${formatMoney(priceIncrement)}</Text>
              </View>

              <TouchableOpacity 
                style={styles.priceButton}
                onPress={() => adjustPrice(priceIncrement)}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={44}
                  color="#424242"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.incrementSelector}>
              <Text style={styles.incrementSelectorLabel}>Select Price Increment:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.incrementOptions}
              >
                <TouchableOpacity
                  style={[
                    styles.incrementOption,
                    showCustomIncrementInput && styles.incrementOptionActive
                  ]}
                  onPress={() => setShowCustomIncrementInput(!showCustomIncrementInput)}
                >
                  <Text style={[
                    styles.incrementOptionText,
                    showCustomIncrementInput && styles.incrementOptionTextActive
                  ]}>
                    Custom
                  </Text>
                </TouchableOpacity>
                {incrementOptions.map((option, index) => (
                  <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.incrementOption,
                      priceIncrement === option && !showCustomIncrementInput && styles.incrementOptionActive
                    ]}
                    onPress={() => {
                      setPriceIncrement(option);
                      setShowCustomIncrementInput(false);
                    }}
                  >
                    <Text style={[
                      styles.incrementOptionText,
                      priceIncrement === option && !showCustomIncrementInput && styles.incrementOptionTextActive
                    ]}>
                      ${(option / 1000).toFixed(0)}k
                    </Text>
                  </TouchableOpacity>
                  </React.Fragment>
                ))}
              </ScrollView>
            </View>

            {showCustomIncrementInput && (
              <View style={styles.customIncrementContainer}>
                <TextInput
                  style={styles.customIncrementInput}
                  placeholder="Enter custom increment"
                  keyboardType="numeric"
                  value={customIncrement}
                  onChangeText={setCustomIncrement}
                  onBlur={() => Keyboard.dismiss()}
                />
                <TouchableOpacity 
                  style={styles.customIncrementButton}
                  onPress={handleCustomIncrementSubmit}
                >
                  <Text style={styles.customIncrementButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <Text style={commonStyles.subtitle}>Agent Commission</Text>
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
                  {commissionTiers.length > 1 && (
                    <>
                      <View style={styles.tierInputContainer}>
                        <Text style={styles.tierInputLabel}>From ($)</Text>
                        <TextInput
                          style={[commonStyles.input, styles.tierInput]}
                          placeholder="0"
                          keyboardType="numeric"
                          value={tier.fromPrice}
                          onChangeText={(value) => updateCommissionTier(tier.id, 'fromPrice', value)}
                          onBlur={() => Keyboard.dismiss()}
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          minimumFontScale={0.5}
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
                          onBlur={() => Keyboard.dismiss()}
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          minimumFontScale={0.5}
                        />
                      </View>
                    </>
                  )}
                  
                  <View style={[styles.tierInputContainer, commissionTiers.length === 1 && { flex: 1 }]}>
                    <Text style={styles.tierInputLabel}>Rate (%)</Text>
                    <TextInput
                      style={[commonStyles.input, styles.tierInput]}
                      placeholder="2.5"
                      keyboardType="numeric"
                      value={tier.rate}
                      onChangeText={(value) => updateCommissionTier(tier.id, 'rate', value)}
                      onBlur={() => Keyboard.dismiss()}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.5}
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
                onBlur={() => Keyboard.dismiss()}
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
                onBlur={() => Keyboard.dismiss()}
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
                <View style={[styles.inputWithPrefix, styles.debtInputContainer]}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={[commonStyles.input, styles.inputWithPrefixField]}
                    placeholder={`Debt ${index + 1}`}
                    keyboardType="numeric"
                    value={item.amount}
                    onChangeText={(value) => updateDebtItem(item.id, value)}
                    onBlur={() => Keyboard.dismiss()}
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
                    onBlur={() => Keyboard.dismiss()}
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

        <View style={styles.pinnedFooter}>
          <View style={styles.pinnedContent}>
            <Text style={styles.pinnedLabel}>Balance of Sale Funds</Text>
            <Text style={[
              styles.pinnedValue,
              { color: netProceedsValue >= 0 ? '#424242' : '#f44336' }
            ]}>
              ${formatMoney(netProceedsValue)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    paddingTop: 48,
    paddingBottom: 8,
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
    paddingTop: 12,
    paddingBottom: 200,
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
  debtInputContainer: {
    flex: 1,
    maxWidth: '85%',
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
  priceCard: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    fontFamily: 'CourierPrime_400Regular',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9e9e9e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
    maxWidth: '80%',
    alignSelf: 'center',
  },
  dollarSign: {
    fontWeight: '800',
    color: '#424242',
    marginRight: 4,
    fontFamily: 'CourierPrime_700Bold',
  },
  priceInput: {
    fontWeight: '800',
    color: '#424242',
    minWidth: 120,
    maxWidth: 220,
    padding: 0,
    margin: 0,
    fontFamily: 'CourierPrime_700Bold',
  },
  priceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  priceButton: {
    padding: 6,
  },
  incrementContainer: {
    alignItems: 'center',
  },
  incrementLabel: {
    fontSize: 13,
    color: '#424242',
    fontFamily: 'CourierPrime_400Regular',
  },
  incrementValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#424242',
    fontFamily: 'CourierPrime_700Bold',
  },
  incrementSelector: {
    width: '100%',
    marginTop: 8,
  },
  incrementSelectorLabel: {
    fontSize: 13,
    color: '#424242',
    marginBottom: 10,
    fontFamily: 'CourierPrime_400Regular',
  },
  incrementOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  incrementOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#9e9e9e',
    minWidth: 60,
    alignItems: 'center',
  },
  incrementOptionActive: {
    backgroundColor: '#424242',
    borderColor: '#424242',
  },
  incrementOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    fontFamily: 'CourierPrime_700Bold',
  },
  incrementOptionTextActive: {
    color: '#ffffff',
  },
  customIncrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  customIncrementInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#9e9e9e',
    fontFamily: 'CourierPrime_400Regular',
  },
  customIncrementButton: {
    backgroundColor: '#424242',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  customIncrementButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'CourierPrime_700Bold',
  },
  pinnedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 80,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  pinnedContent: {
    alignItems: 'center',
  },
  pinnedLabel: {
    fontSize: 13,
    color: '#424242',
    marginBottom: 4,
    fontFamily: 'CourierPrime_400Regular',
  },
  pinnedValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#424242',
    fontFamily: 'CourierPrime_700Bold',
  },
});
