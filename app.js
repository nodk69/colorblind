/* ═══════════════════════════════════════════════════════════════
   COLOR VISION TEST — app.js
   Vanilla JS, no dependencies. Canvas plates generated here.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   DIGIT PATTERNS  (5 cols × 7 rows, 1 = filled pixel)
───────────────────────────────────────────────────────────── */
const DIGITS = {
  '0': [
    [0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],
    [1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]
  ],
  '1': [
    [0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],
    [0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]
  ],
  '2': [
    [0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],
    [0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]
  ],
  '3': [
    [1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],
    [0,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]
  ],
  '4': [
    [0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],
    [1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]
  ],
  '5': [
    [1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],
    [1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]
  ],
  '6': [
    [0,0,1,1,0],[0,1,0,0,0],[1,0,0,0,0],
    [1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]
  ],
  '7': [
    [1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],
    [0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]
  ],
  '8': [
    [0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],
    [0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]
  ],
  '9': [
    [0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],
    [0,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,1,1,0,0]
  ]
};

/* ─────────────────────────────────────────────────────────────
   HSL → HEX HELPER
   Standard CSS hsl() conversion used when building plate colors.
───────────────────────────────────────────────────────────── */
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k     = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ─────────────────────────────────────────────────────────────
   PLATE CONFIGURATIONS  —  20 plates
   fig / bg: [hue 0-360, saturation 0-100, lightness 0-100]
   Equal lightness on diagnostic plates → colors differ only in hue.
   scoring values:
     'normal'        correct answer for normal vision
     'protan'        answer typical of protanomaly/protanopia
     'deutan'        answer typical of deuteranomaly/deuteranopia
     'protan-deutan' typical of either red-green deficiency
     'tritan'        typical of tritanomaly/tritanopia
     'severity'      indicates moderate-to-strong deficiency
     'none'          distractor — no diagnostic value
