import React, { useState, useEffect, useRef } from "react";
import { 
  Database, 
  Plus, 
  Trash2, 
  Copy, 
  Edit2, 
  Save, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Download, 
  Upload, 
  Info, 
  ExternalLink, 
  Lock, 
  FolderPlus,
  X
} from "lucide-react";

interface SupabaseAccount {
  id: string;
  name: string;
  projectUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  bucketName: string;
  notes?: string;
  active: boolean;
  status?: string;
  createdDate: string;
}

export default function SupabaseManager() {
  const [accounts, setAccounts] = useState<SupabaseAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [isCreatingBucket, setIsCreatingBucket] = useState<string | null>(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formAnonKey, setFormAnonKey] = useState("");
  const [formServiceRoleKey, setFormServiceRoleKey] = useState("");
  const [formBucketName, setFormBucketName] = useState("cryptopub-images");
  const [formNotes, setFormNotes] = useState("");
  const [makeBucketPublic, setMakeBucketPublic] = useState(true);

  // Status message state
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string; details?: any } | null>(null);
  const [bucketResult, setBucketResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [infoMessage, setInfoMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/supabase/accounts");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setAccounts(data);
          
          // Verify if our localStorage has any accounts, if not, save them as fallback
          const stored = localStorage.getItem("cryptopub_supabase_accounts");
          if (!stored) {
            localStorage.setItem("cryptopub_supabase_accounts", JSON.stringify(data));
          }
        } else {
          // Empty on server! Check if we have unmasked accounts in localStorage to restore
          const cached = localStorage.getItem("cryptopub_supabase_accounts");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log("[SupabaseManager] Server config is empty. Restoring from localStorage...");
                const importRes = await fetch("/api/supabase/accounts/import", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ importedAccounts: parsed })
                });
                if (importRes.ok) {
                  const importData = await importRes.json();
                  if (importData.success) {
                    setAccounts(importData.accounts);
                    console.log("[SupabaseManager] Accounts successfully restored to server.");
                  }
                }
              }
            } catch(e) {
              console.error("[SupabaseManager] Failed to restore from localStorage:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      showBanner("error", "Failed to load Supabase configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  const showBanner = (type: "success" | "error" | "info", text: string) => {
    setInfoMessage({ type, text });
    setTimeout(() => {
      setInfoMessage(null);
    }, 5000);
  };

  const handleActiveChange = async (id: string) => {
    try {
      const res = await fetch("/api/supabase/accounts/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAccounts(data.accounts);
          
          // Sync active state in localStorage
          const stored = localStorage.getItem("cryptopub_supabase_accounts");
          if (stored) {
            try {
              const localAccounts = JSON.parse(stored);
              if (Array.isArray(localAccounts)) {
                localAccounts.forEach((a: any) => a.active = (a.id === id));
                localStorage.setItem("cryptopub_supabase_accounts", JSON.stringify(localAccounts));
              }
            } catch (e) {}
          }
          
          showBanner("success", "Active account updated successfully.");
        }
      }
    } catch (err) {
      showBanner("error", "Failed to change active account.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim() || !formAnonKey.trim() || !formServiceRoleKey.trim()) {
      showBanner("error", "Please fill in all required fields.");
      return;
    }

    const payload = {
      id: editId || `acc-${Date.now()}`,
      name: formName.trim(),
      projectUrl: formUrl.trim().replace(/\/$/, ""), // remove trailing slash
      anonKey: formAnonKey.trim(),
      serviceRoleKey: formServiceRoleKey.trim(),
      bucketName: formBucketName.trim() || "cryptopub-images",
      notes: formNotes.trim(),
      active: editId ? (accounts.find(a => a.id === editId)?.active || false) : (accounts.length === 0)
    };

    try {
      const res = await fetch("/api/supabase/accounts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAccounts(data.accounts);
          
          // Update localStorage with the real unmasked credentials
          const stored = localStorage.getItem("cryptopub_supabase_accounts");
          let localAccounts: any[] = [];
          if (stored) {
            try {
              localAccounts = JSON.parse(stored);
            } catch (e) {}
          }
          if (!Array.isArray(localAccounts)) localAccounts = [];
          
          const existingIdx = localAccounts.findIndex(a => a.id === payload.id);
          const localPayload = { ...payload };
          if (payload.serviceRoleKey === "••••••••••••••••" && existingIdx >= 0) {
            localPayload.serviceRoleKey = localAccounts[existingIdx].serviceRoleKey;
          }
          
          if (existingIdx >= 0) {
            localAccounts[existingIdx] = localPayload;
          } else {
            localAccounts.push(localPayload);
          }
          
          const activeId = data.accounts.find((a: any) => a.active)?.id;
          localAccounts.forEach(a => a.active = (a.id === activeId));
          localStorage.setItem("cryptopub_supabase_accounts", JSON.stringify(localAccounts));

          resetForm();
          showBanner("success", editId ? "Account updated successfully." : "Account added successfully.");
        }
      }
    } catch (err) {
      showBanner("error", "Error saving account.");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormName("");
    setFormUrl("");
    setFormAnonKey("");
    setFormServiceRoleKey("");
    setFormBucketName("cryptopub-images");
    setFormNotes("");
    setShowForm(false);
  };

  const handleEdit = (acc: SupabaseAccount) => {
    setEditId(acc.id);
    setFormName(acc.name);
    setFormUrl(acc.projectUrl);
    setFormAnonKey(acc.anonKey);
    setFormServiceRoleKey(acc.serviceRoleKey);
    setFormBucketName(acc.bucketName);
    setFormNotes(acc.notes || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete account "${name}"?`)) return;
    try {
      const res = await fetch("/api/supabase/accounts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAccounts(data.accounts);
          
          // Also remove from localStorage on delete
          const stored = localStorage.getItem("cryptopub_supabase_accounts");
          if (stored) {
            try {
              let localAccounts = JSON.parse(stored);
              if (Array.isArray(localAccounts)) {
                localAccounts = localAccounts.filter((a: any) => a.id !== id);
                const activeId = data.accounts.find((a: any) => a.active)?.id;
                localAccounts.forEach((a: any) => a.active = (a.id === activeId));
                localStorage.setItem("cryptopub_supabase_accounts", JSON.stringify(localAccounts));
              }
            } catch(e) {}
          }
          
          showBanner("success", "Account deleted successfully.");
        }
      }
    } catch (err) {
      showBanner("error", "Failed to delete account.");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch("/api/supabase/accounts/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAccounts(data.accounts);
          
          // Also duplicate in localStorage
          const stored = localStorage.getItem("cryptopub_supabase_accounts");
          if (stored) {
            try {
              const localAccounts = JSON.parse(stored);
              if (Array.isArray(localAccounts)) {
                const src = localAccounts.find((a: any) => a.id === id);
                if (src) {
                  const duplicated = {
                    ...src,
                    id: data.accounts.find((a: any) => a.name.includes("(Copy)"))?.id || `acc-${Date.now()}`,
                    name: `${src.name} (Copy)`,
                    active: false
                  };
                  localAccounts.push(duplicated);
                  localStorage.setItem("cryptopub_supabase_accounts", JSON.stringify(localAccounts));
                }
              }
            } catch(e) {}
          }
          
          showBanner("success", "Account duplicated successfully.");
        }
      }
    } catch (err) {
      showBanner("error", "Failed to duplicate account.");
    }
  };

  const handleTestConnection = async (acc: SupabaseAccount) => {
    setIsTesting(acc.id);
    setTestResult(null);
    try {
      const res = await fetch("/api/supabase/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: acc.id,
          projectUrl: acc.projectUrl,
          serviceRoleKey: acc.serviceRoleKey,
          anonKey: acc.anonKey,
          bucketName: acc.bucketName
        })
      });
      if (res.ok) {
        const result = await res.json();
        setTestResult({
          id: acc.id,
          success: result.success,
          message: result.error ? `Failed: ${result.error}` : "All checks passed successfully!",
          details: result.details
        });
        fetchAccounts(); // Update status in local table
      }
    } catch (err: any) {
      setTestResult({
        id: acc.id,
        success: false,
        message: `Error testing connection: ${err.message}`
      });
    } finally {
      setIsTesting(null);
    }
  };

  const handleCreateBucket = async (acc: SupabaseAccount) => {
    setIsCreatingBucket(acc.id);
    setBucketResult(null);
    try {
      const res = await fetch("/api/supabase/create-bucket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: acc.id,
          projectUrl: acc.projectUrl,
          serviceRoleKey: acc.serviceRoleKey,
          bucketName: acc.bucketName,
          isPublic: makeBucketPublic
        })
      });
      if (res.ok) {
        const result = await res.json();
        setBucketResult({
          id: acc.id,
          success: result.success,
          message: result.success 
            ? `Bucket "${acc.bucketName}" created and configured successfully!`
            : `Failed to create bucket: ${result.error}`
        });
      }
    } catch (err: any) {
      setBucketResult({
        id: acc.id,
        success: false,
        message: `Error creating bucket: ${err.message}`
      });
    } finally {
      setIsCreatingBucket(null);
    }
  };

  const handleExport = () => {
    try {
      // Grab unmasked configurations from localStorage if they exist to provide a fully functional backup
      const stored = localStorage.getItem("cryptopub_supabase_accounts");
      let exportData = accounts;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            exportData = parsed;
          }
        } catch (e) {}
      }
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `cryptopub_supabase_accounts_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showBanner("success", "Accounts exported successfully.");
    } catch (err) {
      showBanner("error", "Failed to export accounts.");
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const imported = JSON.parse(text);
        
        const accountsList = Array.isArray(imported) ? imported : [imported];
        
        const res = await fetch("/api/supabase/accounts/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ importedAccounts: accountsList })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAccounts(data.accounts);
            
            // Also store imported unmasked accounts in localStorage
            localStorage.setItem("cryptopub_supabase_accounts", JSON.stringify(accountsList));
            
            showBanner("success", `Successfully imported ${accountsList.length} account(s).`);
          } else {
            showBanner("error", `Failed to import: ${data.error}`);
          }
        }
      } catch (err) {
        showBanner("error", "Failed to parse imported JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  return (
    <div className="space-y-6" id="supabase-manager-panel">
      {/* Upper Status / Feedback banner */}
      {infoMessage && (
        <div 
          className={`p-4 rounded-xl flex items-center justify-between gap-3 border ${
            infoMessage.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : infoMessage.type === "error" 
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          }`}
          id="manager-banner"
        >
          <div className="flex items-center gap-3">
            {infoMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : infoMessage.type === "error" ? (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Info className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{infoMessage.text}</span>
          </div>
          <button 
            onClick={() => setInfoMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl" id="supabase-main-container">
        {/* Header toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-md shadow-amber-500/5">
              <Database className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Supabase Configurations</h2>
              <p className="text-xs text-slate-400">Manage storage endpoints, public buckets, and security roles for asset publishing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImportClick}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-lg border border-white/5 flex items-center gap-1.5 transition-all"
              id="import-accounts-btn"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />

            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-lg border border-white/5 flex items-center gap-1.5 transition-all"
              id="export-accounts-btn"
              disabled={accounts.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
              id="add-account-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        {/* Configuration Form */}
        {showForm && (
          <form onSubmit={handleSave} className="p-6 border-b border-white/5 bg-slate-950/20 space-y-4" id="supabase-account-form">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-500" />
              <span>{editId ? "Edit Supabase Account" : "Add New Supabase Account"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Account Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Production Storage, Developer Project"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <span>Project URL</span>
                  <span className="text-rose-500">*</span>
                  <span className="text-[10px] text-amber-500/80 font-normal">(https://your-project.supabase.co)</span>
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://xyzabcdefg.supabase.co"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Anon Public Key <span className="text-rose-500">*</span></label>
                <input
                  type="password"
                  value={formAnonKey}
                  onChange={(e) => setFormAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Service Role Key (Encrypted Locally)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={formServiceRoleKey}
                  onChange={(e) => setFormServiceRoleKey(e.target.value)}
                  placeholder={editId ? "•••••••••••••••• (Leave as is or update)" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                  required={!editId}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Storage Bucket Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formBucketName}
                  onChange={(e) => setFormBucketName(e.target.value)}
                  placeholder="cryptopub-images"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Notes <span className="text-slate-600">(Optional)</span></label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Primary backup, test environment"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={makeBucketPublic}
                    onChange={(e) => setMakeBucketPublic(e.target.checked)}
                    className="rounded bg-slate-950 border-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-400 font-semibold select-none">☑ Make Bucket Public on Auto-Creation</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editId ? "Update Account" : "Add Account"}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Accounts Table List */}
        <div className="overflow-x-auto" id="supabase-table-wrapper">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3" id="table-loading">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              <span className="text-sm text-slate-400 font-medium">Loading storage configurations...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3" id="table-empty">
              <div className="w-12 h-12 rounded-full bg-slate-800/40 flex items-center justify-center border border-white/5">
                <Database className="w-6 h-6 text-slate-500" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-sm font-bold text-slate-200">No Supabase Accounts Configured</h4>
                <p className="text-xs text-slate-400">Add an account to enable automatic image hosting to private storage buckets. Inlined markdown assets will then be served securely from Supabase CDN.</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Configure Supabase Account</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" id="supabase-accounts-table">
              <thead>
                <tr className="bg-slate-950/40 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-16">Active</th>
                  <th className="py-3.5 px-4">Account Name</th>
                  <th className="py-3.5 px-4">Project URL</th>
                  <th className="py-3.5 px-4">Storage Bucket</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right w-44">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accounts.map((acc) => (
                  <React.Fragment key={acc.id}>
                    <tr 
                      className={`hover:bg-white/[0.02] transition-colors ${
                        acc.active ? "bg-amber-500/[0.01]" : ""
                      }`}
                    >
                      {/* Active Radio Button */}
                      <td className="py-4 px-4 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="radio"
                            name="activeAccountRadio"
                            checked={acc.active}
                            onChange={() => handleActiveChange(acc.id)}
                            className="w-4 h-4 text-amber-500 bg-slate-950 border-white/10 focus:ring-0 focus:ring-offset-0"
                          />
                        </label>
                      </td>

                      {/* Name with badges/notes */}
                      <td className="py-4 px-4 font-semibold text-slate-200 text-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{acc.name}</span>
                            {acc.active && (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-extrabold uppercase tracking-wide rounded border border-amber-500/15">
                                Active
                              </span>
                            )}
                          </div>
                          {acc.notes && (
                            <span className="text-[10px] text-slate-500 font-normal line-clamp-1">{acc.notes}</span>
                          )}
                        </div>
                      </td>

                      {/* Project URL */}
                      <td className="py-4 px-4 text-slate-300 text-xs font-mono">
                        <div className="flex items-center gap-1.5 max-w-xs truncate">
                          <span>{acc.projectUrl}</span>
                          <a 
                            href={acc.projectUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-slate-500 hover:text-amber-500 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Bucket name */}
                      <td className="py-4 px-4 text-slate-300 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-slate-950 px-2 py-1 rounded border border-white/5 text-[11px]">
                            {acc.bucketName}
                          </span>
                        </div>
                      </td>

                      {/* Status indicator */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`w-2 h-2 rounded-full ${
                              acc.status === "Connected" 
                                ? "bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" 
                                : acc.status === "Failed" 
                                  ? "bg-rose-500 shadow-sm shadow-rose-500/50" 
                                  : "bg-slate-500"
                            }`} 
                          />
                          <span className="text-xs text-slate-300 font-medium">{acc.status || "Not Tested"}</span>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="py-4 px-4 text-slate-400 text-xs">{acc.createdDate}</td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Connection Button */}
                          <button
                            onClick={() => handleTestConnection(acc)}
                            disabled={isTesting === acc.id}
                            className={`px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded flex items-center gap-1 border border-white/5 transition-all ${
                              isTesting === acc.id ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                            title="Verify keys, storage bucket existence, and write permissions"
                          >
                            {isTesting === acc.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-amber-500" />
                            )}
                            <span>Test</span>
                          </button>

                          {/* Create Bucket Button */}
                          <button
                            onClick={() => handleCreateBucket(acc)}
                            disabled={isCreatingBucket === acc.id}
                            className={`px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded flex items-center gap-1 border border-white/5 transition-all ${
                              isCreatingBucket === acc.id ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                            title="Create bucket if it does not already exist via Supabase API"
                          >
                            {isCreatingBucket === acc.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <FolderPlus className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>Bucket</span>
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(acc.id)}
                            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                            title="Duplicate settings"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(acc)}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit configurations"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(acc.id, acc.name)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Connection Test or Bucket Action Result Panel */}
                    {(testResult?.id === acc.id || bucketResult?.id === acc.id) && (
                      <tr className="bg-slate-950/30">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
                            {/* Connection Test Result */}
                            {testResult?.id === acc.id && (
                              <div className={`p-4 rounded-xl border ${
                                testResult.success 
                                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                                  : "bg-rose-500/5 border-rose-500/10 text-rose-400"
                              }`}>
                                <div className="flex items-start gap-2.5">
                                  {testResult.success ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-400 mt-0.5" />
                                  )}
                                  <div className="space-y-1">
                                    <h5 className="text-xs font-bold uppercase tracking-wider">Connection Test Outcome</h5>
                                    <p className="text-xs font-medium">{testResult.message}</p>
                                    
                                    {testResult.success && testResult.details && (
                                      <div className="mt-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded border border-white/5 space-y-1 text-slate-300">
                                        <div>🚀 API Connection: <span className="text-emerald-400 font-bold">Passed</span></div>
                                        <div>🔐 Service Role Auth: <span className="text-emerald-400 font-bold">Passed</span></div>
                                        <div>📦 Storage Bucket Existence ({acc.bucketName}): <span className="text-emerald-400 font-bold">Passed</span> ({testResult.details.bucketPublic ? "Public" : "Private"})</div>
                                        <div>📤 Sandbox Upload Permission: <span className="text-emerald-400 font-bold">Passed</span></div>
                                        <div>🌐 Public Address Resolution: <a href={testResult.details.samplePublicUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{testResult.details.samplePublicUrl}</a></div>
                                      </div>
                                    )}

                                    {!testResult.success && (
                                      <div className="mt-1.5 text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                                        Ensure your **Project URL** is complete, and both **Anon Key** and **Service Role Key** are accurate. Verify that the bucket **{acc.bucketName}** exists, or click the <span className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded font-bold">Bucket</span> operator on the right to create it automatically.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Bucket Creation Result */}
                            {bucketResult?.id === acc.id && (
                              <div className={`p-4 rounded-xl border ${
                                bucketResult.success 
                                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                                  : "bg-rose-500/5 border-rose-500/10 text-rose-400"
                              }`}>
                                <div className="flex items-start gap-2.5">
                                  {bucketResult.success ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-400 mt-0.5" />
                                  )}
                                  <div className="space-y-1">
                                    <h5 className="text-xs font-bold uppercase tracking-wider">Bucket Operations Outcome</h5>
                                    <p className="text-xs font-medium">{bucketResult.message}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  setTestResult(null);
                                  setBucketResult(null);
                                }}
                                className="text-[11px] text-slate-500 hover:text-slate-300 underline font-medium"
                              >
                                Close Results Panel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
