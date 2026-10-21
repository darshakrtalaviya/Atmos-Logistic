import { TripRecord, DealData, ProgramCalcOutput, ProgramCalcInput } from '../types';

export function formatInwardPickupWhatsApp(trip: TripRecord, partyBalance?: number): string {
  const dateFormatted = new Date(trip.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `*ATMOS GROUP* 🏢
*MOTHER YARN SPLITTING & MONO BEAMS*

*PIPE RECEIPT CONFIRMATION / પાઇપ મળ્યાની પહોંચ*

*PARTY NAME:* ${trip.khataName}
*DATE:* ${dateFormatted}
*PIPE QUANTITY:* *${trip.pipeCount} PIPES (ખાલી પાઇપ)*
*PIPE PICKUP LOCATION:* ${trip.pickup || 'Party Premises'}
*TEMPO NUMBER:* ${trip.vehicleNumber}
*RECEIVED BY:* ${trip.driver || trip.owner}${trip.driverPhone ? ` (${trip.driverPhone})` : ''}
*RECEIPT / CHALLAN NO:* ${trip.challanNo}
${trip.beamCount > 0 ? `*ADDITIONAL BEAMS:* ${trip.beamCount} BEAMS\n` : ''}${trip.remark ? `*REMARK / નોંધ:* ${trip.remark}\n` : ''}${partyBalance !== undefined ? `*CURRENT PIPE BALANCE:* *${partyBalance} Pipes* (જમા પાઇપ બેલેન્સ)\n` : ''}
સદર પાઇપ મધર યાર્ન સ્પ્લિટિંગ અને મોનો બીમ બનાવવા માટે સારી સ્થિતિમાં સ્વીકારેલ છે.
(Mono Yarn Beaming)

*ATMOS GROUP*
Prince Mayani: +91 99255 79533`;
}

export function formatOutwardDeliveryWhatsApp(trip: TripRecord): string {
  const dateFormatted = new Date(trip.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalOutItems = (Number(trip.beamCount) || 0) + (Number(trip.pipeCount) || 0);

  return `*ATMOS GROUP* 🏢
*MOTHER YARN SPLITTING & MONO BEAMS*

*OUTWARD DELIVERY CHALLAN / ડિલિવરી ચલણ*

*CHALLAN NO:* ${trip.challanNo}
*DATE:* ${dateFormatted}
*PARTY NAME:* ${trip.khataName}
*TEMPO NUMBER:* ${trip.vehicleNumber}
*DELIVERED BY / DRIVER:* ${trip.driver || trip.owner}${trip.driverPhone ? ` (${trip.driverPhone})` : ''}
*DELIVERY ROUTE:* ${trip.pickup || 'ATMOS Plant'} ➔ ${trip.destination || 'Party Premises'}

*DISPATCHED ITEMS (OUTWARD ITEMS: ${totalOutItems}):*
${trip.beamCount > 0 ? `• *મોનો બીમ (Mono Beams):* *${trip.beamCount} BEAMS*\n` : ''}${trip.pipeCount > 0 ? `• *ખાલી પાઇપ (Pipes):* *${trip.pipeCount} PIPES*\n` : ''}${trip.remark ? `*REMARK / નોંધ:* ${trip.remark}\n` : ''}
માલ યોગ્ય સ્થિતિમાં મોકલેલ છે.

*ATMOS GROUP*
Prince Mayani: +91 99255 79533`;
}

export function formatDealMessage(deal: DealData): string {
  const address = deal.partyAddress.trim();
  const location = deal.partyLocation.trim();
  const days = deal.paymentDays;
  const transportation = deal.transportationOption;
  const gst = deal.gstOption;

  let partyLine = '';
  if (address && location) {
    partyLine = `${address} || ${location}`;
  } else {
    partyLine = address || location || '[Party Address] | [Party Location]';
  }

  const sectionsText = deal.beams.map((beam) => {
    const item = beam.itemName.trim() || '[Item Name]';
    const ends = beam.ends.trim() || '[Ends]';
    const rs = beam.panno.trim() || '[Panno]';
    const qty = beam.beamQty || 0;
    const mtr = beam.meterPerBeam || 0;
    const rate = beam.rate.trim() || '[Rate]';
    const qStr = qty > 0 ? String(qty) : '[Qty]';
    const mStr = mtr > 0 ? String(mtr) : '[Mtr]';
    const totalMtr = qty * mtr;

    const rateOptions = [
      transportation ? '+ Transportation' : '',
      gst ? '+ GST' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `ITEM NAME :- ${item} [ No Dyeing Guarantee ]
ENDS :- ${ends}
Panno :- ${rs}
BEAM:- ${qStr} * ${mStr} mtr.
METER PER BEAM :- ${mtr > 0 ? mtr : '[Mtr]'}
TOTAL MTR :- ${totalMtr > 0 ? totalMtr : '[Total Mtr]'}
RATE :- ${rate}${rateOptions ? ` ${rateOptions}` : ''}`;
  });

  const combinedSections = sectionsText.join('\n\n-----------------------------\n\n');

  return `${partyLine}

${combinedSections}

PAYMENT CONDITION :- ${days || 20} DAYS NET BILL TO BILL
( Then after 1.5% interest applicable on late payment. )

By.
ATMOS GROUP
Prince Mayani: +9199255 79533`;
}

export function formatProgramCalcWhatsApp(
  input: ProgramCalcInput,
  output: ProgramCalcOutput
): string {
  return `*ATMOS GROUP* 🏢
*MOTHER YARN SPLITTING & MONO BEAM REPORT*

*Mother Yarn:* ${input.yarnDenier}D / ${input.filament} Fil | Creel: ${input.creel} Bobbins
*Mono Ends:* ${input.ends} | Pano: ${input.pano}"

*ગણતરી રિપોર્ટ (Splitting Results):*
• *સેક્શન (Section):* *${output.section}*
• *ગોળા (Gola per Section):* *${output.gola}*
• *રીડ કાઉન્ટ (Reed Count):* *${output.reedCount}* (Req: ${output.requiredReed})
• *બીમમાં રીડ ઘર (Reed Ghar in Beam):* *${output.reedGharBeam}*
• *૧ સેક્શનમાં રીડ ઘર (Reed Ghar in 1 Sec):* *${output.reedGharSection}*
• *સરેરાશ તાર/ઘર (Avg Ends/Ghar):* *${output.avgEndsGhar}*

*ડેન્ટિંગ નિયમ (Dent Pattern):*
${output.ruleExplanation}

By.
ATMOS GROUP
Prince Mayani: +9199255 79533`;
}

export function openWhatsAppDirect(phone: string | undefined, message: string) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  let url = `https://wa.me/?text=${encoded}`;
  if (cleanPhone) {
    const fullNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    url = `https://wa.me/${fullNumber}?text=${encoded}`;
  }
  window.open(url, '_blank');
}
