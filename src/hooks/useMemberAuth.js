import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useMemberAuth() {
  const [memberUser, setMemberUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('mkc_member');
    if (stored) setMemberUser(JSON.parse(stored));
    setChecking(false);
  }, []);

  const login = async (email, password) => {
    const list = await base44.entities.Member.filter({ email: email.trim() });
    const match = list.find(m => m.password === password && m.active !== false);
    if (match) {
      sessionStorage.setItem('mkc_member', JSON.stringify(match));
      setMemberUser(match);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  const logout = () => {
    sessionStorage.removeItem('mkc_member');
    setMemberUser(null);
  };

  return { memberUser, checking, login, logout };
}