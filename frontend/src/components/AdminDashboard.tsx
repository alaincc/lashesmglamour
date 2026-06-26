import React, { useState, useEffect } from "react";

interface APIStatus {
  status: string;
  database_connected: boolean;
  redis_connected: boolean;
  cached_services_count: number;
  square_environment: string;
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ status: string; message: string } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://localhost:8000/api/v1";

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
    }
    fetchStatus();
  }, []);

  // Fetch status whenever token changes or on mount
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/status`);
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch API status:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Invalid credentials. Try again.");
      }

      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      setToken(data.access_token);
      setUsername("");
      setPassword("");
      fetchStatus();
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setSyncResult(null);
    setError(null);
  };

  const handleSync = async () => {
    if (!token) return;
    setIsSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const res = await fetch(`${API_BASE}/admin/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Manual synchronization failed.");
      }

      const data = await res.json();
      setSyncResult(data);
      fetchStatus();
    } catch (err: any) {
      setError(err.message || "Sync execution failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-border pb-6 mb-10 gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl text-brand-charcoal font-extrabold tracking-wide">
            Admin Management
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase mt-1">
            Lashes & MGlamour Control Panel
          </p>
        </div>
        {token && (
          <button
            onClick={handleLogout}
            className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded transition-all"
          >
            Log Out
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* LOGIN VIEW */}
      {!token ? (
        <div className="max-w-md mx-auto bg-white border border-brand-border p-8 rounded-2xl shadow-sm">
          <h2 className="font-heading text-xl text-brand-charcoal font-bold mb-6 text-center">
            Sign In to Dashboard
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-charcoal hover:bg-brand-pink text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      ) : (
        /* LOGGED IN DASHBOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Status section */}
          <div className="md:col-span-1 bg-brand-light-pink border border-brand-pink/10 p-6 rounded-2xl space-y-6">
            <h2 className="font-heading text-lg text-brand-pink font-bold border-b border-brand-pink/10 pb-3">
              API Diagnostics
            </h2>
            
            <div className="space-y-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
              <div className="flex justify-between items-center">
                <span>Database</span>
                <span className={`px-2 py-1 rounded text-[10px] text-white ${apiStatus?.database_connected ? "bg-emerald-500" : "bg-red-500"}`}>
                  {apiStatus?.database_connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Redis cache</span>
                <span className={`px-2 py-1 rounded text-[10px] text-white ${apiStatus?.redis_connected ? "bg-emerald-500" : "bg-zinc-400"}`}>
                  {apiStatus?.redis_connected ? "Connected" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Square Env</span>
                <span className="bg-brand-charcoal text-white px-2 py-1 rounded text-[10px]">
                  {apiStatus?.square_environment || "unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-brand-pink/10 pt-4">
                <span className="text-[10px] text-zinc-500 font-bold">Cached Services</span>
                <span className="text-brand-pink text-sm font-bold">{apiStatus?.cached_services_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Sync operations section */}
          <div className="md:col-span-2 bg-white border border-brand-border p-6 rounded-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="font-heading text-lg text-brand-charcoal font-bold border-b border-brand-border pb-3">
                Synchronizer Controls
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Manually trigger a full catalog synchronization loop with your live Square Developer account. 
                This downloads and maps all catalog category configurations, item variants, pricing, and active team members.
              </p>
            </div>

            <div className="pt-6 border-t border-brand-border space-y-4">
              {syncResult && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm">
                  ✓ {syncResult.message}
                </div>
              )}
              
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full md:w-auto bg-brand-pink hover:bg-brand-pink-hover text-white font-bold uppercase tracking-wider text-xs px-8 py-3.5 rounded transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? "Executing sync with Square..." : "Trigger Manual Sync"}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
