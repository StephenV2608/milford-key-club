import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Super admin seed — always has full access
const SUPER_ADMIN_SEED = {
  username: 'SuperAdmin',
  id_code: 'MKC-SUPER-2026',
  role: 'super_admin',
};

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('mkc_admin');
    if (stored) {
      setAdminUser(JSON.parse(stored));
    }
    setChecking(false);
  }, []);

  const login = async (username, idCode) => {
    // Check super admin seed first
    if (
      username.trim() === SUPER_ADMIN_SEED.username &&
      idCode.trim() === SUPER_ADMIN_SEED.id_code
    ) {
      const user = { ...SUPER_ADMIN_SEED, permissions: ['settings','projects','events','officers','gallery','hours','news'] };
      sessionStorage.setItem('mkc_admin', JSON.stringify(user));
      setAdminUser(user);
      return { success: true };
    }

    // Check database admins
    const list = await base44.entities.AdminUser.filter({ username: username.trim() });
    const match = list.find(u => u.id_code === idCode.trim());
    if (match) {
      const user = { ...match, permissions: match.permissions || [] };
      sessionStorage.setItem('mkc_admin', JSON.stringify(user));
      setAdminUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or ID code.' };
  };

  const logout = () => {
    sessionStorage.removeItem('mkc_admin');
    setAdminUser(null);
  };

  const isSuperAdmin = adminUser?.role === 'super_admin';
  const hasPermission = (perm) => isSuperAdmin || (adminUser?.permissions || []).includes(perm);

  return { adminUser, checking, login, logout, isSuperAdmin, hasPermission };
}