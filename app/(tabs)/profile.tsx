
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Switch } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface AgentInfo {
  code: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [isPrimaryResidence, setIsPrimaryResidence] = useState(true);
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [isConcessionCardHolder, setIsConcessionCardHolder] = useState(false);

  useEffect(() => {
    loadAgentInfo();
    loadUserProfile();
  }, []);

  const loadAgentInfo = async () => {
    try {
      const savedAgent = await AsyncStorage.getItem('agentInfo');
      const hasPaid = await AsyncStorage.getItem('hasPaid');
      const storedAgentCode = await AsyncStorage.getItem('agentCode');
      
      if (savedAgent) {
        setAgentInfo(JSON.parse(savedAgent));
        setIsUnlocked(true);
      } else if (hasPaid || storedAgentCode) {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.log('Error loading agent info:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const primaryResidence = await AsyncStorage.getItem('isPrimaryResidence');
      const firstHomeBuyer = await AsyncStorage.getItem('isFirstHomeBuyer');
      const concessionCard = await AsyncStorage.getItem('isConcessionCardHolder');
      
      if (primaryResidence !== null) setIsPrimaryResidence(primaryResidence === 'true');
      if (firstHomeBuyer !== null) setIsFirstHomeBuyer(firstHomeBuyer === 'true');
      if (concessionCard !== null) setIsConcessionCardHolder(concessionCard === 'true');
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };

  const handlePrimaryResidenceToggle = async (value: boolean) => {
    setIsPrimaryResidence(value);
    if (!value) {
      setIsFirstHomeBuyer(false);
      setIsConcessionCardHolder(false);
      await AsyncStorage.setItem('isFirstHomeBuyer', 'false');
      await AsyncStorage.setItem('isConcessionCardHolder', 'false');
    }
    await AsyncStorage.setItem('isPrimaryResidence', value.toString());
  };

  const handleFirstHomeBuyerToggle = async (value: boolean) => {
    setIsFirstHomeBuyer(value);
    if (value) {
      setIsConcessionCardHolder(false);
      await AsyncStorage.setItem('isConcessionCardHolder', 'false');
    }
    await AsyncStorage.setItem('isFirstHomeBuyer', value.toString());
  };

  const handleConcessionCardToggle = async (value: boolean) => {
    setIsConcessionCardHolder(value);
    await AsyncStorage.setItem('isConcessionCardHolder', value.toString());
  };

  const clearAgentData = async () => {
    Alert.alert(
      'Clear Agent Details',
      'Are you sure you want to clear the agent details? This will lock the app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['agentCode', 'agentInfo', 'hasPaid']);
              
              setAgentInfo(null);
              setIsUnlocked(false);
              
              console.log('Agent details cleared successfully');
              Alert.alert('Success', 'Agent details cleared. The app is now locked.');
              
              router.push('/(tabs)/(home)/');
            } catch (error) {
              console.log('Error clearing agent data:', error);
              Alert.alert('Error', 'Failed to clear agent details. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {agentInfo && (
          <View style={[commonStyles.card, styles.agentCard]}>
            <View style={styles.agentHeader}>
              <Image 
                source={{ uri: agentInfo.photo }} 
                style={styles.agentPhoto}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agentInfo.name}</Text>
                <Text style={styles.agentContact}>{agentInfo.phone}</Text>
                <Text style={styles.agentContact}>{agentInfo.email}</Text>
              </View>
            </View>
            <View style={styles.agentDisclaimer}>
              <IconSymbol 
                ios_icon_name="info.circle" 
                android_material_icon_name="info" 
                size={16} 
                color={colors.textSecondary}
              />
              <Text style={styles.disclaimerText}>
                This agent provided you with free access to PropertyGuru. 
                They do not endorse this app.
              </Text>
            </View>
            <TouchableOpacity 
              style={[commonStyles.button, styles.clearButton]}
              onPress={clearAgentData}
            >
              <Text style={commonStyles.buttonText}>Clear Agent Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {!agentInfo && isUnlocked && (
          <View style={commonStyles.card}>
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check-circle" 
              size={48} 
              color={colors.success}
            />
            <Text style={styles.statusTitle}>App Unlocked</Text>
            <Text style={styles.statusText}>
              You have access to all features.
            </Text>
          </View>
        )}

        {!isUnlocked && (
          <View style={[commonStyles.card, styles.lockCard]}>
            <IconSymbol 
              ios_icon_name="lock.fill" 
              android_material_icon_name="lock" 
              size={48} 
              color={colors.secondary}
            />
            <Text style={styles.lockTitle}>App Locked</Text>
            <Text style={styles.lockText}>
              Enter an agent code on the Home tab to unlock all features.
            </Text>
          </View>
        )}

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Property Purchase Settings</Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
            These settings will be used to calculate stamp duty accurately across all calculators.
          </Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelContainer}>
              <Text style={styles.toggleLabel}>Primary Residence</Text>
              <Text style={styles.toggleHint}>
                Is this property your primary place of residence?
              </Text>
            </View>
            <Switch
              value={isPrimaryResidence}
              onValueChange={handlePrimaryResidenceToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <View style={[styles.toggleRow, !isPrimaryResidence && styles.disabledRow]}>
            <View style={styles.toggleLabelContainer}>
              <Text style={[styles.toggleLabel, !isPrimaryResidence && styles.disabledText]}>
                First Home Owner
              </Text>
              <Text style={[styles.toggleHint, !isPrimaryResidence && styles.disabledText]}>
                Is this your first home purchase?
              </Text>
              {!isPrimaryResidence && (
                <Text style={styles.disabledNote}>
                  (Only available for primary residence)
                </Text>
              )}
            </View>
            <Switch
              value={isFirstHomeBuyer}
              onValueChange={handleFirstHomeBuyerToggle}
              disabled={!isPrimaryResidence}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <View style={[styles.toggleRow, (!isPrimaryResidence || isFirstHomeBuyer) && styles.disabledRow]}>
            <View style={styles.toggleLabelContainer}>
              <Text style={[styles.toggleLabel, (!isPrimaryResidence || isFirstHomeBuyer) && styles.disabledText]}>
                Concession Card Holder
              </Text>
              <Text style={[styles.toggleHint, (!isPrimaryResidence || isFirstHomeBuyer) && styles.disabledText]}>
                Do you hold an eligible concession card?
              </Text>
              {!isPrimaryResidence && (
                <Text style={styles.disabledNote}>
                  (Only available for primary residence)
                </Text>
              )}
              {isFirstHomeBuyer && (
                <Text style={styles.disabledNote}>
                  (Not available for first home buyers)
                </Text>
              )}
            </View>
            <Switch
              value={isConcessionCardHolder}
              onValueChange={handleConcessionCardToggle}
              disabled={!isPrimaryResidence || isFirstHomeBuyer}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>About PropertyGuru</Text>
          <Text style={commonStyles.text}>
            PropertyGuru is your one-stop shop for managing and planning property transactions 
            in Victoria, Australia.
          </Text>
          <Text style={[commonStyles.text, { marginTop: 12 }]}>
            Our mission is to demystify what&apos;s involved with property transactions and make 
            real estate less overwhelming.
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Test Agent Codes</Text>
          <Text style={commonStyles.text}>
            For testing purposes, you can use these codes:
          </Text>
          <View style={styles.codeList}>
            <Text style={styles.codeItem}>• AGENT001 - Sarah Johnson</Text>
            <Text style={styles.codeItem}>• AGENT002 - Michael Chen</Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  agentCard: {
    backgroundColor: colors.highlight,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  agentContact: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  agentDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    lineHeight: 18,
  },
  clearButton: {
    marginTop: 12,
    backgroundColor: colors.secondary,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  lockCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.highlight,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  lockText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disabledRow: {
    opacity: 0.5,
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  toggleHint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  disabledNote: {
    fontSize: 11,
    color: colors.secondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  codeList: {
    marginTop: 12,
  },
  codeItem: {
    fontSize: 14,
    color: colors.text,
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  bottomPadding: {
    height: 20,
  },
});
