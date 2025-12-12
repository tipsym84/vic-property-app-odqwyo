
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStampDuty, calculateLandTransferFee, UserProfile } from '@/utils/stampDutyCalculations';

export default function BuyerCalculatorScreen() {
  const router = useRouter();
  const [purchasePrice, setPurchasePrice] = useState('');
  const [legalFees, setLegalFees] = useState('1500');
  const [mortgageAmount, setMortgageAmount] = useState('');
  const [concessionAlertShown, setConcessionAlertShown] = useState(false);
  
  // User profile from AsyncStorage
  const [userProfile, setUserProfile] = useState<UserProfile>({
    isPrimaryResidence: true,
    isFirstHomeBuyer: false,
    isConcessionCardHolder: false,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const primaryResidence = await AsyncStorage.getItem('isPrimaryResidence');
      const firstHomeBuyer = await AsyncStorage.getItem('isFirstHomeBuyer');
      const concessionCard = await AsyncStorage.getItem('isConcessionCardHolder');
      
      setUserProfile({
        isPrimaryResidence: primaryResidence === 'true',
        isFirstHomeBuyer: firstHomeBuyer === 'true',
        isConcessionCardHolder: concessionCard === 'true',
      });
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

  const price = parseFloat(purchasePrice) || 0;
  const mortgage = parseFloat(mortgageAmount) || 0;
  const legal = parseFloat(legalFees) || 0;

  const landTransferFee = calculateLandTransferFee(price);
  const stampDuty = calculateStampDuty(price, userProfile, showConcessionAlert);
  const mortgageReg = mortgage > 0 ? 119.90 : 0;
  const caveatFee = 119.90;

  const totalCosts = landTransferFee + stampDuty + mortgageReg + caveatFee + legal;

  const getStampDutyDescription = () => {
    const { isPrimaryResidence, isFirstHomeBuyer, isConcessionCardHolder } = userProfile;
    
    if (!isPrimaryResidence) {
      return 'Standard rates (Section 28)';
    }
    if (isFirstHomeBuyer) {
      return 'First home buyer concession (Section 57JA)';
    }
    if (isConcessionCardHolder) {
      return 'Concession card holder (Section 60)';
    }
    return 'Primary residence rates (Section 57J)';
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
        <Text style={styles.headerTitle}>Buyer Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={commonStyles.card}>
          <View style={styles.profileBanner}>
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="account-circle"
              size={24}
              color={colors.primary}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>Using your profile settings:</Text>
              <Text style={styles.profileValue}>
                {userProfile.isPrimaryResidence ? 'Primary Residence' : 'Not Primary Residence'}
                {userProfile.isFirstHomeBuyer && ' • First Home Buyer'}
                {userProfile.isConcessionCardHolder && ' • Concession Card'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.label}>Purchase Price ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter purchase price"
            keyboardType="numeric"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
          />

          <Text style={commonStyles.label}>Mortgage Amount ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter mortgage amount (optional)"
            keyboardType="numeric"
            value={mortgageAmount}
            onChangeText={setMortgageAmount}
          />

          <Text style={commonStyles.label}>Legal Fees ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter legal fees"
            keyboardType="numeric"
            value={legalFees}
            onChangeText={setLegalFees}
          />
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Cost Breakdown</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Land Transfer Fee</Text>
            <Text style={styles.resultValue}>${landTransferFee.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <View style={styles.resultLabelContainer}>
              <Text style={styles.resultLabel}>Stamp Duty</Text>
              <Text style={styles.resultSubLabel}>{getStampDutyDescription()}</Text>
            </View>
            <Text style={styles.resultValue}>${stampDuty.toFixed(2)}</Text>
          </View>

          {mortgage > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Mortgage Registration</Text>
              <Text style={styles.resultValue}>${mortgageReg.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Caveat Lodgement</Text>
            <Text style={styles.resultValue}>${caveatFee.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Legal Fees</Text>
            <Text style={styles.resultValue}>${legal.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Costs</Text>
            <Text style={styles.totalValue}>${totalCosts.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount Required</Text>
            <Text style={styles.totalValue}>${(price + totalCosts).toFixed(2)}</Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Stamp Duty Information</Text>
          {userProfile.isFirstHomeBuyer && (
            <Text style={commonStyles.textSecondary}>
              First Home Buyer Concession (Section 57JA):{'\n'}
              - Properties up to $600,000: No stamp duty{'\n'}
              - Properties $600,001 to $750,000: Reduced stamp duty{'\n'}
              - Properties over $750,000: Standard rates apply
            </Text>
          )}
          {userProfile.isConcessionCardHolder && !userProfile.isFirstHomeBuyer && (
            <Text style={commonStyles.textSecondary}>
              Concession Card Holder (Section 60):{'\n'}
              - Properties up to $600,000: No stamp duty{'\n'}
              - Properties $600,001 to $750,000: Reduced stamp duty{'\n'}
              - Properties over $750,000: Standard rates apply{'\n\n'}
              Note: Applies to contracts signed on or after 1 July 2023
            </Text>
          )}
          {!userProfile.isFirstHomeBuyer && !userProfile.isConcessionCardHolder && userProfile.isPrimaryResidence && (
            <Text style={commonStyles.textSecondary}>
              Primary Residence (Section 57J):{'\n'}
              - Reduced rates apply for primary residences up to $550,000{'\n'}
              - Standard rates apply for properties over $550,000
            </Text>
          )}
          {!userProfile.isPrimaryResidence && (
            <Text style={commonStyles.textSecondary}>
              Standard Stamp Duty (Section 28):{'\n'}
              - Standard rates apply for non-primary residences
            </Text>
          )}
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
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  resultLabelContainer: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.text,
  },
  resultSubLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
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
