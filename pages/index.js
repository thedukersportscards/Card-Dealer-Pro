import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'dealer-pro-v1';
function loadInventory() {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function persistInventory(inv) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inv)); } catch {}
}

async function identifyCard(file) {
  const base64 = await fileToBase64(file);
  const mediaType = file.type || 'image/jpeg';
  const res = await fetch('/api/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mediaType })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Identification failed');
  return data;
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = () => rej(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

const blank = () => ({
  name: '', year: '', set: '', parallel: '', cardNum: '',
  sport: 'Football', grade: 'Raw', status: 'inventory',
  date: new Date().toISOString().split('T')[0],
  cost: '', market: '', target: '', floor: '',
  confidence: 'medium', notes: ''
});

const GRADES = ['Raw','PSA 10','PSA 9','PSA 8','BGS 9.5','BGS 9','SGC 10','SGC 9','CGC 10'];
const SPORTS = ['Football','Basketball','Baseball','Hockey','Soccer','Other'];

function Spinner({ size = 18 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid var(--brd)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0
    }} />
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 11, fontWeight: 700, color: 'var(--gold)',
      textTransform: 'uppercase', letterSpacing: 1,
      marginBottom: 10, paddingBottom: 6,
      borderBottom: '1px solid var(--brd)'
    }}>{children}</div>
  );
}

const inputStyle = {
  background: 'var(--surf2)', border: '1px solid var(--brd)',
  borderRadius: 6, color: 'var(--txt)',
  fontSize: 15, padding: '10px 12px', width: '100%', outline: 'none'
};

function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      <input style={inputStyle} {...props} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      <select style={{ ...inputStyle, appearance: 'none' }} {...props}>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

function BtnPrimary({ children, style, ...props }) {
  return (
    <button style={{
      width: '100%', padding: 15,
      background: 'var(--gold)', color: '#0f0f0f',
      border: 'none', borderRadius: 8,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 17, fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: 1,
      cursor: 'pointer', marginTop: 8, ...style
    }} {...props}>{children}</button>
  );
}

function BtnSecondary({ children, style, ...props }) {
  return (
    <button style={{
      width: '100%', padding: 13,
      background: 'transparent', color: 'var(--txt2)',
      border: '1px solid var(--brd)', borderRadius: 8,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 15, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: 0.5,
      cursor: 'pointer', marginTop: 8, ...style
    }} {...props}>{children}</button>
  );
}

