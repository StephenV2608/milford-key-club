import { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useMemberAuth } from '../hooks/useMemberAuth';
import AdminDashboard from '../components/portal/AdminDashboard';
import MemberDashboard from '../components/portal/MemberDashboard';
import PortalLogin from '../components/portal/PortalLogin';

export default function Portal() {
  const adminAuth = useAdminAuth();
  const memberAuth = useMemberAuth();

  const checking = adminAuth.checking || memberAuth.checking;

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (adminAuth.adminUser) {
    return <AdminDashboard adminAuth={adminAuth} />;
  }

  if (memberAuth.memberUser) {
    return <MemberDashboard memberAuth={memberAuth} />;
  }

  return <PortalLogin adminAuth={adminAuth} memberAuth={memberAuth} />;
}