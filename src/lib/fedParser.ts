import { FedMeeting } from '../types';

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

export function parseCmeHistory(content: string): FedMeeting[] {
  const clean = content.replace(/^\ufeff/, '').trim();
  const lines = clean.split(/\r?\n/).map((l) => l.split(',').map((c) => c.trim()));

  if (lines.length < 3 || lines[1][0].toLowerCase() !== 'date') {
    throw new Error('Usa il CSV originale di CME FedWatch: Historical → Downloads → All upcoming meetings.');
  }

  const headerRow = lines[0];
  const targetRow = lines[1];

  // Match meeting columns
  const meetings: FedMeeting[] = [];
  const meetingBlocks: Array<{ index: number; dateStr: string }> = [];

  const regex = /History for (\d{1,2}) ([A-Za-z]{3}) (\d{4}) Fed meeting/i;
  for (let col = 0; col < headerRow.length; col++) {
    const label = headerRow[col];
    const match = regex.exec(label);
    if (match) {
      const [, day, monthStr, year] = match;
      const monthNum = MONTHS[monthStr.toLowerCase()];
      if (monthNum) {
        const paddedMonth = String(monthNum).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        meetingBlocks.push({ index: col, dateStr: `${year}-${paddedMonth}-${paddedDay}` });
      }
    }
  }

  if (meetingBlocks.length === 0) {
    throw new Error('Il CSV non contiene riunioni Fed riconoscibili.');
  }

  // Last available observation row (row index 2 or subsequent)
  const lastObsRow = lines[2];

  for (let b = 0; b < meetingBlocks.length; b++) {
    const current = meetingBlocks[b];
    const nextIndex = b + 1 < meetingBlocks.length ? meetingBlocks[b + 1].index : targetRow.length;
    const probs: Record<string, number> = {};
    let highestProb = -1;
    let mostProbRange = '';

    for (let c = current.index; c < nextIndex && c < targetRow.length; c++) {
      const rateLabel = targetRow[c].replace(/[()]/g, '').trim();
      const valStr = lastObsRow[c];
      const parsedVal = parseFloat(valStr);
      if (!isNaN(parsedVal)) {
        // CME gives percentage as e.g. 72.4 or 0.724
        const percentage = parsedVal <= 1.0 ? parsedVal * 100 : parsedVal;
        probs[rateLabel] = Math.round(percentage * 10) / 10;
        if (percentage > highestProb) {
          highestProb = percentage;
          mostProbRange = rateLabel;
        }
      }
    }

    if (Object.keys(probs).length > 0) {
      meetings.push({
        meetingDate: current.dateStr,
        currentRate: '4.50 - 4.75%',
        mostProbableRange: mostProbRange ? `${mostProbRange.replace('-', ' - ')} bps` : '4.25 - 4.50%',
        probability: Math.round(highestProb * 10) / 10,
        probabilities: probs,
      });
    }
  }

  return meetings;
}
