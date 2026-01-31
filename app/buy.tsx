
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Keyboard, Modal } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStampDuty, calculateLandTransferFee, UserProfile } from '@/utils/stampDutyCalculations';

interface CostItem {
  id: string;
  type: 'Legal Fees' | 'Building/Pest Inspection' | 'Council Rates' | 'Other';
  customLabel: string;
  amount: string;
}

const formatMoney = (value: number): string => {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getDynamicFontSize = (value: number): number => {
  const digits = Math.floor(Math.log10(Math.abs(value))) + 1;
  if (digits <= 5) return 48;
  if (digits === 6) return 42;
  if (digits === 7) return 36;
  if (digits === 8) return 32;
  return 28;
};

const COST_OPTIONS = ['Legal Fees', 'Building/Pest Inspection', 'Council Rates', 'Other'] as const;

export default function BuyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentBid, setCurrentBid] = useState(500000);
  const [currentBidText, setCurrentBidText] = useState('500000');
  const [bidIncrement, setBidIncrement] = useState(5000);
  const [customIncrement, setCustomIncrement] = useState('1000');
  const [showCustomIncrementInput, setShowCustomIncrementInput] = useState(false);
  const [loanPreApproval, setLoanPreApproval] = useState('');
  const [savings, setSavings] = useState('');
  const [viewMode, setViewMode] = useState<'total' | 'cash' | 'remaining'>('cash');
  const [concessionAlertShown, setConcessionAlertShown] = useState(false);
  
  const [costItems, setCostItems] = useState<CostItem[]>([
    { id: '1', type: 'Legal Fees', customLabel: '', amount: '1500' },
  ]);

  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showCustomLabelInput, setShowCustomLabelInput] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    isPrimaryResidence: true,
    isFirstHomeBuyer: false,
    isConcessionCardHolder: false,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Buy screen focused - reloading profile settings');
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      const primaryResidence = await AsyncStorage.getItem('isPrimaryResidence');
      const firstHomeBuyer = await AsyncStorage.getItem('isFirstHomeBuyer');
      const concessionCard = await AsyncStorage.getItem('isConcessionCardHolder');
      
      const newProfile = {
        isPrimaryResidence: primaryResidence === 'true',
        isFirstHomeBuyer: firstHomeBuyer === 'true',
        isConcessionCardHolder: concessionCard === 'true',
      };
      
      console.log('Loaded user profile:', newProfile);
      setUserProfile(newProfile);
    } catch (error) {
      console.log('Error loading user profile:', error);
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
    setCurrentBidText(text);
    const numValue = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(numValue) && numValue >= 0) {
      setCurrentBid(numValue);
    }
  };

  const handleBidBlur = () => {
    setCurrentBidText(currentBid.toString());
    Keyboard.dismiss();
  };

  const handleCustomIncrementSubmit = () => {
    const value = parseFloat(customIncrement);
    if (!isNaN(value) && value > 0) {
      setBidIncrement(value);
      setShowCustomIncrementInput(false);
    } else {
      Alert.alert('Invalid Value', 'Please enter a valid increment amount.');
    }
  };

  const stampDuty = calculateStampDuty(currentBid, userProfile, showConcessionAlert);
  const landTransferFee = calculateLandTransferFee(currentBid);
  const mortgageReg = parseFloat(loanPreApproval) > 0 ? 119.90 : 0;
  const caveatFee = 119.90;
  
  const additionalCosts = costItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalCosts = stampDuty + landTransferFee + mortgageReg + caveatFee + additionalCosts;
  const totalRequired = currentBid + totalCosts;
  
  const loanAmount = parseFloat(loanPreApproval) || 0;
  const cashNeeded = totalRequired - loanAmount;
  const savingsAmount = parseFloat(savings) || 0;
  const savingsRemaining = savingsAmount - cashNeeded;

  const adjustBid = (amount: number) => {
    const newBid = Math.max(0, currentBid + amount);
    setCurrentBid(newBid);
    setCurrentBidText(newBid.toString());
  };

  const addCostItem = () => {
    const newId = (costItems.length + 1).toString();
    setCostItems([...costItems, { id: newId, type: 'Legal Fees', customLabel: '', amount: '' }]);
  };

  const updateCostItemType = (id: string, type: typeof COST_OPTIONS[number]) => {
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
    setCostItems(costItems.map(item => 
      item.id === id ? { ...item, amount } : item
    ));
  };

  const removeCostItem = (id: string) => {
    setCostItems(costItems.filter(item => item.id !== id));
    if (showDropdown === id) setShowDropdown(null);
    if (showCustomLabelInput === id) setShowCustomLabelInput(null);
  };

  const getCostItemDisplayLabel = (item: CostItem): string => {
    if (item.type === 'Other' && item.customLabel) {
      return item.customLabel;
    }
    return item.type;
  };

  const incrementOptions = [500, 2000, 5000, 10000, 20000, 50000];

  const handleProfilePress = () => {
    router.push({
      pathname: '/(tabs)/profile',
      params: { from: 'buy' }
    } as any);
  };

  const handleScroll = () => {
    Keyboard.dismiss();
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
          <View style={styles.profileBanner}>
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="account-circle"
              size={20}
              color="#424242"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>Using your profile settings:</Text>
              <Text style={styles.profileValue}>
                {userProfile.isPrimaryResidence ? 'Primary Residence' : 'Not Primary Residence'}
                {userProfile.isFirstHomeBuyer && ' • First Home Buyer'}
                {userProfile.isConcessionCardHolder && ' • Concession Card'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleProfilePress}>
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={18}
                color="#424242"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[commonStyles.card, styles.bidCard]}>
          <Text style={styles.bidLabel}>Current Offer</Text>
          <View style={styles.bidInputContainer}>
            <Text style={[styles.dollarSign, { fontSize: getDynamicFontSize(currentBid) }]}>$</Text>
            <TextInput
              style={[styles.bidInput, { fontSize: getDynamicFontSize(currentBid) }]}
              value={currentBidText}
              onChangeText={handleBidTextChange}
              onBlur={handleBidBlur}
              keyboardType="numeric"
              selectTextOnFocus
              textAlign="center"
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
                    setBidIncrement(option);
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
          <Text style={commonStyles.label}>Loan Pre-Approval Amount ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter pre-approved loan amount"
            keyboardType="numeric"
            value={loanPreApproval}
            onChangeText={setLoanPreApproval}
            onBlur={() => Keyboard.dismiss()}
          />

          {viewMode === 'remaining' && (
            <>
              <Text style={commonStyles.label}>Your Savings ($)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter your total savings"
                keyboardType="numeric"
                value={savings}
                onChangeText={setSavings}
                onBlur={() => Keyboard.dismiss()}
              />
            </>
          )}
        </View>

        <View style={commonStyles.card}>
          <View style={styles.sectionHeader}>
            <Text style={commonStyles.subtitle}>Additional Costs</Text>
            <TouchableOpacity onPress={addCostItem} style={styles.addButton}>
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={24}
                color="#424242"
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
                  <View style={styles.dropdownMenu}>
                    {COST_OPTIONS.map((option, optIndex) => (
                      <React.Fragment key={optIndex}>
                      <TouchableOpacity
                        style={styles.dropdownMenuItem}
                        onPress={() => updateCostItemType(item.id, option)}
                      >
                        <Text style={styles.dropdownMenuItemText}>{option}</Text>
                      </TouchableOpacity>
                      </React.Fragment>
                    ))}
                  </View>
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

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Caveat Lodgement</Text>
            <Text style={styles.resultValue}>${formatMoney(caveatFee)}</Text>
          </View>

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
            <Text style={styles.resultLabel}>Total Costs</Text>
            <Text style={styles.resultValue}>${formatMoney(totalCosts)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.totalLabel}>Total Amount Required</Text>
            <Text style={styles.totalValue}>${formatMoney(totalRequired)}</Text>
          </View>

          {loanAmount > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Less: Loan Pre-Approval</Text>
              <Text style={[styles.resultValue, { color: colors.success }]}>-${formatMoney(loanAmount)}</Text>
            </View>
          )}
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
              <Text style={styles.pinnedSubtext}>
                (Total ${formatMoney(totalRequired)} - Loan ${formatMoney(loanAmount)})
              </Text>
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
              <Text style={styles.pinnedSubtext}>
                (Savings ${formatMoney(savingsAmount)} - Cash Needed ${formatMoney(cashNeeded)})
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
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  profileLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: 'CourierPrime_400Regular',
  },
  profileValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
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
    maxWidth: '80%',
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
    minWidth: 120,
    maxWidth: 220,
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
  costItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  costTypeContainer: {
    flex: 2,
    position: 'relative',
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
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
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
  pinnedSubtext: {
    fontSize: 11,
    color: '#616161',
    marginTop: 2,
    marginBottom: 10,
    fontFamily: 'CourierPrime_400Regular',
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
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
});
