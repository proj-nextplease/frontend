/**
 * Playful Gen Z Envelope Art (Upzi-inspired style for NextPlease).
 * - Extra-large scale for maximum visual impact in Hero section.
 * - Stylized decorative Google Fonts (Comfortaa, Fredoka, Baloo 2, Itim).
 * - Notebook lined letter, mascot stamp, neon lime doodles & 3D stickers.
 */

export function EnvelopeArt() {
  return (
    <div className="np-upzi-envelope-wrap" aria-label="NextPlease Letter Illustration">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Comfortaa:wght@600;700&family=Fredoka:wght@500;600;700;800&family=Itim&display=swap');

        .np-upzi-envelope-wrap {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          user-select: none;
          position: relative;
          line-height: 0;
        }

        .np-upzi-svg {
          width: 100%;
          height: auto;
          display: block;
          overflow: visible;
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .np-upzi-envelope-wrap:hover .np-upzi-svg {
          transform: translateY(-6px);
        }

        .np-upzi-envelope-wrap:hover .np-letter-sheet {
          transform: translateY(-18px);
        }

        .np-upzi-envelope-wrap:hover .np-doodle-coil {
          animation: npCoilWiggle 0.6s ease-in-out infinite alternate;
        }

        .np-upzi-envelope-wrap:hover .np-doodle-arrow {
          animation: npArrowBounce 0.6s ease-in-out infinite alternate;
        }

        .np-upzi-envelope-wrap:hover .np-sticker-heart {
          transform: scale(1.18) rotate(18deg);
        }

        .np-upzi-envelope-wrap:hover .np-sticker-bolt {
          transform: scale(1.18) rotate(-15deg);
        }

        /* ── Stylized Typography Classes ── */
        .np-font-letter {
          font-family: 'Comfortaa', 'Itim', 'Baloo 2', cursive, sans-serif;
        }
        .np-font-display {
          font-family: 'Fredoka', 'Baloo 2', cursive, sans-serif;
        }

        /* ── Floating Stage Animation ── */
        .np-stage-float {
          animation: npStageIdle 6s ease-in-out infinite alternate;
          transform-box: fill-box;
          transform-origin: 50% 50%;
        }
        @keyframes npStageIdle {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.3deg); }
          100% { transform: translateY(3px) rotate(-0.3deg); }
        }

        /* ── Envelope Base Entrance ── */
        .np-env-in {
          animation: npEnvEnter 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
          transform-origin: 50% 90%;
        }
        @keyframes npEnvEnter {
          0% { opacity: 0; transform: translateY(40px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Letter Rise ── */
        .np-letter-sheet {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: npLetterSlide 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes npLetterSlide {
          0% { opacity: 0; transform: translateY(95px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Flap Unfolding ── */
        .np-flap-open {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: npFlapExpand 0.75s cubic-bezier(0.34, 1.35, 0.64, 1) 0.25s both;
        }
        @keyframes npFlapExpand {
          0% { transform: scaleY(0.1); opacity: 0.5; }
          100% { transform: scaleY(1); opacity: 1; }
        }

        /* ── Doodles Drawing ── */
        .np-doodle-coil {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: npDrawLine 1.2s ease-out 0.2s forwards;
        }
        .np-doodle-arrow {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: npDrawLine 1.1s ease-out 0.4s forwards;
        }
        @keyframes npDrawLine {
          to { stroke-dashoffset: 0; }
        }

        @keyframes npCoilWiggle {
          0% { transform: rotate(-3deg) scale(0.98); }
          100% { transform: rotate(4deg) scale(1.04); }
        }
        @keyframes npArrowBounce {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(5px) rotate(-4deg); }
        }

        /* ── Stickers Pop ── */
        .np-sticker-pop {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: npPopIn 0.6s cubic-bezier(0.34, 1.6, 0.5, 1) both;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .np-st-d1 { animation-delay: 1.0s; }
        .np-st-d2 { animation-delay: 1.2s; }
        .np-st-d3 { animation-delay: 1.35s; }
        @keyframes npPopIn {
          0% { opacity: 0; transform: scale(0) rotate(-30deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        /* ── Reduced Motion ── */
        @media (prefers-reduced-motion: reduce) {
          .np-stage-float,
          .np-env-in,
          .np-letter-sheet,
          .np-flap-open,
          .np-doodle-coil,
          .np-doodle-arrow,
          .np-sticker-pop {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>

      <svg
        className="np-upzi-svg"
        viewBox="35 30 680 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Shadows */}
          <filter id="upziEnvShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#022a26" floodOpacity="0.38" />
          </filter>

          <filter id="upziLetterShadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#022a26" floodOpacity="0.22" />
          </filter>

          <filter id="upziStampShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#022a26" floodOpacity="0.28" />
          </filter>

          <filter id="upziStickerShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        <g className="np-stage-float">
          {/* ══════════════════════════════════════════════════════════════
              1. LEFT DOODLE: Neon Lime Looping Spring Scribble
             ══════════════════════════════════════════════════════════════ */}
          <g className="np-doodle-coil" transform="translate(15, 10)">
            <path
              d="M 125 350 
                 C 75 330, 45 285, 75 250 
                 C 105 215, 155 235, 140 280 
                 C 125 320, 80 290, 85 240 
                 C 90 190, 145 190, 145 150 
                 C 145 110, 95 105, 105 160 
                 C 115 215, 170 190, 175 140 
                 C 180 90, 125 75, 140 40 
                 C 150 15, 185 25, 195 55"
              stroke="#ccff00"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="drop-shadow(0 0 10px rgba(204, 255, 0, 0.55))"
            />
          </g>

          {/* ══════════════════════════════════════════════════════════════
              2. RIGHT DOODLE: Neon Lime Looping Arrow pointing to envelope
             ══════════════════════════════════════════════════════════════ */}
          <g className="np-doodle-arrow" transform="translate(20, 0)">
            <path
              d="M 685 150 
                 C 695 110, 665 75, 635 85 
                 C 605 95, 600 135, 630 145 
                 C 660 155, 675 125, 660 100 
                 C 645 75, 595 85, 575 135 
                 C 568 150, 565 170, 565 190"
              stroke="#ccff00"
              strokeWidth="8.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="drop-shadow(0 0 10px rgba(204, 255, 0, 0.55))"
            />
            <path
              d="M 545 175 L 565 195 L 585 170"
              stroke="#ccff00"
              strokeWidth="8.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="drop-shadow(0 0 10px rgba(204, 255, 0, 0.55))"
            />
          </g>

          {/* ══════════════════════════════════════════════════════════════
              3. MAIN ENVELOPE + LETTER SCENE
             ══════════════════════════════════════════════════════════════ */}
          <g className="np-env-in">
            {/* Ground Shadow */}
            <ellipse cx="388" cy="395" rx="200" ry="14" fill="#021c19" opacity="0.35" filter="blur(6px)" />

            {/* Envelope Back */}
            <g filter="url(#upziEnvShadow)">
              <rect x="195" y="142" width="386" height="242" rx="28" fill="#0f766e" />
            </g>

            {/* Dark Inner Lining */}
            <path
              d="M 201 154 L 388 84 L 575 154 L 575 372 C 575 378 570 382 554 382 L 222 382 C 206 382 201 378 201 372 Z"
              fill="#064e3b"
            />

            {/* Open Flap */}
            <g className="np-flap-open">
              <path
                d="M 195 152 C 272 76, 344 46, 388 46 C 432 46, 504 76, 581 152 Z"
                fill="#14b8a6"
              />
              <path
                d="M 388 46 C 432 46, 504 76, 581 152 L 388 152 Z"
                fill="#000000"
                fillOpacity="0.08"
              />
            </g>

            {/* ── THE LETTER SHEET (Stylized Notebook Ruled Paper) ── */}
            <g className="np-letter-sheet">
              <g filter="url(#upziLetterShadow)">
                <rect x="218" y="58" width="340" height="236" rx="22" fill="#ffffff" />
              </g>

              {/* Faint Ruled Lines */}
              <g stroke="#e2e8f0" strokeWidth="1.4">
                <line x1="230" y1="94" x2="546" y2="94" />
                <line x1="230" y1="128" x2="546" y2="128" />
                <line x1="230" y1="162" x2="546" y2="162" />
                <line x1="230" y1="196" x2="546" y2="196" />
                <line x1="230" y1="230" x2="546" y2="230" />
                <line x1="230" y1="264" x2="546" y2="264" />
              </g>

              {/* Stylized Letter Content (Comfortaa / Fredoka / Itim) */}
              <text className="np-font-letter" x="240" y="114" fontSize="13" fontWeight="600" fill="#1e293b" letterSpacing="-0.2">
                <tspan fontWeight="700" fill="#0d9488">nextplease</tspan> hiểu cảm giác lạc hướng giữa
              </text>
              <text className="np-font-letter" x="240" y="148" fontSize="13" fontWeight="600" fill="#1e293b" letterSpacing="-0.2">
                vô vàn lựa chọn. Và <tspan fontWeight="700" fill="#0d9488">nextplease</tspan> ở đây để giúp
              </text>
              <text className="np-font-letter" x="240" y="182" fontSize="13" fontWeight="600" fill="#1e293b" letterSpacing="-0.2">
                bạn: <tspan fontWeight="700" fill="#0f172a">Tìm hướng đi, tích proof thật,</tspan> và
              </text>
              <text className="np-font-letter" x="240" y="216" fontSize="13" fontWeight="700" fill="#0d9488" letterSpacing="-0.2">
                mở khoá cơ hội nghề nghiệp.
              </text>
            </g>

            {/* ── ENVELOPE FRONT POCKET ── */}
            <g filter="url(#upziEnvShadow)">
              <path
                d="M 195 214 
                   L 388 262 
                   L 581 214 
                   L 581 356 
                   A 28 28 0 0 1 553 384 
                   L 223 384 
                   A 28 28 0 0 1 195 356 
                   Z"
                fill="#10b981"
              />
              <path
                d="M 195 214 L 388 262 L 581 214"
                stroke="#6ee7b7"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Small Mint Swirl Pin */}
            <g transform="translate(210, 238)">
              <circle cx="15" cy="15" r="14" fill="#34d399" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
              <path
                d="M 9 17 C 8 10, 14 7, 19 10 C 23 13, 21 20, 15 19 C 12 18, 12 14, 15 13"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* ── ADDRESS SECTION: FROM & TO ── */}
            {/* FROM: nextplease (Stylized Bubble Sticker) */}
            <g transform="translate(238, 280)">
              <text className="np-font-display" x="0" y="0" fontSize="14" fontWeight="700" fill="#ffffff" letterSpacing="0.8">
                FROM:
              </text>
              <g transform="translate(62, -20)">
                <rect x="0" y="0" width="114" height="30" rx="15" fill="#ffffff" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.14))" />
                <text className="np-font-display" x="12" y="21" fontSize="15.5" fontWeight="800" fill="#059669" letterSpacing="-0.2">
                  nextplease<tspan fill="#f59e0b">:</tspan>
                </text>
              </g>
            </g>

            {/* TO: Sinh viên & các bạn trẻ */}
            <g transform="translate(238, 322)">
              <text className="np-font-display" x="0" y="0" fontSize="14" fontWeight="700" fill="#ffffff" letterSpacing="0.8">
                TO:
              </text>
              
              {/* Line 1 */}
              <text className="np-font-display" x="62" y="-1" fontSize="13.5" fontWeight="600" fill="#ffffff">
                Các bạn sinh viên &amp; các bạn trẻ
              </text>
              <line x1="62" y1="9" x2="315" y2="9" stroke="#ffffff" strokeOpacity="0.38" strokeWidth="1.2" />

              {/* Line 2 */}
              <text className="np-font-display" x="62" y="28" fontSize="13.5" fontWeight="600" fill="#ffffff">
                đang tìm kiếm cơ hội
              </text>
              <line x1="62" y1="38" x2="315" y2="38" stroke="#ffffff" strokeOpacity="0.38" strokeWidth="1.2" />
            </g>

            {/* ══════════════════════════════════════════════════════════════
                4. STICKERS: ⚡ Lightning & 🧡 Heart
               ══════════════════════════════════════════════════════════════ */}
            {/* ⚡ Lightning Bolt Sticker */}
            <g className="np-sticker-pop np-st-d2 np-sticker-bolt" transform="translate(540, 294) rotate(-8)">
              <g filter="url(#upziStickerShadow)">
                <path
                  d="M 15 2 L 4 17 L 12 17 L 7 32 L 24 14 L 15 14 Z"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="#ffffff"
                />
                <path
                  d="M 15 2 L 4 17 L 12 17 L 7 32 L 24 14 L 15 14 Z"
                  fill="#facc15"
                />
                <path
                  d="M 15 4 L 7 16 L 13 16 L 10 26 L 20 15 L 15 15 Z"
                  fill="#fef08a"
                  opacity="0.8"
                />
              </g>
            </g>

            {/* 🧡 Orange Heart Sticker */}
            <g className="np-sticker-pop np-st-d3 np-sticker-heart" transform="translate(548, 342) rotate(10)">
              <g filter="url(#upziStickerShadow)">
                <path
                  d="M 14 6 
                     C 10 0, 0 2, 0 10 
                     C 0 18, 14 26, 14 26 
                     C 14 26, 28 18, 28 10 
                     C 28 2, 18 0, 14 6 Z"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="#ffffff"
                />
                <path
                  d="M 14 6 
                     C 10 0, 0 2, 0 10 
                     C 0 18, 14 26, 14 26 
                     C 14 26, 28 18, 28 10 
                     C 28 2, 18 0, 14 6 Z"
                  fill="#fb923c"
                />
                <ellipse cx="6" cy="8" rx="2.5" ry="4" fill="#ffffff" opacity="0.6" transform="rotate(-25 6 8)" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
