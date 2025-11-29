
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface CostItem {
  id: string;
  name: string;
  amount: string;
}

export default function AuctionGuruScreen() {
  const router = useRouter();
  const [currentBid, setCurrentBid] = useState(500000);
  const [bidIncrement, setBidIncrement] = useState(5000);
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [loanPreApproval, setLoanPreApproval] = useState('');
  const [savings, setSavings] = useState('');
  const [viewMode, setViewMode] = useState<'total' | 'cash' | 'remaining'>('cash');
  
  const [costItems, setCostItems] = useState<CostItem[]>([
    { id: '1', name: 'Legal Fees', amount: '1500' },
    { id: '2', name: 'Building Inspection', amount: '500' },
    { id: '3', name: 'Pest Inspection', amount: '300' },
  ]);

  const calculateStampDuty = (price: number, firstHome: boolean): number => {
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

    return duty;
  };

  const calculateLandTransferFee = (price: number): number => {
    if (price <= 25000) return 110;
    if (price <= 130000) return 110 + ((price - 25000) / 1000) * 2.46;
    if (price <= 960000) return 368.30 + ((price - 130000) / 1000) * 5.06;
    return 4568.10 + ((price - 960000) / 1000) * 5.06;
  };

  const stampDuty = calculateStampDuty(currentBid, isFirstHomeBuyer);
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
    setCurrentBid(Math.max(0, currentBid + amount));
  };

  const addCostItem = () => {
    const newId = (costItems.length + 1).toString();
    setCostItems([...costItems, { id: newId, name: '', amount: '' }]);
  };

  const updateCostItem = (id: string, field: 'name' | 'amount', value: string) => {
    setCostItems(costItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeCostItem = (id: string) => {
    if (costItems.length > 1) {
      setCostItems(costItems.filter(item => item.id !== id));
    }
  };

  const incrementOptions = [500, 1000, 2000, 5000, 10000, 20000, 50000];
  const currentIncrementIndex = incrementOptions.indexOf(bidIncrement);

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
        <Text style={styles.headerTitle}>AuctionGuru</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[commonStyles.card, styles.bidCard]}>
          <Text style={styles.bidLabel}>Current Bid</Text>
          <Text style={styles.bidAmount}>${currentBid.toLocaleString()}</Text>
          
          <View style={styles.bidControls}>
            <TouchableOpacity 
              style={styles.bidButton}
              onPress={() => adjustBid(-bidIncrement)}
            >
              <IconSymbol
                ios_icon_name="minus.circle.fill"
                android_material_icon_name="remove-circle"
                size={48}
                color="#ffffff"
              />
            </TouchableOpacity>

            <View style={styles.incrementContainer}>
              <Text style={styles.incrementLabel}>Increment</Text>
              <Text style={styles.incrementValue}>${bidIncrement.toLocaleString()}</Text>
            </View>

            <TouchableOpacity 
              style={styles.bidButton}
              onPress={() => adjustBid(bidIncrement)}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={48}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.incrementSelector}>
            <Text style={styles.incrementSelectorLabel}>Select Bid Increment:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.incrementOptions}
            >
              {incrementOptions.map((option, index) => (
                <React.Fragment key={index}>
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.incrementOption,
                    bidIncrement === option && styles.incrementOptionActive
                  ]}
                  onPress={() => setBidIncrement(option)}
                >
                  <Text style={[
                    styles.incrementOptionText,
                    bidIncrement === option && styles.incrementOptionTextActive
                  ]}>
                    ${(option / 1000).toFixed(option < 1000 ? 0 : 0)}k
                  </Text>
                </TouchableOpacity>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.switchRow}>
            <Text style={commonStyles.label}>First Home Buyer</Text>
            <Switch
              value={isFirstHomeBuyer}
              onValueChange={setIsFirstHomeBuyer}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <Text style={commonStyles.label}>Loan Pre-Approval Amount ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter pre-approved loan amount"
            keyboardType="numeric"
            value={loanPreApproval}
            onChangeText={setLoanPreApproval}
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
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {costItems.map((item, index) => (
            <React.Fragment key={index}>
            <View key={item.id} style={styles.costItemRow}>
              <TextInput
                style={[commonStyles.input, styles.costNameInput]}
                placeholder="Cost name"
                value={item.name}
                onChangeText={(value) => updateCostItem(item.id, 'name', value)}
              />
              <TextInput
                style={[commonStyles.input, styles.costAmountInput]}
                placeholder="Amount"
                keyboardType="numeric"
                value={item.amount}
                onChangeText={(value) => updateCostItem(item.id, 'amount', value)}
              />
              {costItems.length > 1 && (
                <TouchableOpacity onPress={() => removeCostItem(item.id)}>
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={24}
                    color={colors.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            </React.Fragment>
          ))}
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Cost Breakdown</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Purchase Price</Text>
            <Text style={styles.resultValue}>${currentBid.toLocaleString()}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Stamp Duty</Text>
            <Text style={styles.resultValue}>${stampDuty.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Land Transfer Fee</Text>
            <Text style={styles.resultValue}>${landTransferFee.toFixed(2)}</Text>
          </View>

          {mortgageReg > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Mortgage Registration</Text>
              <Text style={styles.resultValue}>${mortgageReg.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Caveat Lodgement</Text>
            <Text style={styles.resultValue}>${caveatFee.toFixed(2)}</Text>
          </View>

          {costItems.map((item, index) => (
            <React.Fragment key={index}>
            {item.name && parseFloat(item.amount) > 0 && (
              <View key={item.id} style={styles.resultRow}>
                <Text style={styles.resultLabel}>{item.name}</Text>
                <Text style={styles.resultValue}>${parseFloat(item.amount).toFixed(2)}</Text>
              </View>
            )}
            </React.Fragment>
          ))}

          <View style={styles.divider} />

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Costs</Text>
            <Text style={styles.resultValue}>${totalCosts.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.totalLabel}>Total Amount Required</Text>
            <Text style={styles.totalValue}>${totalRequired.toLocaleString()}</Text>
          </View>

          {loanAmount > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Less: Loan Pre-Approval</Text>
              <Text style={[styles.resultValue, { color: colors.success }]}>-${loanAmount.toLocaleString()}</Text>
            </View>
          )}
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>View Mode</Text>
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

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.pinnedFooter}>
        <View style={styles.pinnedContent}>
          {viewMode === 'total' && (
            <>
              <Text style={styles.pinnedLabel}>Total Amount Required</Text>
              <Text style={styles.pinnedValue}>${totalRequired.toLocaleString()}</Text>
            </>
          )}
          {viewMode === 'cash' && (
            <>
              <Text style={styles.pinnedLabel}>Cash Needed</Text>
              <Text style={styles.pinnedValue}>${cashNeeded.toLocaleString()}</Text>
              <Text style={styles.pinnedSubtext}>
                (Total ${totalRequired.toLocaleString()} - Loan ${loanAmount.toLocaleString()})
              </Text>
            </>
          )}
          {viewMode === 'remaining' && (
            <>
              <Text style={styles.pinnedLabel}>Savings Remaining</Text>
              <Text style={[
                styles.pinnedValue,
                { color: savingsRemaining >= 0 ? colors.success : colors.secondary }
              ]}>
                ${savingsRemaining.toLocaleString()}
              </Text>
              <Text style={styles.pinnedSubtext}>
                (Savings ${savingsAmount.toLocaleString()} - Cash Needed ${cashNeeded.toLocaleString()})
              </Text>
            </>
          )}
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
    paddingBottom: 200,
  },
  bidCard: {
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  bidAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 24,
  },
  bidControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  bidButton: {
    padding: 8,
  },
  incrementContainer: {
    alignItems: 'center',
  },
  incrementLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  incrementValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  incrementSelector: {
    width: '100%',
    marginTop: 8,
  },
  incrementSelectorLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
  },
  incrementOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  incrementOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 60,
    alignItems: 'center',
  },
  incrementOptionActive: {
    backgroundColor: '#ffffff',
  },
  incrementOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  incrementOptionTextActive: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  costNameInput: {
    flex: 2,
    marginVertical: 0,
  },
  costAmountInput: {
    flex: 1,
    marginVertical: 0,
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
  viewModeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  viewModeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  viewModeButtonTextActive: {
    color: '#ffffff',
  },
  pinnedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  pinnedValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  pinnedSubtext: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
});
