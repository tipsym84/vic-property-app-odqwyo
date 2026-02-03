
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PropertyContextType {
  netProceeds: number;
  setNetProceeds: (value: number) => void;
  useSaleFundsForPurchase: boolean;
  setUseSaleFundsForPurchase: (value: boolean) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [netProceeds, setNetProceeds] = useState(0);
  const [useSaleFundsForPurchase, setUseSaleFundsForPurchase] = useState(false);

  return (
    <PropertyContext.Provider
      value={{
        netProceeds,
        setNetProceeds,
        useSaleFundsForPurchase,
        setUseSaleFundsForPurchase,
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
