
import { Alert } from 'react-native';

export interface UserProfile {
  isPrimaryResidence: boolean;
  isFirstHomeBuyer: boolean;
  isConcessionCardHolder: boolean;
}

// Section 28 of the Duties Act - Standard stamp duty calculation
export const calculateSection28StampDuty = (dutiableValue: number): number => {
  if (dutiableValue <= 25000) {
    return dutiableValue * 0.014;
  } else if (dutiableValue <= 130000) {
    return 350 + (dutiableValue - 25000) * 0.024;
  } else if (dutiableValue <= 960000) {
    return 2870 + (dutiableValue - 130000) * 0.06;
  } else {
    return 52670 + (dutiableValue - 960000) * 0.055;
  }
};

// Section 57J - Primary residence (not first home buyer, not concession)
export const calculateSection57JStampDuty = (dutiableValue: number): number => {
  if (dutiableValue <= 25000) {
    return dutiableValue * 0.014;
  } else if (dutiableValue <= 130000) {
    return 350 + (dutiableValue - 25000) * 0.024;
  } else if (dutiableValue <= 440000) {
    return 2870 + (dutiableValue - 130000) * 0.05;
  } else if (dutiableValue <= 550000) {
    return 18370 + (dutiableValue - 440000) * 0.06;
  } else {
    // For values over $550,000, use standard Section 28 rates
    return calculateSection28StampDuty(dutiableValue);
  }
};

// Section 57JA - First home buyer concession
export const calculateSection57JAStampDuty = (dutiableValue: number): number => {
  if (dutiableValue <= 600000) {
    return 0;
  } else if (dutiableValue <= 750000) {
    const A = dutiableValue;
    const B = calculateSection28StampDuty(dutiableValue);
    return ((A - 600000) / 150000) * B;
  } else {
    // For values over $750,000, use standard Section 28 rates
    return calculateSection28StampDuty(dutiableValue);
  }
};

// Section 60 - Concession card holder
export const calculateSection60StampDuty = (dutiableValue: number, showAlert: () => void): number => {
  // Show alert about contract date
  showAlert();
  
  if (dutiableValue <= 600000) {
    return 0;
  } else if (dutiableValue <= 750000) {
    const A = dutiableValue;
    const B = calculateSection28StampDuty(dutiableValue);
    return ((A - 600000) / 150000) * B;
  } else {
    // For values over $750,000, use standard Section 28 rates
    return calculateSection28StampDuty(dutiableValue);
  }
};

// Main stamp duty calculation function
export const calculateStampDuty = (
  purchasePrice: number,
  userProfile: UserProfile,
  showConcessionAlert?: () => void
): number => {
  const { isPrimaryResidence, isFirstHomeBuyer, isConcessionCardHolder } = userProfile;

  // If not primary residence, use standard Section 28 rates
  if (!isPrimaryResidence) {
    return calculateSection28StampDuty(purchasePrice);
  }

  // Primary residence = yes, First home buyer = yes
  if (isPrimaryResidence && isFirstHomeBuyer) {
    return calculateSection57JAStampDuty(purchasePrice);
  }

  // Primary residence = yes, First home buyer = no, Concession card holder = yes
  if (isPrimaryResidence && !isFirstHomeBuyer && isConcessionCardHolder) {
    if (showConcessionAlert) {
      return calculateSection60StampDuty(purchasePrice, showConcessionAlert);
    }
    return calculateSection60StampDuty(purchasePrice, () => {});
  }

  // Primary residence = yes, First home buyer = no, Concession card holder = no
  if (isPrimaryResidence && !isFirstHomeBuyer && !isConcessionCardHolder) {
    return calculateSection57JStampDuty(purchasePrice);
  }

  // Default to standard rates
  return calculateSection28StampDuty(purchasePrice);
};

export const calculateLandTransferFee = (price: number): number => {
  if (price <= 25000) return 110;
  if (price <= 130000) return 110 + ((price - 25000) / 1000) * 2.46;
  if (price <= 960000) return 368.30 + ((price - 130000) / 1000) * 5.06;
  return 4568.10 + ((price - 960000) / 1000) * 5.06;
};
