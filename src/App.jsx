import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"
const C = {
  bg: '#f4f5f7',
  bgCard: '#ffffff',
  bgSidebar: '#1a1f2e',
  accent: '#2563eb',
  accentLight: 'rgba(37,99,235,0.08)',
  green: '#16a34a',
  greenLight: 'rgba(22,163,74,0.08)',
  red: '#dc2626',
  redLight: 'rgba(220,38,38,0.08)',
  text: '#111827',
  textMid: '#6b7280',
  textDim: '#9ca3af',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  font: '"Outfit", sans-serif',
  mono: '"JetBrains Mono", monospace',
  brand: '"Orbitron", sans-serif',
}
const PAGES = { DASHBOARD: 'dashboard', NEW_TRADE: 'new_trade', ZEN: 'zen', MENTOR: 'mentor', LOGIN: 'login', SETTINGS: 'settings' }
const NAV = [
  { id: 'dashboard', ico: '⊞', lbl: 'Dashboard' },
  { id: 'new_trade', ico: '+', lbl: 'Nuevo' },
  { id: 'zen', ico: '◎', lbl: 'Zen' },
  { id: 'mentor', ico: '⚡', lbl: 'Mentor' },
  { id: 'settings', ico: '⚙', lbl: 'Settings' },
]
const storage = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch { } },
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return isMobile
}

const inputSt = {
  width: '100%', background: '#fff', border: `1px solid ${C.border}`,
  borderRadius: 8, padding: '11px 13px', color: C.text, fontFamily: C.font,
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

const btnP = {
  background: C.accent, border: 'none', borderRadius: 8, padding: '12px 18px',
  color: '#fff', fontFamily: C.font, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  minHeight: 44,
}

export default function App() {
  const [page, setPage] = useState(PAGES.LOGIN)
  const [trades, setTrades] = useState([])
  const [user, setUser] = useState(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=JetBrains+Mono:wght@400;600&family=Outfit:wght@300;400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      setUser(session.user)
      setPage(PAGES.DASHBOARD)
      const t = storage.get('edge_trades')
      if (t) setTrades(t)
    }
  })
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  if (!session?.user) { setUser(null); setPage(PAGES.LOGIN) }
  else { setUser(session.user) }
})

  return () => subscription.unsubscribe()
}, [])

  const saveTrades = (t) => { setTrades(t); storage.set('edge_trades', t) }
  const handleLogin = (u) => { setUser(u); storage.set('edge_user', u); setPage(PAGES.DASHBOARD) }
  const handleAddTrade = (trade) => { saveTrades([...trades, { ...trade, id: Date.now() }]); setPage(PAGES.DASHBOARD) }
 const handleReset = () => { saveTrades([]); setPage(PAGES.DASHBOARD) }
const handleLogout = async () => { await supabase.auth.signOut() }
  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100vh',
      background: C.bg,
      fontFamily: C.font,
      color: C.text,
      overflow: 'hidden',
    }}>
      {!isMobile && <Sidebar page={page} setPage={setPage} user={user} />}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: isMobile ? '20px 16px' : '28px 32px',
        paddingBottom: isMobile ? '80px' : '28px',
      }}>
        {page === PAGES.DASHBOARD && <Dashboard trades={trades} setPage={setPage} isMobile={isMobile} />}
        {page === PAGES.NEW_TRADE && <NewTrade onAdd={handleAddTrade} onCancel={() => setPage(PAGES.DASHBOARD)} isMobile={isMobile} />}
        {page === PAGES.ZEN && <ZenMode isMobile={isMobile} />}
        {page === PAGES.MENTOR && <MentorIA trades={trades} isMobile={isMobile} />}
    {page === PAGES.SETTINGS && <Settings user={user} onReset={handleReset} onLogout={handleLogout} isMobile={isMobile} />}
      </div>
          {isMobile && <BottomNav page={page} setPage={setPage} />}
   </div>
  )
}

