import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormSelect from '../components/ui/form-select';

const GRADES = ['9', '10', '11', '12'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', grade: '9', class_year: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Name, email, and password are required.');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    // Check for duplicate email
    const existing = await base44.entities.Member.filter({ email: form.email.trim().toLowerCase() });
    if (existing.length > 0) {
      toast.error('An account with that email already exists.');
      setLoading(false);
      return;
    }

    await base44.entities.Member.create({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      grade: form.grade,
      class_year: form.class_year.trim(),
      password: form.password,
      active: false, // will be auto-approved by automation
    });

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 safe-top">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-heading font-bold text-2xl mb-2">Welcome to Key Club!</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Your account is ready. Check your email for a welcome message, then sign in to the portal.
          </p>
          <Link to="/portal">
            <Button variant="outline" className="rounded-full px-6">Go to Portal Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-12 safe-top">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-2xl">Create Member Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join the Milford Key Club portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" required />
          </div>
          <div className="space-y-1.5">
            <Label>Email Address *</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@school.edu" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Grade</Label>
              <FormSelect
                className="w-full"
                value={form.grade}
                onChange={v => set('grade', v)}
                options={GRADES.map(g => ({ value: g, label: `Grade ${g}` }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Graduation Year</Label>
              <Input value={form.class_year} onChange={e => set('class_year', e.target.value)} placeholder="2027" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="At least 6 characters"
                required
                className="pr-10"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Confirm Password *</Label>
            <Input
              type="password"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? 'Submitting...' : 'Submit Registration'}
          </Button>

          <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-1">Privacy Notice</p>
            <p>
              By registering, you agree to share your name, email, grade, and graduation year with the Milford Key Club for membership and service hour tracking purposes only. Your info is visible to club officers and advisors and is never sold or shared outside the club. You may request account deletion at any time from your portal.
            </p>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link to="/portal" className="text-primary hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}