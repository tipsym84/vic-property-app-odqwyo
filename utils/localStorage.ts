
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fixed keys for Buy screen numeric inputs
export const BUY_KEYS = {
  CURRENT_OFFER: 'buy_currentOffer',
  BID_INCREMENT: 'buy_bidIncrement',
  CUSTOM_INCREMENT: 'buy_customIncrement',
  LOAN_AMOUNT: 'buy_loanAmount_',  // Append loan ID
  SAVINGS_AMOUNT: 'buy_savingsAmount_',  // Append savings ID
  COST_AMOUNT: 'buy_costAmount_',  // Append cost ID
  PARTIAL_REPAYMENT: 'buy_partialRepayment',
  // Toggle keys
  PRIMARY_RESIDENCE_TOGGLE: 'buy_primaryResidenceToggle',
  FIRST_HOME_OWNER_TOGGLE: 'buy_firstHomeOwnerToggle',
  CONCESSION_CARD_TOGGLE: 'buy_concessionCardToggle',
};

// Fixed keys for Sell screen numeric inputs
export const SELL_KEYS = {
  SALE_PRICE: 'sell_salePrice',
  PRICE_INCREMENT: 'sell_priceIncrement',
  CUSTOM_INCREMENT: 'sell_customIncrement',
  ADVERTISING_COSTS: 'sell_advertisingCosts',
  LEGAL_FEES: 'sell_legalFees',
  DEBT_AMOUNT: 'sell_debtAmount_',  // Append debt ID
  PARTIAL_REPAYMENT: 'sell_partialRepayment',
  COMMISSION_FROM: 'sell_commissionFrom_',  // Append tier ID
  COMMISSION_TO: 'sell_commissionTo_',  // Append tier ID
  COMMISSION_RATE: 'sell_commissionRate_',  // Append tier ID
  // Toggle keys
  MORTGAGE_REPAID_TOGGLE: 'sell_mortgageRepaidToggle',
  MORTGAGE_REPAID_FULL_TOGGLE: 'sell_mortgageRepaidFullToggle',
  USE_SALE_FUNDS_TOGGLE: 'sell_useSaleFundsToggle',
};

/**
 * Save a numeric value to localStorage with a fixed key
 * CRITICAL: Only saves if key is a valid, non-null string
 * @param key - Fixed key for the value (must not be null or undefined)
 * @param value - Numeric value to save (as string)
 */
export const saveNumericValue = async (key: string | null | undefined, value: string): Promise<void> => {
  // CRITICAL: Do not attempt to write to localStorage if key is null or undefined
  if (!key || key === null || key === undefined) {
    console.warn('saveNumericValue: Attempted to save with null/undefined key. Skipping save operation.');
    return;
  }
  
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`Saved to localStorage: ${key} = ${value}`);
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

/**
 * Load a numeric value from localStorage
 * CRITICAL: Only loads if key is a valid, non-null string
 * @param key - Fixed key for the value (must not be null or undefined)
 * @returns The stored value or null if not found
 */
export const loadNumericValue = async (key: string | null | undefined): Promise<string | null> => {
  // CRITICAL: Do not attempt to read from localStorage if key is null or undefined
  if (!key || key === null || key === undefined) {
    console.warn('loadNumericValue: Attempted to load with null/undefined key. Returning null.');
    return null;
  }
  
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log(`Loaded from localStorage: ${key} = ${value}`);
    }
    return value;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Save a boolean toggle value to localStorage with a fixed key
 * CRITICAL: Only saves if key is a valid, non-null string
 * @param key - Fixed key for the toggle (must not be null or undefined)
 * @param value - Boolean value to save
 */
export const saveToggleValue = async (key: string | null | undefined, value: boolean): Promise<void> => {
  // CRITICAL: Do not attempt to write to localStorage if key is null or undefined
  if (!key || key === null || key === undefined) {
    console.warn('saveToggleValue: Attempted to save with null/undefined key. Skipping save operation.');
    return;
  }
  
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`Saved toggle to localStorage: ${key} = ${value}`);
  } catch (error) {
    console.error(`Failed to save toggle ${key} to localStorage:`, error);
  }
};

/**
 * Load a boolean toggle value from localStorage
 * CRITICAL: Only loads if key is a valid, non-null string
 * @param key - Fixed key for the toggle (must not be null or undefined)
 * @param defaultValue - Default value if not found (default: false)
 * @returns The stored boolean value or default
 */
export const loadToggleValue = async (key: string | null | undefined, defaultValue: boolean = false): Promise<boolean> => {
  // CRITICAL: Do not attempt to read from localStorage if key is null or undefined
  if (!key || key === null || key === undefined) {
    console.warn('loadToggleValue: Attempted to load with null/undefined key. Returning default value.');
    return defaultValue;
  }
  
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      const parsed = JSON.parse(value);
      console.log(`Loaded toggle from localStorage: ${key} = ${parsed}`);
      return parsed;
    }
    console.log(`No stored value for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  } catch (error) {
    console.error(`Failed to load toggle ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Clear all values for a specific screen
 * @param keyPrefix - Prefix to identify screen keys (e.g., 'buy_' or 'sell_')
 */
export const clearScreenValues = async (keyPrefix: string): Promise<void> => {
  if (!keyPrefix || keyPrefix === null || keyPrefix === undefined) {
    console.warn('clearScreenValues: Invalid key prefix provided. Skipping clear operation.');
    return;
  }
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key => key.startsWith(keyPrefix));
    await AsyncStorage.multiRemove(keysToRemove);
    console.log(`Cleared ${keysToRemove.length} keys with prefix ${keyPrefix}`);
  } catch (error) {
    console.error(`Failed to clear keys with prefix ${keyPrefix}:`, error);
  }
};