function Login({ onLogin, isMobile }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else onLogin(data.user)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setMessage('¡Revisá tu mail para confirmar tu cuenta!')
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.edgejournalapp.com'
    })
    if (error) setError(error.message)
    else setMessage('¡Revisá tu mail para resetear tu contraseña!')
    setLoading(false)
  }

  const action = mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgot

  return (
    <div style={{ background: '#f4f5f7', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ fontFamily: C.brand, color: C.accent, fontSize: 22, letterSpacing: 6, marginBottom: 6 }}>EDGE</div>
        <div style={{ color: C.textDim, fontSize: 11, letterSpacing: 3, marginBottom: 36, fontFamily: C.mono }}>TRADING JOURNAL</div>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 20 }}>
            {mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña'}
          </div>
          {error && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: C.red, marginBottom: 14, textAlign: 'left' }}>{error}</div>}
          {message && <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: C.green, marginBottom: 14, textAlign: 'left' }}>{message}</div>}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            type="email" style={inputSt} onKeyDown={e => e.key === 'Enter' && action()} />
          {mode !== 'forgot' && (
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña" style={{ ...inputSt, marginTop: 12 }}
              onKeyDown={e => e.key === 'Enter' && action()} />
          )}
          <button onClick={action} disabled={loading}
            style={{ ...btnP, width: '100%', marginTop: 18, padding: '13px', opacity: loading ? 0.6 : 1 }}>
            {loading ? '...' : mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear Cuenta' : 'Enviar Link'}
          </button>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mode === 'login' && <>
              <button onClick={() => { setMode('register'); setError(''); setMessage('') }}
                style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontFamily: C.font }}>
                ¿No tenés cuenta? Registrate
              </button>
              <button onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                style={{ background: 'none', border: 'none', color: C.textMid, cursor: 'pointer', fontSize: 12, fontFamily: C.font }}>
                Olvidé mi contraseña
              </button>
            </>}
            {mode !== 'login' && (
              <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
                style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13, fontFamily: C.font }}>
                ← Volver al login
              </button>
            )}
          </div>
        </div>
        <div style={{ color: C.textDim, fontSize: 10, marginTop: 18, fontFamily: C.mono }}>Edge Journal · v1.0</div>
      </div>
    </div>
  )
}
function Sidebar({ page, setPage, user }) {
  return (
    <div style={{ width: 200, background: C.bgSidebar, display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: C.brand, color: '#fff', fontSize: 14, letterSpacing: 4 }}>EDGE</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 2, marginTop: 3, fontFamily: C.mono }}>TRADING JOURNAL</div>
      </div>
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%',
            background: page === n.id ? 'rgba(37,99,235,0.2)' : 'transparent',
            color: page === n.id ? '#60a5fa' : 'rgba(255,255,255,0.5)',
            fontFamily: C.font, fontSize: 13, fontWeight: page === n.id ? 600 : 400,
            minHeight: 44,
          }}>
            <span style={{ fontSize: 16 }}>{n.ico}</span> {n.lbl}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {user?.username?.[0]?.toUpperCase() || 'R'}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{user?.username || 'Trader'}</div>
      </div>
    </div>
  )
}

function BottomNav({ page, setPage }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: C.bgSidebar,
      display: 'flex',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(n => (
        <button key={n.id} onClick={() => setPage(n.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 3, padding: '10px 4px 12px', border: 'none', cursor: 'pointer',
          background: page === n.id ? 'rgba(37,99,235,0.18)' : 'transparent',
          color: page === n.id ? '#60a5fa' : 'rgba(255,255,255,0.45)',
          fontFamily: C.font, minHeight: 56,
          borderTop: page === n.id ? `2px solid #60a5fa` : '2px solid transparent',
        }}>
          <span style={{ fontSize: 18 }}>{n.ico}</span>
          <span style={{ fontSize: 9, letterSpacing: 0.5, fontWeight: page === n.id ? 600 : 400 }}>{n.lbl}</span>
        </button>
      ))}
    </div>
  )
}

