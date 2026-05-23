import { useState } from "react";
import { useListProfiles } from "@workspace/api-client-react";
import { Download, Shield, Copy, Check, ExternalLink, Puzzle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 pb-8 border-l border-dashed border-border ml-[-22px] pl-8">
        <h3 className="font-semibold text-sm mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground space-y-2">{children}</div>
      </div>
    </div>
  );
}

export default function Extension() {
  const { data: profiles, isLoading } = useListProfiles();

  const apiUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-app.replit.app";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browser Extension</h1>
        <p className="text-muted-foreground mt-1">
          Install the SafeGuard extension to enforce blocking rules directly in Chrome or Firefox.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">How it works</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-primary font-bold">1</span>
            <span>Every page load, the extension reads the current domain and asks SafeGuard if it's blocked.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-primary font-bold">2</span>
            <span>SafeGuard checks the block rules for the selected child profile in real time.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-primary font-bold">3</span>
            <span>If blocked, the page is immediately replaced with a "Site Blocked" screen.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Steps */}
        <div className="lg:col-span-3 rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-6">Setup Instructions</h2>

          <Step n={1} title="Download the extension">
            <p>Download the extension folder and unzip it on the child's computer.</p>
            <a href="/extension.zip" download>
              <Button size="sm" className="mt-2 gap-2">
                <Download className="h-3.5 w-3.5" />
                Download extension.zip
              </Button>
            </a>
          </Step>

          <Step n={2} title="Load it into Chrome">
            <p>Open Chrome and go to <code className="bg-muted px-1 rounded text-xs">chrome://extensions</code></p>
            <p>Enable <strong className="text-foreground">Developer mode</strong> (top-right toggle).</p>
            <p>Click <strong className="text-foreground">Load unpacked</strong> and select the unzipped folder.</p>
          </Step>

          <Step n={3} title="Open extension settings">
            <p>Click the puzzle icon in Chrome's toolbar, find <strong className="text-foreground">SafeGuard</strong>, then click the three-dot menu → <strong className="text-foreground">Options</strong>.</p>
          </Step>

          <Step n={4} title="Paste your API URL">
            <p>Copy this URL into the <strong className="text-foreground">SafeGuard API URL</strong> field:</p>
            <div className="flex items-center mt-1 bg-muted rounded-md px-3 py-2 font-mono text-xs text-foreground">
              <span className="truncate">{apiUrl}</span>
              <CopyButton text={apiUrl} />
            </div>
          </Step>

          <Step n={5} title="Choose a profile ID">
            <p>Pick the child's Profile ID from the table on the right and paste it into the <strong className="text-foreground">Profile ID</strong> field in the extension settings.</p>
          </Step>

          <Step n={6} title="Test it">
            <p>In the extension settings page there is a <strong className="text-foreground">Test a domain</strong> box. Try typing <code className="bg-muted px-1 rounded text-xs">facebook.com</code> — if it's on the child's block list it should say <strong className="text-green-600">BLOCKED</strong>.</p>
          </Step>
        </div>

        {/* Profile IDs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold mb-1">Profile IDs</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Copy the ID for the child whose rules you want to enforce on this device.
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : profiles && profiles.length > 0 ? (
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ background: p.avatarColor }}
                      >
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-sm font-mono font-bold text-primary">
                        {p.id}
                      </code>
                      <CopyButton text={String(p.id)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No profiles yet.{" "}
                <a href="/profiles" className="text-primary underline underline-offset-2">
                  Create one first.
                </a>
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-sm text-amber-800">
            <strong>Firefox users:</strong> go to <code className="bg-amber-100 px-1 rounded text-xs">about:debugging</code> → This Firefox → Load Temporary Add-on → select any file inside the extension folder.
          </div>

          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">One extension per device</p>
            <p>Install the extension on each computer or browser you want to protect. Set a different Profile ID per device to match the child using it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
