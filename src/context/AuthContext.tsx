import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerProfile, Address } from '../types';
import { getAddresses, getCurrentUser, customerLogout } from '../lib/api';

interface AuthContextType {
  user: CustomerProfile | null;
  isAdmin: boolean;
  login: (user: CustomerProfile) => void;
  logout: () => void;
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (addr: Address | null) => void;
  refreshAddresses: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  updateUser: (updatedFields: Partial<CustomerProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerProfile | null>(() => {
    try {
      const stored = localStorage.getItem('quikzo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Verify session on mount if token exists
  useEffect(() => {
    const verifySession = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('quikzo_user', JSON.stringify(currentUser));
      }
    };
    verifySession();
  }, []);

  const refreshAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setSelectedAddress(null);
      return;
    }
    try {
      const list = await getAddresses(user.id);
      setAddresses(list);
      if (list.length > 0) {
        const defaultOne = list.find(a => a.isDefault) || list[0];
        setSelectedAddress(prev => (prev ? list.find(a => a.id === prev.id) || defaultOne : defaultOne));
      } else {
        setSelectedAddress(null);
      }
    } catch (e) {
      console.error('Failed to load addresses', e);
    }
  };

  useEffect(() => {
    refreshAddresses();
  }, [user?.id]);

  const login = (newUser: CustomerProfile) => {
    setUser(newUser);
    try {
      localStorage.setItem('quikzo_user', JSON.stringify(newUser));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    customerLogout();
    localStorage.removeItem('quikzo_user');
    setAddresses([]);
    setSelectedAddress(null);
  };

  const updateUser = (updatedFields: Partial<CustomerProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('quikzo_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        login,
        logout,
        updateUser,
        addresses,
        selectedAddress,
        setSelectedAddress,
        refreshAddresses,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
