
import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PropertyContextType {
  netProceeds: number;
  setNetProceeds: (value: number) => void;
  useSaleFundsForPurchase: boolean;
  setUseSaleFundsForPurchase: (value: boolean) => void;
  resetAllData: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [netProceeds, setNetProceeds] = useState(0);
  const [useSaleFundsForPurchase, setUseSaleFundsForPurchase] = useState(false);

  const resetAllData = async () => {
    try {
      console.log('Resetting all app data...');
      
      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      
      // Reset context state
      setNetProceeds(0);
      setUseSaleFundsForPurchase(false);
      
      console.log('All app data has been reset');
    } catch (error) {
      console.error('Error resetting app data:', error);
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        netProceeds,
        setNetProceeds,
        useSaleFundsForPurchase,
        setUseSaleFundsForPurchase,
        resetAllData,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}