function CardFormFields({ form, setForm }) {
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const cost = parseFloat(form.cost) || 0;
  const target = parseFloat(form.target) || 0;
  const floor = parseFloat(form.floor) || 0;
  const market = parseFloat(form.market) || 0;
  const showMargin = cost > 0 && (target > 0 || floor > 0 || market > 0);
  const marginPct = v => {
    if (!cost || !v) return null;
    const p = ((v - cost) / cost * 100).toFixed(0);
    return { p, pos: parseFloat(p) >= 0 };
  };
  const MarginVal = ({ v }) => {
    const r = marginPct(v);
    if (!r) return <span style={{ color: 'var(--txt3)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800 }}>—</span>;
    return <span style={{ color: r.pos ? 'var(--grn)' : 'var(--red)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800 }}>{r.pos ? '+' : ''}{r.p}%</span>;
  };
  const confColors = { low: 'var(--red)', medium: 'var(--gold)', high: 'var(--grn)' };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <SectionTitle>Card Details</SectionTitle>
        <div style={{ marginBottom: 10 }}>
          <Input label="Player / Card Name" value={form.name} onChange={upd('name')} placeholder="e.g. Patrick Mahomes" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <Input label="Year" value={form.year} onChange={upd('year')} placeholder="2023" inputMode="numeric" />
          <Input label="Brand / Set" value={form.set} onChange={upd('set')} placeholder="Bowman Chrome" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <Input label="Parallel / Variant" value={form.parallel} onChange={upd('parallel')} placeholder="Orange Refractor" />
          <Input label="Card #" value={form.cardNum} onChange={upd('cardNum')} placeholder="#02/25" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <Select label="Grade" value={form.grade} onChange={upd('grade')} options={GRADES} />
          <Select label="Sport" value={form.sport} onChange={upd('sport')} options={SPORTS} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Select label="Status" value={form.status} onChange={upd('status')} options={[
            { value: 'inventory', label: 'Inventory' },
            { value: 'grading', label: 'At Grading' },
            { value: 'sold', label: 'Sold' }
          ]} />
          <Input label="Date Acquired" type="date" value={form.date} onChange={upd('date')} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SectionTitle>Pricing</SectionTitle>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <Input label="My Cost ($)" type="number" value={form.cost} onChange={upd('cost')} placeholder="0.00" inputMode="decimal" step="0.01" />
          <Input label="Market Value ($)" type="number" value={form.market} onChange={upd('market')} placeholder="0.00" inputMode="decimal" step="0.01" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input label="Target Price ($)" type="number" value={form.target} onChange={upd('target')} placeholder="0.00" inputMode="decimal" step="0.01" />
          <Input label="Floor Price ($)" type="number" value={form.floor} onChange={upd('floor')} placeholder="0.00" inputMode="decimal" step="0.01" />
        </div>
        {showMargin && (
          <div style={{ background: 'var(--surf2)', borderRadius: 8, padding: 12, marginTop: 12, display: 'flex', justifyContent: 'space-around', border: '1px solid var(--brd)' }}>
            {[['At Target', target], ['At Floor', floor], ['vs Market', market]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 3 }}>{label}</div>
                <MarginVal v={val} />
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Value Confidence</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['low', 'medium', 'high'].map(v => {
              const active = form.confidence === v;
              const c = confColors[v];
              return (
                <button key={v} onClick={() => setForm(f => ({ ...f, confidence: v }))} style={{
                  flex: 1, padding: '9px 4px', borderRadius: 6,
                  border: active ? `1px solid ${c}` : '1px solid var(--brd)',
                  background: active ? `${c}18` : 'var(--surf2)',
                  color: active ? c : 'var(--txt3)',
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase'
                }}>{v}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SectionTitle>Notes</SectionTitle>
        <textarea value={form.notes} onChange={upd('notes')}
          placeholder="Centering, eye appeal, source, condition observations..."
          style={{ ...inputStyle, resize: 'none', height: 80, fontSize: 14 }} />
      </div>
    </>
  );
}

function statusStyle(s) {
  const m = {
    inventory: ['var(--grn)', 'rgba(76,175,118,0.15)', 'rgba(76,175,118,0.3)'],
    sold:      ['var(--red)', 'rgba(224,85,85,0.15)', 'rgba(224,85,85,0.3)'],
    grading:   ['var(--blu)', 'rgba(74,158,221,0.15)', 'rgba(74,158,221,0.3)']
  }[s] || ['var(--txt2)', 'var(--surf2)', 'var(--brd)'];
  return {
    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
    padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase',
    color: m[0], background: m[1], border: `1px solid ${m[2]}`
  };
}

function gradeStyle(g) {
  const c = g === 'PSA 10' ? 'var(--gold)' : g?.includes('9') ? 'var(--blu)' : 'var(--txt3)';
  return {
    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
    padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap',
    background: 'var(--surf2)', border: `1px solid ${c}`, color: c
  };
}

const confDotStyle = c => ({
  width: 7, height: 7, borderRadius: '50%',
  background: { high: 'var(--grn)', medium: 'var(--gold)', low: 'var(--red)' }[c] || 'var(--txt3)',
  display: 'inline-block', marginRight: 4, flexShrink: 0
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState('add');
  const [method, setMethod] = useState('single');
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState(blank());
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [batch, setBatch] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editCard, setEditCard] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => { setMounted(true); setInventory(loadInventory()); }, []);
  useEffect(() => { if (mounted) persistInventory(inventory); }, [inventory, mounted]);

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2800);
  }, []);

  async function handlePhoto(file, isBatch) {
    if (!file) return;
    if (!isBatch) { setPreviewUrl(URL.createObjectURL(file)); setAiLoading(true); setAiMsg('AI identifying card...'); }
    else setBatchLoading(true);
    try {
      const card = await identifyCard(file);
      if (isBatch) {
        setBatch(q => [...q, { ...card, id: Date.now() + Math.random(), cost: '', market: '', target: '', floor: '', status: 'inventory', confidence: 'medium', grade: 'Raw', date: new Date().toISOString().split('T')[0] }]);
        setBatchLoading(false);
      } else {
        setForm(f => ({ ...f, name: card.name || '', year: card.year || '', set: card.set || '', parallel: card.parallel || '', cardNum: card.cardNum || '', sport: card.sport || 'Football', notes: card.notes || '' }));
        setAiLoading(false);
        setAiMsg('✓ Card identified — review details and add pricing below');
      }
    } catch (err) {
      setAiLoading(false); setBatchLoading(false); setAiMsg('');
      showToast('Could not identify: ' + err.message);
    }
  }

  function saveCard() {
    if (!form.name.trim()) { showToast('Enter a card name'); return; }
    const card = { ...form, id: Date.now(), cost: parseFloat(form.cost) || 0, market: parseFloat(form.market) || 0, target: parseFloat(form.target) || 0, floor: parseFloat(form.floor) || 0 };
    setInventory(inv => [card, ...inv]);
    setForm(blank()); setPreviewUrl(null); setAiMsg('');
    showToast('Card saved!');
  }

  function saveBatch() {
    const cards = batch.map(c => ({ ...c, id: Date.now() + Math.random(), cost: parseFloat(c.cost) || 0, market: parseFloat(c.market) || 0, target: parseFloat(c.target) || 0, floor: parseFloat(c.floor) || 0 }));
    setInventory(inv => [...cards, ...inv]);
    const n = cards.length; setBatch([]);
    showToast(`${n} cards saved!`);
  }

  function saveEdit() {
    setInventory(inv => inv.map(c => c.id === editCard.id ? { ...editForm, id: editCard.id, cost: parseFloat(editForm.cost) || 0, market: parseFloat(editForm.market) || 0, target: parseFloat(editForm.target) || 0, floor: parseFloat(editForm.floor) || 0 } : c));
    setEditCard(null); showToast('Updated!');
  }

  function markSold(id) { setInventory(inv => inv.map(c => c.id === id ? { ...c, status: 'sold' } : c)); showToast('Marked as sold'); }
  function deleteCard(id) { if (!confirm('Delete this card?')) return; setInventory(inv => inv.filter(c => c.id !== id)); showToast('Deleted'); }

  const filtered = inventory.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) return [c.name, c.year, c.set, c.parallel, c.sport, c.cardNum].join(' ').toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const invCards = inventory.filter(c => c.status === 'inventory');
  const soldCards = inventory.filter(c => c.status === 'sold');
  const gradingCards = inventory.filter(c => c.status === 'grading');
  const invCost = invCards.reduce((s, c) => s + (c.cost || 0), 0);
  const invTarget = invCards.reduce((s, c) => s + (c.target || 0), 0);
  const soldRev = soldCards.reduce((s, c) => s + (c.target || 0), 0);
  const soldCost = soldCards.reduce((s, c) => s + (c.cost || 0), 0);
  const fmt = v => v ? `$${parseFloat(v).toFixed(2)}` : '—';
  const mpct = (cost, val) => { if (!cost || !val) return null; return ((val - cost) / cost * 100).toFixed(0); };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Dealer Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dealer Pro" />
      </Head>

      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>

        <div style={{ background: 'var(--surf)', borderBottom: '2px solid var(--gold)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1 }}>🃏 Dealer Pro</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', textAlign: 'right', lineHeight: 1.4 }}>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{invCards.length}</span> cards · <span style={{ color: 'var(--gold)', fontWeight: 700 }}>${invTarget.toFixed(0)}</span> target
          </div>
        </div>

        <div style={{ display: 'flex', background: 'var(--surf)', borderBottom: '1px solid var(--brd)' }}>
          {[['add', '+ Add'], ['inventory', 'Inventory'], ['stats', 'Stats']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex: 1, padding: '12px 4px',
              fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
              color: tab === k ? 'var(--gold)' : 'var(--txt3)',
              background: 'none', border: 'none',
              borderBottom: tab === k ? '3px solid var(--gold)' : '3px solid transparent',
              cursor: 'pointer'
            }}>{l}</button>
          ))}
        </div>

        {tab === 'add' && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[['single', '📷 Single'], ['batch', '📦 Batch'], ['manual', '✏️ Manual']].map(([k, l]) => (
                <button key={k} onClick={() => setMethod(k)} style={{
                  flex: 1, padding: '12px 8px', borderRadius: 8,
                  background: method === k ? 'rgba(232,197,71,0.07)' : 'var(--surf)',
                  border: method === k ? '2px solid var(--gold)' : '2px solid var(--brd)',
                  color: method === k ? 'var(--gold)' : 'var(--txt3)',
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer'
                }}>{l}</button>
              ))}
            </div>

            {method === 'single' && (
              <div className="fade-up">
                <label style={{ border: '2px dashed var(--brd)', borderRadius: 10, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: 'var(--surf)', display: 'block' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handlePhoto(e.target.files[0], false); }} />
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase' }}>Take Photo or Choose from Library</div>
                  <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 4 }}>AI identifies the card automatically</div>
                </label>
                {previewUrl && <img src={previewUrl} alt="card preview" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, marginBottom: 16, border: '1px solid var(--brd)' }} />}
                {(aiLoading || !!aiMsg) && (
                  <div style={{ background: 'var(--surf2)', border: '1px solid var(--brd)', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {aiLoading && <Spinner />}
                    <div style={{ fontSize: 14, color: 'var(--txt2)' }}>{aiMsg}</div>
                  </div>
                )}
                <CardFormFields form={form} setForm={setForm} />
                <BtnPrimary onClick={saveCard}>Save to Inventory</BtnPrimary>
                <BtnSecondary onClick={() => { setForm(blank()); setPreviewUrl(null); setAiMsg(''); }}>Clear</BtnSecondary>
              </div>
            )}

            {method === 'batch' && (
              <div className="fade-up">
                <div style={{ background: 'rgba(232,197,71,0.08)', border: '1px solid rgba(232,197,71,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: 'var(--txt2)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold)' }}>Batch Mode:</strong> Photo each card — AI queues them. Review then save all at once.
                </div>
                <label style={{ border: '2px dashed var(--brd)', borderRadius: 10, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: 'var(--surf)', display: 'block' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { handlePhoto(e.target.files[0], true); e.target.value = ''; } }} />
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase' }}>Add Card to Queue</div>
                </label>
                {batchLoading && (
                  <div style={{ background: 'var(--surf2)', border: '1px solid var(--brd)', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Spinner /><div style={{ fontSize: 14, color: 'var(--txt2)' }}>Identifying card...</div>
                  </div>
                )}
                {batch.map((c, i) => (
                  <div key={c.id} style={{ background: 'var(--surf2)', borderRadius: 6, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--brd)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name || 'Unknown'}{c.parallel ? ` · ${c.parallel}` : ''}</div>
                      <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{[c.year, c.set].filter(Boolean).join(' · ')}</div>
                    </div>
                    <button onClick={() => setBatch(q => q.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
                  </div>
                ))}
                {batch.length > 0 && (
                  <>
                    <BtnPrimary onClick={saveBatch}>Save All ({batch.length}) to Inventory</BtnPrimary>
                    <BtnSecondary onClick={() => setBatch([])}>Clear Queue</BtnSecondary>
                  </>
                )}
              </div>
            )}

            {method === 'manual' && (
              <div className="fade-up">
                <CardFormFields form={form} setForm={setForm} />
                <BtnPrimary onClick={saveCard}>Save to Inventory</BtnPrimary>
                <BtnSecondary onClick={() => setForm(blank())}>Clear</BtnSecondary>
              </div>
            )}
          </div>
        )}

        {tab === 'inventory' && (
          <div style={{ padding: 16 }}>
            <input style={{ ...inputStyle, marginBottom: 12 }} placeholder="Search player, set, year..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {[['all', 'All'], ['inventory', 'Inventory'], ['grading', 'Grading'], ['sold', 'Sold']].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} style={{
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  border: filter === k ? '1px solid var(--gold)' : '1px solid var(--brd)',
                  background: filter === k ? 'rgba(232,197,71,0.08)' : 'var(--surf)',
                  color: filter === k ? 'var(--gold)' : 'var(--txt3)',
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase'
                }}>{l}</button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--txt3)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, textTransform: 'uppercase', color: 'var(--txt2)', marginBottom: 6 }}>No cards found</div>
                <div style={{ fontSize: 14 }}>Add cards using the + Add tab</div>
              </div>
            ) : filtered.map(c => {
              const mp = mpct(c.cost, c.target);
              return (
                <div key={c.id} style={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, flex: 1, paddingRight: 8, lineHeight: 1.2 }}>{[c.year, c.name, c.parallel, c.cardNum].filter(Boolean).join(' ')}</div>
                    <div style={gradeStyle(c.grade)}>{c.grade || 'Raw'}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 8 }}>{c.set}{c.sport ? ` · ${c.sport}` : ''}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--brd)', borderBottom: '1px solid var(--brd)', marginBottom: 8 }}>
                    {[['Cost', c.cost, 'var(--txt2)'], ['Market', c.market, 'var(--txt3)'], ['Target', c.target, 'var(--gold)'], ['Floor', c.floor, 'var(--blu)']].map(([label, val, color]) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 800, color }}>{fmt(val)}</div>
                      </div>
                    ))}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Margin</div>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 800, color: mp ? (parseFloat(mp) >= 0 ? 'var(--grn)' : 'var(--red)') : 'var(--txt3)' }}>
                        {mp ? `${parseFloat(mp) >= 0 ? '+' : ''}${mp}%` : '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={statusStyle(c.status)}>{c.status}</span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)', display: 'flex', alignItems: 'center' }}>
                      <span style={confDotStyle(c.confidence)} />{c.confidence}
                    </span>
                    {c.date && <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.date}</span>}
                  </div>
                  {c.notes && <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--brd)' }}>{c.notes}</div>}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {[['Edit', false, () => { setEditCard(c); setEditForm({ ...c, cost: c.cost || '', market: c.market || '', target: c.target || '', floor: c.floor || '' }); }],
                      ['Mark Sold', false, () => markSold(c.id)],
                      ['Delete', true, () => deleteCard(c.id)]
                    ].map(([label, danger, action]) => (
                      <button key={label} onClick={action} style={{
                        flex: 1, padding: 8, background: 'var(--surf2)',
                        border: '1px solid var(--brd)', borderRadius: 6,
                        color: danger ? 'var(--red)' : 'var(--txt2)',
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer'
                      }}>{label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'stats' && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['Active Inventory', invCards.length, 'var(--gold)', `${gradingCards.length} at grading`],
                ['Cost Basis', `$${invCost.toFixed(0)}`, 'var(--txt2)', 'inventory only'],
                ['Target Value', `$${invTarget.toFixed(0)}`, 'var(--gold)', 'at target prices'],
                ['Potential Profit', `$${(invTarget - invCost).toFixed(0)}`, 'var(--grn)', 'at target prices'],
              ].map(([label, val, color, sub]) => (
                <div key={label} style={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 3 }}>{sub}</div>
                </div>
              ))}
              <div style={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: 10, padding: 14, gridColumn: '1/-1' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Realized Profit (Sold)</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: soldRev - soldCost >= 0 ? 'var(--grn)' : 'var(--red)' }}>${(soldRev - soldCost).toFixed(2)}</div>
                <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 3 }}>{soldCards.length} cards · ${soldRev.toFixed(2)} revenue · ${soldCost.toFixed(2)} cost</div>
              </div>
            </div>
            {inventory.filter(c => c.target > 0).length > 0 && (
              <>
                <SectionTitle>Top Cards by Target Price</SectionTitle>
                {[...inventory].filter(c => c.target > 0).sort((a, b) => b.target - a.target).slice(0, 8).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--brd)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{c.grade} · {c.status}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 800, color: 'var(--gold)' }}>${parseFloat(c.target).toFixed(0)}</div>
                      {c.cost ? <div style={{ fontSize: 11, color: 'var(--txt3)' }}>cost ${parseFloat(c.cost).toFixed(0)}</div> : null}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {editCard && editForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, overflowY: 'auto', padding: '20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: 12, width: '100%', maxWidth: 480, padding: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 }}>Edit Card</div>
              <CardFormFields form={editForm} setForm={setEditForm} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <BtnSecondary style={{ marginTop: 0, flex: 1 }} onClick={() => setEditCard(null)}>Cancel</BtnSecondary>
                <BtnPrimary style={{ marginTop: 0, flex: 2 }} onClick={saveEdit}>Save Changes</BtnPrimary>
              </div>
            </div>
          </div>
        )}

        <div style={{
          position: 'fixed', bottom: 20, left: '50%',
          transform: toast.show ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100px)',
          background: 'var(--gold)', color: '#0f0f0f',
          padding: '12px 20px', borderRadius: 8,
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700,
          zIndex: 300, transition: 'transform 0.3s', whiteSpace: 'nowrap'
        }}>{toast.msg}</div>
      </div>
    </>
  );
}
