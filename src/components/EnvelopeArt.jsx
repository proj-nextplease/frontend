/**
 * Polished open-envelope illustration (flat-vector, emerald palette).
 * A paper plane glides in along a dashed flight path, the flap unfolds, the
 * warm letter rises out with its message + signature, and sparkles twinkle —
 * then the whole scene keeps a gentle idle float. Everything is one crafted SVG.
 */

const SPARKLE = 'M0 -12 C 1.6 -3.2 3.2 -1.6 12 0 C 3.2 1.6 1.6 3.2 0 12 C -1.6 3.2 -3.2 1.6 -12 0 C -3.2 -1.6 -1.6 -3.2 0 -12 Z';

export function EnvelopeArt() {
  return (
    <div className="np-ea-wrap" aria-hidden="true">
      <style>{`
        .np-ea-wrap { width: min(640px, 94vw); margin: 24px auto 0; }
        .np-ea { width: 100%; height: auto; display: block; overflow: visible; }
        .np-ea text { font-family: 'Inter','Plus Jakarta Sans',sans-serif; }

        .np-ea-float { animation: npeaFloat 7s ease-in-out 2.7s infinite; transform-box: view-box; }
        @keyframes npeaFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        .np-ea-in { animation: npeaIn 0.8s cubic-bezier(0.22,1,0.36,1) both; transform-box: fill-box; transform-origin: 50% 92%; }
        @keyframes npeaIn { 0% { opacity: 0; transform: translateY(30px) scale(0.93); } 100% { opacity: 1; transform: none; } }

        .np-ea-flap { transform-box: fill-box; transform-origin: 50% 100%; animation: npeaFlap 0.72s cubic-bezier(0.34,1.42,0.5,1) 0.6s both; }
        @keyframes npeaFlap { 0% { transform: scaleY(0.1); } 62% { transform: scaleY(1.05); } 100% { transform: scaleY(1); } }
        .np-ea-letter { transform-box: fill-box; transform-origin: 50% 100%; animation: npeaLetter 0.9s cubic-bezier(0.22,1,0.36,1) 1.2s both; }
        @keyframes npeaLetter { 0% { opacity: 0; transform: translateY(70px) scale(0.98); } 100% { opacity: 1; transform: none; } }
        .np-ea-msg { opacity: 0; animation: npeaFade 0.55s ease-out 1.85s both; }
        @keyframes npeaFade { to { opacity: 1; } }

        .np-ea-trail { stroke-dasharray: 5 9; stroke-dashoffset: 300; animation: npeaTrail 1.15s ease-out 0.2s forwards; }
        @keyframes npeaTrail { to { stroke-dashoffset: 0; } }
        .np-ea-plane { offset-path: path('M 46 58 C 138 30 196 128 250 150'); offset-rotate: auto; animation: npeaFly 1.35s cubic-bezier(0.4,0.2,0.3,1) 0.2s both; }
        @keyframes npeaFly {
          0% { offset-distance: 0%; opacity: 0; }
          14% { opacity: 1; }
          82% { offset-distance: 100%; opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }

        .np-ea-pop { transform-box: fill-box; transform-origin: 50% 50%; animation: npeaPop 0.6s cubic-bezier(0.34,1.6,0.5,1) both; }
        .np-ea-tw { transform-box: fill-box; transform-origin: 50% 50%; animation: npeaTw 2.6s ease-in-out infinite; }
        .np-ea-d1 { animation-delay: 1.5s; } .np-ea-d2 { animation-delay: 1.7s; } .np-ea-d3 { animation-delay: 1.9s; } .np-ea-d4 { animation-delay: 2.1s; }
        @keyframes npeaPop { 0% { opacity: 0; transform: scale(0) rotate(-30deg); } 100% { opacity: 1; transform: none; } }
        @keyframes npeaTw { 0%,100% { transform: scale(0.7); opacity: 0.55; } 50% { transform: scale(1.12); opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
          .np-ea-float,.np-ea-in,.np-ea-flap,.np-ea-letter,.np-ea-msg,.np-ea-pop,.np-ea-tw { animation: none !important; opacity: 1 !important; transform: none !important; }
          .np-ea-plane,.np-ea-trail { display: none; }
        }
      `}</style>

      <svg className="np-ea" viewBox="42 44 436 336" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eaBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#12897d" /><stop offset="1" stopColor="#0a4f48" />
          </linearGradient>
          <linearGradient id="eaFlap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1cc3ae" /><stop offset="1" stopColor="#11968a" />
          </linearGradient>
          <linearGradient id="eaPocket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#17bda9" /><stop offset="1" stopColor="#0e857a" />
          </linearGradient>
          <linearGradient id="eaLetter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#fdf4e6" />
          </linearGradient>
          <radialGradient id="eaGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="eaShadow" x="-40%" y="-40%" width="180%" height="200%">
            <feDropShadow dx="0" dy="28" stdDeviation="24" floodColor="#04241f" floodOpacity="0.34" />
          </filter>
          <filter id="eaLetterShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#04241f" floodOpacity="0.24" />
          </filter>
        </defs>

        <g className="np-ea-float"><g className="np-ea-in">
          {/* ambient glow */}
          <circle cx="250" cy="250" r="220" fill="url(#eaGlow)" />
          <circle cx="378" cy="150" r="120" fill="url(#eaGlow)" />

          {/* dashed flight path */}
          <path className="np-ea-trail" d="M 46 58 C 138 30 196 128 250 150" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* ground shadow */}
          <ellipse cx="260" cy="380" rx="180" ry="15" fill="#04241f" opacity="0.16" />

          {/* envelope back */}
          <g filter="url(#eaShadow)">
            <rect x="96" y="170" width="328" height="196" rx="26" fill="url(#eaBody)" />
          </g>
          {/* inner lining seen at the opening */}
          <path d="M104 176 L260 118 L416 176 Z" fill="#0a4a44" />

          {/* open flap (behind the letter) */}
          <path className="np-ea-flap" d="M100 176 Q 258 88 260 86 Q 262 88 420 176 Z" fill="url(#eaFlap)" />
          <path className="np-ea-flap" d="M100 176 L260 86 L260 176 Z" fill="#ffffff" fillOpacity="0.06" />
          <path className="np-ea-flap" d="M260 86 L260 176" stroke="#0a5b52" strokeOpacity="0.45" strokeWidth="2" />

          {/* the letter */}
          <g className="np-ea-letter">
            <g filter="url(#eaLetterShadow)">
              <rect x="142" y="90" width="236" height="216" rx="26" fill="url(#eaLetter)" />
            </g>
            {/* ruled lines */}
            <g className="np-ea-msg" stroke="#0f2e2b" strokeOpacity="0.06" strokeWidth="2">
              <line x1="164" y1="140" x2="356" y2="140" /><line x1="164" y1="166" x2="356" y2="166" /><line x1="164" y1="192" x2="356" y2="192" />
            </g>
            {/* message */}
            <text className="np-ea-msg" x="164" y="130" fontSize="14.5" fontWeight="500" fill="#183c37" letterSpacing="-0.2">
              <tspan fill="#0d9488" fontWeight="800">nextplease</tspan> ở đây giúp bạn:
              <tspan x="164" dy="26" fontWeight="800">tìm đúng hướng đi,</tspan>
              <tspan x="164" dy="26" fontWeight="800">tích proof thật, và mở khoá</tspan>
              <tspan x="164" dy="26" fontWeight="800">cơ hội nghề nghiệp.</tspan>
            </text>
            {/* signature swirl */}
            <path className="np-ea-msg" d="M166 250 c 10 -9 18 5 27 -1 c 9 -6 15 4 24 -1" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.85" />
          </g>

          {/* front pocket (inverted-V seam) */}
          <path d="M96 246 L260 208 L424 246 L424 340 A26 26 0 0 1 398 366 L122 366 A26 26 0 0 1 96 340 Z" fill="url(#eaPocket)" />
          <path d="M96 246 L260 208 L424 246" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2.5" fill="none" />

          {/* FROM / TO */}
          <g className="np-ea-msg" fill="#ffffff">
            <text x="128" y="312" fontSize="15" fontWeight="800" opacity="0.72">FROM:</text>
            <text x="196" y="312" fontSize="15.5" fontWeight="800">nextplease<tspan fill="#facc15">:</tspan></text>
            <text x="128" y="336" fontSize="15" fontWeight="800" opacity="0.72">TO:</text>
            <text x="196" y="336" fontSize="14" fontWeight="600" opacity="0.94">Sinh viên &amp; người trẻ tìm cơ hội</text>
          </g>

          {/* postage stamp */}
          <g transform="translate(344 214) rotate(8)">
            <rect x="0" y="0" width="60" height="70" rx="8" fill="#ffffff" />
            <rect x="6" y="6" width="48" height="58" rx="5" fill="none" stroke="#bfe9e0" strokeWidth="1.6" strokeDasharray="4 3.4" />
            <path d="M16 44 L42 22 L33 48 L27 40 Z" fill="#0d9488" />
            <circle cx="30" cy="34" r="1.6" fill="#0d9488" />
          </g>

          {/* sparkles */}
          <g className="np-ea-pop np-ea-d1" transform="translate(150 60)"><path className="np-ea-tw" d={SPARKLE} fill="#fde68a" transform="scale(1.15)" /></g>
          <g className="np-ea-pop np-ea-d2" transform="translate(438 132)"><path className="np-ea-tw np-ea-d2" d={SPARKLE} fill="#ffffff" transform="scale(0.8)" /></g>
          <g className="np-ea-pop np-ea-d3" transform="translate(420 300)"><path className="np-ea-tw np-ea-d3" d={SPARKLE} fill="#5eead4" transform="scale(0.95)" /></g>
          <g className="np-ea-pop np-ea-d4" transform="translate(96 300)"><path className="np-ea-tw np-ea-d4" d={SPARKLE} fill="#ffffff" transform="scale(0.7)" /></g>
          {/* dots */}
          <circle className="np-ea-msg" cx="470" cy="220" r="5" fill="#facc15" />
          <circle className="np-ea-msg" cx="70" cy="150" r="5" fill="#5eead4" />
          <circle className="np-ea-msg" cx="360" cy="70" r="4" fill="#ffffff" opacity="0.8" />

          {/* paper plane gliding in */}
          <g className="np-ea-plane">
            <path d="M-4 -9 L20 0 L-4 9 L3 0 Z" fill="#ffffff" />
            <path d="M-4 -9 L3 0 L-4 9 Z" fill="#d7f5ee" />
          </g>
        </g></g>
      </svg>
    </div>
  );
}
