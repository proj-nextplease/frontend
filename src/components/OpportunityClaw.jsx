import { Crown, TrendingUp, MapPin, Wallet } from 'lucide-react';

/**
 * Playful "claw machine" illustration (upzi-style, emerald palette — no purple,
 * no mascot). A crane claw dips into a prize cabinet full of glowing JOB tags and
 * lifts one out, while real-looking job cards and match badges float around it.
 * It says visually: real proof pulls out real opportunities.
 */

const TEAL = '#0d9488';
const EMERALD = '#10b981';
const INK = '#0f2e2b';
const MUTED = '#5b7772';
const AMBER = '#b45309';

export function OpportunityClaw() {
  return (
    <div className="np-claw" aria-hidden="true">
      <style>{`
        .np-claw { width: 100%; display: flex; justify-content: center; }
        .np-claw-stage { position: relative; width: 100%; max-width: 623.5px; aspect-ratio: 1 / 1; }
        .np-claw-svg { width: 100%; height: 100%; display: block; overflow: visible; }
        .np-claw text, .np-claw-card, .np-claw-pill { font-family: 'Inter','Plus Jakarta Sans',sans-serif; }

        /* claw bob + prize sway */
        .npc-claw { transform-box: fill-box; transform-origin: 50% 0; animation: npcBob 4.6s ease-in-out infinite; }
        .npc-bear { transform-box: fill-box; transform-origin: 50% 100%; animation: npcBear 4.2s ease-in-out infinite; }
        .npc-bear-arm { transform-box: fill-box; transform-origin: 0 50%; animation: npcWave 3.2s ease-in-out infinite; }
        @keyframes npcBear { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-5px) rotate(1deg); } }
        @keyframes npcWave { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-7deg); } }
        @keyframes npcBob { 0%,100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-10px) rotate(1.5deg); } }
        .npc-tw { transform-box: fill-box; transform-origin: 50% 50%; animation: npcTw 2.8s ease-in-out infinite; }
        .npc-tw.d2 { animation-delay: .7s; } .npc-tw.d3 { animation-delay: 1.4s; }
        @keyframes npcTw { 0%,100% { transform: scale(.7); opacity: .5; } 50% { transform: scale(1.1); opacity: 1; } }
        .npc-arrow { animation: npcArrow 1.8s ease-in-out infinite; }
        @keyframes npcArrow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(3px); } }

        /* floating overlay cards */
        .np-claw-card { position: absolute; background: #fff; border-radius: 16px; padding: 14px 16px;
          box-shadow: 0 16px 34px rgba(6,40,36,0.16); border: 1px solid #eef3f0; width: min(58%, 300px); }
        .np-claw-card .npc-pay { display: flex; align-items: center; gap: 7px; font-weight: 800; color: ${INK}; font-size: 0.94rem; }
        .np-claw-card .npc-note { color: ${EMERALD}; font-weight: 700; font-size: 0.78rem; margin-top: 3px; }
        .np-claw-card .npc-loc { display: flex; align-items: center; gap: 5px; color: ${MUTED}; font-size: 0.8rem; margin-top: 4px; }
        .np-claw-card--a { top: 40%; right: -4%; animation: npcFloat 6s ease-in-out infinite; }
        .np-claw-card--b { bottom: 5%; left: -6%; animation: npcFloat 6.4s ease-in-out 0.8s infinite; }
        @keyframes npcFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .np-claw-pill { position: absolute; display: inline-flex; align-items: center; gap: 6px;
          font-weight: 800; font-size: 0.82rem; padding: 8px 14px; border-radius: 999px; white-space: nowrap; }
        .np-claw-pill--top { top: 30%; left: -8%; background: #d7f5e8; color: ${TEAL};
          box-shadow: 0 12px 26px rgba(13,148,136,0.2); animation: npcFloat 5.6s ease-in-out 0.4s infinite; }
        .np-claw-pill--match { bottom: 20%; right: 2%; background: #fff; color: ${EMERALD};
          box-shadow: 0 14px 30px rgba(6,40,36,0.16); animation: npcFloat 6.2s ease-in-out 1.2s infinite; }

        @media (max-width: 560px) {
          .np-claw-card { width: min(64%, 260px); padding: 10px 12px; }
          .np-claw-card--a { right: -2%; } .np-claw-card--b { left: -2%; }
          .np-claw-pill { font-size: 0.76rem; padding: 7px 12px; }
          .np-claw-pill--top { left: -2%; } .np-claw-pill--match { right: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .npc-claw,.npc-tw,.npc-arrow,.np-claw-card,.np-claw-pill { animation: none !important; }
        }
      `}</style>

      <div className="np-claw-stage">
        <svg className="np-claw-svg" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="npcBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fffdf2" /><stop offset="1" stopColor="#d9f3df" />
            </linearGradient>
            <linearGradient id="npcGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" /><stop offset="1" stopColor="#eefcf5" stopOpacity="0.96" />
            </linearGradient>
            <linearGradient id="npcSign" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#34d399" /><stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="npcBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8ef55" /><stop offset="1" stopColor="#a7c932" />
            </linearGradient>
            <filter id="npcShadow" x="-30%" y="-20%" width="160%" height="150%">
              <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#7055a8" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* ground shadow */}
          <ellipse cx="184" cy="342" rx="142" ry="13" fill="#5c4f7d" opacity="0.13" />

          {/* ── cabinet ── */}
          <g filter="url(#npcShadow)">
            <rect x="58" y="70" width="244" height="272" rx="30" fill="url(#npcBody)" />
          </g>

          {/* glass window */}
          <rect x="80" y="96" width="200" height="150" rx="20" fill="url(#npcGlass)" />
          <rect x="80" y="96" width="200" height="150" rx="20" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
          {/* glass sheen */}
          <path d="M96 108 L150 108 L110 236 L96 236 Z" fill="#ffffff" opacity="0.28" />

          {/* friendly mascot inspired by the reference illustration */}
          <g className="npc-bear">
            <ellipse cx="247" cy="165" rx="38" ry="55" fill="#7c3aed" />
            <circle cx="222" cy="119" r="15" fill="#7c3aed" />
            <circle cx="269" cy="119" r="15" fill="#7c3aed" />
            <circle cx="222" cy="119" r="6" fill="#a78bfa" />
            <circle cx="269" cy="119" r="6" fill="#a78bfa" />
            <ellipse cx="245" cy="151" rx="28" ry="32" fill="#8b5cf6" />
            <path d="M230 139 Q236 134 241 139 M252 139 Q258 134 263 139" stroke="#24114f" strokeWidth="3" strokeLinecap="round" />
            <circle cx="237" cy="149" r="3" fill="#24114f" /><circle cx="256" cy="149" r="3" fill="#24114f" />
            <ellipse cx="246" cy="162" rx="7" ry="11" fill="#fff" />
            <ellipse cx="246" cy="165" rx="3" ry="7" fill="#ef4444" />
            <path d="M225 181 Q246 198 268 181 L262 211 Q246 222 230 211 Z" fill="#f8fafc" />
            <path d="M246 188 L246 222 L236 237 M246 222 L257 237" stroke="#24114f" strokeWidth="4" strokeLinecap="round" />
            <path d="M224 180 Q208 179 198 194" stroke="#7c3aed" strokeWidth="16" strokeLinecap="round" />
            <g className="npc-bear-arm"><path d="M264 181 Q281 176 288 191" stroke="#7c3aed" strokeWidth="16" strokeLinecap="round" /><rect x="271" y="182" width="24" height="33" rx="6" fill="#2dd4bf" transform="rotate(18 271 182)" /></g>
          </g>

          {/* prize pile — JOB tags inside */}
          <g>
            <rect x="104" y="196" width="52" height="40" rx="8" fill="#f6d84a" transform="rotate(-11 130 216)" />
            <rect x="150" y="200" width="56" height="40" rx="8" fill="#61d8c2" transform="rotate(7 178 220)" />
            <rect x="196" y="198" width="52" height="42" rx="8" fill="#ffffff" transform="rotate(-6 222 219)" />
            <rect x="128" y="206" width="50" height="38" rx="8" fill="#b5dc42" transform="rotate(4 153 225)" />
            <text x="140" y="222" fontSize="11" fontWeight="800" fill="#0f2e2b" transform="rotate(-11 130 216)" opacity="0.8">JOB</text>
            <text x="210" y="224" fontSize="11" fontWeight="800" fill="#0d9488" transform="rotate(-6 222 219)">JOB</text>
          </g>

          {/* ── claw + cable ── */}
          <line x1="180" y1="96" x2="180" y2="150" stroke="#0a4a44" strokeWidth="4" strokeLinecap="round" />
          <rect x="172" y="88" width="16" height="14" rx="4" fill="#0a4a44" />
          <g className="npc-claw">
            {/* claw head */}
            <rect x="164" y="150" width="32" height="16" rx="6" fill="#e6f2ef" stroke="#0d9488" strokeWidth="2" />
            <circle cx="180" cy="158" r="4" fill="#0d9488" />
            {/* prongs */}
            <path d="M168 166 C 160 178 158 192 164 204" stroke="#cfe6e0" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M192 166 C 200 178 202 192 196 204" stroke="#cfe6e0" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M180 166 L180 200" stroke="#cfe6e0" strokeWidth="7" strokeLinecap="round" fill="none" />
            {/* gripped JOB envelope */}
            <g transform="rotate(-4 180 214)">
              <rect x="156" y="196" width="48" height="34" rx="7" fill="#facc15" />
              <path d="M156 202 L180 216 L204 202" stroke="#b45309" strokeWidth="2" fill="none" opacity="0.5" />
              <text x="180" y="220" fontSize="11" fontWeight="800" fill="#7c4a06" textAnchor="middle">JOB</text>
            </g>
          </g>

          {/* ── control panel / base ── */}
          <rect x="80" y="262" width="200" height="64" rx="16" fill="url(#npcBase)" />
          {/* prize chute */}
          <rect x="98" y="286" width="60" height="28" rx="8" fill="#758e2b" />
          <rect x="98" y="286" width="60" height="28" rx="8" fill="none" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="2" />
          {/* joystick */}
          <circle cx="214" cy="300" r="16" fill="#91ae2d" />
          <circle cx="214" cy="300" r="9" fill="#45c8a7" />
          {/* coin slot */}
          <rect x="244" y="278" width="20" height="8" rx="4" fill="#91ae2d" />
          <rect x="248" y="296" width="12" height="16" rx="3" fill="#facc15" />

          {/* ── top sign: down-arrow badge + JOB HERE! ── */}
          <g transform="translate(96 44)">
            <circle cx="16" cy="16" r="18" fill="#f59e0b" />
            <circle cx="16" cy="16" r="18" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <g className="npc-arrow">
              <path d="M16 8 L16 22 M10 16 L16 22 L22 16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
          <g transform="translate(140 30)">
            <rect x="0" y="0" width="128" height="34" rx="12" fill="url(#npcSign)" />
            <rect x="0" y="0" width="128" height="34" rx="12" fill="none" stroke="#ffffff" strokeWidth="2" />
            <text x="64" y="23" fontSize="16" fontWeight="800" fill="#ffffff" textAnchor="middle" letterSpacing="0.5">JOB HERE!</text>
          </g>

          {/* sparkles */}
          <path className="npc-tw" d="M40 120 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 z" fill="#fde68a" />
          <path className="npc-tw d2" d="M312 100 l2.5 7 l7 2.5 l-7 2.5 l-2.5 7 l-2.5 -7 l-7 -2.5 l7 -2.5 z" fill="#5eead4" />
          <path className="npc-tw d3" d="M320 210 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" fill="#34d399" />
        </svg>

        {/* floating job cards */}
        <div className="np-claw-card np-claw-card--a">
          <div className="npc-pay"><Wallet size={15} color={TEAL} /> 40 – 50 triệu / tháng</div>
          <div className="npc-note">Lương ngon quá trời 🤑</div>
          <div className="npc-loc"><MapPin size={13} /> Q.3, TP.Hồ Chí Minh</div>
        </div>
        <div className="np-claw-card np-claw-card--b">
          <div className="npc-pay"><Wallet size={15} color={TEAL} /> 10 – 15 triệu / tháng</div>
          <div className="npc-note" style={{ color: AMBER }}>Chuẩn giá thị trường 👌</div>
          <div className="npc-loc"><MapPin size={13} /> Q.Thanh Khê, Đà Nẵng</div>
        </div>

        {/* badges */}
        <span className="np-claw-pill np-claw-pill--top"><Crown size={15} /> Top ứng viên</span>
        <span className="np-claw-pill np-claw-pill--match"><TrendingUp size={15} /> Phù hợp cao</span>
      </div>
    </div>
  );
}
