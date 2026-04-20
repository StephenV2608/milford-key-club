import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Super admin seed — always has full access
const SUPER_ADMIN_SEED = {
  username: 'SuperAdmin',
  id_code: 'MKC-K7XQ-9PVR-4MBN',
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

  const login = async (identifier, secret) => {
    const id = identifier.trim();
    const pw = secret.trim();

    // Check super admin seed first
    if (id === SUPER_ADMIN_SEED.username && pw === SUPER_ADMIN_SEED.id_code) {
      const user = { ...SUPER_ADMIN_SEED, permissions: ['announcements','messages','events','people','hours','forms','resources','news','gallery','showcase','officers','pages','settings'] };
      sessionStorage.setItem('mkc_admin', JSON.stringify(user));
      setAdminUser(user);
      return { success: true };
    }

    // Check database admins (username + id code)
    const adminList = await base44.entities.AdminUser.filter({ username: id });
    const adminMatch = adminList.find(u => u.id_code === pw);
    if (adminMatch) {
      const user = { ...adminMatch, permissions: adminMatch.permissions || [] };
      sessionStorage.setItem('mkc_admin', JSON.stringify(user));
      setAdminUser(user);
      return { success: true };
    }

    // Check members with officer role (email + password)
    const memberList = await base44.entities.Member.filter({ email: id });
    const memberMatch = memberList.find(m => m.password === pw && m.active !== false && m.officer_role);
    if (memberMatch) {
      const user = {
        id: memberMatch.id,
        username: memberMatch.name,
        email: memberMatch.email,
        officer_role: memberMatch.officer_role,
        role: 'admin',
        permissions: memberMatch.admin_permissions || [],
        fromMember: true,
      };
      sessionStorage.setItem('mkc_admin', JSON.stringify(user));
      setAdminUser(user);
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials.' };
  };

  const logout = () => {
    sessionStorage.removeItem('mkc_admin');
    setAdminUser(null);
  };

  const isSuperAdmin = adminUser?.role === 'super_admin';
  const hasPermission = (perm) => isSuperAdmin || (adminUser?.permissions || []).includes(perm);

  return { adminUser, checking, login, logout, isSuperAdmin, hasPermission };
}