───────────────────────────────────────────────────────────── */
const PLATES = [
  /* ── PLATE 1  Demo — everyone sees this ── */
  {
    id: 1, label: '12',
    fig: [215, 68, 22],   // dark navy   (L=22)
    bg:  [44,  72, 52],   // golden yellow (L=52) — intentional L difference for maximum contrast
    options: [
      { text: '12', scoring: 'normal' },
      { text: '21', scoring: 'none'   },
      { text: '18', scoring: 'none'   },
      { text: '15', scoring: 'none'   },
      { text: 'I see no number', scoring: 'none' },
      { text: "I'm not sure",   scoring: 'none'  }
    ],
    purpose: 'Control — high luminance contrast, all vision types see 12'
  },

  /* ── PLATE 2  Red-green screening ── */
  {
    id: 2, label: '8',
    fig: [18, 76, 50],    // orange-red  (L=50)
    bg:  [73, 76, 50],    // yellow-green (L=50)
    options: [
      { text: '8', scoring: 'normal'        },
      { text: '3', scoring: 'protan-deutan' },
      { text: '6', scoring: 'none'          },
      { text: '0', scoring: 'none'          },
      { text: 'I see no number', scoring: 'protan-deutan' },
      { text: "I'm not sure",   scoring: 'none'           }
    ],
    purpose: 'Primary red-green detection'
  },

  /* ── PLATE 3  Red-green confirmation ── */
  {
    id: 3, label: '74',
    fig: [14, 74, 48],    // deep red-orange (L=48)
    bg:  [70, 74, 48],    // olive-green     (L=48)
    options: [
      { text: '74', scoring: 'normal'        },
      { text: '21', scoring: 'protan-deutan' },
      { text: '71', scoring: 'none'          },
      { text: '24', scoring: 'none'          },
      { text: 'I see no number', scoring: 'protan-deutan' },
      { text: "I'm not sure",   scoring: 'none'           }
    ],
    purpose: 'Red-green confirmation (two-digit)'
  },

  /* ── PLATE 4  Red-green ── */
  {
    id: 4, label: '6',
    fig: [356, 55, 55],   // salmon-pink   (L=55)
    bg:  [120, 22, 55],   // grey-green    (L=55)
    options: [
      { text: '6', scoring: 'normal'        },
      { text: '5', scoring: 'protan-deutan' },
      { text: '8', scoring: 'none'          },
      { text: '0', scoring: 'none'          },
      { text: 'I see no number', scoring: 'protan-deutan' },
      { text: "I'm not sure",   scoring: 'none'           }
    ],
    purpose: 'Red-green detection — salmon vs grey-green'
  },

  /* ── PLATE 5  Severity indicator ── */
  {
    id: 5, label: '16',
    fig: [12, 60, 50],    // muted red     (L=50, lower sat → subtler)
    bg:  [78, 60, 50],    // muted green   (L=50)
    options: [
      { text: '16', scoring: 'normal'   },
      { text: '10', scoring: 'severity' },
      { text: '19', scoring: 'none'     },
      { text: '15', scoring: 'none'     },
      { text: 'I see no number', scoring: 'severity' },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Severity indicator — mild deficiency may still read this'
  },

  /* ── PLATE 6  Severity indicator (harder) ── */
  {
    id: 6, label: '2',
    fig: [8,  52, 51],    // very muted red-orange (L=51)
    bg:  [82, 52, 51],    // very muted lime       (L=51)
    options: [
      { text: '2', scoring: 'normal'   },
      { text: '7', scoring: 'severity' },
      { text: '5', scoring: 'none'     },
      { text: '3', scoring: 'none'     },
      { text: 'I see no number', scoring: 'severity' },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Severity indicator — even mild deficiency struggles here'
  },

  /* ── PLATE 7  Red-green two-digit ── */
  {
    id: 7, label: '29',
    fig: [22, 72, 49],    // orange-red (L=49)
    bg:  [75, 72, 49],    // yellow-green (L=49)
    options: [
      { text: '29', scoring: 'normal'        },
      { text: '70', scoring: 'protan-deutan' },
      { text: '20', scoring: 'none'          },
      { text: '79', scoring: 'none'          },
      { text: 'I see no number', scoring: 'protan-deutan' },
      { text: "I'm not sure",   scoring: 'none'           }
    ],
    purpose: 'Red-green detection — deficiency typically transposes digits'
  },

  /* ── PLATE 8  Protan vs Deutan differentiator ── */
  {
    id: 8, label: '7',
    fig: [2,  80, 44],    // deep red (L=44) — protan sees as very dark, merges with bg
    bg:  [32, 38, 42],    // brownish-olive (L=42) — similar L, protan confusion
    options: [
      { text: '7', scoring: 'normal' },   // normal & deutan see 7
      { text: '1', scoring: 'none'   },
      { text: '4', scoring: 'none'   },
      { text: '9', scoring: 'none'   },
      { text: 'I see no number', scoring: 'protan' }, // protan cannot distinguish
      { text: "I'm not sure",   scoring: 'none'    }
    ],
    purpose: 'Protan differentiator — protan sees nothing, deutan & normal see 7'
  },

  /* ── PLATE 9  Protan vs Deutan differentiator (reverse) ── */
  {
    id: 9, label: '5',
    fig: [118, 62, 44],   // vivid green (L=44) — deutan sees as brownish, merges with bg
    bg:  [24,  48, 42],   // warm brown (L=42) — deutan confusion
    options: [
      { text: '5', scoring: 'normal' },   // normal & protan see 5
      { text: '6', scoring: 'none'   },
      { text: '3', scoring: 'none'   },
      { text: '8', scoring: 'none'   },
      { text: 'I see no number', scoring: 'deutan' }, // deutan cannot distinguish
      { text: "I'm not sure",   scoring: 'none'    }
    ],
    purpose: 'Deutan differentiator — deutan sees nothing, protan & normal see 5'
  },

  /* ── PLATE 10  Type differentiation ── */
  {
    id: 10, label: '42',
    fig: [16, 70, 48],    // red-orange (L=48)
    bg:  [72, 70, 48],    // yellow-green (L=48)
    options: [
      { text: '42', scoring: 'normal' },
      { text: '2',  scoring: 'protan' }, // protan loses left digit (4)
      { text: '4',  scoring: 'deutan' }, // deutan loses right digit (2)
      { text: '44', scoring: 'none'   },
      { text: 'I see no number', scoring: 'severity' },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Type differentiation — which digit they see identifies protan vs deutan'
  },

  /* ── PLATE 11  Tritan (blue-yellow) detection ── */
  {
    id: 11, label: '3',
    fig: [252, 68, 50],   // blue-purple (L=50)
    bg:  [172, 68, 50],   // teal-green  (L=50) — tritan confusion line
    options: [
      { text: '3', scoring: 'normal' },
      { text: '8', scoring: 'none'   },
      { text: '5', scoring: 'none'   },
      { text: '0', scoring: 'none'   },
      { text: 'I see no number', scoring: 'tritan' },
      { text: "I'm not sure",   scoring: 'tritan'  }
    ],
    purpose: 'Tritan detection — blue-purple vs teal, equal lightness'
  },

  /* ── PLATE 12  Tritan confirmation ── */
  {
    id: 12, label: '9',
    fig: [240, 65, 49],   // blue       (L=49)
    bg:  [178, 65, 49],   // cyan-teal  (L=49)
    options: [
      { text: '9', scoring: 'normal' },
      { text: '6', scoring: 'none'   },
      { text: '4', scoring: 'none'   },
      { text: '7', scoring: 'none'   },
      { text: 'I see no number', scoring: 'tritan' },
      { text: "I'm not sure",   scoring: 'tritan'  }
    ],
    purpose: 'Tritan confirmation — second blue-yellow plate'
  },

  /* ── PLATE 13  Severe deficiency confirmation ── */
  {
    id: 13, label: '97',
    fig: [6,  56, 50],    // very muted red (L=50)
    bg:  [80, 56, 50],    // very muted green (L=50, subtle hue diff)
    options: [
      { text: '97', scoring: 'normal'   },
      { text: '79', scoring: 'severity' },
      { text: '91', scoring: 'none'     },
      { text: '17', scoring: 'none'     },
      { text: 'I see no number', scoring: 'severity' },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Severe confirmation — only normal vision reads this reliably'
  },

  /* ── PLATE 14  Moderate screening (deutan-specific) ── */
  {
    id: 14, label: '15',
    fig: [20, 70, 50],    // orange-red (L=50)
    bg:  [50, 55, 48],    // warm yellow-green (L=48, slightly closer hue)
    options: [
      { text: '15', scoring: 'normal' },
      { text: '17', scoring: 'protan' },
      { text: '13', scoring: 'none'   },
      { text: '75', scoring: 'none'   },
      { text: 'I see no number', scoring: 'deutan'   },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Moderate screening — deutan specific confusion pattern'
  },

  /* ── PLATE 15  Partial type differentiation ── */
  {
    id: 15, label: '64',
    fig: [16, 68, 50],    // red-orange  (L=50)
    bg:  [74, 68, 50],    // yellow-green (L=50)
    options: [
      { text: '64', scoring: 'normal' },
      { text: '6',  scoring: 'protan' }, // protan loses second digit
      { text: '4',  scoring: 'deutan' }, // deutan loses first digit
      { text: '46', scoring: 'none'   },
      { text: 'I see no number', scoring: 'severity' },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Partial type differentiation — second data point for protan/deutan'
  },

  /* ── PLATE 16  Mild screening ── */
  {
    id: 16, label: '0',
    fig: [10, 50, 51],    // soft red-orange (L=51, low sat)
    bg:  [84, 50, 51],    // soft lime-green (L=51)
    options: [
      { text: '0', scoring: 'normal'   },
      { text: '8', scoring: 'none'     },
      { text: '6', scoring: 'none'     },
      { text: '9', scoring: 'none'     },
      { text: 'I see no number', scoring: 'severity' },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Mild screening — borderline deficiency may still read 0'
  },

  /* ── PLATE 17  Mild screening 2 ── */
  {
    id: 17, label: '38',
    fig: [20, 65, 50],    // orange-red (L=50)
    bg:  [70, 65, 50],    // yellow-green (L=50)
    options: [
      { text: '38', scoring: 'normal'        },
      { text: '88', scoring: 'protan-deutan' },
      { text: '33', scoring: 'none'          },
      { text: '83', scoring: 'none'          },
      { text: 'I see no number', scoring: 'protan-deutan' },
      { text: "I'm not sure",   scoring: 'none'           }
    ],
    purpose: 'Mild screening — additional data point for borderline cases'
  },

  /* ── PLATE 18  Supplementary ── */
  {
    id: 18, label: '1',
    fig: [16, 72, 49],    // red-orange (L=49)
    bg:  [76, 72, 49],    // chartreuse-green (L=49)
    options: [
      { text: '1', scoring: 'normal'        },
      { text: '7', scoring: 'protan-deutan' },
      { text: '4', scoring: 'none'          },
      { text: '9', scoring: 'none'          },
      { text: 'I see no number', scoring: 'protan-deutan' },
      { text: "I'm not sure",   scoring: 'none'           }
    ],
    purpose: 'Supplementary — increases confidence in scoring'
  },

  /* ── PLATE 19  Supplementary ── */
  {
    id: 19, label: '56',
    fig: [24, 70, 50],    // orange (L=50)
    bg:  [72, 70, 50],    // yellow-green (L=50)
    options: [
      { text: '56', scoring: 'normal'        },
      { text: '50', scoring: 'protan-deutan' },
      { text: '65', scoring: 'none'          },
      { text: '55', scoring: 'none'          },
      { text: 'I see no number', scoring: 'protan-deutan' },
      { text: "I'm not sure",   scoring: 'none'           }
    ],
    purpose: 'Supplementary — two-digit extra data point'
  },

  /* ── PLATE 20  Final severity confirmation ── */
  {
    id: 20, label: '4',
    fig: [4,  58, 50],    // near-red (L=50, subtle hue — hardest plate)
    bg:  [82, 58, 50],    // near-green (L=50)
    options: [
      { text: '4', scoring: 'normal'   },
      { text: '1', scoring: 'none'     },
      { text: '7', scoring: 'none'     },
      { text: '9', scoring: 'none'     },
      { text: 'I see no number', scoring: 'severity' },
      { text: "I'm not sure",   scoring: 'none'      }
    ],
    purpose: 'Final severity check — only normal vision reliably sees this'
  }
];

/* ─────────────────────────────────────────────────────────────
   CANVAS GENERATION UTILITIES
───────────────────────────────────────────────────────────── */
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* ─────────────────────────────────────────────────────────────
   DIGIT DOT POSITIONS
   Returns an array of {x, y, r} for figure dots.
   All coordinates in logical pixels (400×400 space).
───────────────────────────────────────────────────────────── */
function getDigitDotPositions(label, cx, cy, plateRadius) {
  const chars = label.split('');
  const n = chars.length;
  const ROWS = 7, COLS = 5;

  // Number fills 62–72% of plate diameter
  const maxWidth  = plateRadius * (n === 1 ? 0.56 : 0.86);
  const maxHeight = plateRadius * 0.72;
  const cellByW   = maxWidth  / (n * COLS + (n - 1) * 1.4);
  const cellByH   = maxHeight / ROWS;
  const cellSize  = Math.min(cellByW, cellByH);
  const gap       = cellSize * 1.4;

  const totalW = n * COLS * cellSize + (n - 1) * gap;
  const totalH = ROWS * cellSize;
  const positions = [];

  chars.forEach((ch, di) => {
    const pattern = DIGITS[ch];
    if (!pattern) return;
    const startX = cx - totalW / 2 + di * (COLS * cellSize + gap);
    const startY = cy - totalH / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (pattern[row] && pattern[row][col] === 1) {
          const pcx = startX + col * cellSize + cellSize / 2;
          const pcy = startY + row * cellSize + cellSize / 2;

          // 4–7 dots per lit pixel cell for solid coverage
          const count = 4 + Math.floor(Math.random() * 4);
          for (let k = 0; k < count; k++) {
            const ox = (Math.random() - 0.5) * cellSize * 0.9;
            const oy = (Math.random() - 0.5) * cellSize * 0.9;
            const r  = clamp(cellSize * 0.22 + Math.random() * cellSize * 0.18, 2.5, 12);
            positions.push({ x: pcx + ox, y: pcy + oy, r });
          }
        }
      }
    }
  });

  return positions;
}

/* ─────────────────────────────────────────────────────────────
   GENERATE ONE PLATE  (improved — white bg, 450 dots, DPR-aware, noise)
   The canvas should already be sized at 400*DPR × 400*DPR.
   All drawing happens in logical 400×400 coordinate space via ctx.scale.
───────────────────────────────────────────────────────────── */
function generatePlate(canvas, plate) {
  const ctx      = canvas.getContext('2d');
  const LOGICAL  = 400;
  const DPR      = canvas.width / LOGICAL;  // inferred from canvas size
  const cx = 200, cy = 200, plateR = 188;

  // Scale once so all coordinates below are in logical pixels
  ctx.save();
  if (DPR !== 1) ctx.scale(DPR, DPR);

  ctx.clearRect(0, 0, LOGICAL, LOGICAL);

  // ── White plate circle ──
  ctx.beginPath();
  ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
  ctx.fillStyle = '#f5f5f5';
  ctx.fill();

  // ── Clip all dots to circle ──
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, plateR - 1, 0, Math.PI * 2);
  ctx.clip();

  const figHex  = hslToHex(...plate.fig);
  const bgHex   = hslToHex(...plate.bg);
  const noiseL  = plate.fig[2]; // noise shares same perceived lightness

  // Figure dots (the number)
  const figDots = getDigitDotPositions(plate.label, cx, cy, plateR * 0.90);

  // Background dots — random fill, 400-440 total
  const bgDots = [];
  const bgCount = 400 + Math.floor(Math.random() * 40);
  for (let i = 0; i < bgCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.sqrt(Math.random()) * (plateR - 6) * 0.97;
    const r     = 2.5 + Math.random() * 9.5;    // radius 2.5–12 logical px
    bgDots.push({ x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), r });
  }

  // Noise dots — 15–22 dots with random hues at same lightness
  // Prevents shape-recognition shortcuts (makes it look like real Ishihara)
  const noiseDots = [];
  const noiseCount = 15 + Math.floor(Math.random() * 8);
  for (let i = 0; i < noiseCount; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const dist   = Math.sqrt(Math.random()) * (plateR - 6) * 0.95;
    const noiseH = Math.random() * 360;
    // Vary saturation slightly around 55% for noise
    const noiseS = 45 + Math.random() * 20;
    noiseDots.push({
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
      r: 2.5 + Math.random() * 8,
      hex: hslToHex(noiseH, noiseS, noiseL)
    });
  }

  // Merge and shuffle so draw order doesn't reveal the number
  const allDots = [
    ...bgDots.map(d  => ({ ...d, hex: bgHex  })),
    ...figDots.map(d => ({ ...d, hex: figHex })),
    ...noiseDots
  ];
  shuffle(allDots);

  // Draw each dot with subtle per-dot color and size jitter for texture
  const JITTER = 20;
  allDots.forEach(dot => {
    const [r, g, b] = hexToRgb(dot.hex);
    const jr = clamp(r + (Math.random() - 0.5) * JITTER * 2, 0, 255);
    const jg = clamp(g + (Math.random() - 0.5) * JITTER * 2, 0, 255);
    const jb = clamp(b + (Math.random() - 0.5) * JITTER * 2, 0, 255);

    // ±12% radius wobble per dot for organic feel
    const rFinal = Math.max(dot.r * (0.88 + Math.random() * 0.24), 2);

    ctx.fillStyle = `rgb(${Math.round(jr)},${Math.round(jg)},${Math.round(jb)})`;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, rFinal, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore(); // remove clip

  // ── Circle border ──
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore(); // remove DPR scale
}

/* ─────────────────────────────────────────────────────────────
   APP STATE
───────────────────────────────────────────────────────────── */
const state = {
  currentPlate:     0,
  answers:          [],
  plateStartTime:   null,
  timeoutHandle:    null,
  generatedCanvases: [],
  testComplete:     false
};

/* ─────────────────────────────────────────────────────────────
   DOM REFERENCES
───────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const DOM = {
  instructionsScreen: $('instructions-screen'),
  prevResultBanner:   $('prev-result-banner'),
  prevResultText:     $('prev-result-text'),
  dismissBannerBtn:   $('dismiss-banner-btn'),
  startTestBtn:       $('start-test-btn'),
  testScreen:         $('test-screen'),
  progressText:       $('progress-text'),
  progressFill:       $('progress-fill'),
  progressTrack:      document.querySelector('.progress-track'),
  plateArea:          $('plate-area'),
  plateContainer:     $('plate-container'),
  plateCanvas:        $('plate-canvas'),
  answerButtons:      $('answer-buttons'),
  resultsScreen:      $('results-screen'),
  resultsBadge:       $('results-badge'),
  resultsTitle:       $('results-title'),
  resultsSubtitle:    $('results-subtitle'),
  severityMarker:     $('severity-marker'),
  markerLabel:        $('marker-label'),
  typeDetail:         $('type-detail'),
  typeContent:        $('type-content'),
  normalDetail:       $('normal-detail'),
  normalDetailText:   $('normal-detail-text'),
  breakdownContent:   $('breakdown-content'),
  productsSection:    $('products-section'),
  emailForm:          $('email-form'),
  emailInput:         $('email-input'),
  emailFormMsg:       $('email-form-msg'),
  copyLinkBtn:        $('copy-link-btn'),
  twitterShareBtn:    $('twitter-share-btn'),
  facebookShareBtn:   $('facebook-share-btn'),
  whatsappShareBtn:   $('whatsapp-share-btn'),
  copyConfirm:        $('copy-confirm'),
  retakeBtn:          $('retake-btn'),
  siteFooter:         $('site-footer'),
  clearDataBtn:       $('clear-data-btn')
};

/* ─────────────────────────────────────────────────────────────
   LOCAL STORAGE
───────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'cvt_result_v1';

function saveResult(result) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date:       new Date().toISOString(),
      type:       result.type,
      severity:   result.severity,
      confidence: result.confidence,
      breakdown:  result.breakdown
    }));
  } catch (e) { /* localStorage full or disabled */ }
}

function loadPreviousResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearStoredResult() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined,
    { month: 'long', day: 'numeric', year: 'numeric' });
}

/* ─────────────────────────────────────────────────────────────
   PRE-GENERATE ALL 20 PLATES  (async, one per frame)
   Generates each plate in a separate task so the browser
   stays responsive and the progress text updates visibly.
───────────────────────────────────────────────────────────── */
async function preGeneratePlates(onProgress) {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  state.generatedCanvases = [];

  for (let i = 0; i < PLATES.length; i++) {
    await new Promise(resolve => requestAnimationFrame(() => {
      const off = document.createElement('canvas');
      off.width  = 400 * DPR;
      off.height = 400 * DPR;
      generatePlate(off, PLATES[i]);
      state.generatedCanvases.push(off);
      if (onProgress) onProgress(i + 1, PLATES.length);
      resolve();
    }));
  }
}

/* ─────────────────────────────────────────────────────────────
   SCREEN TRANSITIONS
───────────────────────────────────────────────────────────── */
function showScreen(screen) {
  [DOM.instructionsScreen, DOM.testScreen, DOM.resultsScreen].forEach(s => {
    if (s) s.classList.add('hidden');
  });
  if (screen) screen.classList.remove('hidden');
}

function showFooter(visible) {
  DOM.siteFooter.classList.toggle('hidden', !visible);
}

/* ─────────────────────────────────────────────────────────────
   INSTRUCTIONS SCREEN
───────────────────────────────────────────────────────────── */
function showInstructionScreen() {
  showScreen(DOM.instructionsScreen);
  showFooter(true);

  // Reset button in case of restart
  DOM.startTestBtn.disabled    = false;
  DOM.startTestBtn.textContent = 'Start Test →';

  const prev = loadPreviousResult();
  if (prev) {
    DOM.prevResultText.textContent =
      `You took this test on ${formatDate(prev.date)}. ` +
      `Result: ${getTypeLabel(prev.type)} — ${prev.severity} deficiency. ` +
      `Take it again to compare?`;
    DOM.prevResultBanner.classList.remove('hidden');
  }

  DOM.startTestBtn.addEventListener('click', startTest, { once: true });
  DOM.dismissBannerBtn.addEventListener('click', () =>
    DOM.prevResultBanner.classList.add('hidden'));
}

/* ─────────────────────────────────────────────────────────────
   START TEST  (shows "Preparing…" while plates generate)
───────────────────────────────────────────────────────────── */
async function startTest() {
  state.currentPlate = 0;
  state.answers      = [];
  state.testComplete = false;

  // Show inline progress on the button while generating
  DOM.startTestBtn.disabled    = true;
  DOM.startTestBtn.textContent = 'Preparing test plates…';

  await preGeneratePlates((done, total) => {
    DOM.startTestBtn.textContent = `Preparing… ${done} / ${total}`;
  });

  // Set up main canvas at correct DPR
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  DOM.plateCanvas.width  = 400 * DPR;
  DOM.plateCanvas.height = 400 * DPR;

  showScreen(DOM.testScreen);
  showFooter(false);
  displayPlate(0);
}

/* ─────────────────────────────────────────────────────────────
   DISPLAY A PLATE
───────────────────────────────────────────────────────────── */
function displayPlate(index) {
  if (index >= PLATES.length) { finishTest(); return; }

  const plate    = PLATES[index];
  const plateNum = index + 1;

  DOM.progressText.textContent = `Plate ${plateNum} of ${PLATES.length}`;
  DOM.progressFill.style.width = ((index / PLATES.length) * 100) + '%';
  DOM.progressTrack.setAttribute('aria-valuenow', plateNum);
  DOM.progressTrack.setAttribute('aria-valuemax', PLATES.length);

  // Fade in by drawing to main canvas
  DOM.plateContainer.style.opacity = '0';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const ctx = DOM.plateCanvas.getContext('2d');
    ctx.clearRect(0, 0, DOM.plateCanvas.width, DOM.plateCanvas.height);
    ctx.drawImage(state.generatedCanvases[index],
      0, 0, DOM.plateCanvas.width, DOM.plateCanvas.height);
    DOM.plateContainer.style.transition = 'opacity 0.25s ease';
    DOM.plateContainer.style.opacity    = '1';
  }));

  // Build answer buttons
  DOM.answerButtons.innerHTML = '';
  plate.options.forEach(opt => {
    const btn       = document.createElement('button');
    const isSpecial = opt.text === 'I see no number' || opt.text === "I'm not sure";
    btn.className   = 'answer-btn' + (isSpecial ? ' no-number' : '');
    btn.textContent = opt.text;
    btn.setAttribute('aria-label', `Select answer: ${opt.text}`);
    btn.addEventListener('click', () => recordAnswer(opt, plate), { once: true });
    DOM.answerButtons.appendChild(btn);
  });

  state.plateStartTime = performance.now();

  clearTimeout(state.timeoutHandle);
  state.timeoutHandle = setTimeout(() => {
    recordAnswer({ text: 'timeout', scoring: 'none' }, plate, true);
  }, 10000);
}

