import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Wand2, RefreshCw, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const MODES = [
  { id: 'draft', label: 'Generate Draft from Topic', icon: Wand2, desc: 'Enter a topic or keywords and get a full project description.' },
  { id: 'improve', label: 'Improve Existing Content', icon: RefreshCw, desc: 'Paste existing content and get polished variations.' },
  { id: 'summary', label: 'Summarize a Completed Project', icon: Sparkles, desc: 'Describe what happened and get a shareable summary.' },
];

export default function AIContentTab() {
  const [mode, setMode] = useState('draft');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const PROMPTS = {
    draft: `You are a content writer for a high school Key Club chapter called Milford Key Club. 
Given the following topic or keywords, write an engaging project description (2–3 paragraphs) suitable for a club website. Keep it inspiring and community-focused.
Topic/Keywords: ${input}`,
    improve: `You are a content editor for a high school Key Club chapter called Milford Key Club.
Improve the following content: make it cleaner, more engaging, and more inspiring. Keep the same general meaning.
Provide 2 variations.
Content: ${input}`,
    summary: `You are writing for the Milford Key Club website. 
Based on the project notes below, write a polished, celebratory summary (2 short paragraphs) highlighting impact and member involvement.
Notes: ${input}`,
  };

  const generate = async () => {
    if (!input.trim()) { toast.error('Please enter some text first.'); return; }
    setLoading(true);
    setOutput('');
    const result = await base44.integrations.Core.InvokeLLM({ prompt: PROMPTS[mode] });
    setOutput(result);
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-gradient-to-r from-primary/10 to-accent rounded-xl border border-primary/20 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-bold text-base">AI Content Assistant</h3>
        </div>
        <p className="text-sm text-muted-foreground">Generate, improve, and summarize content for your club's website using AI.</p>
      </div>

      {/* Mode Selector */}
      <div className="grid sm:grid-cols-3 gap-3">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setOutput(''); setInput(''); }}
            className={`text-left p-4 rounded-xl border transition-all ${mode === m.id ? 'border-primary bg-accent' : 'border-border bg-card hover:bg-muted/50'}`}
          >
            <m.icon className={`w-5 h-5 mb-2 ${mode === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="font-semibold text-sm">{m.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {mode === 'draft' ? 'Topic / Keywords' : mode === 'improve' ? 'Existing Content to Improve' : 'Project Notes'}
          </Label>
          <Textarea
            className="mt-1"
            rows={5}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'draft' ? 'e.g. food bank sorting, hunger awareness, community pantry...' :
              mode === 'improve' ? 'Paste your existing content here...' :
              'e.g. We packed 200 bags of groceries at the Milford food bank on Saturday...'
            }
          />
        </div>
        <Button onClick={generate} disabled={loading} className="gap-2 rounded-full px-6">
          <Sparkles className="w-4 h-4" />
          {loading ? 'Generating...' : `Generate with AI`}
        </Button>
      </div>

      {/* Output */}
      {(output || loading) && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Generated Content</h4>
            {output && (
              <Button size="sm" variant="outline" onClick={copy} className="gap-1.5 h-8">
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${70 + i * 7}%` }} />)}
            </div>
          ) : (
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-4">{output}</div>
          )}
          {output && (
            <Button variant="ghost" size="sm" onClick={generate} className="gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5" />Regenerate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}