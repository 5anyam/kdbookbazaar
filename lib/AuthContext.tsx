'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CK = process.env.NEXT_PUBLIC_CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7';
const CS = process.env.NEXT_PUBLIC_CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = Cookies.get('kdbookbazaar_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User);
      } catch {
        Cookies.remove('kdbookbazaar_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch('https://cms.kdbookbazaar.com/wp-json/custom-api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed. Please check your credentials.');
    }

    const userData: User = {
      id: result.data.id,
      email: result.data.email,
      username: result.data.username,
      first_name: result.data.first_name,
      last_name: result.data.last_name,
    };

    setUser(userData);
    Cookies.set('kdbookbazaar_user', JSON.stringify(userData), { expires: 7 });
    Cookies.set('caishen_token', result.data.token, { expires: 7 });
  };

  const register = async (data: RegisterData) => {
    // Call WooCommerce REST API directly — creates a real WordPress user
    const auth = btoa(`${CK}:${CS}`);
    const res = await fetch(`${WC_BASE}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      const code: string = result.code || '';
      if (code.includes('email-exists')) throw new Error('An account with this email already exists. Please login instead.');
      if (code.includes('username-exists')) throw new Error('This username is already taken. Please choose another.');
      throw new Error(result.message || 'Registration failed. Please try again.');
    }

    // Auto-login after successful registration
    await login(data.username, data.password);
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('kdbookbazaar_user');
    Cookies.remove('caishen_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