/* ─────────────────────────────────────────────────────────────
   RECORD AN ANSWER & ADVANCE
───────────────────────────────────────────────────────────── */
function recordAnswer(opt, plate, isTimeout = false) {
  clearTimeout(state.timeoutHandle);

  state.answers.push({
    plateId:    plate.id,
    scoring:    opt.scoring,
    text:       opt.text,
    responseMs: isTimeout ? 10000 : Math.round(performance.now() - state.plateStartTime)
  });

  DOM.answerButtons.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled = true;
    b.style.pointerEvents = 'none';
  });

  DOM.plateContainer.style.opacity = '0';
  setTimeout(() => {
    state.currentPlate++;
    displayPlate(state.currentPlate);
  }, 280);
}

/* ─────────────────────────────────────────────────────────────
   FINISH TEST
───────────────────────────────────────────────────────────── */
function finishTest() {
  clearTimeout(state.timeoutHandle);
  state.testComplete = true;
  const result = scoreAnswers(state.answers);
  saveResult(result);
  showResultsScreen(result);
}

/* ─────────────────────────────────────────────────────────────
   SCORING ALGORITHM  (updated for 20 plates)
───────────────────────────────────────────────────────────── */
function scoreAnswers(answers) {
  const counts = {
    normal:          0,
    protan:          0,
    deutan:          0,
    'protan-deutan': 0,
    tritan:          0,
    severity:        0,
    none:            0
  };

  let fastNormal = 0;  // < 2s on normal-scoring answer
  let slowNormal = 0;  // > 5s on normal-scoring answer

  answers.forEach(a => {
    if (counts[a.scoring] !== undefined) counts[a.scoring]++;
    if (a.scoring === 'normal') {
      if (a.responseMs < 2000) fastNormal++;
      if (a.responseMs > 5000) slowNormal++;
    }
  });

  // Split combined protan-deutan answers equally
  const combined  = counts['protan-deutan'];
  counts.protan  += combined * 0.5;
  counts.deutan  += combined * 0.5;

  // Severity answers contribute to both protan & deutan pools at half weight
  counts.protan += counts.severity * 0.5;
  counts.deutan += counts.severity * 0.5;

  // Total raw deficiency score
  const rawDef = counts.protan + counts.deutan + counts.tritan + counts.severity;

  // Response-time modifier: very fast correct answers push toward normal
  let timeMod = 0;
  if (fastNormal >= 8)  timeMod -= 2;
  else if (fastNormal >= 5) timeMod -= 1;
  if (slowNormal >= 4)  timeMod += 2;
  else if (slowNormal >= 2) timeMod += 1;

  const adjustedDef = Math.max(rawDef + timeMod, 0);

  // Severity bands scaled for 20 plates
  let severity;
  if (adjustedDef <= 3)       severity = 'none';
  else if (adjustedDef <= 8)  severity = 'mild';
  else if (adjustedDef <= 14) severity = 'moderate';
  else                        severity = 'strong';

  // Determine type
  let type = 'normal';
  if (severity !== 'none') {
    const pd = counts.protan + counts.deutan;
    if (counts.tritan >= 1.5 &&
        counts.tritan > counts.protan &&
        counts.tritan > counts.deutan) {
      type = 'tritan';
    } else if (counts.protan > counts.deutan + 1) {
      type = 'protan';
    } else if (counts.deutan > counts.protan + 1) {
      type = 'deutan';
    } else if (pd > 2) {
      type = 'protan-deutan';
    } else {
      type = 'inconclusive';
    }
  }

  // Confidence: how consistent/dominant the pattern was
  const total      = PLATES.length;
  const dominance  = Math.abs(counts.normal - adjustedDef);
  const consistency = 1 - (counts.none / total); // fewer "unsure" = more consistent
  const confidence = Math.round(clamp(
    (dominance / total) * 70 + consistency * 30,
    15, 98
  ));

  return {
    type,
    severity,
    confidence,
    breakdown: {
      normal:   Math.round(counts.normal),
      protan:   Math.round(counts.protan),
      deutan:   Math.round(counts.deutan),
      tritan:   Math.round(counts.tritan),
      noNumber: counts.severity + counts.none,
      combined: Math.round(counts['protan-deutan'])
    }
  };
}