function Dashboard({ trades, setPage, isMobile }) {
  const wins = trades.filter(t => parseFloat(t.result) > 0)
  const losses = trades.filter(t => parseFloat(t.result) <= 0)
  const wr = trades.length ? Math.round(wins.length / trades.length * 100) : 0
  const pnl = trades.reduce((s, t) => s + parseFloat(t.result || 0), 0)
  const avgW = wins.length ? wins.reduce((s, t) => s + parseFloat(t.result), 0) / wins.length : 0
  const avgL = losses.length ? Math.abs(losses.reduce((s, t) => s + parseFloat(t.result), 0) / losses.length) : 0
  const calData = {}
  trades.forEach(t => { calData[t.date] = (calData[t.date] || 0) + parseFloat(t.result || 0) })
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (34 - i))
    const k = d.toISOString().split('T')[0]
    return { k, v: calData[k] ?? null, d: d.getDate() }
  })

  const stats = [
    { label: 'Win Rate', val: `${wr}%`, sub: `${wins.length}/${trades.length} trades`, col: wr >= 50 ? C.green : C.red },
    { label: 'Net PnL', val: `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)}`, sub: 'periodo total', col: pnl >= 0 ? C.green : C.red },
    { label: 'Avg Win', val: `$${avgW.toFixed(0)}`, sub: `Loss: $${avgL.toFixed(0)}`, col: C.accent },
    { label: 'Trades', val: trades.length, sub: 'ejecutados', col: C.accent },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 18 : 28 }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: C.text }}>Dashboard</div>
          <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <button onClick={() => setPage(PAGES.NEW_TRADE)} style={{ ...btnP, display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '10px 14px' : '10px 18px', fontSize: isMobile ? 13 : 14 }}>
          + {isMobile ? '' : 'Nuevo Trade'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 14 : 20 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: isMobile ? '14px 16px' : '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 10, color: C.textMid, fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: s.col, fontFamily: C.mono }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 14 }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: isMobile ? '16px' : '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: C.text }}>Calendario de Performance</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: isMobile ? 3 : 4 }}>
            {['L','M','X','J','V','S','D'].map((d, i) => (
              <div key={i} style={{ fontSize: 9, color: C.textDim, textAlign: 'center', paddingBottom: 5, fontWeight: 500 }}>{d}</div>
            ))}
            {days.map((d, i) => (
              <div key={i} title={d.k + (d.v !== null ? `: $${d.v.toFixed(0)}` : '')} style={{
                aspectRatio: '1', borderRadius: 4,
                background: d.v === null ? '#f9fafb' : d.v > 0 ? `rgba(22,163,74,${Math.min(0.85, 0.15 + Math.abs(d.v) / 500)})` : `rgba(220,38,38,${Math.min(0.85, 0.15 + Math.abs(d.v) / 500)})`,
                border: `1px solid ${d.v === null ? C.border : d.v > 0 ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: d.v === null ? C.textDim : d.v > 0 ? '#14532d' : '#7f1d1d', fontWeight: 500,
              }}>{d.d}</div>
            ))}
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: isMobile ? '16px' : '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.text }}>Trades Recientes</div>
          {trades.length === 0
            ? <div style={{ color: C.textDim, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sin trades aun</div>
            : [...trades].reverse().slice(0, isMobile ? 4 : 6).map(t => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                background: parseFloat(t.result) > 0 ? C.greenLight : C.redLight,
                border: `1px solid ${parseFloat(t.result) > 0 ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{t.instrument} · {t.direction}</div>
                  <div style={{ fontSize: 10, color: C.textMid, marginTop: 2 }}>{t.date} · {t.session}</div>
                  {t.tvLink && (
                    <a href={t.tvLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 9, color: C.accent, textDecoration: 'none', fontFamily: C.mono }}>
                      📊 TradingView
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.image && (
                    <img src={t.image} alt="trade" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', border: `1px solid ${C.border}` }} />
                  )}
                  <div style={{ fontFamily: C.mono, fontSize: 13, fontWeight: 700, color: parseFloat(t.result) > 0 ? C.green : C.red }}>
                    {parseFloat(t.result) > 0 ? '+' : ''}${parseFloat(t.result).toFixed(0)}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

const INSTRUMENTS = ['NQ','MNQ','ES','MES','YM','MYM','RTY','M2K','GC','CL','SI','BTC','ETH','SPY','QQQ','IWM','Otro']
const DRAFT_KEY = 'edge_trade_draft'
function NewTrade({ onAdd, onCancel, isMobile }) {
  const [form, setForm] = useState(() => storage.get(DRAFT_KEY) || {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    instrument: 'NQ', direction: 'Long', session: 'NY Open',
    setup: 'A+', result: '', emotion: 3, notes: '', tvLink: '', image: '', customInstrument: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const fileRef = useRef(null)

  useEffect(() => { storage.set(DRAFT_KEY, form) }, [form])

  const handleAdd = () => {
    if (!form.result) return
    const finalInstrument = form.instrument === 'Otro' ? (form.customInstrument || 'Otro') : form.instrument
    storage.set(DRAFT_KEY, null)
    onAdd({ ...form, instrument: finalInstrument })
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Imagen muy grande. Máximo 2MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => set('image', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginBottom: 4, color: C.text }}>Nuevo Trade</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>Registra tu operacion</div>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 20 : 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <F label="Fecha"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputSt} /></F>
          <F label="Hora NY"><input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={inputSt} /></F>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <F label="Instrumento">
            <select value={form.instrument} onChange={e => set('instrument', e.target.value)} style={{ ...inputSt, cursor: 'pointer', minHeight: 44 }}>
              {INSTRUMENTS.map(o => <option key={o}>{o}</option>)}
            </select>
            {form.instrument === 'Otro' && (
              <input value={form.customInstrument} onChange={e => set('customInstrument', e.target.value)}
                placeholder="ej: EURUSD, AAPL, BTC..." style={{ ...inputSt, marginTop: 8 }} />
            )}
          </F>
          <F label="Direccion"><Sel value={form.direction} opts={['Long','Short']} onChange={v => set('direction', v)} /></F>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <F label="Sesion"><Sel value={form.session} opts={['Pre-Market','NY Open','NY AM','NY Lunch']} onChange={v => set('session', v)} /></F>
          <F label="Setup"><Sel value={form.setup} opts={['A+','A','B','B-']} onChange={v => set('setup', v)} /></F>
        </div>
        <F label="Resultado ($)">
          <input type="number" inputMode="decimal" value={form.result} onChange={e => set('result', e.target.value)}
            placeholder="ej: 450 o -200"
            style={{ ...inputSt, color: form.result > 0 ? C.green : form.result < 0 ? C.red : C.text, fontWeight: 600 }} />
        </F>
        <F label="Link TradingView (opcional)">
          <input type="url" value={form.tvLink} onChange={e => set('tvLink', e.target.value)}
            placeholder="https://www.tradingview.com/chart/..." style={inputSt} />
        </F>
        <F label="Screenshot del trade (opcional)">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => fileRef.current.click()} style={{
              padding: '10px 16px', background: '#f9fafb', border: `1px solid ${C.border}`,
              borderRadius: 8, cursor: 'pointer', fontFamily: C.font, fontSize: 13, color: C.textMid, minHeight: 44,
            }}>📷 Subir imagen</button>
            {form.image && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={form.image} alt="preview" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: `1px solid ${C.border}` }} />
                <button onClick={() => set('image', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 16 }}>✕</button>
              </div>
            )}
          </div>
        </F>
        <F label="Estado emocional">
          <div style={{ display: 'flex', gap: isMobile ? 6 : 8, paddingTop: 4 }}>
            {['😫','😟','😐','😊','🧘'].map((e, i) => (
              <button key={i} onClick={() => set('emotion', i + 1)} style={{
                fontSize: isMobile ? 24 : 22, border: `2px solid ${form.emotion === i + 1 ? C.accent : C.border}`,
                background: form.emotion === i + 1 ? C.accentLight : '#fff', borderRadius: 8,
                padding: isMobile ? '7px 10px' : '5px 9px', cursor: 'pointer', flex: 1, minHeight: 44,
              }}>{e}</button>
            ))}
          </div>
        </F>
        <F label="Notas / Reflexion">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Seguiste el plan? Que aprendiste?" rows={3}
            style={{ ...inputSt, resize: 'vertical', lineHeight: 1.7 }} />
        </F>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={() => { storage.set(DRAFT_KEY, null); onCancel() }} style={{ flex: 1, padding: '13px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMid, cursor: 'pointer', fontFamily: C.font, fontSize: 14, minHeight: 44 }}>Cancelar</button>
          <button onClick={handleAdd} style={{ ...btnP, flex: 2, padding: '13px' }}>Guardar Trade</button>
        </div>
      </div>
    </div>
  )
}

function F({ label, children }) {
  return <div><div style={{ fontSize: 11, color: C.textMid, fontWeight: 500, marginBottom: 6 }}>{label}</div>{children}</div>
}

function Sel({ value, opts, onChange }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputSt, cursor: 'pointer', minHeight: 44 }}>{opts.map(o => <option key={o}>{o}</option>)}</select>
}

function ZenMode({ isMobile }) {
  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState(0)
  const [count, setCount] = useState(4)
  const [cycles, setCycles] = useState(0)
  const [big, setBig] = useState(false)
  const ref = useRef(null)
  const PHASES = ['','INHALA','SOSTEN','EXHALA','SOSTEN']
  const COLS = ['','#2563eb','#7c3aed','#16a34a','#7c3aed']
  const toggle = () => {
    if (active) { clearInterval(ref.current); setActive(false); setPhase(0); setCount(4); setCycles(0); setBig(false); return }
    setActive(true); let p = 1, c = 4; setPhase(1); setCount(4); setBig(true)
    ref.current = setInterval(() => {
      c--; if (c <= 0) { p = p % 4 + 1; c = 4; if (p === 1) setCycles(x => x + 1); setPhase(p); setBig(p === 1 || p === 2) }
      setCount(c)
    }, 1000)
  }
  useEffect(() => () => clearInterval(ref.current), [])
  const col = active ? COLS[phase] : C.borderStrong
  const circleSize = isMobile ? 160 : 190
  const innerSize = big ? (isMobile ? 110 : 130) : (isMobile ? 64 : 76)

  return (
    <div style={{ textAlign: 'center', paddingTop: isMobile ? 8 : 16 }}>
      <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginBottom: 4, color: C.text }}>Modo Zen</div>
      <div style={{ fontSize: 11, color: C.textMid, letterSpacing: 2, marginBottom: isMobile ? 32 : 44, fontFamily: C.mono }}>BOX BREATHING · NAVY SEALs · 4:4:4:4</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: circleSize, height: circleSize, borderRadius: '50%', border: `2px solid ${col}`, marginBottom: 24, transition: 'border-color 1s', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ width: innerSize, height: innerSize, borderRadius: '50%', border: `3px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 1s ease-in-out', background: active ? `${col}18` : '#f9fafb' }}>
          {active && <div style={{ fontFamily: C.mono, fontSize: isMobile ? 24 : 28, fontWeight: 700, color: col }}>{count}</div>}
        </div>
      </div>
      <div style={{ height: 28, marginBottom: 4, fontSize: 13, fontWeight: 600, letterSpacing: 4, fontFamily: C.mono, color: col }}>{active ? PHASES[phase] : ''}</div>
      <div style={{ height: 20, marginBottom: 28, fontSize: 12, color: C.textMid }}>{cycles > 0 ? `Ciclos: ${cycles}` : ''}</div>
      <button onClick={toggle} style={{ ...btnP, padding: '13px 48px', background: active ? '#fff' : C.accent, color: active ? C.red : '#fff', border: active ? `2px solid ${C.red}` : 'none', fontSize: 14 }}>
        {active ? 'Detener' : 'Comenzar'}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: isMobile ? 8 : 10, maxWidth: 420, margin: '32px auto 0' }}>
        {[['INHALA','4s','#2563eb','#eff6ff'],['SOSTEN','4s','#7c3aed','#f5f3ff'],['EXHALA','4s','#16a34a','#f0fdf4'],['SOSTEN','4s','#7c3aed','#f5f3ff']].map(([l,t,c,bg],i) => (
          <div key={i} style={{ background: bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: isMobile ? '10px 6px' : '12px 8px' }}>
            <div style={{ fontSize: 8, color: C.textMid, letterSpacing: 1, fontFamily: C.mono, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, fontFamily: C.mono, color: c }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MentorIA({ trades, isMobile }) {
  const [msgs, setMsgs] = useState([{ role: 'assistant', text: 'Hola! Soy tu Mentor IA. Tengo acceso a tu historial de trades. Preguntame sobre tu performance, patrones o que podes mejorar.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async () => {
    if (!input.trim() || loading) return
    const txt = input.trim(); setInput('')
    setMsgs(m => [...m, { role: 'user', text: txt }])
    setLoading(true)
    const ctx = trades.length > 0 ? `Trades:\n${trades.map(t => `${t.date} | ${t.instrument} ${t.direction} | ${t.session} | Setup ${t.setup} | $${t.result}`).join('\n')}` : 'Sin trades aun.'
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: `Eres el Mentor IA de Edge Journal. Trading ICT/Smart Money. Español argentino, directo y preciso. ${ctx}`,
          messages: msgs.concat({ role: 'user', text: txt }).slice(-12).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })) })
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'assistant', text: data.content?.[0]?.text || 'Error.' }])
    } catch { setMsgs(m => [...m, { role: 'assistant', text: 'Conectando con el servidor...' }]) }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100vh - 136px)' : 'calc(100vh - 56px)', maxWidth: 680 }}>
      <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginBottom: 4, color: C.text }}>Mentor IA</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 14 }}>Tu coach de trading personal</div>
      <div style={{ flex: 1, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: isMobile ? 14 : 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', WebkitOverflowScrolling: 'touch' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: isMobile ? '88%' : '80%', padding: '11px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.7,
              background: m.role === 'user' ? C.accent : '#f9fafb', color: m.role === 'user' ? '#fff' : C.text,
              border: `1px solid ${m.role === 'user' ? C.accent : C.border}`,
              borderBottomRightRadius: m.role === 'user' ? 3 : 12, borderBottomLeftRadius: m.role === 'assistant' ? 3 : 12 }}>
              {m.role === 'assistant' && <div style={{ fontSize: 9, color: C.accent, fontFamily: C.mono, letterSpacing: 1, marginBottom: 5, fontWeight: 600 }}>MENTOR IA</div>}
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '11px 14px', borderRadius: 12, background: '#f9fafb', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.accent, fontFamily: C.mono, marginBottom: 4 }}>MENTOR IA</div>
              <div style={{ color: C.textMid, fontSize: 12 }}>Analizando...</div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Pregunta sobre tu performance..." style={{ ...inputSt, flex: 1 }} disabled={loading} />
        <button onClick={send} disabled={loading || !input.trim()} style={{ ...btnP, opacity: loading || !input.trim() ? 0.4 : 1, padding: '12px 16px', minWidth: 44 }}>→</button>
      </div>
    </div>
  )
}
function Settings({ user, onReset, onLogout, isMobile }) {
  const [profile, setProfile] = useState(() => storage.get('edge_profile') || {
    name: user?.username || '', broker: '', accountSize: '', riskPct: '1',
  })
  const [resetConfirm, setResetConfirm] = useState(false)
  const [saved, setSaved] = useState(false)
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const save = () => {
    storage.set('edge_profile', profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginBottom: 4, color: C.text }}>Configuración</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>Perfil y preferencias del journal</div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 20 : 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMid, letterSpacing: 1, marginBottom: 18, fontFamily: C.mono }}>PERFIL DEL TRADER</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <F label="Nombre / Handle">
            <input value={profile.name} onChange={e => set('name', e.target.value)} placeholder="Tu nombre o alias" style={inputSt} />
          </F>
          <F label="Broker / Plataforma">
            <input value={profile.broker} onChange={e => set('broker', e.target.value)} placeholder="ej: Apex, FTMO, Topstep..." style={inputSt} />
          </F>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <F label="Tamaño de Cuenta ($)">
              <input type="number" value={profile.accountSize} onChange={e => set('accountSize', e.target.value)} placeholder="ej: 50000" style={inputSt} />
            </F>
            <F label="Riesgo Máximo (%)">
              <input type="number" value={profile.riskPct} onChange={e => set('riskPct', e.target.value)} placeholder="ej: 1" style={inputSt} />
            </F>
          </div>
          <button onClick={save} style={{ ...btnP, width: '100%', padding: '13px', background: saved ? C.green : C.accent }}>
            {saved ? '✓ Guardado' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div style={{ background: C.bgCard, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 16, padding: isMobile ? 20 : 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.red, letterSpacing: 1, marginBottom: 18, fontFamily: C.mono }}>⚠️ Careful — this deletes everything permanently · Ojo — borrás todo. No hay vuelta atrás.</div>
        {!resetConfirm ? (
          <button onClick={() => setResetConfirm(true)} style={{ width: '100%', padding: '13px', background: '#fff', border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, cursor: 'pointer', fontFamily: C.font, fontSize: 14, fontWeight: 600, minHeight: 44 }}>
            🗑️ Resetear Journal
          </button>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 14, lineHeight: 1.6 }}>
              ⚠️ <strong>¿Estás seguro?</strong> Se borrarán <strong>todos</strong> los trades. Esta acción no se puede deshacer.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setResetConfirm(false)} style={{ flex: 1, padding: '13px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMid, cursor: 'pointer', fontFamily: C.font, fontSize: 14, minHeight: 44 }}>
                Cancelar
              </button>
              <button onClick={onReset} style={{ flex: 1, padding: '13px', background: C.red, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: 14, fontWeight: 600, minHeight: 44 }}>
                Sí, borrar todo
              </button>
            </div>
          </div>
        )}
      </div>

      <button onClick={onLogout} style={{ width: '100%', padding: '13px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMid, cursor: 'pointer', fontFamily: C.font, fontSize: 14, minHeight: 44 }}>
        Cerrar Sesión
      </button>
    </div>
  )
}