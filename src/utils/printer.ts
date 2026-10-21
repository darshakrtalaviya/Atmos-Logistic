import { TripRecord } from '../types';

/**
 * Robust print helper that handles browser printing, modal printing,
 * and sandbox environments.
 */
export function triggerPrintElement(elementId: string): void {
  const element = document.getElementById(elementId);
  // If the element doesn't exist, try falling back to window.print
  if (!element) {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print failed:', e);
    }
    return;
  }

  // Ensure element is visible during print
  element.classList.remove('hidden');

  // Tag body for CSS print filtering
  document.body.classList.add('print-active-state');
  element.classList.add('print-current-target');

  try {
    window.print();
  } catch (err) {
    console.error('Window print error:', err);
    alertPrintNotice();
  } finally {
    // Clean up classes after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('print-active-state');
      element.classList.remove('print-current-target');
    }, 1200);
  }
}

function alertPrintNotice() {
  const existing = document.getElementById('print-sandbox-toast');
  if (existing) return;

  const toast = document.createElement('div');
  toast.id = 'print-sandbox-toast';
  toast.className =
    'fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-xs flex items-center gap-3 no-print max-w-md';
  toast.innerHTML = `
    <div class="text-amber-400 font-bold text-base">⚠️</div>
    <div>
      <div class="font-bold">પ્રિન્ટિંગ સૂચના (Print Notice)</div>
      <div class="text-slate-300 text-[11px] mt-0.5">
        તમે સીધું પ્રિન્ટ કરી શકો છો અથવા 'Download Slip (HTML / PDF)' બટન વાપરી શકો છો.
      </div>
    </div>
    <button id="close-print-sandbox-toast" class="ml-auto text-slate-400 hover:text-white p-1 font-bold">✕</button>
  `;
  document.body.appendChild(toast);

  document.getElementById('close-print-sandbox-toast')?.addEventListener('click', () => {
    toast.remove();
  });

  setTimeout(() => {
    toast.remove();
  }, 6000);
}

/**
 * Downloads a standalone, self-contained HTML file of the Challan
 * that can be opened in any browser or mobile phone and printed as A4 / PDF.
 */
export function downloadChallanFile(trip: TripRecord, elementId: string): void {
  const element = document.getElementById(elementId);
  const content = element ? element.innerHTML : '';

  const html = `<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="utf-8">
  <title>CHALLAN_${trip.challanNo}_${trip.khataName}</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 8mm; 
    }
    * {
      box-sizing: border-box;
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
      margin: 15px auto; 
      max-width: 820px; 
      padding: 24px; 
      border: 2px solid #0f172a; 
      border-radius: 12px; 
      background: #ffffff !important;
      color: #000000 !important;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 14px; 
      margin-bottom: 14px; 
    }
    th, td { 
      border: 1px solid #334155; 
      padding: 8px 10px; 
      text-align: left; 
    }
    th { 
      background: #f1f5f9; 
    }
    .print-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .print-btn { 
      padding: 10px 20px; 
      font-weight: bold; 
      background: #2563eb; 
      color: white; 
      border: none; 
      border-radius: 8px; 
      cursor: pointer; 
      font-size: 13px;
    }
    .print-btn:hover {
      background: #1d4ed8;
    }
    @media print { 
      .print-actions, .no-print { 
        display: none !important; 
      } 
      body { 
        border: none; 
        margin: 0; 
        padding: 0; 
        max-width: 100%;
      } 
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Click to Print / Save as PDF (પ્રિન્ટ કરો)</button>
  </div>
  ${content}
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        try {
          window.print();
        } catch(e) {}
      }, 500);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CHALLAN_${trip.challanNo}_${trip.khataName.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
