import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProgramCalcInput, ProgramCalcOutput } from '../types';
import { formatProgramCalcWhatsApp, openWhatsAppDirect } from '../utils/whatsapp';
import {
  Calculator,
  Share2,
  Copy,
  Check,
  Sliders,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ProgramCalculatorProps {
  initialInput?: ProgramCalcInput;
  onSaveInput?: (input: ProgramCalcInput) => void;
  onExportToDeal?: (params: { ends: string; panno: string }) => void;
}

export const ProgramCalculator: React.FC<ProgramCalculatorProps> = ({
  initialInput,
  onSaveInput,
  onExportToDeal,
}) => {
  const [yarnDenier, setYarnDenier] = useState<number>(initialInput?.yarnDenier ?? 240);
  const [filament, setFilament] = useState<number>(initialInput?.filament ?? 12);
  const [creel, setCreel] = useState<number>(initialInput?.creel ?? 168);
  const [ends, setEnds] = useState<number>(initialInput?.ends ?? 12024);
  const [pano, setPano] = useState<number>(initialInput?.pano ?? 58);
  const [selectedDividers, setSelectedDividers] = useState<(number | 'auto')[]>(
    initialInput?.reedDividers ?? ['auto']
  );
  const [isManualReedActive, setIsManualReedActive] = useState<boolean>(
    initialInput?.manualReedActive ?? false
  );
  const [manualReedSize, setManualReedSize] = useState<number>(
    initialInput?.manualReedSize ?? 35
  );

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculation Engine
  const calculation: ProgramCalcOutput | null = useMemo(() => {
    if (ends <= 0 || pano <= 0 || creel <= 0 || filament <= 0) return null;

    const section = Math.ceil(ends / creel / filament);
    const gola = Math.ceil(ends / section / filament);

    const activeDividers = selectedDividers.map((d) => (d === 'auto' ? section : d));
    const uniqueDividers = Array.from(new Set(activeDividers)).filter((v) => v > 0);
    const dividersToUse = uniqueDividers.length > 0 ? uniqueDividers : [section];

    const dividerResults = dividersToUse.map((div) => {
      const requiredReed = ends / pano / div;
      return {
        divider: div,
        reedCount: Math.ceil(requiredReed),
        requiredReed,
      };
    });

    const avgReedCount =
      dividerResults.reduce((s, r) => s + r.reedCount, 0) / dividerResults.length;
    const avgRequiredReed =
      dividerResults.reduce((s, r) => s + r.requiredReed, 0) / dividerResults.length;

    const chosenReedCount =
      isManualReedActive && manualReedSize > 0 ? manualReedSize : Math.round(avgReedCount);
    const requiredReed = Number(avgRequiredReed.toFixed(2));

    const reedGharBeam = Math.round(chosenReedCount * pano);
    const reedGharSection = Math.ceil(reedGharBeam / section);
    const avgEndsGhar = Number((ends / reedGharBeam).toFixed(2));

    // Distribution
    const endsPerSection = Math.round(ends / section);
    const gharInSection = reedGharSection;
    const baseEnds = Math.floor(endsPerSection / gharInSection);
    const extraEnds = endsPerSection % gharInSection;

    const pattern: number[] = [];
    let accumulator = 0;
    for (let i = 0; i < gharInSection; i++) {
      accumulator += extraEnds;
      if (accumulator >= gharInSection) {
        pattern.push(baseEnds + 1);
        accumulator -= gharInSection;
      } else {
        pattern.push(baseEnds);
      }
    }

    let ruleExplanation = '';
    let highTar: number | undefined;
    let lowTar: number | undefined;
    let highCount: number | undefined;
    let lowCount: number | undefined;

    if (extraEnds === 0) {
      ruleExplanation = `બધા ${gharInSection} ઘરમાં સરખા ${baseEnds} તાર આવશે.`;
    } else {
      highCount = extraEnds;
      lowCount = gharInSection - extraEnds;
      highTar = baseEnds + 1;
      lowTar = baseEnds;

      if (highCount > lowCount) {
        const minInt = Math.floor(highCount / lowCount);
        const maxInt = minInt + 1;
        ruleExplanation = `દર ${minInt} થી ${maxInt} ઘરમાં વધારે તાર (${highTar}T) અને બાકીમાં (${lowTar}T) આવશે.`;
      } else {
        const minInt = Math.floor(lowCount / highCount);
        const maxInt = minInt + 1;
        ruleExplanation = `દર ${minInt} થી ${maxInt} ઘરમાં ઓછો તાર (${lowTar}T) અને બાકીમાં (${highTar}T) આવશે.`;
      }
    }

    return {
      section,
      gola,
      reedCount: chosenReedCount,
      requiredReed,
      reedGharBeam,
      reedGharSection,
      avgEndsGhar,
      dividerResults,
      pattern,
      baseEnds,
      extraEnds,
      ruleExplanation,
      highTar,
      lowTar,
      highCount,
      lowCount,
    };
  }, [ends, pano, creel, filament, selectedDividers, isManualReedActive, manualReedSize]);

  // Save on change
  useEffect(() => {
    if (onSaveInput) {
      onSaveInput({
        yarnDenier,
        filament,
        creel,
        ends,
        pano,
        reedDividers: selectedDividers,
        manualReedActive: isManualReedActive,
        manualReedSize,
      });
    }
  }, [
    yarnDenier,
    filament,
    creel,
    ends,
    pano,
    selectedDividers,
    isManualReedActive,
    manualReedSize,
    onSaveInput,
  ]);

  // High-DPI Sharp Animated Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !calculation) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;
    const pattern = calculation.pattern;
    const gharWidth = 48;
    const displayLimit = Math.min(pattern.length, 36);
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = displayLimit * gharWidth;
    const cssHeight = 130;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Reed Top & Bottom Steel Frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, cssWidth, 16);
      ctx.fillRect(0, cssHeight - 16, cssWidth, 16);

      // Steel frame border
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 15, cssWidth, 1);
      ctx.fillRect(0, cssHeight - 16, cssWidth, 1);

      offset += 0.04;
      const glow = Math.sin(offset) * 2;
      const maxTar = Math.max(...pattern);

      for (let i = 0; i < displayLimit; i++) {
        const x = i * gharWidth;
        const endsCount = pattern[i];
        const isMax = endsCount === maxTar;

        // Vertical Dent Wire
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 16);
        ctx.lineTo(x, cssHeight - 16);
        ctx.stroke();

        // Ghar Index Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText(`G${i + 1}`, x + 5, 27);

        // Yarn lines inside dent
        const padding = 10;
        const availableSpace = gharWidth - padding * 2;
        const step = endsCount > 1 ? availableSpace / (endsCount - 1) : availableSpace / 2;

        ctx.lineWidth = 2;
        ctx.strokeStyle = isMax ? '#38bdf8' : '#fb7185';

        for (let j = 0; j < endsCount; j++) {
          const lineX = endsCount === 1 ? x + gharWidth / 2 : x + padding + j * step;
          ctx.beginPath();
          ctx.moveTo(lineX, 32);
          ctx.lineTo(lineX, cssHeight - 32);
          ctx.stroke();

          // Yarn Node
          ctx.fillStyle = isMax ? '#0284c7' : '#e11d48';
          ctx.beginPath();
          ctx.arc(lineX, 58 + glow * (j % 2 === 0 ? 1 : -1), 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Tar label
        ctx.fillStyle = isMax ? '#38bdf8' : '#fb7185';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(`${endsCount}T`, x + gharWidth / 2 - 8, cssHeight - 20);
      }

      // Final Right Border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(displayLimit * gharWidth, 16);
      ctx.lineTo(displayLimit * gharWidth, cssHeight - 16);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [calculation]);

  const toggleDivider = (val: number | 'auto') => {
    if (selectedDividers.includes(val)) {
      if (selectedDividers.length > 1) {
        setSelectedDividers(selectedDividers.filter((d) => d !== val));
      }
    } else {
      setSelectedDividers([...selectedDividers, val]);
    }
  };

  const handleShareWhatsApp = () => {
    if (!calculation) return;
    const msg = formatProgramCalcWhatsApp(
      {
        yarnDenier,
        filament,
        creel,
        ends,
        pano,
        reedDividers: selectedDividers,
        manualReedActive: isManualReedActive,
        manualReedSize,
      },
      calculation
    );
    openWhatsAppDirect('', msg);
  };

  const handleCopyReport = () => {
    if (!calculation) return;
    const msg = formatProgramCalcWhatsApp(
      {
        yarnDenier,
        filament,
        creel,
        ends,
        pano,
        reedDividers: selectedDividers,
        manualReedActive: isManualReedActive,
        manualReedSize,
      },
      calculation
    );
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Mono Yarn Splitting Program (વોર્પિંગ ગણતરી)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mother yarn splitting to mono yarn beams, creel capacity, reed divider & dent patterns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onExportToDeal && (
            <button
              type="button"
              onClick={() => onExportToDeal({ ends: String(ends), panno: String(pano) })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
            >
              <span>Export to Deal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Party Data Input Section */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-blue-100 dark:border-blue-950/80 shadow-2xs transition-colors">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                <span>Party Order Data (ઓર્ડર વિગત)</span>
              </h2>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Primary Inputs</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ENDS (કુલ તાર)
                </label>
                <input
                  type="number"
                  value={ends}
                  onChange={(e) => setEnds(Number(e.target.value) || 0)}
                  placeholder="e.g. 12024"
                  className="w-full px-3 py-2 text-sm font-bold text-blue-900 dark:text-blue-300 bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/60 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono-numbers outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  PANNO (પન્નો / ઇંચ)
                </label>
                <input
                  type="number"
                  value={pano}
                  onChange={(e) => setPano(Number(e.target.value) || 0)}
                  placeholder="e.g. 58"
                  className="w-full px-3 py-2 text-sm font-bold text-blue-900 dark:text-blue-300 bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/60 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono-numbers outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Mother Yarn Specifications */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Mother Yarn Splitting Specs (મધર યાર્ન વિગત)</span>
              </h2>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium font-mono">
                {creel} × {filament} = {creel * filament} Ends/Sec
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  MOTHER YARN D
                </label>
                <input
                  type="number"
                  value={yarnDenier}
                  onChange={(e) => setYarnDenier(Number(e.target.value) || 0)}
                  placeholder="240"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  FILAMENT (Fil)
                </label>
                <input
                  type="number"
                  value={filament}
                  onChange={(e) => setFilament(Number(e.target.value) || 0)}
                  placeholder="12"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  CREEL (Bobbins)
                </label>
                <input
                  type="number"
                  value={creel}
                  onChange={(e) => setCreel(Number(e.target.value) || 0)}
                  placeholder="168"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reed Divider Selector */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Reed Formula Divider (રીડ ફોર્મ્યુલા ભાગાકાર)
              </label>
              <span className="text-[11px] text-slate-400">Multiple allowed</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleDivider('auto')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  selectedDividers.includes('auto')
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Auto (Section: {calculation?.section || '...'})
              </button>
              {[4, 5, 6, 7].map((div) => {
                const isSelected = selectedDividers.includes(div);
                return (
                  <button
                    key={div}
                    type="button"
                    onClick={() => toggleDivider(div)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Divider {div}
                  </button>
                );
              })}
            </div>

            {/* Manual Reed Option Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Custom / Manual Reed?</span>
              <button
                type="button"
                onClick={() => setIsManualReedActive(!isManualReedActive)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isManualReedActive
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isManualReedActive ? 'Manual Active ✓' : 'Enable Manual Reed'}
              </button>
            </div>

            {isManualReedActive && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Enter Reed Size (હાથથી રીડ સાઇઝ નાખો)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={manualReedSize}
                    onChange={(e) => setManualReedSize(Number(e.target.value) || 0)}
                    placeholder="e.g. 35, 40..."
                    step="any"
                    className="w-32 px-2.5 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-100 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg font-mono-numbers outline-none"
                  />
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    કસ્ટમ સાઇઝ લાગુ થશે
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculation Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                Section (સેક્શન)
              </span>
              <strong className="text-blue-600 dark:text-blue-400 text-2xl font-black font-mono-numbers block mt-1">
                {calculation?.section ?? '—'}
              </strong>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                Gola (ગોળા)
              </span>
              <strong className="text-slate-900 dark:text-white text-2xl font-black font-mono-numbers block mt-1">
                {calculation?.gola ?? '—'}
              </strong>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                Reed Count {isManualReedActive ? '(Manual)' : ''}
              </span>
              <strong className="text-blue-600 dark:text-blue-400 text-2xl font-black font-mono-numbers block mt-1">
                {calculation?.reedCount ?? '—'}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Req: {calculation?.requiredReed ?? '—'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                Ghar in Beam (બીમમાં રીડ ઘર)
              </span>
              <strong className="text-slate-900 dark:text-white text-lg font-bold font-mono-numbers block mt-1">
                {calculation?.reedGharBeam ?? '—'}
              </strong>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                1 Sec Ghar (૧ સેક્શનમાં રીડ ઘર)
              </span>
              <strong className="text-slate-900 dark:text-white text-lg font-bold font-mono-numbers block mt-1">
                {calculation?.reedGharSection ?? '—'}
              </strong>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                Avg Ends/Ghar (સરેરાશ તાર/ઘર)
              </span>
              <strong className="text-slate-900 dark:text-white text-lg font-bold font-mono-numbers block mt-1">
                {calculation?.avgEndsGhar ?? '—'}
              </strong>
            </div>
          </div>

          {/* Divider Comparison Box */}
          {calculation && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Divider Comparison Breakdown (ભાગાકાર સરખામણી)
                </span>
                <span className="text-[11px] text-slate-400">Values in Real-Time</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {calculation.dividerResults.map((item) => (
                  <div
                    key={item.divider}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <span className="font-bold text-blue-900 dark:text-blue-300 block">
                      Divider {item.divider}
                    </span>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      <span>Reed Count:</span>
                      <strong className="font-mono-numbers text-slate-900 dark:text-slate-100">
                        {item.reedCount}
                      </strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Exact:</span>
                      <span className="font-mono-numbers">{item.requiredReed.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1 Section Wise Dent & Yarn Visualizer */}
          {calculation && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>1 Section Dent & Yarn Distribution (ડેન્ટિંગ પેટર્ન)</span>
                </h3>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Interactive Canvas</span>
              </div>

              {/* Dynamic Rule Card */}
              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed font-medium">
                <strong>નિયમ: </strong>
                <span>{calculation.ruleExplanation}</span>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                {calculation.highCount !== undefined && calculation.highTar !== undefined && (
                  <div className="px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium">
                    {calculation.highCount} ઘર : {calculation.highTar} તાર
                  </div>
                )}
                {calculation.lowCount !== undefined && calculation.lowTar !== undefined && (
                  <div className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium">
                    {calculation.lowCount} ઘર : {calculation.lowTar} તાર
                  </div>
                )}
                <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                  કુલ ૧ સેક્શન ઘર: {calculation.reedGharSection}
                </div>
              </div>

              {/* Canvas Container */}
              <div className="bg-slate-950 rounded-xl p-3 overflow-x-auto shadow-inner border border-slate-800">
                <canvas ref={canvasRef} className="block mx-auto max-w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
