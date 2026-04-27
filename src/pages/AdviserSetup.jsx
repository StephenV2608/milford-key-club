import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, CheckCircle2, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Private invite token — change this value to invalidate the link.
// Share the link as: /adviser-setup?token=<INVITE_TOKEN>
const INVITE_TOKEN = 'mkc-adviser-2026-7Q9XZK';

export default function AdviserSetup() {
  const [tokenOk, setTokenOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ full_name: '', email: '', username: '', id_code: '', confirm: '' });
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTokenOk(params.get('token') === INVITE_TOKEN);
    setChecking(false);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.username.trim() || !form.id_code) {
      toast.error('Name, username, and ID code are required.');
      return;
    }
    if (form.id_code !== form.confirm) {
      toast.error('ID codes do not match.');
      return;
    }
    if (form.id_code.length < 6) {
      toast.error('ID code must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const username = form.username.trim();
    const existing = await base44.entities.AdminUser.filter({ username });
    if (existing.length > 0) {
      toast.error('That username is already taken. Pick another.');
      setLoading(false);
      return;
    }

    await base44.entities.AdminUser.create({
      username,
      email: form.email.trim().toLowerCase(),
      id_code: form.id_code,
      role: 'super_admin',
      permissions: [],
    });

    setDone(true);
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!tokenOk) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-heading font-bold text-2xl mb-2">Invalid or expired link</h1>
          <p className="text-muted-foreground text-sm mb-6">
            This setup link is private. Please use the original link you were sent.
          </p>
          <Link to="/">
            <Button variant="outline" className="rounded-full px-6">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-heading font-bold text-2xl mb-2">Account created!</h1>
          <p className="text-muted-foreground text-sm mb-2">
            You're set up as a <span className="font-semibold text-foreground">Super Admin</span>.
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in at <span className="font-mono text-foreground">/admin</span> using your username and ID code.
          </p>
          <Link to="/admin">
            <Button className="rounded-full px-6">Go to Admin Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-2xl">Adviser Account Setup</h1>
          <p className="text-muted-foreground text-sm mt-1">Private invite — create your Super Admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed">
              You'll be set up as a <span className="font-semibold">Super Admin</span> with full access to the admin panel. Keep your ID code private.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Ms. Smith" required />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="adviser@school.edu" />
          </div>
          <div className="space-y-1.5">
            <Label>Username *</Label>
            <Input value={form.username} onChange={e => set('username', e.target.value)} placeholder="msmith" required />
            <p className="text-xs text-muted-foreground">Used to sign in to the admin panel.</p>
          </div>
          <div className="space-y-1.5">
            <Label>ID Code (Password) *</Label>
            <div className="relative">
              <Input
                type={showCode ? 'text' : 'password'}
                value={form.id_code}
                onChange={e => set('id_code', e.target.value)}
                placeholder="At least 6 characters"
                required
                className="pr-10"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCode(v => !v)}>
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Confirm ID Code *</Label>
            <Input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Re-enter ID code" required />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? 'Creating account...' : 'Create Super Admin Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}