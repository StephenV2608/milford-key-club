import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle, LogOut, User, AlertCircle, Edit2, X, Check, Trash2, TrendingUp, Star, Megaphone, MessageCircle, Send, Info, AlertTriangle } from 'lucide-react';
import ProjectSubmitForm from './ProjectSubmitForm';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const GOAL = 15; // service hours goal

function calcHours(start, end) {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return null;
  return Math.round(diff) / 60;
}

export default function MemberDashboard({ memberAuth }) {
  const { memberUser, logout } = memberAuth;
  const [tab, setTab] = useState('hours');
  const [myHours, setMyHours] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: '', start_time: '', end_time: '', organization: '', description: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { loadHours(); }, []);
  const loadHours = () => {
    base44.entities.ServiceHour.filter({ member_email: memberUser.email })
      .then(list => setMyHours(list.sort((a, b) => new Date(b.date) - new Date(a.date))));
  };

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const computedHours = calcHours(form.start_time, form.end_time);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!computedHours || computedHours <= 0) { toast.error('End time must be after start time.'); return; }
    setSubmitting(true);
    await base44.entities.ServiceHour.create({
      member_name: memberUser.name,
      member_email: memberUser.email,
      date: form.date,
      hours: computedHours,
      organization: form.organization,
      description: form.description,
      status: 'pending',
    });
    toast.success('Hours submitted for review!');
    setForm({ date: '', start_time: '', end_time: '', organization: '', description: '' });
    setSubmitting(false);
    loadHours();
  };

  const handleDeleteAccount = async () => {
    const members = await base44.entities.Member.filter({ email: memberUser.email });
    if (members.length) await base44.entities.Member.delete(members[0].id);
    toast.success('Account deleted.');
    logout();
  };

  const approvedHours = myHours.filter(h => h.status === 'approved').reduce((a, h) => a + (h.hours || 0), 0);
  const pendingHours = myHours.filter(h => h.status === 'pending').reduce((a, h) => a + (h.hours || 0), 0);
  const progress = Math.min(100, Math.round((approvedHours / GOAL) * 100));

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl">Hello, {memberUser.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{memberUser.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 select-none">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{approvedHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Approved hrs</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending hrs</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{myHours.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Submissions</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex bg-muted rounded-xl p-1 mb-6 select-none">
          {[
            { id: 'announcements', label: 'News', icon: Megaphone },
            { id: 'hours', label: 'Log Hours', icon: Clock },
            { id: 'history', label: 'History', icon: CheckCircle },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'projects', label: 'Projects', icon: Star },
            { id: 'contact', label: 'Contact', icon: MessageCircle },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${tab === id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'announcements' && (
          <AnnouncementsBoard />
        )}
        {tab === 'hours' && (
          <LogHoursTab form={form} setF={setF} computedHours={computedHours} submitting={submitting} handleSubmit={handleSubmit} />
        )}
        {tab === 'history' && (
          <HistoryTab myHours={myHours} />
        )}
        {tab === 'progress' && (
          <ProgressTab approvedHours={approvedHours} pendingHours={pendingHours} progress={progress} goal={GOAL} myHours={myHours} />
        )}
        {tab === 'projects' && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading font-semibold text-base mb-1 flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Submit a Project</h3>
            <p className="text-xs text-muted-foreground mb-5">Share your service work for the Community Showcase. Approved submissions are publicly displayed.</p>
            <ProjectSubmitForm memberUser={memberUser} />
          </div>
        )}
        {tab === 'contact' && (
          <ContactOfficersForm memberUser={memberUser} />
        )}
        {tab === 'profile' && (
          <ProfileTab memberUser={memberUser} memberAuth={memberAuth} onDeleteRequest={() => setShowDeleteConfirm(true)} />
        )}
      </div>

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-heading font-bold text-lg mb-2">Delete Account?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently delete your member account and cannot be undone. Your submitted hours will remain in the system.</p>
            <div className="flex gap-3">
              <Button variant="destructive" className="flex-1 gap-1.5" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4" /> Yes, Delete
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogHoursTab({ form, setF, computedHours, submitting, handleSubmit }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" /> Log Service Hours
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Date *</Label>
            <Input type="date" value={form.date} onChange={e => setF('date', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Start Time *</Label>
            <Input type="time" value={form.start_time} onChange={e => setF('start_time', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>End Time *</Label>
            <Input type="time" value={form.end_time} onChange={e => setF('end_time', e.target.value)} required />
          </div>
        </div>
        {form.start_time && form.end_time && (
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${computedHours && computedHours > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {computedHours && computedHours > 0
              ? <><CheckCircle className="w-4 h-4 shrink-0" /> <strong>{computedHours.toFixed(2)} hours</strong> will be logged</>
              : <><AlertCircle className="w-4 h-4 shrink-0" /> End time must be after start time</>
            }
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Organization / Event *</Label>
          <Input placeholder="e.g. Milford Food Bank" value={form.organization} onChange={e => setF('organization', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Briefly describe what you did..." rows={2} value={form.description} onChange={e => setF('description', e.target.value)} />
        </div>
        <Button type="submit" className="rounded-full px-8 select-none" disabled={submitting || !computedHours || computedHours <= 0}>
          {submitting ? 'Submitting...' : 'Submit Hours'}
        </Button>
      </form>
    </div>
  );
}

function HistoryTab({ myHours }) {
  const statusColors = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold text-base mb-4">My Submissions</h3>
      {myHours.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No submissions yet. Log your first hours!</p>
      ) : (
        <div className="space-y-3">
          {myHours.map(h => (
            <div key={h.id} className="flex items-start gap-3 bg-muted/40 rounded-lg px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm">{h.organization}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[h.status]}`}>{h.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{h.date}</p>
                {h.description && <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>}
                {h.admin_notes && <p className="text-xs text-muted-foreground italic mt-1">Admin: {h.admin_notes}</p>}
              </div>
              <p className="font-bold text-sm shrink-0">{h.hours}h</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressTab({ approvedHours, pendingHours, progress, goal, myHours }) {
  const remaining = Math.max(0, goal - approvedHours);
  const byOrg = myHours.filter(h => h.status === 'approved').reduce((acc, h) => {
    acc[h.organization] = (acc[h.organization] || 0) + h.hours;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Hours Progress
        </h3>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">{approvedHours.toFixed(1)} / {goal} hrs</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-green-700">{approvedHours.toFixed(1)}</p>
            <p className="text-xs text-green-600">Approved</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{remaining.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Still needed</p>
          </div>
        </div>
        {pendingHours > 0 && (
          <p className="text-xs text-amber-600 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⏳ {pendingHours.toFixed(1)} hrs still pending approval
          </p>
        )}
        {progress >= 100 && (
          <p className="text-xs text-green-700 mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 font-semibold">
            🎉 You've met the service hour requirement!
          </p>
        )}
      </div>

      {/* By Organization */}
      {Object.keys(byOrg).length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Hours by Organization</h3>
          <div className="space-y-2">
            {Object.entries(byOrg).sort((a, b) => b[1] - a[1]).map(([org, hrs]) => (
              <div key={org} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{org}</p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (hrs / approvedHours) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0">{hrs.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnnouncementsBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Announcement.filter({ published: true }, '-created_date').then(list => {
      const now = new Date();
      setItems(list.filter(a => !a.expires_at || new Date(a.expires_at) >= now));
      setLoading(false);
    });
  }, []);

  const priorityConfig = {
    normal:    { label: 'Normal',    color: 'bg-blue-100 text-blue-700',   icon: Info },
    important: { label: 'Important', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    urgent:    { label: 'Urgent',    color: 'bg-red-100 text-red-700',     icon: AlertTriangle },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-primary" />
        <h3 className="font-heading font-semibold text-base">Club Announcements</h3>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No announcements right now. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(a => {
            const cfg = priorityConfig[a.priority] || priorityConfig.normal;
            const Icon = cfg.icon;
            return (
              <div key={a.id} className={`bg-card rounded-xl border p-4 ${a.priority === 'urgent' ? 'border-red-200' : a.priority === 'important' ? 'border-amber-200' : 'border-border'}`}>
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {a.posted_by && `Posted by ${a.posted_by}`}
                      {a.posted_by && a.created_date && ' · '}
                      {a.created_date && new Date(a.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContactOfficersForm({ memberUser }) {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) { toast.error('Please fill in all fields.'); return; }
    setSending(true);
    await base44.entities.OfficerMessage.create({
      member_name: memberUser.name,
      member_email: memberUser.email,
      subject: form.subject,
      message: form.message,
      status: 'unread',
    });
    toast.success('Message sent to officers!');
    setForm({ subject: '', message: '' });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold text-base mb-1 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" /> Contact Officers
      </h3>
      <p className="text-xs text-muted-foreground mb-5">Send a message directly to the club officers. They'll reply to your email.</p>
      {sent && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm text-green-700 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" /> Message sent! Officers will reply to {memberUser.email}.
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Subject *</label>
          <input
            className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            placeholder="What's this about?"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Message *</label>
          <textarea
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[120px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            placeholder="Write your message here..."
            required
          />
        </div>
        <Button type="submit" disabled={sending} className="rounded-full gap-1.5 select-none">
          <Send className="w-4 h-4" />{sending ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}

function ProfileTab({ memberUser, memberAuth, onDeleteRequest }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: memberUser.name, email: memberUser.email, grade: memberUser.grade || '', class_year: memberUser.class_year || '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });

  const save = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setSaving(true);
    const members = await base44.entities.Member.filter({ email: memberUser.email });
    if (members.length) {
      await base44.entities.Member.update(members[0].id, { name: form.name, email: form.email, grade: form.grade, class_year: form.class_year });
    }
    toast.success('Profile updated!');
    setSaving(false);
    setEditing(false);
    // Update session
    sessionStorage.setItem('memberUser', JSON.stringify({ ...memberUser, ...form }));
  };

  const changePassword = async () => {
    if (pwForm.current !== memberUser.password) { toast.error('Current password is incorrect'); return; }
    if (pwForm.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    const members = await base44.entities.Member.filter({ email: memberUser.email });
    if (members.length) await base44.entities.Member.update(members[0].id, { password: pwForm.next });
    toast.success('Password changed!');
    setChangingPw(false);
    setPwForm({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="space-y-4">
      {/* Profile Info */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" /> My Profile</h3>
          {!editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5 select-none"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-1.5">
                <Label>Grade</Label>
                <select className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}>
                  <option value="">— Select —</option>
                  {['9','10','11','12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Graduation Year</Label><Input placeholder="2027" value={form.class_year} onChange={e => setForm(p => ({ ...p, class_year: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving} className="gap-1.5 select-none"><Check className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save'}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="gap-1.5 select-none"><X className="w-3.5 h-3.5" />Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Name', value: memberUser.name },
              { label: 'Email', value: memberUser.email },
              { label: 'Grade', value: memberUser.grade ? `Grade ${memberUser.grade}` : '—' },
              { label: 'Graduation Year', value: memberUser.class_year || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground w-28 shrink-0 uppercase tracking-wide font-medium">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Change Password</h3>
          {!changingPw && <Button size="sm" variant="outline" onClick={() => setChangingPw(true)} className="select-none">Change</Button>}
        </div>
        {changingPw ? (
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>New Password</Label><Input type="password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button size="sm" onClick={changePassword} className="gap-1.5 select-none"><Check className="w-3.5 h-3.5" />Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setChangingPw(false)} className="select-none">Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Update your portal login password.</p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
        <h3 className="font-heading font-semibold text-sm text-destructive mb-2">Danger Zone</h3>
        <p className="text-xs text-muted-foreground mb-3">Permanently delete your member account. This cannot be undone.</p>
        <Button variant="destructive" size="sm" onClick={onDeleteRequest} className="gap-1.5 select-none">
          <Trash2 className="w-3.5 h-3.5" /> Delete Account
        </Button>
      </div>
    </div>
  );
}