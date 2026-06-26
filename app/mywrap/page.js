'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStats } from '../StatsContext';
import LoadingBar from 'react-top-loading-bar';
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar"
import { AppSidebar } from "../../components/app-sidebar"
import { OverView } from "../../components/OverView"
import { Profile } from "../../components/Profile"
import { Likes } from "../../components/Likes"
import { Followers } from '@/components/Followers';
import { OTD } from '@/components/OTD';
import { Messages } from '@/components/Messages';
import { ProfileTimeline } from '@/components/ProfileTimeline';
import { TopicsAds } from '@/components/TopicsAds';
import { Search } from '@/components/Search';

function StatCard({ label, value, sub, gradient }) {
  return (
    <div className="bg-[#070809] border border-[#1a1a1a] rounded-2xl p-8 flex flex-col gap-2 text-left">
      <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">{label}</span>
      <span
        className="text-5xl font-black leading-none"
        style={gradient ? { background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : { color: '#fff' }}
      >
        {value}
      </span>
      {sub && <span className="text-gray-500 text-sm mt-1">{sub}</span>}
    </div>
  );
}


export default function Wrap() {
  const { stats } = useStats();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loadingStep, setLoadingStep] = useState('Starting...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  const [pendingConvo, setPendingConvo] = useState(null);
  const parsed = useRef(false);

  useEffect(() => {
    if (!stats?.keys) { router.replace('/'); return; }
    if (parsed.current) return;
    parsed.current = true;

    const { entries, keys } = stats;

    const readEntry = (entry) => new Promise((resolve, reject) => {
      const chunks = [];
      entry.ondata = (err, chunk, final) => {
        if (err) { reject(err); return; }
        chunks.push(chunk);
        if (final) {
          let len = 0;
          for (const c of chunks) len += c.length;
          const buf = new Uint8Array(len);
          let off = 0;
          for (const c of chunks) { buf.set(c, off); off += c.length; }
          resolve(new TextDecoder().decode(buf));
        }
      };
      entry.start();
    });

    const readEntryBinary = (entry) => new Promise((resolve, reject) => {
      const chunks = [];
      entry.ondata = (err, chunk, final) => {
        if (err) { reject(err); return; }
        chunks.push(chunk);
        if (final) {
          let len = 0;
          for (const c of chunks) len += c.length;
          const buf = new Uint8Array(len);
          let off = 0;
          for (const c of chunks) { buf.set(c, off); off += c.length; }
          resolve(buf);
        }
      };
      entry.start();
    });

    async function parse() {
      // Phase 1: decompress all JSON entries to strings on the main thread
      // (fflate UnzipFile objects are not transferable to a worker)
      setLoadingStep('Reading files...');
      setLoadingProgress(3);
      const jsonKeys = keys.filter(k => k.endsWith('.json'));
      const jsonFiles = {};
      const BATCH_SIZE = 30;
      for (let i = 0; i < jsonKeys.length; i += BATCH_SIZE) {
        const batch = jsonKeys.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async k => { jsonFiles[k] = await readEntry(entries[k]); }));
        setLoadingProgress(3 + Math.round(((i + batch.length) / jsonKeys.length) * 12));
      }

      // Phase 2: worker handles all JSON parsing and computation off the main thread
      setLoadingStep('Processing data...');
      setLoadingProgress(15);
      const worker = new Worker(new URL('./parser.worker.js', import.meta.url));

      const result = await new Promise((resolve, reject) => {
        worker.onmessage = ({ data }) => {
          if (data.type === 'progress') {
            setLoadingStep(data.step);
            setLoadingProgress(data.pct);
          } else if (data.type === 'result') {
            resolve(data.data);
          } else if (data.type === 'error') {
            reject(new Error(data.message));
          }
        };
        worker.onerror = e => reject(new Error(e.message));
        worker.postMessage({ jsonFiles });
      });

      worker.terminate();

      // Phase 3: create pfpUrl — needs DOM canvas/Blob APIs, must stay on main thread
      const { pfpPath, username } = result;
      let pfpUrl = null;
      const resolvedPfpKey = pfpPath ? keys.find(k => k.endsWith(pfpPath)) ?? null : null;
      if (resolvedPfpKey) {
        const ext = resolvedPfpKey.split('.').pop().toLowerCase();
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const buf = await readEntryBinary(entries[resolvedPfpKey]);
        pfpUrl = URL.createObjectURL(new Blob([buf], { type: mime }));
      } else {
        const initial = (username?.[0] ?? '?').toUpperCase();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 72;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 72, 72);
        grad.addColorStop(0, '#405de6');
        grad.addColorStop(0.5, '#833ab4');
        grad.addColorStop(1, '#e1306c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 72, 72);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 36, 37);
        pfpUrl = canvas.toDataURL('image/png');
      }

      setLoadingProgress(100);
      setData({ ...result, pfpUrl });
    }

    parse();
  }, [stats, router]);

  useEffect(() => {
    if (data) return;
    const id = setInterval(() => {
      setLoadingProgress(p => p >= 99 ? 99 : Math.min(99, p + Math.random() * 0.5 + 0.15));
    }, 250);
    return () => clearInterval(id);
  }, [data]);

  if (!data) {
    const pct = Math.round(loadingProgress);
    const DOT_THRESHOLDS = [0, 45, 70, 95];
    const DOT_NEXT = [45, 70, 95, 101];

    const stepText = (() => {
      const m = loadingStep.match(/^(.*?)(\d+)(.*)$/);
      if (!m) return <span style={{ color: '#aaa', fontSize: 13 }}>{loadingStep}</span>;
      return (
        <span style={{ color: '#aaa', fontSize: 13 }}>
          {m[1]}<span style={{ color: '#4d90fe', fontWeight: 600 }}>{m[2]}</span>{m[3]}
        </span>
      );
    })();

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 17, padding: '0 16px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            
            <h1 className="loader-h1 cursor-pointer"><span className="text-[#06f] font-inter">I</span>nsta<span className="text-[#06f] font-inter">W</span>rapped</h1>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#ffffff0d', backdropFilter: 'blur(5px)', border: '0.5px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: '24px 28px', width: '100%', maxWidth: 380 }}>

          {/* Status dot + step label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
           
            {stepText}
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ width: `${loadingProgress}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #4d90fe)', borderRadius: 99, transition: 'width 0.45s ease-out', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)', animation: 'iw-shimmer 1.6s ease-in-out infinite' }} />
            </div>
          </div>

          {/* Percentage + step dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#aaa', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
          </div>
        </div>

      </div>
    );
  }

  return (
    <>
    <LoadingBar color="#06f" progress={loadingProgress} onLoaderFinished={() => setLoadingProgress(0)} />
    <SidebarProvider>
      <AppSidebar data={data} activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-[#333] sticky top-0 z-10" style={{ background: '#0d0f12' }}>
          <SidebarTrigger />
          <span className="cursor-pointer sidebar-head text-center text-3xl"><span className="text-[#06f] font-inter">I</span>nsta<span className="text-[#06f] font-inter">W</span>rapped</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden">
          {activeSection === 'overview' && <OverView data={data} />}
          {activeSection === 'followers' && <Followers data={data} />}
          {activeSection === 'profile' && <Profile data={data} />}
          {activeSection === 'likes' && <Likes data={data} />}
          {activeSection === 'onthisday' && <OTD data={data} />}
          {activeSection === 'messages' && <Messages data={data} pendingConvo={pendingConvo} onPendingConvoHandled={() => setPendingConvo(null)} />}
          {activeSection === 'timeline' && <ProfileTimeline data={data} />}
          {activeSection === 'topics' && <TopicsAds data={data} />}
          {activeSection === 'search' && (
            <Search
              data={data}
              onOpenConvo={(name, term) => {
                setActiveSection('messages');
                setPendingConvo({ name, term });
              }}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
    </>
  );
}
