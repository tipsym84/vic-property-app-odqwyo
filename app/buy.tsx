
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Keyboard, Modal, Switch, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStampDuty, calculateLandTransferFee, UserProfile } from '@/utils/stampDutyCalculations';
import { useProperty } from '@/contexts/PropertyContext';
import { saveNumericValue, loadNumericValue, saveToggleValue, loadToggleValue, BUY_KEYS } from '@/utils/localStorage';

interface CostItem {
  id: string;
  type: string;
  customLabel: string;
  amount: string;
}

interface LoanItem {
  id: string;
  name: string;
  amount: string;
}

interface SavingsItem {
  id: string;
  amount: string;
}

const formatMoney = (value: number): string => {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getDynamicFontSize = (value: number): number => {
  const valueStr = Math.abs(value).toString().replace(/[^0-9]/g, '');
  const digits = valueStr.length;
  
  if (digits <= 5) return 48;
  if (digits === 6) return 42;
  if (digits === 7) return 36;
  if (digits === 8) return 32;
  if (digits === 9) return 28;
  return 24;
};

const ALL_COST_OPTIONS = [
  'Legal Fees',
  'Building/Pest Inspection',
  'Council Rates',
  'Owners Corporation',
  'Lenders Mortgage Insurance (LMI)',
  'Insurance',
  'Removalist',
  'Other'
];

export default function BuyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { netProceeds, useSaleFundsForPurchase } = useProperty();
  
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidText, setCurrentBidText] = useState('');
  const [bidIncrement, setBidIncrement] = useState(5000);
  const [customIncrement, setCustomIncrement] = useState('1000');
  const [showCustomIncrementInput, setShowCustomIncrementInput] = useState(false);
  
  const [loans, setLoans] = useState<LoanItem[]>([
    { id: '1', name: 'Loan 1', amount: '' }
  ]);
  const [selectedLoanId, setSelectedLoanId] = useState('1');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [tempLoanName, setTempLoanName] = useState('');
  const [tempLoanAmount, setTempLoanAmount] = useState('');
  
  const [savingsItems, setSavingsItems] = useState<SavingsItem[]>([
    { id: '1', amount: '' }
  ]);
  
  const [viewMode, setViewMode] = useState<'total' | 'cash' | 'remaining'>('cash');
  const [concessionAlertShown, setConcessionAlertShown] = useState(false);
  
  const [costItems, setCostItems] = useState<CostItem[]>([]);

  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showCustomLabelInput, setShowCustomLabelInput] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    isPrimaryResidence: false,
    isFirstHomeBuyer: false,
    isConcessionCardHolder: false,
  });

  // Load all persisted values on mount
  useEffect(() => {
    console.log('Buy screen mounted - loading persisted values');
    loadAllNumericValues();
    loadAllToggleValues();
    loadBuyScreenData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Buy screen focused - reloading persisted values');
      loadAllNumericValues();
      loadAllToggleValues();
      loadBuyScreenData();
    }, [])
  );

  // Load all numeric values from localStorage
  const loadAllNumericValues = async () => {
    console.log('Loading all numeric values from localStorage');
    
    // Load current bid - using fixed key BUY_KEYS.CURRENT_OFFER
    const savedBid = await loadNumericValue(BUY_KEYS.CURRENT_OFFER);
    if (savedBid !== null) {
      const numValue = parseFloat(savedBid);
      if (!isNaN(numValue) && numValue > 0) {
        setCurrentBid(numValue);
        setCurrentBidText(numValue.toLocaleString('en-US'));
      }
    }
    
    // Load bid increment
    const savedIncrement = await loadNumericValue(BUY_KEYS.BID_INCREMENT);
    if (savedIncrement !== null) {
      const numValue = parseFloat(savedIncrement);
      if (!isNaN(numValue)) {
        setBidIncrement(numValue);
      }
    }
    
    // Load custom increment
    const savedCustomIncrement = await loadNumericValue(BUY_KEYS.CUSTOM_INCREMENT);
    if (savedCustomIncrement !== null) {
      setCustomIncrement(savedCustomIncrement);
    }
  };

  // Load all toggle values from localStorage
  const loadAllToggleValues = async () => {
    console.log('Loading all toggle values from localStorage');
    
    // Load Primary Residence toggle - default to FALSE
    const primaryResidence = await loadToggleValue(BUY_KEYS.PRIMARY_RESIDENCE_TOGGLE, false);
    
    // Load First Home Owner toggle
    const firstHomeOwner = await loadToggleValue(BUY_KEYS.FIRST_HOME_OWNER_TOGGLE, false);
    
    // Load Concession Card toggle
    const concessionCard = await loadToggleValue(BUY_KEYS.CONCESSION_CARD_TOGGLE, false);
    
    const newProfile = {
      isPrimaryResidence: primaryResidence,
      isFirstHomeBuyer: firstHomeOwner,
      isConcessionCardHolder: concessionCard,
    };
    
    console.log('Loaded toggle values:', newProfile);
    setUserProfile(newProfile);
  };

  // Save data whenever it changes
  useEffect(() => {
    saveBuyScreenData();
  }, [currentBid, bidIncrement, loans, selectedLoanId, savingsItems, costItems, viewMode]);

  const loadBuyScreenData = async () => {
    try {
      console.log('Loading Buy screen data from storage');
      const savedData = await AsyncStorage.getItem('buyScreenData');
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Loaded Buy screen data:', data);
        
        if (data.loans) {
          setLoans(data.loans);
          // Load loan amounts from localStorage
          for (const loan of data.loans) {
            const savedAmount = await loadNumericValue(BUY_KEYS.LOAN_AMOUNT + loan.id);
            if (savedAmount !== null) {
              loan.amount = savedAmount;
            }
          }
          setLoans([...data.loans]);
        }
        if (data.selectedLoanId) setSelectedLoanId(data.selectedLoanId);
        
        if (data.savingsItems) {
          setSavingsItems(data.savingsItems);
          // Load savings amounts from localStorage
          for (const item of data.savingsItems) {
            const savedAmount = await loadNumericValue(BUY_KEYS.SAVINGS_AMOUNT + item.id);
            if (savedAmount !== null) {
              item.amount = savedAmount;
            }
          }
          setSavingsItems([...data.savingsItems]);
        }
        
        if (data.costItems) {
          setCostItems(data.costItems);
          // Load cost amounts from localStorage
          for (const item of data.costItems) {
            const savedAmount = await loadNumericValue(BUY_KEYS.COST_AMOUNT + item.id);
            if (savedAmount !== null) {
              item.amount = savedAmount;
            }
          }
          setCostItems([...data.costItems]);
        }
        
        if (data.viewMode) setViewMode(data.viewMode);
      }
    } catch (error) {
      console.error('Error loading Buy screen data:', error);
    }
  };

  const saveBuyScreenData = async () => {
    try {
      const data = {
        currentBid,
        bidIncrement,
        loans,
        selectedLoanId,
        savingsItems,
        costItems,
        viewMode,
      };
      await AsyncStorage.setItem('buyScreenData', JSON.stringify(data));
      console.log('Saved Buy screen data');
    } catch (error) {
      console.error('Error saving Buy screen data:', error);
    }
  };

  const handlePrimaryResidenceToggle = async (value: boolean) => {
    console.log('User toggled Primary Residence to:', value);
    const newProfile = {
      ...userProfile,
      isPrimaryResidence: value,
      isFirstHomeBuyer: value ? userProfile.isFirstHomeBuyer : false,
      isConcessionCardHolder: value ? userProfile.isConcessionCardHolder : false,
    };
    setUserProfile(newProfile);
    
    // Persist to localStorage immediately using fixed key
    await saveToggleValue(BUY_KEYS.PRIMARY_RESIDENCE_TOGGLE, value);
    if (!value) {
      // If turning off primary residence, also turn off dependent toggles
      await saveToggleValue(BUY_KEYS.FIRST_HOME_OWNER_TOGGLE, false);
      await saveToggleValue(BUY_KEYS.CONCESSION_CARD_TOGGLE, false);
    }
  };

  const handleFirstHomeBuyerToggle = async (value: boolean) => {
    console.log('User toggled First Home Owner to:', value);
    if (userProfile.isPrimaryResidence) {
      const newProfile = {
        ...userProfile,
        isFirstHomeBuyer: value,
      };
      setUserProfile(newProfile);
      
      // Persist to localStorage immediately using fixed key
      await saveToggleValue(BUY_KEYS.FIRST_HOME_OWNER_TOGGLE, value);
    }
  };

  const handleConcessionCardToggle = async (value: boolean) => {
    console.log('User toggled Concession Card to:', value);
    if (userProfile.isPrimaryResidence) {
      const newProfile = {
        ...userProfile,
        isConcessionCardHolder: value,
      };
      setUserProfile(newProfile);
      
      // Persist to localStorage immediately using fixed key
      await saveToggleValue(BUY_KEYS.CONCESSION_CARD_TOGGLE, value);
      
      if (value) {
        showConcessionAlert();
      }
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

  const handleBidTextChange = (text: string) => {
    console.log('User changed current bid:', text);
    const cleanText = text.replace(/[^0-9]/g, '');
    const numValue = parseFloat(cleanText);
    if (!isNaN(numValue) && numValue >= 0) {
      setCurrentBid(numValue);
      const formatted = numValue.toLocaleString('en-US');
      setCurrentBidText(formatted);
      // Persist to localStorage immediately using fixed key BUY_KEYS.CURRENT_OFFER
      saveNumericValue(BUY_KEYS.CURRENT_OFFER, cleanText);
    } else if (cleanText === '') {
      setCurrentBid(0);
      setCurrentBidText('');
      saveNumericValue(BUY_KEYS.CURRENT_OFFER, '0');
    }
  };

  const handleBidBlur = () => {
    if (currentBid > 0) {
      const formatted = currentBid.toLocaleString('en-US');
      setCurrentBidText(formatted);
    }
    Keyboard.dismiss();
  };

  const handleCustomIncrementSubmit = () => {
    console.log('User submitted custom increment:', customIncrement);
    const value = parseFloat(customIncrement);
    if (!isNaN(value) && value > 0) {
      setBidIncrement(value);
      setShowCustomIncrementInput(false);
      // Persist to localStorage using fixed keys
      saveNumericValue(BUY_KEYS.BID_INCREMENT, value.toString());
      saveNumericValue(BUY_KEYS.CUSTOM_INCREMENT, customIncrement);
    } else {
      Alert.alert('Invalid Value', 'Please enter a valid increment amount.');
    }
  };

  const selectedLoan = loans.find(item => item.id === selectedLoanId);
  const currentLoanAmount = selectedLoan ? selectedLoan.amount : '';

  const stampDuty = calculateStampDuty(currentBid, userProfile, showConcessionAlert);
  const landTransferFee = calculateLandTransferFee(currentBid);
  const loanAmount = parseFloat(currentLoanAmount) || 0;
  const mortgageReg = loanAmount > 0 ? 119.90 : 0;
  
  const additionalCosts = costItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalCosts = stampDuty + landTransferFee + mortgageReg + additionalCosts;
  const totalRequired = currentBid + totalCosts;
  
  const totalSavings = savingsItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const balanceOfSaleFunds = useSaleFundsForPurchase ? netProceeds : 0;
  const totalAvailableFunds = totalSavings + balanceOfSaleFunds;
  
  // Calculate cash needed - deduct balance of sale funds and ensure it's never negative
  const cashNeededRaw = totalRequired - loanAmount - balanceOfSaleFunds;
  const cashNeeded = Math.max(0, cashNeededRaw);
  
  const savingsRemaining = totalAvailableFunds - cashNeeded;

  const adjustBid = (amount: number) => {
    console.log('User adjusted bid by:', amount);
    const newBid = Math.max(0, currentBid + amount);
    setCurrentBid(newBid);
    const formatted = newBid > 0 ? newBid.toLocaleString('en-US') : '';
    setCurrentBidText(formatted);
    // Persist to localStorage immediately using fixed key
    saveNumericValue(BUY_KEYS.CURRENT_OFFER, newBid.toString());
  };

  const getAvailableCostOptions = () => {
    const usedOptions = costItems
      .map(item => item.type)
      .filter(type => type !== 'Other');
    
    return ALL_COST_OPTIONS.filter(option => 
      option === 'Other' || !usedOptions.includes(option)
    );
  };

  const addCostItem = () => {
    const availableOptions = getAvailableCostOptions();
    if (availableOptions.length > 0) {
      const newId = (costItems.length + 1).toString();
      const defaultType = availableOptions[0];
      setCostItems([...costItems, { id: newId, type: defaultType, customLabel: '', amount: '' }]);
    }
  };

  const updateCostItemType = (id: string, type: string) => {
    setCostItems(costItems.map(item => 
      item.id === id ? { ...item, type, customLabel: type === 'Other' ? item.customLabel : '' } : item
    ));
    setShowDropdown(null);
    if (type === 'Other') {
      setShowCustomLabelInput(id);
    } else {
      setShowCustomLabelInput(null);
    }
  };

  const updateCostItemCustomLabel = (id: string, customLabel: string) => {
    setCostItems(costItems.map(item => 
      item.id === id ? { ...item, customLabel } : item
    ));
  };

  const updateCostItemAmount = (id: string, amount: string) => {
    console.log('User updated cost item amount:', id, amount);
    setCostItems(costItems.map(item => 
      item.id === id ? { ...item, amount } : item
    ));
    // Persist to localStorage immediately using fixed key with ID
    const storageKey = BUY_KEYS.COST_AMOUNT + id;
    saveNumericValue(storageKey, amount);
  };

  const removeCostItem = (id: string) => {
    setCostItems(costItems.filter(item => item.id !== id));
    if (showDropdown === id) setShowDropdown(null);
    if (showCustomLabelInput === id) setShowCustomLabelInput(null);
    // Clear from localStorage using fixed key
    const storageKey = BUY_KEYS.COST_AMOUNT + id;
    saveNumericValue(storageKey, '');
  };

  const getCostItemDisplayLabel = (item: CostItem): string => {
    if (item.type === 'Other' && item.customLabel) {
      return item.customLabel;
    }
    return item.type;
  };

  const openLoanModal = (loanId: string | null = null) => {
    if (loanId) {
      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        setEditingLoanId(loanId);
        setTempLoanName(loan.name);
        setTempLoanAmount(loan.amount);
      }
    } else {
      const newId = (loans.length + 1).toString();
      setEditingLoanId(newId);
      setTempLoanName(`Loan ${loans.length + 1}`);
      setTempLoanAmount('');
    }
    setShowLoanModal(true);
  };

  const saveLoan = () => {
    if (!editingLoanId) return;
    
    console.log('User saved loan:', editingLoanId, tempLoanAmount);
    
    const existingLoan = loans.find(l => l.id === editingLoanId);
    if (existingLoan) {
      setLoans(loans.map(l => 
        l.id === editingLoanId ? { ...l, name: tempLoanName, amount: tempLoanAmount } : l
      ));
    } else {
      setLoans([...loans, { id: editingLoanId, name: tempLoanName, amount: tempLoanAmount }]);
      setSelectedLoanId(editingLoanId);
    }
    
    // Persist loan amount to localStorage using fixed key with ID
    const storageKey = BUY_KEYS.LOAN_AMOUNT + editingLoanId;
    saveNumericValue(storageKey, tempLoanAmount);
    
    setShowLoanModal(false);
    setEditingLoanId(null);
    setTempLoanName('');
    setTempLoanAmount('');
  };

  const removeLoan = (id: string) => {
    if (loans.length > 1) {
      setLoans(loans.filter(item => item.id !== id));
      if (selectedLoanId === id) {
        setSelectedLoanId(loans[0].id);
      }
      // Clear from localStorage using fixed key
      const storageKey = BUY_KEYS.LOAN_AMOUNT + id;
      saveNumericValue(storageKey, '');
    }
  };

  const addSavingsItem = () => {
    const newId = (savingsItems.length + 1).toString();
    setSavingsItems([...savingsItems, { id: newId, amount: '' }]);
  };

  const updateSavingsItem = (id: string, amount: string) => {
    console.log('User updated savings item:', id, amount);
    setSavingsItems(savingsItems.map(item => 
      item.id === id ? { ...item, amount } : item
    ));
    // Persist to localStorage immediately using fixed key with ID
    const storageKey = BUY_KEYS.SAVINGS_AMOUNT + id;
    saveNumericValue(storageKey, amount);
  };

  const removeSavingsItem = (id: string) => {
    if (savingsItems.length > 1) {
      setSavingsItems(savingsItems.filter(item => item.id !== id));
      // Clear from localStorage using fixed key
      const storageKey = BUY_KEYS.SAVINGS_AMOUNT + id;
      saveNumericValue(storageKey, '');
    }
  };

  const incrementOptions = [500, 2000, 5000, 10000, 20000, 50000];

  const handleScroll = () => {
    Keyboard.dismiss();
  };

  const handleIncrementChange = (value: number) => {
    console.log('User changed increment to:', value);
    setBidIncrement(value);
    // Persist to localStorage immediately using fixed key
    saveNumericValue(BUY_KEYS.BID_INCREMENT, value.toString());
  };

  // FIXED FONT SIZE: 70% of original 48px = 33.6px (no dynamic scaling)
  const fixedFontSize = 48 * 0.7;

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
        <Text style={styles.headerTitle}>Buy</Text>
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
              <Text style={styles.toggleLabel}>Primary Residence</Text>
              <Switch
                value={userProfile.isPrimaryResidence}
                onValueChange={handlePrimaryResidenceToggle}
                trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                thumbColor={userProfile.isPrimaryResidence ? '#4caf50' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.toggleRow}>
              <Text style={[
                styles.toggleLabel,
                !userProfile.isPrimaryResidence && styles.toggleLabelDisabled
              ]}>
                First Home Owner
              </Text>
              <Switch
                value={userProfile.isFirstHomeBuyer}
                onValueChange={handleFirstHomeBuyerToggle}
                disabled={!userProfile.isPrimaryResidence}
                trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                thumbColor={userProfile.isFirstHomeBuyer ? '#4caf50' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.toggleRow}>
              <Text style={[
                styles.toggleLabel,
                !userProfile.isPrimaryResidence && styles.toggleLabelDisabled
              ]}>
                Concession Card
              </Text>
              <Switch
                value={userProfile.isConcessionCardHolder}
                onValueChange={handleConcessionCardToggle}
                disabled={!userProfile.isPrimaryResidence}
                trackColor={{ false: '#d0d0d0', true: '#81c784' }}
                thumbColor={userProfile.isConcessionCardHolder ? '#4caf50' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.bidCard]}>
          <Text style={styles.bidLabel}>Current Offer</Text>
          <View style={styles.bidInputContainer}>
            <Text style={[styles.dollarSign, { fontSize: fixedFontSize }]}>$</Text>
            <TextInput
              style={[styles.bidInput, { fontSize: fixedFontSize }]}
              value={currentBidText}
              onChangeText={handleBidTextChange}
              onBlur={handleBidBlur}
              keyboardType="numeric"
              selectTextOnFocus
              textAlign="center"
              placeholder=""
            />
          </View>
          
          <View style={styles.bidControls}>
            <TouchableOpacity 
              style={styles.bidButton}
              onPress={() => adjustBid(-bidIncrement)}
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
              <Text style={styles.incrementValue}>${formatMoney(bidIncrement)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.bidButton}
              onPress={() => adjustBid(bidIncrement)}
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
            <Text style={styles.incrementSelectorLabel}>Select Offer Increment:</Text>
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
                    bidIncrement === option && !showCustomIncrementInput && styles.incrementOptionActive
                  ]}
                  onPress={() => {
                    handleIncrementChange(option);
                    setShowCustomIncrementInput(false);
                  }}
                >
                  <Text style={[
                    styles.incrementOptionText,
                    bidIncrement === option && !showCustomIncrementInput && styles.incrementOptionTextActive
                  ]}>
                    ${(option / 1000).toFixed(option < 1000 ? 0 : 0)}k
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
                  saveNumericValue(BUY_KEYS.CUSTOM_INCREMENT, text);
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
            <Text style={commonStyles.label}>Loan Pre-Approval Amount</Text>
            <TouchableOpacity onPress={() => openLoanModal(null)} style={styles.addButton}>
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={20}
                color="#424242"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.loanDisplayRow}>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={[commonStyles.input, styles.inputWithPrefixField]}
                placeholder="Tap to add loan"
                keyboardType="numeric"
                value={currentLoanAmount}
                onFocus={() => {
                  Keyboard.dismiss();
                  openLoanModal(selectedLoanId);
                }}
              />
            </View>
            {selectedLoan && (
              <TouchableOpacity onPress={() => openLoanModal(selectedLoanId)} style={styles.editButton}>
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color="#424242"
                />
              </TouchableOpacity>
            )}
          </View>

          {loans.length > 1 && (
            <View style={styles.loanSelectorContainer}>
              <Text style={styles.loanSelectorLabel}>Select Loan Scenario:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.loanOptions}
              >
                {loans.map((loan, index) => (
                  <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.loanOption,
                      selectedLoanId === loan.id && styles.loanOptionActive
                    ]}
                    onPress={() => setSelectedLoanId(loan.id)}
                  >
                    <Text style={[
                      styles.loanOptionText,
                      selectedLoanId === loan.id && styles.loanOptionTextActive
                    ]}>
                      {loan.name}
                    </Text>
                  </TouchableOpacity>
                  </React.Fragment>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[commonStyles.label, { marginTop: 12 }]}>Your Savings/Other Funds</Text>
            <TouchableOpacity onPress={addSavingsItem} style={styles.addButton}>
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={20}
                color="#424242"
              />
            </TouchableOpacity>
          </View>

          {savingsItems.map((item, index) => (
            <React.Fragment key={index}>
            <View style={styles.savingsItemRow}>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={[commonStyles.input, styles.inputWithPrefixField]}
                  placeholder={`Savings ${index + 1}`}
                  keyboardType="numeric"
                  value={item.amount}
                  onChangeText={(value) => updateSavingsItem(item.id, value)}
                  onBlur={() => Keyboard.dismiss()}
                />
              </View>
              {savingsItems.length > 1 && (
                <TouchableOpacity onPress={() => removeSavingsItem(item.id)} style={styles.deleteButton}>
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

          {useSaleFundsForPurchase && (
            <>
              <Text style={[commonStyles.label, { marginTop: 12 }]}>Balance of Sale Funds</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={[commonStyles.input, styles.inputWithPrefixField, styles.lockedInput]}
                  value={formatMoney(netProceeds)}
                  editable={false}
                />
              </View>
            </>
          )}
        </View>

        <View style={commonStyles.card}>
          <View style={styles.sectionHeader}>
            <Text style={commonStyles.subtitle}>Additional Costs</Text>
            <TouchableOpacity 
              onPress={addCostItem} 
              style={styles.addButton}
              disabled={getAvailableCostOptions().length === 0}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={24}
                color={getAvailableCostOptions().length === 0 ? '#d0d0d0' : '#424242'}
              />
            </TouchableOpacity>
          </View>

          {costItems.map((item, index) => (
            <React.Fragment key={index}>
            <View style={styles.costItemRow}>
              <View style={styles.costTypeContainer}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowDropdown(showDropdown === item.id ? null : item.id)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {getCostItemDisplayLabel(item)}
                  </Text>
                  <IconSymbol
                    ios_icon_name="chevron.down"
                    android_material_icon_name="arrow-drop-down"
                    size={20}
                    color="#424242"
                  />
                </TouchableOpacity>
                
                {showDropdown === item.id && (
                  <>
                    <TouchableWithoutFeedback onPress={() => setShowDropdown(null)}>
                      <View style={styles.dropdownOverlay} />
                    </TouchableWithoutFeedback>
                    <View style={styles.dropdownMenu}>
                      <ScrollView 
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                      >
                        {getAvailableCostOptions().map((option, optIndex) => (
                          <React.Fragment key={optIndex}>
                          <TouchableOpacity
                            style={styles.dropdownMenuItem}
                            onPress={() => updateCostItemType(item.id, option)}
                          >
                            <Text style={styles.dropdownMenuItemText}>{option}</Text>
                          </TouchableOpacity>
                          </React.Fragment>
                        ))}
                      </ScrollView>
                    </View>
                  </>
                )}
              </View>

              <TextInput
                style={[commonStyles.input, styles.costAmountInput]}
                placeholder="Amount"
                keyboardType="numeric"
                value={item.amount}
                onChangeText={(value) => updateCostItemAmount(item.id, value)}
                onBlur={() => Keyboard.dismiss()}
              />
              
              <TouchableOpacity onPress={() => removeCostItem(item.id)} style={styles.deleteButton}>
                <IconSymbol
                  ios_icon_name="minus.circle.fill"
                  android_material_icon_name="remove-circle"
                  size={24}
                  color="#f44336"
                />
              </TouchableOpacity>
            </View>

            {item.type === 'Other' && showCustomLabelInput === item.id && (
              <View style={styles.customLabelContainer}>
                <TextInput
                  style={styles.customLabelInput}
                  placeholder="Enter custom label for this cost"
                  value={item.customLabel}
                  onChangeText={(value) => updateCostItemCustomLabel(item.id, value)}
                  onBlur={() => {
                    Keyboard.dismiss();
                    setShowCustomLabelInput(null);
                  }}
                  autoFocus
                />
              </View>
            )}
            </React.Fragment>
          ))}
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Cost Breakdown</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Purchase Price</Text>
            <Text style={styles.resultValue}>${formatMoney(currentBid)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Stamp Duty</Text>
            <Text style={styles.resultValue}>${formatMoney(stampDuty)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Land Transfer Fee</Text>
            <Text style={styles.resultValue}>${formatMoney(landTransferFee)}</Text>
          </View>

          {mortgageReg > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Mortgage Registration</Text>
              <Text style={styles.resultValue}>${formatMoney(mortgageReg)}</Text>
            </View>
          )}

          {costItems.map((item, index) => {
            const displayLabel = getCostItemDisplayLabel(item);
            const amount = parseFloat(item.amount);
            return (
              <React.Fragment key={index}>
              {displayLabel && amount > 0 && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{displayLabel}</Text>
                  <Text style={styles.resultValue}>${formatMoney(amount)}</Text>
                </View>
              )}
              </React.Fragment>
            );
          })}

          <View style={styles.divider} />

          <View style={styles.resultRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${formatMoney(totalRequired)}</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.pinnedFooter}>
        <View style={styles.pinnedContent}>
          {viewMode === 'total' && (
            <>
              <Text style={styles.pinnedLabel}>Total Amount Required</Text>
              <Text style={styles.pinnedValue}>${formatMoney(totalRequired)}</Text>
            </>
          )}
          {viewMode === 'cash' && (
            <>
              <Text style={styles.pinnedLabel}>Cash Needed</Text>
              <Text style={styles.pinnedValue}>${formatMoney(cashNeeded)}</Text>
            </>
          )}
          {viewMode === 'remaining' && (
            <>
              <Text style={styles.pinnedLabel}>Savings Remaining</Text>
              <Text style={[
                styles.pinnedValue,
                { color: savingsRemaining >= 0 ? '#424242' : '#f44336' }
              ]}>
                ${formatMoney(savingsRemaining)}
              </Text>
            </>
          )}
          
          <View style={styles.viewModeButtons}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'total' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('total')}
            >
              <Text style={[styles.viewModeButtonText, viewMode === 'total' && styles.viewModeButtonTextActive]}>
                Total Required
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'cash' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('cash')}
            >
              <Text style={[styles.viewModeButtonText, viewMode === 'cash' && styles.viewModeButtonTextActive]}>
                Cash Needed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'remaining' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('remaining')}
            >
              <Text style={[styles.viewModeButtonText, viewMode === 'remaining' && styles.viewModeButtonTextActive]}>
                Savings Remaining
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showLoanModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoanModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                onScroll={() => Keyboard.dismiss()}
                scrollEventThrottle={16}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Loan Details</Text>
                  
                  <Text style={styles.modalLabel}>Loan Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. CBA"
                    value={tempLoanName}
                    onChangeText={setTempLoanName}
                    onFocus={() => {
                      if (tempLoanName.startsWith('Loan ')) {
                        setTempLoanName('');
                      }
                    }}
                  />
                  
                  <Text style={styles.modalLabel}>Pre-Approval Amount</Text>
                  <View style={styles.modalInputWithPrefix}>
                    <Text style={styles.inputPrefix}>$</Text>
                    <TextInput
                      style={[styles.modalInput, styles.modalInputWithPrefixField]}
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      value={tempLoanAmount}
                      onChangeText={(text) => {
                        setTempLoanAmount(text);
                        console.log('User typing loan amount:', text);
                      }}
                    />
                  </View>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonCancel]}
                      onPress={() => setShowLoanModal(false)}
                    >
                      <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonSave]}
                      onPress={saveLoan}
                    >
                      <Text style={styles.modalButtonTextSave}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  },
  toggleLabelDisabled: {
    color: colors.textSecondary,
  },
  bidCard: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    fontFamily: 'CourierPrime_400Regular',
  },
  bidInputContainer: {
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
    width: '90%',
    alignSelf: 'center',
  },
  dollarSign: {
    fontWeight: '800',
    color: '#424242',
    marginRight: 4,
    fontFamily: 'CourierPrime_700Bold',
  },
  bidInput: {
    fontWeight: '800',
    color: '#424242',
    flex: 1,
    padding: 0,
    margin: 0,
    fontFamily: 'CourierPrime_700Bold',
  },
  bidControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  bidButton: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  editButton: {
    padding: 8,
  },
  loanDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loanSelectorContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  loanSelectorLabel: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'CourierPrime_400Regular',
  },
  loanOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  loanOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#9e9e9e',
    minWidth: 60,
    alignItems: 'center',
  },
  loanOptionActive: {
    backgroundColor: '#424242',
    borderColor: '#424242',
  },
  loanOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    fontFamily: 'CourierPrime_700Bold',
  },
  loanOptionTextActive: {
    color: '#ffffff',
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginVertical: 8,
    flex: 1,
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
  lockedInput: {
    backgroundColor: '#f5f5f5',
    color: colors.textSecondary,
  },
  savingsItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  costItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  costTypeContainer: {
    flex: 2,
    position: 'relative',
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'CourierPrime_400Regular',
    flex: 1,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1999,
  },
  dropdownMenu: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 2000,
    maxHeight: 200,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownMenuItemText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'CourierPrime_400Regular',
  },
  costAmountInput: {
    flex: 1,
    marginVertical: 0,
    maxWidth: 100,
  },
  deleteButton: {
    padding: 4,
  },
  customLabelContainer: {
    marginBottom: 12,
    marginTop: -4,
  },
  customLabelInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'CourierPrime_400Regular',
  },
  resultsCard: {
    backgroundColor: '#f5f5f5',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    fontFamily: 'CourierPrime_700Bold',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resultLabel: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    fontFamily: 'CourierPrime_400Regular',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    fontFamily: 'CourierPrime_700Bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
    fontFamily: 'CourierPrime_700Bold',
  },
  pinnedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
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
  viewModeButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    width: '100%',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#9e9e9e',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#424242',
    borderColor: '#424242',
  },
  viewModeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
    fontFamily: 'CourierPrime_700Bold',
  },
  viewModeButtonTextActive: {
    color: '#ffffff',
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalInputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginVertical: 8,
  },
  modalInputWithPrefixField: {
    flex: 1,
    borderWidth: 0,
    marginVertical: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    fontFamily: 'CourierPrime_700Bold',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'CourierPrime_700Bold',
  },
  modalInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'CourierPrime_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonSave: {
    backgroundColor: '#424242',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'CourierPrime_700Bold',
  },
});
