import type { User } from '../types';

declare global {
    interface Window {
        XLSX: any;
    }
}

export type PermissionAction =
  | 'manageProjects' // Create, edit, delete projects
  | 'manageTeam'     // Create, edit, delete employees
  | 'viewReports'    // View Reports and System Report pages
  | 'assignTasks'    // Assign tasks to other users
  | 'deleteAnyTask'  // Delete any task
  | 'editAnyTask'    // Edit any task
  | 'createTasks'   // Create new tasks
  | 'manageSettings' // Access and modify system settings
  | 'exportData';    // Can export data to PDF/Excel

const permissions: Record<User['role'], Partial<Record<PermissionAction, boolean>>> = {
  Admin: { // Admins have all permissions, this is just for clarity.
    manageProjects: true,
    manageTeam: true,
    viewReports: true,
    assignTasks: true,
    deleteAnyTask: true,
    editAnyTask: true,
    createTasks: true,
    manageSettings: true,
    exportData: true,
  },
  Supervisor: {
    manageProjects: true,
    viewReports: true,
    assignTasks: true,
    editAnyTask: true,
    createTasks: true,
    exportData: true,
  },
  Member: {
    createTasks: true,
  },
};

export const hasPermission = (user: User | null | undefined, action: PermissionAction): boolean => {
  if (!user?.role) return false;
  // Admins have all permissions implicitly
  if (user.role === 'Admin') return true;
  return !!permissions[user.role]?.[action];
};


/**
 * Exports data to an Excel file.
 * @param data Array of objects to export.
 * @param fileName The name of the file to be saved.
 */
export const exportToExcel = (data: any[], fileName:string): void => {
    if (!window.XLSX) {
        console.error("XLSX library is not loaded.");
        return;
    }
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Data');
    window.XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Creates a new browser tab with HTML content for viewing or printing.
 * @param title The title of the document for the new tab.
 * @param contentHtml The HTML string to be rendered.
 */
export const exportToPrintableView = (title: string, contentHtml: string): void => {
    const viewWindow = window.open('', '_blank');
    if (!viewWindow) {
        alert('Please allow popups to view the report.');
        return;
    }

    const styles = `
        <style>
            @page { size: A4 landscape; margin: 1cm; }
            body { 
                direction: rtl; 
                font-family: 'Cairo', sans-serif;
                background-color: #ffffff !important;
                color: #1f2937 !important;
                padding: 1.5rem;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* Typography */
            h1, h2, h3, h4, p { margin: 0; padding: 0; line-height: 1.5; }
            h1,h2,h3,h4,p.text-2xl.font-bold.text-white, .font-bold, .font-semibold { color: #111827 !important; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }

            /* Text colors - original class names are kept for matching */
            .text-white, .text-slate-200, .text-slate-300 { color: #374151 !important; }
            .text-slate-400 { color: #6b7280 !important; }
            .text-emerald-400, .text-green-400 { color: #059669 !important; }
            .text-red-400 { color: #dc2626 !important; }
            .text-cyan-400, .text-sky-400 { color: #0891b2 !important; }
            .text-cyan-200 { color: #0e7490 !important; }
            .text-yellow-400 { color: #d97706 !important; }
            .text-purple-400 { color: #9333ea !important; }
            .text-orange-400 { color: #ea580c !important; }
            .text-blue-400 { color: #2563eb !important; }

            /* Backgrounds */
            .bg-slate-800, .bg-slate-900 { background-color: #f9fafb !important; border: 1px solid #e5e7eb; }
            .bg-slate-900\\/50, li.bg-slate-900\\/50 { background-color: #ffffff !important; border: 1px solid #f3f4f6; }
            .bg-emerald-500\\/20 { background-color: #d1fae5 !important; }
            .bg-red-500\\/20 { background-color: #fee2e2 !important; }
            .bg-green-500\\/20 { background-color: #dcfce7 !important; }
            .bg-sky-500\\/20 { background-color: #e0f2fe !important; }
            .bg-yellow-500\\/20 { background-color: #fef3c7 !important; }
            .bg-cyan-900\\/70, .bg-cyan-900\\/50 { background-color: #ecfeff !important; border: 1px solid #cffafe; }
            .bg-cyan-500\\/20 { background-color: #cffafe !important; }
            .bg-purple-500\\/20 { background-color: #f3e8ff !important; }
            .bg-orange-500\\/20 { background-color: #ffedd5 !important; }
            .bg-yellow-600 { background-color: #fcd34d !important; color: #b45309 !important; }
            .bg-red-600 { background-color: #fca5a5 !important; color: #991b1b !important; }
            .bg-slate-600 { background-color: #e5e7eb !important; color: #4b5563 !important; }
            
            /* Layout & Spacing */
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .grid { display: grid; }
            .grid > * { break-inside: avoid; }
            .gap-6 { gap: 1.5rem; }
            .gap-4 { gap: 1rem; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }

            /* Responsive grid columns for screen view */
            @media screen and (min-width: 640px) {
                .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media screen and (min-width: 1024px) {
                .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .lg\\:col-span-2 { grid-column: span 2 / span 2; }
            }

            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .p-6 { padding: 1.5rem; }
            .p-5 { padding: 1.25rem; }
            .p-3 { padding: 0.75rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .h-\\[400px\\] { height: 400px; }
            
            /* Borders & Sizing */
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-full { border-radius: 9999px; }
            .border-t { border-top-width: 1px; }
            .border-slate-700 { border-color: #e5e7eb !important; }
            .w-6 { width: 1.5rem; }
            .h-6 { height: 1.5rem; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05); }

            /* Chart specific */
            .recharts-responsive-container { min-width: 0; }
            .recharts-responsive-container img { max-width: 100%; height: auto; }
            text.recharts-text, .recharts-cartesian-axis-tick-value tspan { fill: #374151 !important; }
            path, rect { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            /* Specific print adjustments */
            @media print {
                body { padding: 0 !important; }
                .grid { grid-template-columns: repeat(2, 1fr) !important; } /* Force 2 columns for A4 landscape */
                .lg\\:col-span-2 { grid-column: span 2 / span 2; }
                .shadow-lg { box-shadow: none !important; }
            }
        </style>
    `;

    viewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
                ${styles}
            </head>
            <body>
                <h1 style="text-align: center; color: #111827; margin-bottom: 2rem; font-size: 2rem;">${title}</h1>
                ${contentHtml}
            </body>
        </html>
    `);

    viewWindow.document.close();
    viewWindow.focus();
};

/**
 * Requests permission from the user to send notifications.
 * @returns A promise that resolves with the permission status.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
        return 'denied';
    }
    const permission = await Notification.requestPermission();
    return permission;
};

/**
 * Sends a push notification if permission is granted.
 * @param title The title of the notification.
 * @param options The notification options (e.g., body, icon).
 * @param onClick Optional callback to execute when the notification is clicked.
 */
export const sendNotification = (title: string, options?: NotificationOptions, onClick?: () => void): void => {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, options);
        notification.onclick = (event) => {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            window.focus(); // focus the main window
            if (onClick) {
                onClick();
            }
        };
    }
};