/* ─────────────────────────────────────────────────────────────
   RESULTS RENDERING  (unchanged)
───────────────────────────────────────────────────────────── */
const TYPE_INFO = {
  normal: {
    label:  'Normal Color Vision',
    badge:  '🎉',
    colors: [],
    desc:   'Your color vision appears to fall within the normal range.',
    detail: 'You identified the test plates in a pattern consistent with typical trichromatic color vision. You can likely distinguish the full range of hues in everyday life.',
    affect: '~8% of males and ~0.5% of females have some form of color vision deficiency — you appear not to be among them.'
  },
  protan: {
    label:  'Protanomaly / Protanopia',
    badge:  '🔴',
    colors: ['Red & green', 'Red & dark brown', 'Orange & yellow-green'],
    desc:   'Possible red weakness detected.',
    detail: 'Protanomaly (mild) or protanopia (complete) results from reduced or absent function of the long-wavelength (red) photoreceptors. Reds appear darker or brownish.',
    affect: 'Affects ~1% of males. Typically inherited in an X-linked recessive pattern.'
  },
  deutan: {
    label:  'Deuteranomaly / Deuteranopia',
    badge:  '🟢',
    colors: ['Green & red-orange', 'Green & brown', 'Blue-green & gray'],
    desc:   'Possible green weakness detected.',
    detail: 'Deuteranomaly (mild) or deuteranopia (complete) is the most common form of color deficiency. It affects medium-wavelength (green) photoreceptors.',
    affect: 'Affects ~5% of males. Typically inherited in an X-linked recessive pattern.'
  },
  'protan-deutan': {
    label:  'Red-Green Color Deficiency',
    badge:  '🔴',
    colors: ['Red & green', 'Orange & yellow-green', 'Brown & olive'],
    desc:   'Red-green color deficiency detected.',
    detail: 'Your response pattern suggests a red-green deficiency. The specific sub-type (protan vs. deutan) could not be determined from this screening alone.',
    affect: 'Combined, red-green deficiencies affect ~8% of males and ~0.5% of females worldwide.'
  },
  tritan: {
    label:  'Tritanomaly / Tritanopia',
    badge:  '🔵',
    colors: ['Blue & green', 'Yellow & pink-red', 'Purple & red'],
    desc:   'Possible blue-yellow deficiency detected.',
    detail: 'Tritanomaly or tritanopia affects blue-yellow color discrimination. Unlike red-green deficiency, tritan defects affect males and females equally and can be acquired.',
    affect: 'Affects fewer than 0.01% of people. Can be acquired due to aging, medication, or disease — worth discussing with a doctor.'
  },
  inconclusive: {
    label:  'Inconclusive',
    badge:  '🤔',
    colors: [],
    desc:   'Your results were inconclusive.',
    detail: 'Your response pattern did not strongly match any single deficiency profile. This can happen with mild deficiencies, borderline cases, or inconsistent responses.',
    affect: 'Consider retaking the test in good lighting on a desktop screen, or consult an eye care professional for a formal assessment.'
  }
};

