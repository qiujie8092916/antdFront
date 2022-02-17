import React, { createContext } from 'react';

export interface LoginContextProps {
  tabUtil?: {
    addTab: (id: string) => void;
    removeTab: (id: string) => void;
  };
}

const LoginContext: React.Context<LoginContextProps> = createContext({});

export default LoginContext;
