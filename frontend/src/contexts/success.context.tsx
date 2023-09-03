import { createContext, ReactNode, useContext, useState } from 'react';

type SuccessContextType = {
  success: string[];
  addSuccess: (message: string) => void;
  clearSuccesss: () => void;
};

const SuccessContext = createContext<SuccessContextType | undefined>(undefined);

export function useSuccess() {
  const context = useContext(SuccessContext);
  if (!context) {
    throw new Error('useSuccess must be used within an SuccessProvider');
  }
  return context;
}

type SuccessProviderProps = {
  children: ReactNode;
};

export function SuccessProvider({ children }: SuccessProviderProps) {
  const [success, setSuccesss] = useState<string[]>([]);

  const addSuccess = (message: string) => {
    setSuccesss((prevSuccesss) => [...prevSuccesss, message]);
  };

  const clearSuccesss = () => {
    setSuccesss([]);
  };

  const contextValue: SuccessContextType = {
    success,
    addSuccess,
    clearSuccesss,
  };

  return (
    <SuccessContext.Provider value={contextValue}>
      {children}
    </SuccessContext.Provider>
  );
}
