import { useState, useEffect, useRef } from "react"

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

const PAGES = { DASHBOARD: 'dashboard', NEW_TRADE: 'new_trade', ZEN: 'zen', MENTOR: 'mentor', LOGIN: 'login' }
const NAV = [
  { id: 'dashboard', ico: '⊞', lbl: 'Dashboard' },
  { id: 'new_trade', ico: '+', lbl: 'Nuevo' },
  { id: 'zen', ico: '◎', lbl: 'Zen' },
  { id: 'mentor', ico: '⚡', lbl: 'Mentor' },
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
    const t = storage.get('ifvg_trades')
    const u = storage.get('ifvg_user')
    if (t) setTrades(t)
    if (u) { setUser(u); setPage(PAGES.DASHBOARD) }
  }, [])

  const saveTrades = (t) => { setTrades(t); storage.set('ifvg_trades', t) }
  const handleLogin = (u) => { setUser(u); storage.set('ifvg_user', u); setPage(PAGES.DASHBOARD) }
  const handleAddTrade = (trade) => { saveTrades([...trades, { ...trade, id: Date.now() }]); setPage(PAGES.DASHBOARD) }

  if (page === PAGES.LOGIN) return <Login onLogin={handleLogin} isMobile={isMobile} />

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
      </div>

      {isMobile && <BottomNav page={page} setPage={setPage} />}
    </div>
  )
}

function Login({ onLogin, isMobile }) {
  const [username, setUsername] = useState('')
  const submit = () => { if (username.trim()) onLogin({ username: username.trim() }) }
  return (
    <div style={{ background: '#f4f5f7', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ fontFamily: C.brand, color: C.accent, fontSize: 22, letterSpacing: 6, marginBottom: 6 }}>IFVG</div>
        <div style={{ color: C.textDim, fontSize: 11, letterSpacing: 3, marginBottom: 36, fontFamily: C.mono }}>TRADING JOURNAL</div>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario"
            style={inputSt} onKeyDown={e => e.key === 'Enter' && submit()} />
          <input type="password" placeholder="Contrasena" style={{ ...inputSt, marginTop: 12 }} onKeyDown={e => e.key === 'Enter' && submit()} />
          <button onClick={submit} style={{ ...btnP, width: '100%', marginTop: 18, padding: '13px' }}>Ingresar</button>
        </div>
        <div style={{ color: C.textDim, fontSize: 10, marginTop: 18, fontFamily: C.mono }}>IFVG Journal · Raulo & Samy · v1.0</div>
      </div>
    </div>
  )
}

function Sidebar({ page, setPage, user }) {
  return (
    <div style={{ width: 200, background: C.bgSidebar, display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: C.brand, color: '#fff', fontSize: 14, letterSpacing: 4 }}>IFVG</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: isMobile ? 14 : 14 }}>
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
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{t.instrument} · {t.direction}</div>
                  <div style={{ fontSize: 10, color: C.textMid, marginTop: 2 }}>{t.date} · {t.session}</div>
                </div>
                <div style={{ fontFamily: C.mono, fontSize: 13, fontWeight: 700, color: parseFloat(t.result) > 0 ? C.green : C.red }}>
                  {parseFloat(t.result) > 0 ? '+' : ''}${parseFloat(t.result).toFixed(0)}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function NewTrade({ onAdd, onCancel, isMobile }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    instrument: 'NQ', direction: 'Long', session: 'NY Open',
    setup: 'A+', result: '', emotion: 3, notes: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
          <F label="Instrumento"><Sel value={form.instrument} opts={['NQ','MNQ','ES','MES']} onChange={v => set('instrument', v)} /></F>
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
        <F label="Estado emocional">
          <div style={{ display: 'flex', gap: isMobile ? 6 : 8, paddingTop: 4 }}>
            {['😫','😟','😐','😊','🧘'].map((e, i) => (
              <button key={i} onClick={() => set('emotion', i + 1)} style={{
                fontSize: isMobile ? 24 : 22, border: `2px solid ${form.emotion === i + 1 ? C.accent : C.border}`,
                background: form.emotion === i + 1 ? C.accentLight : '#fff', borderRadius: 8,
                padding: isMobile ? '7px 10px' : '5px 9px', cursor: 'pointer', flex: 1,
                minHeight: 44,
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
          <button onClick={onCancel} style={{ flex: 1, padding: '13px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMid, cursor: 'pointer', fontFamily: C.font, fontSize: 14, minHeight: 44 }}>Cancelar</button>
          <button onClick={() => { if (!form.result) return; onAdd(form) }} style={{ ...btnP, flex: 2, padding: '13px' }}>Guardar Trade</button>
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
          system: `Mentor de trading IFVG/ICT. Espanol argentino, directo. ${ctx}`,
          messages: msgs.concat({ role: 'user', text: txt }).slice(-12).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })) })
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'assistant', text: data.content?.[0]?.text || 'Error.' }])
    } catch { setMsgs(m => [...m, { role: 'assistant', text: 'El Mentor IA funciona completamente cuando subamos a Vercel.' }]) }
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