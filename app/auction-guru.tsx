
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function AuctionGuruScreen() {
  const router = useRouter();
  const [currentBid, setCurrentBid] = useState(500000);
  const [bidIncrement, setBidIncrement] = useState(5000);
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [estimatedCosts, setEstimatedCosts] = useState(15000);

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

  const stampDuty = calculateStampDuty(currentBid, isFirstHomeBuyer);
  const totalCost = currentBid + stampDuty + estimatedCosts;

  const adjustBid = (amount: number) => {
    setCurrentBid(Math.max(0, currentBid + amount));
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
                color={colors.secondary}
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
                color={colors.success}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Adjust Bid Increment</Text>
            <Slider
              style={styles.slider}
              minimumValue={1000}
              maximumValue={50000}
              step={1000}
              value={bidIncrement}
              onValueChange={setBidIncrement}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>$1k</Text>
              <Text style={styles.sliderLabelText}>$50k</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.resultsCard]}>
          <Text style={styles.resultsTitle}>Real-Time Cost Breakdown</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Purchase Price</Text>
            <Text style={styles.resultValue}>${currentBid.toLocaleString()}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Stamp Duty</Text>
            <Text style={styles.resultValue}>${stampDuty.toFixed(2)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Other Costs (est.)</Text>
            <Text style={styles.resultValue}>${estimatedCosts.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount Required</Text>
            <Text style={styles.totalValue}>${totalCost.toLocaleString()}</Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Quick Bid Adjustments</Text>
          <View style={styles.quickButtons}>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => adjustBid(-10000)}
            >
              <Text style={styles.quickButtonText}>-$10k</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => adjustBid(-5000)}
            >
              <Text style={styles.quickButtonText}>-$5k</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => adjustBid(5000)}
            >
              <Text style={styles.quickButtonText}>+$5k</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => adjustBid(10000)}
            >
              <Text style={styles.quickButtonText}>+$10k</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.textSecondary}>
            * Use this calculator during an auction to see your true costs in real-time. 
            Adjust the bid increment to match the auctioneer&apos;s increments.
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
  sliderContainer: {
    width: '100%',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
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
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomPadding: {
    height: 20,
  },
});
