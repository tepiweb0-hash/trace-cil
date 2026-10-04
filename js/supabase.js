const SESSION_KEY = 'trace.cyberlab.supabase.session.v1';

export class CloudStore {
  constructor() {
    this.url = '';
    this.anon = '';
    this.session = this.readSession();
  }

  readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  }

  writeSession(session) {
    this.session = session;
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }

  async init() {
    try {
      const res = await fetch('/api/config', { cache: 'no-store' });
      if (!res.ok) return false;
      const cfg = await res.json();
      this.url = (cfg.supabaseUrl || '').replace(/\/$/, '');
      this.anon = cfg.supabaseAnonKey || '';
      if (!this.url || !this.anon) return false;
      if (this.session?.refresh_token && this.isExpiredSoon()) {
        await this.refresh();
      }
      return true;
    } catch {
      return false;
    }
  }

  get enabled() { return Boolean(this.url && this.anon); }
  get signedIn() { return Boolean(this.session?.access_token && this.session?.user?.id); }
  get user() { return this.session?.user || null; }

  isExpiredSoon() {
    const exp = this.session?.expires_at;
    if (!exp) return false;
    return Date.now() / 1000 > exp - 60;
  }

  async authRequest(path, body) {
    const res = await fetch(`${this.url}/auth/v1/${path}`, {
      method: 'POST',
      headers: { 'apikey': this.anon, 'Authorization': `Bearer ${this.anon}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.msg || data?.error_description || data?.message || 'Authentication failed');
    return data;
  }

  async signIn(email, password) {
    const data = await this.authRequest('token?grant_type=password', { email, password });
    this.writeSession(data);
    return data;
  }

  async signUp(email, password) {
    const data = await this.authRequest('signup', { email, password });
    if (data?.access_token) this.writeSession(data);
    return data;
  }

  async refresh() {
    if (!this.session?.refresh_token) return false;
    try {
      const data = await this.authRequest('token?grant_type=refresh_token', { refresh_token: this.session.refresh_token });
      this.writeSession(data);
      return true;
    } catch {
      this.writeSession(null);
      return false;
    }
  }

  async signOut() {
    const token = this.session?.access_token;
    try {
      if (token && this.enabled) {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: 'POST',
          headers: { 'apikey': this.anon, 'Authorization': `Bearer ${token}` }
        });
      }
    } finally {
      this.writeSession(null);
    }
  }

  async authedFetch(path, options = {}) {
    if (this.isExpiredSoon()) await this.refresh();
    if (!this.signedIn) throw new Error('Not signed in');
    const res = await fetch(`${this.url}${path}`, {
      ...options,
      headers: {
        'apikey': this.anon,
        'Authorization': `Bearer ${this.session.access_token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || data?.hint || `Cloud request failed (${res.status})`);
    }
    return res;
  }

  async loadState() {
    const uid = this.user?.id;
    if (!uid) return null;
    const res = await this.authedFetch(`/rest/v1/game_saves?user_id=eq.${encodeURIComponent(uid)}&select=state&limit=1`);
    const rows = await res.json();
    return rows?.[0]?.state || null;
  }

  async saveState(state) {
    const uid = this.user?.id;
    if (!uid) return;
    await this.authedFetch('/rest/v1/game_saves?on_conflict=user_id', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: uid, state, updated_at: new Date().toISOString() })
    });
  }
}
