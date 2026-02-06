
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useProperty } from '@/contexts/PropertyContext';

export default function HomeScreen() {
  const router = useRouter();
  const { resetAllData } = useProperty();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleFeaturePress = (route: string) => {
    console.log('Navigating to:', route);
    router.push(route as any);
  };

  const handleResetPress = () => {
    console.log('User tapped Reset button');
    setShowResetModal(true);
  };

  const handleConfirmReset = async () => {
    console.log('User confirmed reset - deleting all data');
    await resetAllData();
    setShowResetModal(false);
  };

  const handleCancelReset = () => {
    console.log('User cancelled reset');
    setShowResetModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>VicPropertyGuru</Text>
          <Text style={styles.subheading}>Get the figures that matter for your……</Text>
        </View>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard]}
          onPress={() => handleFeaturePress('/buy')}
        >
          <View style={[styles.featureIcon, { backgroundColor: '#f5f5f5' }]}>
            <IconSymbol 
              ios_icon_name="gavel.fill" 
              android_material_icon_name="store" 
              size={32} 
              color="#424242"
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Purchase</Text>
          </View>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron-right" 
            size={24} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard]}
          onPress={() => handleFeaturePress('/sell')}
        >
          <View style={[styles.featureIcon, { backgroundColor: '#f5f5f5' }]}>
            <IconSymbol 
              ios_icon_name="dollarsign.circle" 
              android_material_icon_name="attach-money" 
              size={32} 
              color="#424242"
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Sale</Text>
          </View>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron-right" 
            size={24} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[commonStyles.card, styles.featureCard, styles.resetCard]}
          onPress={handleResetPress}
        >
          <View style={[styles.featureIcon, { backgroundColor: '#ffebee' }]}>
            <IconSymbol 
              ios_icon_name="arrow.counterclockwise" 
              android_material_icon_name="refresh" 
              size={32} 
              color="#f44336"
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, styles.resetTitle]}>Reset</Text>
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

      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelReset}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Warning</Text>
            <Text style={styles.modalMessage}>
              This will delete all of your data in this app. Continue?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCancelReset}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmReset}
              >
                <Text style={styles.modalButtonTextConfirm}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontFamily: 'CourierPrime_700Bold',
  },
  subheading: {
    fontSize: 18,
    color: colors.textSecondary,
    fontFamily: 'CourierPrime_400Regular',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
  },
  resetCard: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  resetTitle: {
    color: '#f44336',
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f44336',
    marginBottom: 16,
    fontFamily: 'CourierPrime_700Bold',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    fontFamily: 'CourierPrime_400Regular',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
  modalButtonConfirm: {
    backgroundColor: '#f44336',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'CourierPrime_700Bold',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'CourierPrime_700Bold',
  },
});
