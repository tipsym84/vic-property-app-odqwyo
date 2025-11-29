
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [agentInfo, setAgentInfo] = useState<any>(null);

  useEffect(() => {
    loadAgentInfo();
  }, []);

  const loadAgentInfo = async () => {
    try {
      const savedAgent = await AsyncStorage.getItem('agentInfo');
      if (savedAgent) {
        setAgentInfo(JSON.parse(savedAgent));
      }
    } catch (error) {
      console.log('Error loading agent info:', error);
    }
  };

  const clearAgentCode = async () => {
    Alert.alert(
      'Clear Agent Code',
      'Are you sure you want to remove the agent information? This will lock the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('agentInfo');
              setAgentInfo(null);
              Alert.alert('Success', 'Agent information cleared. The app is now locked.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(tabs)/(home)/'),
                },
              ]);
            } catch (error) {
              console.log('Error clearing agent info:', error);
              Alert.alert('Error', 'Failed to clear agent information.');
            }
          },
        },
      ]
    );
  };

  const contactConveyancer = () => {
    Alert.alert(
      'Contact Conveyancer',
      'Would you like to get in touch with our conveyancing services?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL('tel:1300123456'),
        },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:info@propertyguru.com.au'),
        },
      ]
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

        <View style={commonStyles.card}>
          <View style={styles.appInfo}>
            <View style={styles.appIcon}>
              <IconSymbol
                ios_icon_name="house.fill"
                android_material_icon_name="home"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text style={styles.appName}>PropertyGuru</Text>
            <Text style={styles.appSlogan}>Real Estate Doesn&apos;t Have to be Overwhelming</Text>
          </View>
        </View>

        {agentInfo && (
          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <Text style={commonStyles.subtitle}>Your Agent</Text>
              <TouchableOpacity onPress={clearAgentCode}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agentInfo.name}</Text>
              <Text style={styles.agentContact}>{agentInfo.phone}</Text>
              <Text style={styles.agentContact}>{agentInfo.email}</Text>
            </View>
          </View>
        )}

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>About PropertyGuru</Text>
          <Text style={commonStyles.text}>
            PropertyGuru is your comprehensive guide to property transactions in Victoria, Australia. 
            We provide accurate calculators and information to help you understand all costs involved 
            in buying or selling property.
          </Text>
        </View>

        <TouchableOpacity 
          style={commonStyles.card}
          onPress={contactConveyancer}
        >
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Contact Our Conveyancing Services</Text>
              <Text style={styles.menuDescription}>Get professional help with your property transaction</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Accurate cost calculators</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Real-time auction bidding calculator</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Comprehensive FAQ section</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Victorian-specific information</Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Disclaimer</Text>
          <Text style={commonStyles.textSecondary}>
            All calculations provided by PropertyGuru are estimates only and should not be relied upon 
            as exact figures. Property transaction costs can vary based on individual circumstances. 
            Always consult with a qualified conveyancer or solicitor for accurate advice specific to 
            your situation.
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 PropertyGuru. All rights reserved.</Text>
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  appSlogan: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  agentInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    marginBottom: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  featureList: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 12,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
