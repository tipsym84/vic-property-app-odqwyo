
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AgentInfo {
  code: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [agentCode, setAgentCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    loadAgentInfo();
  }, []);

  const loadAgentInfo = async () => {
    try {
      const savedAgent = await AsyncStorage.getItem('agentInfo');
      const hasPaid = await AsyncStorage.getItem('hasPaid');
      if (savedAgent) {
        setAgentInfo(JSON.parse(savedAgent));
        setIsUnlocked(true);
      } else if (hasPaid) {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.log('Error loading agent info:', error);
    }
  };

  const handleCodeSubmit = async () => {
    const mockAgents: { [key: string]: AgentInfo } = {
      'AGENT001': {
        code: 'AGENT001',
        name: 'Sarah Johnson',
        phone: '0412 345 678',
        email: 'sarah@realestate.com.au',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      },
      'AGENT002': {
        code: 'AGENT002',
        name: 'Michael Chen',
        phone: '0423 456 789',
        email: 'michael@realestate.com.au',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      },
    };

    const agent = mockAgents[agentCode.toUpperCase()];
    if (agent) {
      await AsyncStorage.setItem('agentInfo', JSON.stringify(agent));
      setAgentInfo(agent);
      setIsUnlocked(true);
      setShowCodeInput(false);
      setAgentCode('');
    } else {
      Alert.alert('Invalid Code', 'Invalid agent code. Please try again.');
    }
  };

  const handleFeaturePress = (route: string) => {
    if (!isUnlocked) {
      Alert.alert(
        'App Locked',
        'Please enter an agent code or purchase the app to access this feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>PropertyGuru</Text>
          <Text style={styles.slogan}>Real Estate Doesn&apos;t Have to be Overwhelming</Text>
        </View>

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
              Enter an agent code or purchase the app to unlock all features.
            </Text>
          </View>
        )}

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
          </View>
        )}

        {!agentInfo && !showCodeInput && (
          <TouchableOpacity 
            style={[commonStyles.card, styles.codePrompt]}
            onPress={() => setShowCodeInput(true)}
          >
            <IconSymbol 
              ios_icon_name="ticket" 
              android_material_icon_name="confirmation-number" 
              size={32} 
              color={colors.primary}
            />
            <Text style={styles.codePromptText}>Have an agent code?</Text>
            <Text style={styles.codePromptSubtext}>Tap here to enter it</Text>
          </TouchableOpacity>
        )}

        {showCodeInput && (
          <View style={commonStyles.card}>
            <Text style={commonStyles.subtitle}>Enter Agent Code</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter code (e.g., AGENT001)"
              value={agentCode}
              onChangeText={setAgentCode}
              autoCapitalize="characters"
            />
            <View style={styles.codeButtons}>
              <TouchableOpacity 
                style={[styles.codeButton, styles.cancelButton]}
                onPress={() => {
                  setShowCodeInput(false);
                  setAgentCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.codeButton, commonStyles.button]}
                onPress={handleCodeSubmit}
              >
                <Text style={commonStyles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard, !isUnlocked && styles.lockedCard]}
          onPress={() => handleFeaturePress('/auction-guru')}
        >
          <View style={styles.featureIcon}>
            <IconSymbol 
              ios_icon_name="hammer" 
              android_material_icon_name="gavel" 
              size={32} 
              color={colors.secondary}
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>AuctionGuru</Text>
            <Text style={styles.featureDescription}>
              Real-time bidding calculator to see your true costs
            </Text>
          </View>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron-right" 
            size={24} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard, !isUnlocked && styles.lockedCard]}
          onPress={() => handleFeaturePress('/(tabs)/calculators')}
        >
          <View style={styles.featureIcon}>
            <IconSymbol 
              ios_icon_name="calculator" 
              android_material_icon_name="calculate" 
              size={32} 
              color={colors.primary}
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Cost Calculators</Text>
            <Text style={styles.featureDescription}>
              Calculate land transfer fees, stamp duty, and all associated costs
            </Text>
          </View>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron-right" 
            size={24} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard, !isUnlocked && styles.lockedCard]}
          onPress={() => handleFeaturePress('/(tabs)/faq')}
        >
          <View style={styles.featureIcon}>
            <IconSymbol 
              ios_icon_name="questionmark.circle" 
              android_material_icon_name="help" 
              size={32} 
              color={colors.accent}
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Information & FAQ</Text>
            <Text style={styles.featureDescription}>
              Everything you need to know about property transactions
            </Text>
          </View>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron-right" 
            size={24} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>

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
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    lineHeight: 18,
  },
  codePrompt: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  codePromptText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  codePromptSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  codeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  codeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedCard: {
    opacity: 0.5,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});