function getTypeLabel(type) {
  return TYPE_INFO[type] ? TYPE_INFO[type].label : 'Unknown';
}

function showResultsScreen(result) {
  showScreen(DOM.resultsScreen);
  showFooter(true);

  const info     = TYPE_INFO[result.type] || TYPE_INFO.inconclusive;
  const isNormal = result.type === 'normal';

  DOM.resultsBadge.textContent  = info.badge;
  DOM.resultsTitle.textContent  = isNormal
    ? 'Your Color Vision Appears Normal'
    : `${severityLabel(result.severity)} ${info.label} Detected`;
  DOM.resultsSubtitle.textContent = info.desc;

  // Animate severity marker
  const pos = { none: 5, mild: 32, moderate: 60, strong: 90 };
  requestAnimationFrame(() => requestAnimationFrame(() => {
    DOM.severityMarker.style.left = (pos[result.severity] || 5) + '%';
    DOM.markerLabel.textContent   = severityLabel(result.severity);
  }));

  // Type detail card
  if (!isNormal && result.type !== 'inconclusive') {
    DOM.typeDetail.classList.remove('hidden');
    let html = `<div class="type-row">
      <span class="type-label-pill ${result.type === 'tritan' ? 'tritan' : ''}">${info.label}</span>
      <div class="type-info">
        <p>${info.detail}</p>
        <p style="margin-top:0.5rem">${info.affect}</p>
      </div>
    </div>`;
    if (info.colors.length) {
      html += `<div>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.4rem">Colors commonly confused:</p>
        <div class="confusion-colors">
          ${info.colors.map(c => `<span class="confusion-tag">${c}</span>`).join('')}
        </div>
      </div>`;
    }
    DOM.typeContent.innerHTML = html;
  } else if (result.type === 'inconclusive') {
    DOM.typeDetail.classList.remove('hidden');
    DOM.typeContent.innerHTML =
      `<p style="font-size:0.88rem;color:var(--text-secondary)">${info.detail}</p>`;
  }

  if (isNormal) {
    DOM.normalDetail.classList.remove('hidden');
    DOM.normalDetailText.textContent = info.detail + ' ' + info.affect;
  }

  // Breakdown bars
  const bk    = result.breakdown;
  const total = PLATES.length;
  const rows  = [
    { label: 'Normal pattern',        count: bk.normal,   color: 'var(--success)'    },
    { label: 'Protan indicators',     count: bk.protan,   color: 'var(--danger)'     },
    { label: 'Deutan indicators',     count: bk.deutan,   color: '#ff6b35'           },
    { label: 'Tritan indicators',     count: bk.tritan,   color: 'var(--warning)'    },
    { label: '"No number" responses', count: bk.noNumber, color: 'var(--text-muted)' }
  ];
  DOM.breakdownContent.innerHTML = rows.map(row => `
    <div class="breakdown-row">
      <span class="breakdown-label">${row.label}</span>
      <div class="breakdown-bar-wrap">
        <div class="breakdown-bar" style="background:${row.color};width:0%"
             data-target="${Math.round((row.count / total) * 100)}%"></div>
      </div>
      <span class="breakdown-count">${row.count} / ${total}</span>
    </div>`).join('');

  requestAnimationFrame(() => requestAnimationFrame(() => {
    DOM.breakdownContent.querySelectorAll('.breakdown-bar').forEach(bar => {
      bar.style.transition = 'width 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
      bar.style.width      = bar.dataset.target;
    });
  }));

  if (!isNormal && result.type !== 'inconclusive') {
    DOM.productsSection.classList.remove('hidden');
  }

  // Share buttons
  const shareUrl  = window.location.href.split('?')[0];
  const shareText = isNormal
    ? 'I just took a free color vision test — results appear normal!'
    : 'I just took a free color vision test. Interesting results!';
  const enc    = encodeURIComponent;
  DOM.twitterShareBtn.href  = `https://twitter.com/intent/tweet?text=${enc(shareText + ' Try it: ' + shareUrl)}`;
  DOM.facebookShareBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;
  DOM.whatsappShareBtn.href = `https://wa.me/?text=${enc(shareText + ' Try it: ' + shareUrl)}`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function severityLabel(s) {
  return { none: 'Normal', mild: 'Mild', moderate: 'Moderate', strong: 'Strong' }[s] || 'Unknown';
}

/* ─────────────────────────────────────────────────────────────
   SHARE: COPY LINK
───────────────────────────────────────────────────────────── */
function copyLink() {
  const url = window.location.href.split('?')[0];
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(showCopyConfirm);
  } else {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopyConfirm(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }
}

function showCopyConfirm() {
  DOM.copyConfirm.textContent = '✓ Link copied to clipboard!';
  setTimeout(() => { DOM.copyConfirm.textContent = ''; }, 3000);
}

/* ─────────────────────────────────────────────────────────────
   EMAIL FORM  —  Formspree Ajax submission
───────────────────────────────────────────────────────────── */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnjyevow';

function initEmailForm() {
  const submitBtn = document.getElementById('email-submit-btn');

  DOM.emailForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = DOM.emailInput.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      DOM.emailFormMsg.className   = 'email-msg error';
      DOM.emailFormMsg.textContent = 'Please enter a valid email address.';
      DOM.emailInput.focus();
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';
    DOM.emailInput.disabled      = true;
    DOM.emailFormMsg.className   = 'email-msg';
    DOM.emailFormMsg.textContent = '';

    const prev = loadPreviousResult();
    const resultSummary = prev
      ? `Type: ${getTypeLabel(prev.type)} | Severity: ${prev.severity} | Confidence: ${prev.confidence}%`
      : 'No result stored';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, _subject: 'Color Vision Test — Results Report Request', result: resultSummary })
      });
      const data = await response.json();

      if (response.ok) {
        DOM.emailFormMsg.className   = 'email-msg success';
        DOM.emailFormMsg.textContent = '✓ Thanks! Check your inbox shortly.';
        DOM.emailInput.value = '';
      } else {
        const msg = Array.isArray(data.errors)
          ? data.errors.map(e => e.message).join(' ')
          : (data.error || 'Submission failed. Please try again.');
        DOM.emailFormMsg.className   = 'email-msg error';
        DOM.emailFormMsg.textContent = msg;
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Report';
        DOM.emailInput.disabled = false;
        DOM.emailInput.focus();
      }
    } catch (_) {
      DOM.emailFormMsg.className   = 'email-msg error';
      DOM.emailFormMsg.textContent = 'Network error — please check your connection and try again.';
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Report';
      DOM.emailInput.disabled = false;
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   RESTART
───────────────────────────────────────────────────────────── */
function restartTest() {
  DOM.typeDetail.classList.add('hidden');
  DOM.normalDetail.classList.add('hidden');
  DOM.productsSection.classList.add('hidden');
  DOM.emailInput.disabled = false;
  document.getElementById('email-submit-btn').disabled    = false;
  document.getElementById('email-submit-btn').textContent = 'Send Report';
  DOM.emailFormMsg.textContent = '';
  DOM.emailInput.value         = '';
  DOM.copyConfirm.textContent  = '';
  DOM.typeContent.innerHTML    = '';
  DOM.breakdownContent.innerHTML = '';
  DOM.severityMarker.style.left  = '5%';
  showInstructionScreen();
}

/* ─────────────────────────────────────────────────────────────
   CLEAR DATA
───────────────────────────────────────────────────────────── */
function clearData() {
  clearStoredResult();
  DOM.prevResultBanner.classList.add('hidden');
  const orig = DOM.clearDataBtn.textContent;
  DOM.clearDataBtn.textContent = '✓ Data cleared';
  setTimeout(() => { DOM.clearDataBtn.textContent = orig; }, 2500);
}

/* ─────────────────────────────────────────────────────────────
   BEFOREUNLOAD GUARD
───────────────────────────────────────────────────────────── */
window.addEventListener('beforeunload', e => {
  if (state.currentPlate > 0 && !state.testComplete) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ─────────────────────────────────────────────────────────────
   KEYBOARD SHORTCUTS  (keys 1–6 map to answer buttons)
───────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (DOM.testScreen.classList.contains('hidden')) return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 6) {
    const btns = DOM.answerButtons.querySelectorAll('.answer-btn:not(:disabled)');
    if (btns[n - 1]) btns[n - 1].click();
  }
});

/* ─────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────── */
function init() {
  initEmailForm();

  DOM.copyLinkBtn.addEventListener('click', copyLink);
  DOM.retakeBtn.addEventListener('click', restartTest);
  DOM.clearDataBtn.addEventListener('click', clearData);

  // Hide WhatsApp share on non-touch desktop
  if (!('ontouchstart' in window) && window.innerWidth > 768) {
    const wa = DOM.whatsappShareBtn;
    if (wa) wa.classList.add('hidden');
  }

  showInstructionScreen();
}

document.addEventListener('DOMContentLoaded', init);
