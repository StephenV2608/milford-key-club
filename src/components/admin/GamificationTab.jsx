import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Star, Zap, Award, Medal, Target, Users, TrendingUp } from 'lucide-react';

// --- Points rules ---
const POINTS_PER_HOUR = 10;
const POINTS_PER_SUBMISSION = 5;

// --- Badges ---
const BADGES = [
  { id: 'first_submission',  label: 'First Step',      icon: '🌱', color: 'bg-green-100 text-green-700',   desc: 'Submit your first service hours',          check: (s) => s.total >= 1 },
  { id: 'five_hours',        label: '5hr Club',         icon: '⭐', color: 'bg-blue-100 text-blue-700',     desc: 'Earn 5 approved hours',                    check: (s) => s.approved >= 5 },
  { id: 'ten_hours',         label: '10hr Hero',        icon: '🔥', color: 'bg-orange-100 text-orange-700', desc: 'Earn 10 approved hours',                   check: (s) => s.approved >= 10 },
  { id: 'goal_met',          label: 'Goal Crusher',     icon: '🎯', color: 'bg-purple-100 text-purple-700', desc: 'Meet the 15-hour club requirement',         check: (s) => s.approved >= 15 },
  { id: 'fifty_hours',       label: '50hr Legend',      icon: '🏆', color: 'bg-yellow-100 text-yellow-700', desc: 'Earn 50 approved hours',                   check: (s) => s.approved >= 50 },
  { id: 'hundred_hours',     label: '100hr Logger',     icon: '💯', color: 'bg-red-100 text-red-700',       desc: 'Earn 100 approved hours — elite status',   check: (s) => s.approved >= 100 },
  { id: 'five_events',       label: 'Event Regular',    icon: '📅', color: 'bg-cyan-100 text-cyan-700',     desc: 'Log hours for 5+ different organizations', check: (s) => s.uniqueOrgs >= 5 },
  { id: 'ten_events',        label: 'Event Enthusiast', icon: '🎉', color: 'bg-pink-100 text-pink-700',     desc: 'Log hours for 10+ different organizations',check: (s) => s.uniqueOrgs >= 10 },
  { id: 'consistent',        label: 'Consistent',       icon: '📆', color: 'bg-indigo-100 text-indigo-700', desc: 'Submit hours in 3+ different months',       check: (s) => s.activeMonths >= 3 },
  { id: 'top3',              label: 'Top 3',            icon: '🥉', color: 'bg-slate-100 text-slate-700',   desc: 'Rank in the top 3 by approved hours',       check: (s) => s.rank <= 3 },
];

function computeStats(allHours, memberName, rank) {
  const mine = allHours.filter(h => h.member_name === memberName || h.member_email === memberName);
  const approved = mine.filter(h => h.status === 'approved').reduce((a, h) => a + (h.hours || 0), 0);
  const total = mine.length;
  const uniqueOrgs = new Set(mine.map(h => h.organization).filter(Boolean)).size;
  const activeMonths = new Set(mine.filter(h => h.date).map(h => h.date.slice(0, 7))).size;
  const points = Math.round(approved * POINTS_PER_HOUR + total * POINTS_PER_SUBMISSION);
  return { approved, total, uniqueOrgs, activeMonths, points, rank };
}

function BadgeChip({ badge, earned }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm transition-all ${earned ? badge.color + ' border-current/20' : 'bg-muted/40 text-muted-foreground border-border opacity-50'}`}>
      <span className="text-base">{badge.icon}</span>
      <div>
        <p className="font-semibold text-xs leading-tight">{badge.label}</p>
        <p className="text-[10px] opacity-70 leading-tight">{badge.desc}</p>
      </div>
      {earned && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider opacity-60">Earned</span>}
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-yellow-500 text-lg">🥇</span>;
  if (rank === 2) return <span className="text-slate-400 text-lg">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 text-lg">🥉</span>;
  return <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{rank}</span>;
}

export default function GamificationTab() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.ServiceHour.list('-date').then(h => { setHours(h); setLoading(false); });
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 bg-muted rounded-xl animate-pulse"/>)}</div>;

  // Build leaderboard
  const memberMap = {};
  hours.filter(h => h.status === 'approved').forEach(h => {
    const key = h.member_name || h.member_email || 'Unknown';
    memberMap[key] = (memberMap[key] || 0) + (h.hours || 0);
  });

  const ranked = Object.entries(memberMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, approvedHours], i) => {
      const stats = computeStats(hours, name, i + 1);
      const earned = BADGES.filter(b => b.check(stats));
      return { name, approvedHours: Math.round(approvedHours * 10) / 10, stats, earned, rank: i + 1 };
    });

  const selectedMember = selected ? ranked.find(r => r.name === selected) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl mb-1 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Gamification & Leaderboard
        </h2>
        <p className="text-sm text-muted-foreground">Points, badges, and rankings to motivate members.</p>
      </div>

      {/* Points Legend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">How Points Work</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{POINTS_PER_HOUR} pts per approved hour</p>
              <p className="text-xs text-muted-foreground">Main point source</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3">
            <Star className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{POINTS_PER_SUBMISSION} pts per submission</p>
              <p className="text-xs text-muted-foreground">Bonus for logging</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
          </h3>
          {ranked.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No approved hours yet.</p>
          ) : (
            <div className="space-y-2">
              {ranked.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setSelected(selected === m.name ? null : m.name)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-all text-left ${
                    selected === m.name ? 'border-primary bg-accent' : 'border-border bg-muted/40 hover:bg-muted'
                  }`}
                >
                  <div className="w-7 flex items-center justify-center shrink-0">
                    <RankBadge rank={m.rank} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{m.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {m.earned.slice(0, 3).map(b => (
                        <span key={b.id} title={b.label} className="text-sm leading-none">{b.icon}</span>
                      ))}
                      {m.earned.length > 3 && <span className="text-[10px] text-muted-foreground">+{m.earned.length - 3}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-primary">{m.stats.points} pts</p>
                    <p className="text-xs text-muted-foreground">{m.approvedHours}h</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Member Badge Detail */}
        <div className="bg-card rounded-xl border border-border p-5">
          {selectedMember ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">{selectedMember.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base">{selectedMember.name}</h3>
                  <p className="text-xs text-muted-foreground">Rank #{selectedMember.rank} · {selectedMember.stats.points} pts · {selectedMember.approvedHours}h approved</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Hours', value: selectedMember.approvedHours },
                  { label: 'Entries', value: selectedMember.stats.total },
                  { label: 'Orgs', value: selectedMember.stats.uniqueOrgs },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="font-bold text-sm">{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Badges</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {BADGES.map(badge => (
                  <BadgeChip key={badge.id} badge={badge} earned={selectedMember.earned.some(e => e.id === badge.id)} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-3">
              <Award className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Select a member from the leaderboard<br />to view their badges and stats.</p>
            </div>
          )}
        </div>
      </div>

      {/* Badge Legend */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">All Badges</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {BADGES.map(b => (
            <div key={b.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${b.color} border-current/10`}>
              <span className="text-base">{b.icon}</span>
              <div>
                <p className="font-semibold text-xs">{b.label}</p>
                <p className="text-[10px] opacity-70">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}