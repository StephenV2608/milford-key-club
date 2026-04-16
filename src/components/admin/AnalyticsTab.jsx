import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';

const COLORS = ['#2563eb', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsTab() {
  const [hours, setHours] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ServiceHour.list('-date'),
      base44.entities.Member.list(),
    ]).then(([h, m]) => { setHours(h); setMembers(m); setLoading(false); });
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-40 bg-muted rounded-xl animate-pulse"/>)}</div>;

  // --- Hours per month ---
  const monthlyMap = {};
  hours.filter(h => h.status === 'approved').forEach(h => {
    if (!h.date) return;
    const key = h.date.slice(0, 7); // YYYY-MM
    monthlyMap[key] = (monthlyMap[key] || 0) + (h.hours || 0);
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, total]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      hours: Math.round(total * 10) / 10,
    }));

  // --- Org / event type breakdown ---
  const orgMap = {};
  hours.filter(h => h.status === 'approved').forEach(h => {
    const key = h.organization || 'Unknown';
    orgMap[key] = (orgMap[key] || 0) + (h.hours || 0);
  });
  const orgData = Object.entries(orgMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value: Math.round(value * 10) / 10 }));

  // --- Member engagement ---
  const submitterSet = new Set(hours.map(h => h.member_email).filter(Boolean));
  const activeCount = submitterSet.size;
  const totalMembers = members.filter(m => m.active !== false).length;
  const engagementRate = totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0;

  // --- Member leaderboard data (for engagement bar) ---
  const memberHoursMap = {};
  hours.filter(h => h.status === 'approved').forEach(h => {
    const key = h.member_name || h.member_email || 'Unknown';
    memberHoursMap[key] = (memberHoursMap[key] || 0) + (h.hours || 0);
  });
  const topMembers = Object.entries(memberHoursMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, hours]) => ({ name: name.split(' ')[0], hours: Math.round(hours * 10) / 10 }));

  const totalApproved = hours.filter(h => h.status === 'approved').reduce((a, h) => a + (h.hours || 0), 0);
  const pendingCount = hours.filter(h => h.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl mb-1">Club Analytics</h2>
        <p className="text-sm text-muted-foreground">Visualize activity, engagement, and hour trends.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Total Approved Hours" value={`${Math.round(totalApproved)}h`} color="text-green-600" />
        <StatCard icon={Users} label="Active Members" value={`${activeCount}/${totalMembers}`} sub={`${engagementRate}% engaged`} color="text-primary" />
        <StatCard icon={Star} label="Pending Reviews" value={pendingCount} color="text-amber-500" />
        <StatCard icon={TrendingUp} label="Avg Hours/Member" value={activeCount > 0 ? `${(totalApproved / activeCount).toFixed(1)}h` : '0h'} color="text-purple-600" />
      </div>

      {/* Hours per Month */}
      {monthlyData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Approved Hours per Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}h`, 'Hours']} />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Org Breakdown */}
        {orgData.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Hours by Organization</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orgData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {orgData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}h`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Members Bar */}
        {topMembers.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Top Contributors</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topMembers} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={64} />
                <Tooltip formatter={(v) => [`${v}h`, 'Hours']} />
                <Bar dataKey="hours" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Engagement Rate Visual */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Member Engagement</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
              <div className="h-5 rounded-full bg-primary transition-all duration-700" style={{ width: `${engagementRate}%` }} />
            </div>
          </div>
          <span className="text-2xl font-bold w-16 text-right">{engagementRate}%</span>
        </div>
        <p className="text-xs text-muted-foreground">{activeCount} of {totalMembers} active members have submitted at least one service hour entry.</p>
      </div>
    </div>
  );
}