
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPrimaryResidence, setIsPrimaryResidence] = useState(true);
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [isConcessionCardHolder, setIsConcessionCardHolder] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const primaryResidence = await AsyncStorage.getItem('isPrimaryResidence');
      const firstHomeBuyer = await AsyncStorage.getItem('isFirstHomeBuyer');
      const concessionCard = await AsyncStorage.getItem('isConcessionCardHolder');
      
      if (primaryResidence !== null) setIsPrimaryResidence(primaryResidence === 'true');
      if (firstHomeBuyer !== null) setIsFirstHomeBuyer(firstHomeBuyer === 'true');
      if (concessionCard !== null) setIsConcessionCardHolder(concessionCard === 'true');
      
      console.log('Profile loaded:', { primaryResidence, firstHomeBuyer, concessionCard });
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };

  const handlePrimaryResidenceToggle = async (value: boolean) => {
    setIsPrimaryResidence(value);
    await AsyncStorage.setItem('isPrimaryResidence', value.toString());
    console.log('Primary residence updated:', value);
  };

  const handleFirstHomeBuyerToggle = async (value: boolean) => {
    setIsFirstHomeBuyer(value);
    await AsyncStorage.setItem('isFirstHomeBuyer', value.toString());
    console.log('First home buyer updated:', value);
  };

  const handleConcessionCardToggle = async (value: boolean) => {
    setIsConcessionCardHolder(value);
    await AsyncStorage.setItem('isConcessionCardHolder', value.toString());
    console.log('Concession card holder updated:', value);
  };

  const showBackButton = params.from === 'buy' || params.from === 'auction-guru';

  return (
    <View style={styles.container}>
      {showBackButton && (
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!showBackButton && (
          <View style={styles.header}>
            <Text style={styles.appName}>Profile Settings</Text>
          </View>
        )}

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Stamp Duty Preferences</Text>
          <Text style={commonStyles.textSecondary}>
            These settings affect your stamp duty calculations in the Buy calculator.
          </Text>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Primary Residence</Text>
              <Text style={styles.settingDescription}>
                The property will be your primary place of residence
              </Text>
            </View>
            <Switch
              value={isPrimaryResidence}
              onValueChange={handlePrimaryResidenceToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>First Home Buyer</Text>
              <Text style={styles.settingDescription}>
                You are eligible for first home buyer concessions
              </Text>
            </View>
            <Switch
              value={isFirstHomeBuyer}
              onValueChange={handleFirstHomeBuyerToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Concession Card Holder</Text>
              <Text style={styles.settingDescription}>
                You hold an eligible concession card
              </Text>
            </View>
            <Switch
              value={isConcessionCardHolder}
              onValueChange={handleConcessionCardToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.textSecondary}>
            * These settings are saved locally on your device and will be applied to all stamp duty calculations.
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
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
    paddingTop: 44,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'CourierPrime_700Bold',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'CourierPrime_700Bold',
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'CourierPrime_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
