import React, { useState } from 'react';

interface ExportButtonsProps {
  onPdfExport: () => Promise<void> | void;
  onExcelExport: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onPdfExport, onExcelExport }) => {
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [isExcelLoading, setIsExcelLoading] = useState(false);

    const handlePdfClick = async () => {
        setIsPdfLoading(true);
        try {
            await onPdfExport();
        } catch (error) {
            console.error("PDF Export failed:", error);
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleExcelClick = () => {
        setIsExcelLoading(true);
        setTimeout(() => {
            try {
                onExcelExport();
            } catch (error) {
                console.error("Excel Export failed:", error);
            } finally {
                setIsExcelLoading(false);
            }
        }, 50);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handlePdfClick}
                disabled={isPdfLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold text-white transition-colors disabled:bg-slate-600 disabled:cursor-wait"
                title="تصدير إلى PDF"
            >
                {isPdfLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.229m0 0c1.527a1.932 1.932 0 003.71 0m-3.71 0z" /></svg>
                )}
                <span>PDF</span>
            </button>
            <button
                onClick={handleExcelClick}
                disabled={isExcelLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold text-white transition-colors disabled:bg-slate-600 disabled:cursor-wait"
                title="تصدير إلى Excel"
            >
                 {isExcelLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                   <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 21v-2.25M3.375 18.75h17.25M3.375 18.75s1.125-1.5 2.25-1.5 2.25 1.5 2.25 1.5s1.125-1.5 2.25-1.5 2.25 1.5 2.25 1.5s1.125-1.5 2.25-1.5 2.25 1.5 2.25 1.5M3.375 18.75c0-3.328 2.37-6.04 5.438-6.04s5.438 2.712 5.438 6.04M14.625 12.375c0-3.328 2.37-6.04 5.438-6.04s5.438 2.712 5.438 6.04M14.625 12.375c0-3.328-2.37-6.04-5.438-6.04s-5.438 2.712-5.438 6.04" /></svg>
                )}
                <span>Excel</span>
            </button>
        </div>
    );
};

export default ExportButtons;