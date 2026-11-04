import React, { useState } from 'react';
import { FedMeeting } from '../../types';
import { INITIAL_FED_MEETINGS } from '../../data/marketData';
import { parseCmeHistory } from '../../lib/fedParser';
import { Upload, CheckCircle2, AlertTriangle, Calendar, FileText } from 'lucide-react';

export const FedMonitor: React.FC = () => {
  const [meetings, setMeetings] = useState<FedMeeting[]>(INITIAL_FED_MEETINGS);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCmeHistory(text);
        if (parsed.length > 0) {
          setMeetings(parsed);
          setImportStatus(`Importate con successo ${parsed.length} riunioni FOMC dal file "${file.name}".`);
          setImportError(null);
        } else {
          setImportError('Nessun dato di riunione valido trovato nel CSV.');
        }
      } catch (err: any) {
        setImportError(err.message || 'Errore nel parsing del CSV CME FedWatch.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          POLITICA MONETARIA STATUNITENSE
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Fed Rate Monitor & Probabilità CME FedWatch
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Distribuzione delle aspettative del mercato monetario sui tassi di interesse della Federal Reserve per le prossime riunioni del FOMC, con supporto all'importazione dei CSV storici ufficiali di CME Group.
        </p>
      </div>

      {/* CSV Import Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#15231f]" />
            <h4 className="text-sm font-bold text-[#15231f]">Importa archivio storico CME FedWatch</h4>
          </div>
          <p className="text-xs text-[#64716c]">
            Carica il file esportato da CME: Historical → Downloads → All upcoming meetings.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15231f] text-white hover:bg-[#20342e] text-xs font-semibold cursor-pointer shadow-md transition-all">
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Seleziona CSV CME</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {importError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{importError}</span>
        </div>
      )}

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meetings.map((meeting) => (
          <div
            key={meeting.meetingDate}
            className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#15231f]/5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#15231f]" />
                <h3 className="serif-brand font-bold text-base text-[#15231f]">
                  Riunione FOMC: {meeting.meetingDate}
                </h3>
              </div>
              <span className="mono-num text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#15231f]/5 text-[#15231f]">
                Tasso attuale: {meeting.currentRate}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-800 block">
                  Scenario più probabile
                </span>
                <strong className="text-sm font-extrabold text-emerald-950">
                  {meeting.mostProbableRange}
                </strong>
              </div>
              <div className="text-right">
                <span className="mono-num text-xl font-black text-emerald-700">
                  {meeting.probability}%
                </span>
                <span className="text-[10px] text-emerald-800 block">probabilità</span>
              </div>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-2.5 pt-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#64716c] block">
                Distribuzione probabilità target rate
              </span>
              {Object.entries(meeting.probabilities).map(([range, prob]) => (
                <div key={range} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="mono-num text-[#15231f] font-medium">{range}</span>
                    <strong className="mono-num text-[#15231f]">{prob.toFixed(1)}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${prob}%`,
                        backgroundColor: prob > 50 ? '#14785d' : '#64716c',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
