import { createContext, ReactNode, useContext, useState } from 'react';

type ErrorContextType = {
  errors: string[];
  addError: (message: string) => void;
  clearErrors: () => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

type ErrorProviderProps = {
  children: ReactNode;
};

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const addError = (message: string) => {
    setErrors((prevErrors) => [...prevErrors, message]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const contextValue: ErrorContextType = {
    errors,
    addError,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}
