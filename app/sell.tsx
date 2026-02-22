
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useProperty } from '@/contexts/PropertyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveNumericValue, loadNumericValue, saveToggleValue, loadToggleValue, SELL_KEYS } from '@/utils/localStorage';

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
  
  const [salePrice, setSalePrice] = useState(0);
  const [salePriceText, setSalePriceText] = useState('');
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

  // Load data on mount
  useEffect(() => {
    console.log('Sell screen mounted - loading persisted values');
    loadAllNumericValues();
    loadAllToggleValues();
    loadSellScreenData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Sell screen focused - reloading persisted values');
      loadAllNumericValues();
      loadAllToggleValues();
      loadSellScreenData();
    }, [])
  );

  // Load all numeric values from localStorage
  const loadAllNumericValues = async () => {
    console.log('Loading all numeric values from localStorage');
    
    // Load sale price - using fixed key SELL_KEYS.SALE_PRICE
    const savedPrice = await loadNumericValue(SELL_KEYS.SALE_PRICE);
    if (savedPrice !== null) {
      const numValue = parseFloat(savedPrice);
      if (!isNaN(numValue) && numValue > 0) {
        setSalePrice(numValue);
        setSalePriceText(numValue.toLocaleString('en-US'));
      }
    }
    
    // Load price increment
    const savedIncrement = await loadNumericValue(SELL_KEYS.PRICE_INCREMENT);
    if (savedIncrement !== null) {
      const numValue = parseFloat(savedIncrement);
      if (!isNaN(numValue)) {
        setPriceIncrement(numValue);
      }
    }
    
    // Load custom increment
    const savedCustomIncrement = await loadNumericValue(SELL_KEYS.CUSTOM_INCREMENT);
    if (savedCustomIncrement !== null) {
      setCustomIncrement(savedCustomIncrement);
    }
    
    // Load advertising costs
    const savedAdvertising = await loadNumericValue(SELL_KEYS.ADVERTISING_COSTS);
    if (savedAdvertising !== null) {
      setAdvertisingCosts(savedAdvertising);
    }
    
    // Load legal fees
    const savedLegal = await loadNumericValue(SELL_KEYS.LEGAL_FEES);
    if (savedLegal !== null) {
      setLegalFees(savedLegal);
    }
    
    // Load partial repayment amount
    const savedPartial = await loadNumericValue(SELL_KEYS.PARTIAL_REPAYMENT);
    if (savedPartial !== null) {
      setPartialRepaymentAmount(savedPartial);
    }
  };

  // Load all toggle values from localStorage
  const loadAllToggleValues = async () => {
    console.log('Loading all toggle values from localStorage');
    
    // Load Mortgage to be repaid toggle
    const mortgageRepaid = await loadToggleValue(SELL_KEYS.MORTGAGE_REPAID_TOGGLE, false);
    setMortgageToBeRepaid(mortgageRepaid);
    
    // Load Mortgage repaid in full toggle
    const mortgageRepaidFull = await loadToggleValue(SELL_KEYS.MORTGAGE_REPAID_FULL_TOGGLE, true);
    setMortgageRepaidInFull(mortgageRepaidFull);
    
    // Load Use sale funds toggle
    const useSaleFundsToggle = await loadToggleValue(SELL_KEYS.USE_SALE_FUNDS_TOGGLE, false);
    setUseSaleFunds(useSaleFundsToggle);
    
    console.log('Loaded toggle values:', {
      mortgageRepaid,
      mortgageRepaidFull,
      useSaleFundsToggle
    });
  };

  const loadSellScreenData = async () => {
    try {
      console.log('Loading Sell screen data from AsyncStorage');
      const savedData = await AsyncStorage.getItem('sellScreenData');
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Loaded Sell screen data:', data);
        
        if (data.debtItems && data.debtItems.length > 0) {
          setDebtItems(data.debtItems);
          // Load debt amounts from localStorage
          for (const item of data.debtItems) {
            const savedAmount = await loadNumericValue(SELL_KEYS.DEBT_AMOUNT + item.id);
            if (savedAmount !== null) {
              item.amount = savedAmount;
            }
          }
          setDebtItems([...data.debtItems]);
        }
        
        if (data.commissionTiers && data.commissionTiers.length > 0) {
          setCommissionTiers(data.commissionTiers);
          // Load commission tier values from localStorage
          for (const tier of data.commissionTiers) {
            const savedFrom = await loadNumericValue(SELL_KEYS.COMMISSION_FROM + tier.id);
            const savedTo = await loadNumericValue(SELL_KEYS.COMMISSION_TO + tier.id);
            const savedRate = await loadNumericValue(SELL_KEYS.COMMISSION_RATE + tier.id);
            if (savedFrom !== null) tier.fromPrice = savedFrom;
            if (savedTo !== null) tier.toPrice = savedTo;
            if (savedRate !== null) tier.rate = savedRate;
          }
          setCommissionTiers([...data.commissionTiers]);
        }
      } else {
        console.log('No saved Sell screen data found - using defaults');
      }
    } catch (error) {
      console.error('Error loading Sell screen data:', error);
    }
  };

  // Save structure data only (not individual field values - those are saved in handlers)
  const saveSellScreenStructure = useCallback(async () => {
    try {
      const data = {
        debtItems: debtItems.map(item => ({ id: item.id, amount: '' })), // Structure only, amounts saved separately
        commissionTiers: commissionTiers.map(tier => ({ 
          id: tier.id, 
          fromPrice: '', 
          toPrice: '', 
          rate: '' 
        })), // Structure only, values saved separately
      };
      await AsyncStorage.setItem('sellScreenData', JSON.stringify(data));
      console.log('Saved Sell screen structure to AsyncStorage');
    } catch (error) {
      console.error('Error saving Sell screen data:', error);
    }
  }, [debtItems, commissionTiers]);

  const handleMortgageToBeRepaidToggle = async (value: boolean) => {
    console.log('User toggled Mortgage to be repaid to:', value);
    setMortgageToBeRepaid(value);
    
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user action
    await saveToggleValue(SELL_KEYS.MORTGAGE_REPAID_TOGGLE, value);
  };

  const handleMortgageRepaidInFullToggle = async (value: boolean) => {
    console.log('User toggled Mortgage repaid in full to:', value);
    setMortgageRepaidInFull(value);
    
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user action
    await saveToggleValue(SELL_KEYS.MORTGAGE_REPAID_FULL_TOGGLE, value);
  };

  const handleUseSaleFundsToggle = async (value: boolean) => {
    console.log('User toggled Use sale funds to:', value);
    setUseSaleFunds(value);
    
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user action
    await saveToggleValue(SELL_KEYS.USE_SALE_FUNDS_TOGGLE, value);
  };

  // Memoized commission calculation - only recalculates when dependencies change
  const calculateCommission = useCallback((price: number): number => {
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
  }, [commissionTiers]);

  const handlePriceTextChange = (text: string) => {
    console.log('User changed sale price:', text);
    const cleanText = text.replace(/[^0-9]/g, '');
    const numValue = parseFloat(cleanText);
    if (!isNaN(numValue) && numValue >= 0) {
      setSalePrice(numValue);
      const formatted = numValue.toLocaleString('en-US');
      setSalePriceText(formatted);
      // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user input
      saveNumericValue(SELL_KEYS.SALE_PRICE, cleanText);
    } else if (cleanText === '') {
      setSalePrice(0);
      setSalePriceText('');
      saveNumericValue(SELL_KEYS.SALE_PRICE, '0');
    }
  };

  const handlePriceBlur = () => {
    if (salePrice > 0) {
      const formatted = salePrice.toLocaleString('en-US');
      setSalePriceText(formatted);
    }
    Keyboard.dismiss();
  };

  const adjustPrice = (amount: number) => {
    console.log('User adjusted price by:', amount);
    const newPrice = Math.max(0, salePrice + amount);
    setSalePrice(newPrice);
    const formatted = newPrice > 0 ? newPrice.toLocaleString('en-US') : '';
    setSalePriceText(formatted);
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to button press
    saveNumericValue(SELL_KEYS.SALE_PRICE, newPrice.toString());
  };

  const handleCustomIncrementSubmit = () => {
    console.log('User submitted custom increment:', customIncrement);
    const value = parseFloat(customIncrement);
    if (!isNaN(value) && value > 0) {
      setPriceIncrement(value);
      setShowCustomIncrementInput(false);
      // ✅ EXPLICIT PERSISTENCE: Save immediately in response to button press
      saveNumericValue(SELL_KEYS.PRICE_INCREMENT, value.toString());
      saveNumericValue(SELL_KEYS.CUSTOM_INCREMENT, customIncrement);
    } else {
      setShowCustomIncrementInput(false);
    }
  };

  const handleTapOutside = useCallback(() => {
    console.log('User tapped outside - dismissing keyboard');
    Keyboard.dismiss();
  }, []);

  const incrementOptions = [500, 2000, 5000, 10000, 20000, 50000];
  
  // ✅ FIXED FONT SIZE: 70% of original 48px = 33.6px (no dynamic scaling)
  const fixedFontSize = 48 * 0.7;
  
  // Memoized calculations - only recalculate when dependencies change
  const price = salePrice;
  const commission = useMemo(() => calculateCommission(price), [calculateCommission, price]);
  const advertising = useMemo(() => parseFloat(advertisingCosts) || 0, [advertisingCosts]);
  const legal = useMemo(() => parseFloat(legalFees) || 0, [legalFees]);
  
  // Calculate total debt from all debt items
  const totalDebt = useMemo(() => 
    debtItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
    [debtItems]
  );
  
  // Determine how much debt to deduct
  const debtToDeduct = useMemo(() => {
    if (!mortgageToBeRepaid) {
      return 0;
    }
    if (mortgageRepaidInFull) {
      return totalDebt;
    }
    return parseFloat(partialRepaymentAmount) || 0;
  }, [mortgageToBeRepaid, mortgageRepaidInFull, totalDebt, partialRepaymentAmount]);
  
  const dischargeFee = useMemo(() => 
    mortgageToBeRepaid && debtToDeduct > 0 ? 350 : 0,
    [mortgageToBeRepaid, debtToDeduct]
  );

  const totalCosts = useMemo(() => 
    commission + advertising + legal + dischargeFee,
    [commission, advertising, legal, dischargeFee]
  );
  
  const netProceedsValue = useMemo(() => 
    price - totalCosts - debtToDeduct,
    [price, totalCosts, debtToDeduct]
  );

  // Update context only when net proceeds changes
  useEffect(() => {
    console.log('Sell screen: Net proceeds updated to', netProceedsValue);
    setNetProceeds(netProceedsValue);
  }, [netProceedsValue, setNetProceeds]);

  // Update context only when use sale funds toggle changes
  useEffect(() => {
    console.log('Sell screen: Use sale funds toggle changed to', useSaleFunds);
    setUseSaleFundsForPurchase(useSaleFunds);
  }, [useSaleFunds, setUseSaleFundsForPurchase]);

  const addCommissionTier = () => {
    const newId = (commissionTiers.length + 1).toString();
    const lastTier = commissionTiers[commissionTiers.length - 1];
    const newFrom = lastTier && lastTier.toPrice ? lastTier.toPrice : '0';
    
    const updatedTiers = [
      ...commissionTiers,
      { id: newId, fromPrice: newFrom, toPrice: '', rate: '' }
    ];
    setCommissionTiers(updatedTiers);
    
    // Save structure change
    saveSellScreenStructure();
  };

  const updateCommissionTier = (id: string, field: keyof CommissionTier, value: string) => {
    console.log('User updated commission tier', id, field, 'to', value);
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
    
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user input
    if (field === 'fromPrice') {
      const storageKey = SELL_KEYS.COMMISSION_FROM + id;
      saveNumericValue(storageKey, value);
    } else if (field === 'toPrice') {
      const storageKey = SELL_KEYS.COMMISSION_TO + id;
      saveNumericValue(storageKey, value);
    } else if (field === 'rate') {
      const storageKey = SELL_KEYS.COMMISSION_RATE + id;
      saveNumericValue(storageKey, value);
    }
  };

  const removeCommissionTier = (id: string) => {
    if (commissionTiers.length > 1) {
      const updatedTiers = commissionTiers.filter(tier => tier.id !== id);
      setCommissionTiers(updatedTiers);
      
      // Clear from localStorage using fixed keys
      saveNumericValue(SELL_KEYS.COMMISSION_FROM + id, '');
      saveNumericValue(SELL_KEYS.COMMISSION_TO + id, '');
      saveNumericValue(SELL_KEYS.COMMISSION_RATE + id, '');
      
      // Save structure change
      saveSellScreenStructure();
    }
  };

  const addDebtItem = () => {
    const newId = (debtItems.length + 1).toString();
    console.log('Adding new debt item with id:', newId);
    const updatedItems = [...debtItems, { id: newId, amount: '' }];
    setDebtItems(updatedItems);
    
    // Save structure change
    saveSellScreenStructure();
  };

  const updateDebtItem = (id: string, amount: string) => {
    console.log('User updated debt item', id, 'with amount', amount);
    setDebtItems(debtItems.map(item => 
      item.id === id ? { ...item, amount } : item
    ));
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user input
    const storageKey = SELL_KEYS.DEBT_AMOUNT + id;
    saveNumericValue(storageKey, amount);
  };

  const removeDebtItem = (id: string) => {
    if (debtItems.length > 1) {
      console.log('Removing debt item:', id);
      const updatedItems = debtItems.filter(item => item.id !== id);
      setDebtItems(updatedItems);
      
      // Clear from localStorage using fixed key
      const storageKey = SELL_KEYS.DEBT_AMOUNT + id;
      saveNumericValue(storageKey, '');
      
      // Save structure change
      saveSellScreenStructure();
    }
  };

  const formatMoney = useCallback((value: number): string => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const handleIncrementChange = (value: number) => {
    console.log('User changed increment to:', value);
    setPriceIncrement(value);
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to button press
    saveNumericValue(SELL_KEYS.PRICE_INCREMENT, value.toString());
  };

  const handleAdvertisingChange = (text: string) => {
    console.log('User changed advertising costs:', text);
    setAdvertisingCosts(text);
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user input
    saveNumericValue(SELL_KEYS.ADVERTISING_COSTS, text);
  };

  const handleLegalFeesChange = (text: string) => {
    console.log('User changed legal fees:', text);
    setLegalFees(text);
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user input
    saveNumericValue(SELL_KEYS.LEGAL_FEES, text);
  };

  const handlePartialRepaymentChange = (text: string) => {
    console.log('User changed partial repayment amount:', text);
    setPartialRepaymentAmount(text);
    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user input
    saveNumericValue(SELL_KEYS.PARTIAL_REPAYMENT, text);
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={commonStyles.card}>
            <View style={styles.toggleSection}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Mortgage to be repaid?</Text>
                <Switch
                  value={mortgageToBeRepaid}
                  onValueChange={handleMortgageToBeRepaidToggle}
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
                      onValueChange={handleMortgageRepaidInFullToggle}
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
                  onValueChange={handleUseSaleFundsToggle}
                  trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                  thumbColor={useSaleFunds ? '#4caf50' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          <View style={[commonStyles.card, styles.priceCard]}>
            <Text style={styles.priceLabel}>Sale Price</Text>
            <View style={styles.priceInputContainer}>
              <Text style={[styles.dollarSign, { fontSize: fixedFontSize }]}>$</Text>
              <TextInput
                style={[styles.priceInput, { fontSize: fixedFontSize }]}
                value={salePriceText}
                onChangeText={handlePriceTextChange}
                onBlur={handlePriceBlur}
                keyboardType="numeric"
                selectTextOnFocus
                textAlign="center"
                placeholder=""
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
                      handleIncrementChange(option);
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
                  onChangeText={(text) => {
                    setCustomIncrement(text);
                    // ✅ EXPLICIT PERSISTENCE: Save immediately in response to user input
                    saveNumericValue(SELL_KEYS.CUSTOM_INCREMENT, text);
                  }}
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
                onChangeText={handleAdvertisingChange}
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
                onChangeText={handleLegalFeesChange}
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
                    onChangeText={handlePartialRepaymentChange}
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
              
              if (debtAmount === 0) {
                return null;
              }
              
              const labelText = `Mortgage/Debt ${index + 1}`;
              
              let displayAmount = 0;
              if (mortgageRepaidInFull) {
                displayAmount = debtAmount;
              } else if (index === 0) {
                displayAmount = Math.min(debtAmount, parseFloat(partialRepaymentAmount) || 0);
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    width: '90%',
    alignSelf: 'center',
    height: 60,
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
    width: '100%',
    height: 60,
    flexShrink: 0,
    padding: 0,
    margin: 0,
    fontFamily: 'CourierPrime_700Bold',
    paddingLeft: 8,
    paddingRight: 8,
    includeFontPadding: false,
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
