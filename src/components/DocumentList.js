import React, { useEffect, useState } from "react";
import { getPdfForm } from "../PdfForms";

const onboardingForms = [
    { id: 1, code: "1020", name: "Employment Application", type: "Pre-Hire", template: "/forms/New%20forms/1020-Employment%20Application_1123.pdf" },
    { id: 2, code: "1021", name: "Equal Employment Opportunity", type: "Pre-Hire", template: "/forms/New%20forms/1021-Equal%20Employment%20Opportunity%20Data%20Form.pdf" },
    { id: 3, code: "1050", name: "Skills Checklist", type: "Pre-Hire", template: "/forms/New%20forms/1050-Skills%20Checklist-Associates.pdf" },
    { id: 4, code: "1060", name: "Request for Reference", type: "Pre-Hire", template: "/forms/New%20forms/1060-Request%20for%20Reference.pdf" },
    { id: 5, code: "1070", name: "Background Check Authorization", type: "Pre-Hire", template: "/forms/New%20forms/1070-Background%20Check%20Authorization_TX.pdf" },
    { id: 6, code: "1204", name: "Care Associate Availability", type: "Pre-Hire", template: "/forms/New%20forms/1204-Care%20Associate%20Availability.pdf" },
    { id: 7, code: "1010", name: "Employee Personal Action", type: "Onboarding", template: "/forms/New%20forms/1010-Employee%20Personal%20Action%20Form%20(EPAF)-TX.pdf" },
    { id: 8, code: "1201", name: "Handbook Acknowledgement", type: "Onboarding", template: "/forms/New%20forms/1201-Handbook%20Acknowledgment_TX.pdf" },
    { id: 9, code: "1202", name: "Orientation Acknowledgement", type: "Onboarding", template: "/forms/New%20forms/1202-Orientation%20Acknowledgements.pdf" },
    { id: 10, code: "1203", name: "Orientation Curriculum", type: "Onboarding", template: "/forms/New%20forms/1203-Orientation%20Curriculum_TX.pdf" },
    { id: 11, code: "1220", name: "Abuse & Neglect Policy", type: "Onboarding", template: "/forms/New%20forms/1220-Abuse_Neglect%20Policy.pdf" },
    { id: 12, code: "1530", name: "Care Associate Schedule Acknowledgement", type: "Onboarding", template: "/forms/New%20forms/1530-Care%20Associate%20Schedule%20Acknowledgement.pdf" },
    { id: 13, code: "1600", name: "Emergency Contact Information", type: "Onboarding", template: "/forms/New%20forms/1600-Emergency%20Contact%20Information.pdf" },
    { id: 14, code: "1720", name: "Hepatitis B Consent", type: "Onboarding", template: "/forms/New%20forms/1720-Hepatitis%20B_Consent-Declination.pdf" },
    { id: 15, code: "1740", name: "Pre-Employment Drug Consent", type: "Onboarding", template: "/forms/New%20forms/1740-Pre-Employment%20Drug%20Consent-RVSD.pdf" },
    { id: 16, code: "2900", name: "ID Agreement", type: "Onboarding", template: "/forms/New%20forms/2900-ID%20Agreement.pdf" },
    { id: 17, code: "4000", name: "Nondisclosure / Noncompete", type: "Onboarding", template: "/forms/New%20forms/4000-Nondisclosure_Noncompete_TX.pdf" },
    { id: 18, code: "I-9", name: "I-9 Employment Eligibility", type: "Onboarding", template: "/forms/New%20forms/Revised%20I-9%20(Aug.%202023).pdf" },
    { id: 19, code: "W-4", name: "W-4 Tax Form", type: "Onboarding", template: "/forms/New%20forms/W-4%202023.pdf" }
];

