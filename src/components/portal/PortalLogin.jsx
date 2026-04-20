import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";

export default function PortalLogin({ adminAuth, memberAuth }) {
  const [mode, setMode] = useState('member'); // 'member' | 'admin'
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'admin') {
      const res = await adminAuth.login(form.identifier, form.password);
      if (!res.success) { toast.error(res.error); setLoading(false); }
    } else {
      const res = await memberAuth.login(form.identifier, form.password);
      if (!res.success) { toast.error(res.error); setLoading(false); }
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {mode === 'admin' ? <Shield className="w-8 h-8 text-primary" /> : <Users className="w-8 h-8 text-primary" />}
          </div>
          <h1 className="font-heading font-bold text-2xl">Milford Key Club Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('member'); setForm({ identifier: '', password: '' }); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'member' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users className="w-4 h-4" /> Member Login
          </button>
          <button
            onClick={() => { setMode('admin'); setForm({ identifier: '', password: '' }); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'admin' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Shield className="w-4 h-4" /> Admin Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <Label>{mode === 'admin' ? 'Username or Email' : 'Email Address'}</Label>
            <Input
              value={form.identifier}
              onChange={e => set('identifier', e.target.value)}
              placeholder={mode === 'admin' ? 'SuperAdmin or ava@school.edu' : 'you@school.edu'}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{mode === 'admin' ? 'ID Code or Password' : 'Password'}</Label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={mode === 'admin' ? 'MKC-XXXX-XXXX' : '••••••••'}
                required
                className="pr-10"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {mode === 'member' && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-primary hover:underline font-medium">Register here</a>
          </p>
        )}
      </div>
    </div>
  );
}