const DocumentList = () => {
    const [selectedFormId, setSelectedFormId] = useState(null);

    // Lock body scroll when onboarding form modal is open
    useEffect(() => {
        if (selectedFormId) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [selectedFormId]);

    // Fix signature canvas buffer resolution to match CSS display size.
    // Without explicit width/height canvasProps, canvases default to 300×150 buffer
    // while CSS (Tailwind w-full h-40) stretches them visually. This fixes the mismatch
    // so toDataURL() captures the full-resolution signature for PDF embedding.
    useEffect(() => {
        if (!selectedFormId) return;
        let observer = null;
        const fixCanvas = (canvas) => {
            if (canvas.width > 300 || canvas.height > 150) return;
            requestAnimationFrame(() => {
                const w = canvas.offsetWidth;
                const h = canvas.offsetHeight;
                if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
                    canvas.width = w;
                    canvas.height = h;
                }
            });
        };
        const initTimer = setTimeout(() => {
            const body = window.document.querySelector('.onboarding-form-body');
            if (!body) return;
            body.querySelectorAll('canvas').forEach(fixCanvas);
            observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        if (node.tagName === 'CANVAS') fixCanvas(node);
                        else if (node.querySelectorAll) {
                            node.querySelectorAll('canvas').forEach(fixCanvas);
                        }
                    }
                }
            });
            observer.observe(body, { childList: true, subtree: true });
        }, 400);
        return () => {
            clearTimeout(initTimer);
            if (observer) observer.disconnect();
        };
    }, [selectedFormId]);

    // Inject polished form styles + Tailwind utility classes the PdfForm components need
    useEffect(() => {
        if (document.getElementById("onboarding-modal-styles")) return;
        const style = document.createElement("style");
        style.id = "onboarding-modal-styles";
        style.textContent = `
            /* ===== ANIMATIONS ===== */
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalSlideIn { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            /* ===== NEUTRALIZE FORM'S INNER MODAL — flow inside our container ===== */
            .onboarding-form-body .fixed.inset-0 {
                position: static !important;
                background-color: transparent !important;
                display: block !important;
                padding: 0 !important;
                z-index: auto !important;
            }
            .onboarding-form-body .fixed.inset-0 > .bg-white.rounded-lg {
                max-width: 780px !important;
                margin: 0 auto !important;
                max-height: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                overflow: visible !important;
                background: #fff !important;
            }
            /* Hide form's own header/close (our green header handles that) */
            .onboarding-form-body .fixed.inset-0 > .bg-white .flex.justify-between.items-center.p-6.border-b {
                display: none !important;
            }

            /* ===== FORM MAX-WIDTH CONTAINER ===== */
            .onboarding-form-body .p-6.overflow-y-auto {
                max-width: 780px !important;
                margin: 0 auto !important;
                max-height: none !important;
                overflow: visible !important;
                padding: 32px 40px 40px !important;
                background: #fff !important;
            }

            /* ===== SECTION HEADERS (h3) — bold, divider line ===== */
            .onboarding-form-body h3.text-lg.font-semibold {
                font-family: 'Poppins', sans-serif !important;
                font-size: 15px !important;
                font-weight: 700 !important;
                color: #111827 !important;
                letter-spacing: 0.01em !important;
                text-transform: uppercase !important;
                margin: 32px 0 16px 0 !important;
                padding: 0 0 12px 0 !important;
                border-bottom: 2px solid #e5e7eb !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
            }
            .onboarding-form-body h3.text-lg.font-semibold::before {
                content: '' !important;
                width: 4px !important;
                height: 18px !important;
                background: #108a00 !important;
                border-radius: 2px !important;
                flex-shrink: 0 !important;
            }
            /* First section header — no top margin */
            .onboarding-form-body .p-6.overflow-y-auto > :first-child h3.text-lg.font-semibold,
            .onboarding-form-body h3.text-lg.font-semibold:first-child {
                margin-top: 0 !important;
            }

            /* ===== SUB-HEADINGS (h4) ===== */
            .onboarding-form-body h4 {
                font-family: 'Poppins', sans-serif !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                color: #374151 !important;
                margin-bottom: 12px !important;
            }

            /* ===== INFO BOXES / NOTICES ===== */
            .onboarding-form-body .p-4.border.border-gray-200.rounded-lg.bg-gray-50,
            .onboarding-form-body .mb-6.p-4.border {
                background: #f9fafb !important;
                border: 1px solid #e5e7eb !important;
                border-left: 3px solid #108a00 !important;
                border-radius: 6px !important;
                padding: 14px 18px !important;
                margin-bottom: 20px !important;
                font-size: 13px !important;
                line-height: 1.6 !important;
                color: #4b5563 !important;
            }

            /* ===== LABELS ===== */
            .onboarding-form-body label.block.text-sm.font-medium,
            .onboarding-form-body label {
                font-family: 'Poppins', sans-serif !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                color: #374151 !important;
                margin-bottom: 5px !important;
                display: block !important;
                line-height: 1.4 !important;
            }

            /* ===== TEXT INPUTS ===== */
            .onboarding-form-body input[type="text"],
            .onboarding-form-body input[type="date"],
            .onboarding-form-body input[type="email"],
            .onboarding-form-body input[type="tel"],
            .onboarding-form-body input[type="number"],
            .onboarding-form-body input[type="password"],
            .onboarding-form-body select,
            .onboarding-form-body textarea {
                width: 100% !important;
                height: 42px !important;
                padding: 8px 14px !important;
                border: 1px solid #d1d5db !important;
                border-radius: 6px !important;
                font-family: 'Poppins', sans-serif !important;
                font-size: 14px !important;
                color: #1f2937 !important;
                background: #fff !important;
                outline: none !important;
                transition: border-color 0.15s, box-shadow 0.15s !important;
                box-shadow: none !important;
                box-sizing: border-box !important;
            }
            .onboarding-form-body textarea {
                height: auto !important;
                min-height: 80px !important;
                resize: vertical !important;
            }
            .onboarding-form-body input[type="text"]:focus,
            .onboarding-form-body input[type="date"]:focus,
            .onboarding-form-body input[type="email"]:focus,
            .onboarding-form-body input[type="tel"]:focus,
            .onboarding-form-body input[type="number"]:focus,
            .onboarding-form-body input[type="password"]:focus,
            .onboarding-form-body select:focus,
            .onboarding-form-body textarea:focus {
                border-color: #108a00 !important;
                box-shadow: 0 0 0 3px rgba(16,138,0,0.1) !important;
            }
            .onboarding-form-body input::placeholder,
            .onboarding-form-body textarea::placeholder {
                color: #9ca3af !important;
                font-size: 13px !important;
            }

            /* ===== CHECKBOXES — aligned properly ===== */
            .onboarding-form-body input[type="checkbox"] {
                width: 16px !important;
                height: 16px !important;
                accent-color: #108a00 !important;
                border-radius: 3px !important;
                cursor: pointer !important;
                margin: 0 !important;
                flex-shrink: 0 !important;
                vertical-align: middle !important;
                position: relative !important;
                top: -1px !important;
            }
            /* Checkbox + label row alignment */
            .onboarding-form-body .flex.items-center input[type="checkbox"],
            .onboarding-form-body .flex.items-start input[type="checkbox"] {
                margin-right: 8px !important;
            }
            .onboarding-form-body .flex.items-center > label,
            .onboarding-form-body .flex.items-start > label {
                margin-bottom: 0 !important;
                font-weight: 400 !important;
            }

            /* ===== SECTION NAV TABS ===== */
            .onboarding-form-body .mb-6 > .flex.flex-wrap.gap-2 > button {
                font-family: 'Poppins', sans-serif !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                padding: 8px 20px !important;
                border-radius: 6px !important;
                border: 1px solid #e5e7eb !important;
                background: #f9fafb !important;
                color: #4b5563 !important;
                cursor: pointer !important;
                transition: all 0.15s !important;
            }
            .onboarding-form-body .mb-6 > .flex.flex-wrap.gap-2 > button.bg-blue-600 {
                background: #108a00 !important;
                color: #fff !important;
                border-color: #108a00 !important;
                box-shadow: 0 1px 3px rgba(16,138,0,0.3) !important;
            }
            .onboarding-form-body .mb-6 > .flex.flex-wrap.gap-2 > button.bg-gray-200 {
                background: #f9fafb !important;
                color: #4b5563 !important;
                border-color: #e5e7eb !important;
            }
            .onboarding-form-body .mb-6 > .flex.flex-wrap.gap-2 > button.bg-gray-200:hover {
                background: #f0fdf4 !important;
                border-color: #86efac !important;
                color: #15803d !important;
            }

            /* ===== ACTION BUTTONS — uniform size, properly spaced ===== */
            .onboarding-form-body button.bg-blue-600,
            .onboarding-form-body button.bg-green-600 {
                font-family: 'Poppins', sans-serif !important;
                font-weight: 600 !important;
                font-size: 14px !important;
                padding: 10px 28px !important;
                border-radius: 6px !important;
                border: none !important;
                cursor: pointer !important;
                transition: all 0.15s !important;
                min-width: 160px !important;
                height: 44px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 6px !important;
            }
            .onboarding-form-body button.bg-blue-600 {
                background: #108a00 !important;
                color: #fff !important;
            }
            .onboarding-form-body button.bg-blue-600:hover {
                background: #0d7000 !important;
            }
            .onboarding-form-body button.bg-green-600 {
                background: #28a745 !important;
                color: #fff !important;
            }
            .onboarding-form-body button.bg-green-600:hover {
                background: #1e8e3e !important;
            }
            .onboarding-form-body button.bg-blue-600:disabled,
            .onboarding-form-body button.bg-green-600:disabled,
            .onboarding-form-body button.bg-gray-400 {
                background: #d1d5db !important;
                color: #9ca3af !important;
                cursor: not-allowed !important;
                box-shadow: none !important;
            }
            /* Clear/Reset buttons (red) */
            .onboarding-form-body button.bg-red-600 {
                font-family: 'Poppins', sans-serif !important;
                font-weight: 500 !important;
                font-size: 13px !important;
                padding: 8px 16px !important;
                border-radius: 6px !important;
                border: none !important;
                background: #dc2626 !important;
                color: #fff !important;
                cursor: pointer !important;
                transition: all 0.15s !important;
            }
            .onboarding-form-body button.bg-red-600:hover { background: #b91c1c !important; }
            /* Button row spacing */
            .onboarding-form-body .flex.gap-4.mt-6,
            .onboarding-form-body .flex.gap-3.mt-6,
            .onboarding-form-body .flex.justify-end.gap-4 {
                gap: 12px !important;
                margin-top: 28px !important;
                padding-top: 20px !important;
                border-top: 1px solid #e5e7eb !important;
            }

            /* ===== PDF PREVIEW SECTION ===== */
            .onboarding-form-body iframe {
                border-radius: 6px !important;
                border: 1px solid #e5e7eb !important;
                min-height: 500px !important;
                width: 100% !important;
            }
            .onboarding-form-body .border.rounded-lg.overflow-hidden {
                border-radius: 6px !important;
                border: 1px solid #e5e7eb !important;
            }

            /* ===== SIGNATURE CANVAS AREA — proper bordered box ===== */
            .onboarding-form-body .border.border-gray-300.rounded-md.overflow-hidden,
            .onboarding-form-body .border-2.border-gray-300.rounded-md {
                border: 2px solid #d1d5db !important;
                border-radius: 8px !important;
                background: #fff !important;
                padding: 0 !important;
                overflow: hidden !important;
                position: relative !important;
            }
            .onboarding-form-body canvas {
                display: block !important;
                width: 100% !important;
                background: #fff !important;
                cursor: crosshair !important;
                border: none !important;
                border-radius: 0 !important;
                touch-action: none !important;
            }
            /* Signature preview image */
            .onboarding-form-body img[alt*="Signature"],
            .onboarding-form-body img[alt*="signature"] {
                max-height: 60px !important;
                object-fit: contain !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 4px !important;
                padding: 6px !important;
                background: #fff !important;
            }

            /* ===== GRID / SPACING ===== */
            .onboarding-form-body .grid.grid-cols-2 { gap: 16px !important; }
            .onboarding-form-body .grid.grid-cols-3 { gap: 16px !important; }
            .onboarding-form-body .mb-8 { margin-bottom: 24px !important; }
            .onboarding-form-body .mb-6 { margin-bottom: 20px !important; }
            .onboarding-form-body .space-y-4 > * + * { margin-top: 16px !important; }
            .onboarding-form-body .space-y-6 > * + * { margin-top: 20px !important; }

            /* ===== SPINNER ===== */
            .onboarding-form-body .animate-spin { animation: spin 1s linear infinite !important; }

            /* ===== SMOOTH MODAL SCROLL ===== */
            .onboarding-form-body {
                scroll-behavior: smooth !important;
                -webkit-overflow-scrolling: touch !important;
            }
            .onboarding-form-body::-webkit-scrollbar { width: 6px; }
            .onboarding-form-body::-webkit-scrollbar-track { background: #f1f1f1; }
            .onboarding-form-body::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 6px; }
            .onboarding-form-body::-webkit-scrollbar-thumb:hover { background: #999; }

            /* ===== TAILWIND UTILITY CLASSES ===== */
            .fixed { position: fixed; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .z-50 { z-index: 50; }
            .flex { display: flex; }
            .inline-flex { display: inline-flex; }
            .grid { display: grid; }
            .hidden { display: none; }
            .block { display: block; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .items-end { align-items: flex-end; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .flex-col { flex-direction: column; }
            .flex-row { flex-direction: row; }
            .flex-wrap { flex-wrap: wrap; }
            .flex-1 { flex: 1 1 0%; }
            .flex-shrink-0 { flex-shrink: 0; }
            .gap-1 { gap: 0.25rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-8 { gap: 2rem; }
            .w-full { width: 100%; }
            .w-auto { width: auto; }
            .w-4 { width: 1rem; }
            .w-5 { width: 1.25rem; }
            .w-6 { width: 1.5rem; }
            .w-8 { width: 2rem; }
            .w-10 { width: 2.5rem; }
            .w-12 { width: 3rem; }
            .w-16 { width: 4rem; }
            .w-20 { width: 5rem; }
            .w-24 { width: 6rem; }
            .w-32 { width: 8rem; }
            .h-4 { height: 1rem; }
            .h-5 { height: 1.25rem; }
            .h-6 { height: 1.5rem; }
            .h-8 { height: 2rem; }
            .h-10 { height: 2.5rem; }
            .h-12 { height: 3rem; }
            .h-16 { height: 4rem; }
            .h-20 { height: 5rem; }
            .h-32 { height: 8rem; }
            .h-40 { height: 10rem; }
            .h-48 { height: 12rem; }
            .h-64 { height: 16rem; }
            .h-96 { height: 24rem; }
            .min-h-\\[200px\\] { min-height: 200px; }
            .min-w-\\[160px\\] { min-width: 160px; }
            .max-w-6xl { max-width: 72rem; }
            .max-w-4xl { max-width: 56rem; }
            .max-w-2xl { max-width: 42rem; }
            .max-w-xl { max-width: 36rem; }
            .max-w-md { max-width: 28rem; }
            .max-w-sm { max-width: 24rem; }
            .max-h-\\[95vh\\] { max-height: 95vh; }
            .max-h-\\[85vh\\] { max-height: 85vh; }
            .overflow-hidden { overflow: hidden; }
            .overflow-y-auto { overflow-y: auto; }
            .overflow-x-auto { overflow-x: auto; }
            .p-1 { padding: 0.25rem; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .p-5 { padding: 1.25rem; }
            .p-6 { padding: 1.5rem; }
            .p-8 { padding: 2rem; }
            .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
            .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .m-0 { margin: 0; }
            .m-auto { margin: auto; }
            .mb-0 { margin-bottom: 0; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-5 { margin-bottom: 1.25rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mt-0 { margin-top: 0; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-3 { margin-top: 0.75rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mt-8 { margin-top: 2rem; }
            .mr-1 { margin-right: 0.25rem; }
            .mr-2 { margin-right: 0.5rem; }
            .mr-3 { margin-right: 0.75rem; }
            .ml-1 { margin-left: 0.25rem; }
            .ml-2 { margin-left: 0.5rem; }
            .ml-3 { margin-left: 0.75rem; }
            .ml-auto { margin-left: auto; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .space-x-1 > * + * { margin-left: 0.25rem; }
            .space-x-2 > * + * { margin-left: 0.5rem; }
            .space-x-3 > * + * { margin-left: 0.75rem; }
            .space-x-4 > * + * { margin-left: 1rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-md { font-size: 1rem; }
            .font-normal { font-weight: 400; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .uppercase { text-transform: uppercase; }
            .lowercase { text-transform: lowercase; }
            .capitalize { text-transform: capitalize; }
            .underline { text-decoration: underline; }
            .no-underline { text-decoration: none; }
            .leading-none { line-height: 1; }
            .leading-tight { line-height: 1.25; }
            .leading-normal { line-height: 1.5; }
            .leading-relaxed { line-height: 1.625; }
            .tracking-wide { letter-spacing: 0.025em; }
            .text-white { color: #fff; }
            .text-black { color: #000; }
            .text-gray-300 { color: #d1d5db; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .text-red-500 { color: #ef4444; }
            .text-red-600 { color: #dc2626; }
            .text-red-700 { color: #b91c1c; }
            .text-green-500 { color: #22c55e; }
            .text-green-600 { color: #16a34a; }
            .text-green-700 { color: #15803d; }
            .text-blue-500 { color: #3b82f6; }
            .text-blue-600 { color: #2563eb; }
            .text-blue-700 { color: #1d4ed8; }
            .text-yellow-600 { color: #ca8a04; }
            .text-orange-600 { color: #ea580c; }
            .bg-white { background-color: #fff; }
            .bg-black { background-color: #000; }
            .bg-transparent { background-color: transparent; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-gray-200 { background-color: #e5e7eb; }
            .bg-gray-300 { background-color: #d1d5db; }
            .bg-gray-400 { background-color: #9ca3af; }
            .bg-gray-500 { background-color: #6b7280; }
            .bg-red-50 { background-color: #fef2f2; }
            .bg-red-100 { background-color: #fee2e2; }
            .bg-red-500 { background-color: #ef4444; }
            .bg-red-600 { background-color: #dc2626; }
            .bg-green-50 { background-color: #f0fdf4; }
            .bg-green-100 { background-color: #dcfce7; }
            .bg-green-500 { background-color: #22c55e; }
            .bg-green-600 { background-color: #16a34a; }
            .bg-green-700 { background-color: #15803d; }
            .bg-blue-50 { background-color: #eff6ff; }
            .bg-blue-100 { background-color: #dbeafe; }
            .bg-blue-500 { background-color: #3b82f6; }
            .bg-blue-600 { background-color: #2563eb; }
            .bg-blue-700 { background-color: #1d4ed8; }
            .bg-yellow-50 { background-color: #fefce8; }
            .bg-yellow-100 { background-color: #fef3c7; }
            .bg-orange-50 { background-color: #fff7ed; }
            .bg-opacity-50 { background-color: rgba(0,0,0,0.5); }
            .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
            .border-0 { border: none; }
            .border-2 { border-width: 2px; border-style: solid; }
            .border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }
            .border-t { border-top-width: 1px; border-top-style: solid; border-top-color: #e5e7eb; }
            .border-l { border-left-width: 1px; border-left-style: solid; border-left-color: #e5e7eb; }
            .border-r { border-right-width: 1px; border-right-style: solid; border-right-color: #e5e7eb; }
            .border-l-4 { border-left-width: 4px; border-left-style: solid; }
            .border-gray-100 { border-color: #f3f4f6; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-400 { border-color: #9ca3af; }
            .border-red-200 { border-color: #fecaca; }
            .border-red-300 { border-color: #fca5a5; }
            .border-red-400 { border-color: #f87171; }
            .border-green-200 { border-color: #bbf7d0; }
            .border-green-300 { border-color: #86efac; }
            .border-green-400 { border-color: #4ade80; }
            .border-blue-200 { border-color: #bfdbfe; }
            .border-blue-400 { border-color: #60a5fa; }
            .border-yellow-200 { border-color: #fde68a; }
            .border-yellow-400 { border-color: #facc15; }
            .rounded { border-radius: 0.25rem; }
            .rounded-sm { border-radius: 0.125rem; }
            .rounded-md { border-radius: 0.375rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-2xl { border-radius: 1rem; }
            .rounded-full { border-radius: 9999px; }
            .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); }
            .shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06); }
            .shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05); }
            .shadow-xl { box-shadow: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04); }
            .shadow-none { box-shadow: none; }
            .transition { transition: all 0.15s ease; }
            .transition-colors { transition: color 0.15s, background-color 0.15s, border-color 0.15s; }
            .transition-all { transition: all 0.2s ease; }
            .transition-opacity { transition: opacity 0.15s ease; }
            .duration-200 { transition-duration: 200ms; }
            .duration-300 { transition-duration: 300ms; }
            .ease-in-out { transition-timing-function: ease-in-out; }
            .cursor-pointer { cursor: pointer; }
            .cursor-not-allowed { cursor: not-allowed; }
            .cursor-default { cursor: default; }
            .select-none { user-select: none; }
            .whitespace-nowrap { white-space: nowrap; }
            .whitespace-pre-wrap { white-space: pre-wrap; }
            .break-words { word-wrap: break-word; overflow-wrap: break-word; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .opacity-0 { opacity: 0; }
            .opacity-25 { opacity: 0.25; }
            .opacity-50 { opacity: 0.5; }
            .opacity-75 { opacity: 0.75; }
            .opacity-100 { opacity: 1; }
            .pointer-events-none { pointer-events: none; }
            .resize-none { resize: none; }
            .list-none { list-style: none; }
            .list-disc { list-style-type: disc; }

            /* Hover states */
            .hover\\:bg-gray-50:hover { background-color: #f9fafb; }
            .hover\\:bg-gray-100:hover { background-color: #f3f4f6; }
            .hover\\:bg-gray-200:hover { background-color: #e5e7eb; }
            .hover\\:bg-gray-300:hover { background-color: #d1d5db; }
            .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
            .hover\\:bg-green-700:hover { background-color: #15803d; }
            .hover\\:bg-red-700:hover { background-color: #b91c1c; }
            .hover\\:text-gray-600:hover { color: #4b5563; }
            .hover\\:text-gray-700:hover { color: #374151; }
            .hover\\:text-gray-900:hover { color: #111827; }
            .hover\\:text-red-600:hover { color: #dc2626; }
            .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.07); }

            /* Disabled states */
            .disabled\\:bg-gray-400:disabled { background-color: #9ca3af; }
            .disabled\\:bg-gray-300:disabled { background-color: #d1d5db; }
            .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
            .disabled\\:opacity-50:disabled { opacity: 0.5; }
            .disabled\\:text-gray-200:disabled { color: #e5e7eb; }

            /* Focus states — green theme */
            .focus\\:outline-none:focus { outline: none; }
            .focus\\:ring-2:focus { box-shadow: 0 0 0 3px rgba(16,138,0,0.2); }
            .focus\\:ring-blue-500:focus { box-shadow: 0 0 0 3px rgba(16,138,0,0.2); }
            .focus\\:border-blue-500:focus { border-color: #28a745; }

            /* Animation */
            .animate-spin { animation: spin 1s linear infinite; }
            .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            .border-t-transparent { border-top-color: transparent; }

            /* Grid */
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
            .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
            .col-span-1 { grid-column: span 1 / span 1; }
            .col-span-2 { grid-column: span 2 / span 2; }
            .col-span-3 { grid-column: span 3 / span 3; }
            .col-span-full { grid-column: 1 / -1; }
            .row-span-2 { grid-row: span 2 / span 2; }

            /* Responsive */
            @media (min-width: 640px) {
                .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .sm\\:flex-row { flex-direction: row; }
                .sm\\:text-sm { font-size: 0.875rem; }
            }
            @media (min-width: 768px) {
                .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .md\\:col-span-2 { grid-column: span 2 / span 2; }
                .md\\:col-span-3 { grid-column: span 3 / span 3; }
                .md\\:flex-row { flex-direction: row; }
                .md\\:w-auto { width: auto; }
            }
            @media (min-width: 1024px) {
                .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .lg\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
                .lg\\:flex-row { flex-direction: row; }
            }
        `;
        document.head.appendChild(style);
    }, []);

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12 p-4">
                    {/* Onboarding Forms Section */}
                    <div
                        style={{
                            marginTop: "40px",
                            background: "linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)",
                            borderRadius: "16px",
                            padding: "28px",
                            border: "1px solid #e0f2e9",
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: "20px" }}>
                            <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                                <div
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "12px",
                                        background: "linear-gradient(135deg, #108a00, #28a745)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 4px 12px rgba(16,138,0,0.25)",
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 384 512">
                                        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                                    </svg>
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: 700, margin: 0, color: "#1a1a1a", fontSize: "18px" }}>Onboarding Forms</h5>
                                    <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>Complete required forms for employee onboarding</p>
                                </div>
                            </div>
                            <span
                                style={{
                                    background: "#e8f5e9",
                                    color: "#108a00",
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                }}
                            >
                                {onboardingForms.length} Forms
                            </span>
                        </div>
                        <table
                            className="custom-table timetracker"
                            style={{
                                borderRadius: "12px",
                                overflow: "hidden",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "linear-gradient(135deg, #108a00, #1a9e0f)", }}>
                                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "13px", padding: "14px 20px", letterSpacing: "0.3px" }}>Sr. No</th>
                                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "13px", padding: "14px 20px", letterSpacing: "0.3px" }}>Code</th>
                                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "13px", padding: "14px 20px", letterSpacing: "0.3px" }}>Form Name</th>
                                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "13px", padding: "14px 20px", letterSpacing: "0.3px" }}>Category</th>
                                    <th style={{ color: "#fff", fontWeight: 600, fontSize: "13px", padding: "14px 20px", letterSpacing: "0.3px", textAlign: "center" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {onboardingForms.map((form, idx) => (
                                    <tr
                                        key={form.id}
                                        style={{
                                            background: idx % 2 === 0 ? "#fff" : "#f9fafb",
                                            transition: "background-color 0.15s",
                                            height: "56px",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f9fafb")}
                                    >
                                        <td style={{ padding: "12px 20px", color: "#9ca3af", fontSize: "13px", fontWeight: 500 }}>{idx + 1}</td>
                                        <td style={{ padding: "12px 20px" }}>
                                            <span style={{
                                                background: "#f3f4f6",
                                                padding: "4px 10px",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                color: "#374151",
                                                fontFamily: "'Courier New', monospace",
                                            }}>{form.code}</span>
                                        </td>
                                        <td style={{ padding: "12px 20px", textAlign: "left", fontWeight: 500, color: "#1f2937", fontSize: "14px" }}>{form.name}</td>
                                        <td style={{ padding: "12px 20px" }}>
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    padding: "5px 14px",
                                                    borderRadius: "20px",
                                                    fontWeight: 600,
                                                    letterSpacing: "0.3px",
                                                    ...(form.type === "Pre-Hire"
                                                        ? { background: "#e0f2fe", color: "#0369a1" }
                                                        : { background: "#dcfce7", color: "#15803d" }),
                                                }}
                                            >
                                                {form.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 20px", textAlign: "center" }}>
                                            <button
                                                onClick={() => setSelectedFormId(form.id)}
                                                style={{
                                                    background: "linear-gradient(135deg, #108a00, #28a745)",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "7px 20px",
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                    boxShadow: "0 2px 6px rgba(16,138,0,0.2)",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = "translateY(-1px)";
                                                    e.target.style.boxShadow = "0 4px 12px rgba(16,138,0,0.3)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = "translateY(0)";
                                                    e.target.style.boxShadow = "0 2px 6px rgba(16,138,0,0.2)";
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 576 512" style={{ marginRight: "6px", verticalAlign: "-1px" }}>
                                                    <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
                                                </svg>
                                                Open Form
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Onboarding Form Modal Overlay */}
                {(() => {
                    const FormComponent = selectedFormId ? getPdfForm(selectedFormId) : null;
                    const selectedForm = onboardingForms.find((f) => f.id === selectedFormId);
                    if (!FormComponent) return null;
                    return (
                        <div
                            onClick={() => setSelectedFormId(null)}
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 99999,
                                animation: "fadeIn 0.2s ease-in-out",
                                padding: "20px",
                                fontFamily: "'Poppins', sans-serif",
                            }}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: "20px",
                                    boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
                                    width: "100%",
                                    maxWidth: "1100px",
                                    maxHeight: "95vh",
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "hidden",
                                    animation: "modalSlideIn 0.3s ease-out",
                                }}
                            >
                                {/* Modal Header */}
                                <div
                                    style={{
                                        background: "linear-gradient(135deg, #108a00 0%, #1a9e0f 50%, #28a745 100%)",
                                        padding: "20px 28px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        flexShrink: 0,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "10px",
                                                background: "rgba(255,255,255,0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 384 512">
                                                <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h5 style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "17px" }}>
                                                {selectedForm ? selectedForm.name : "Onboarding Form"}
                                            </h5>
                                            {selectedForm && (
                                                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>
                                                    Code: {selectedForm.code} &bull; {selectedForm.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFormId(null)}
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            background: "rgba(255,255,255,0.15)",
                                            border: "1px solid rgba(255,255,255,0.25)",
                                            color: "#fff",
                                            fontSize: "18px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "all 0.2s",
                                            lineHeight: 1,
                                        }}
                                        onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.3)")}
                                        onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
                                    >
                                        ✕
                                    </button>
                                </div>
                                {/* Modal Body */}
                                <div
                                    className="onboarding-form-body"
                                    style={{
                                        flex: 1,
                                        overflowY: "auto",
                                        padding: "0",
                                        background: "#fff",
                                        fontFamily: "'Poppins', sans-serif",
                                    }}
                                >
                                    <FormComponent
                                        document={{ url: selectedForm?.template || "" }}
                                        token={localStorage.getItem("shinpay-vendor-token") || ""}
                                        onClose={() => setSelectedFormId(null)}
                                        onSuccess={() => setSelectedFormId(null)}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
export default DocumentList;
