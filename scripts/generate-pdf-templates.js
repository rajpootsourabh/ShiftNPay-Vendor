/**
 * PDF Template Generator for ShiftNPay Onboarding Forms
 * 
 * Generates 19 fillable PDF templates with properly named form fields
 * that match the field names expected by src/PdfForms/*.jsx components.
 * 
 * Run: node scripts/generate-pdf-templates.js
 * Output: public/forms/*.pdf
 */

const { PDFDocument, PDFTextField, PDFCheckBox, StandardFonts, rgb, degrees } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", "public", "forms");

// ─── Color constants ───
const GREEN = rgb(16 / 255, 138 / 255, 0);       // #108a00
const DARK_GREEN = rgb(30 / 255, 100 / 255, 20 / 255);
const LIGHT_GREEN = rgb(0.9, 0.97, 0.9);
const DARK_GRAY = rgb(0.2, 0.2, 0.2);
const MID_GRAY = rgb(0.5, 0.5, 0.5);
const LIGHT_GRAY = rgb(0.92, 0.92, 0.92);
const WHITE = rgb(1, 1, 1);

// ─── Helper: create a PDF with form title and fields ───
async function createTemplate({ filename, title, subtitle, sections }) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let currentPage = null;
    let yPos = 0;
    const PAGE_WIDTH = 612;   // Letter
    const PAGE_HEIGHT = 792;
    const MARGIN = 50;
    const FIELD_HEIGHT = 20;
    const CHECKBOX_SIZE = 12;
    const LINE_GAP = 6;
    const SECTION_GAP = 20;
    const USABLE_WIDTH = PAGE_WIDTH - 2 * MARGIN;
    
    const form = pdfDoc.getForm();

    function addPage() {
        currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        yPos = PAGE_HEIGHT - MARGIN;
        return currentPage;
    }

    function ensureSpace(needed) {
        if (!currentPage || yPos - needed < MARGIN + 30) {
            addPage();
        }
    }

    function drawTitle() {
        ensureSpace(80);
        // Green header bar
        currentPage.drawRectangle({
            x: 0, y: yPos - 10, width: PAGE_WIDTH, height: 50,
            color: GREEN,
        });
        currentPage.drawText(title, {
            x: MARGIN, y: yPos + 5, size: 16, font: boldFont, color: WHITE,
        });
        if (subtitle) {
            currentPage.drawText(subtitle, {
                x: MARGIN, y: yPos - 8, size: 9, font, color: rgb(0.9, 1, 0.9),
            });
        }
        yPos -= 60;
        // Company name
        currentPage.drawText("ShiftNPay / Mastercare", {
            x: MARGIN, y: yPos, size: 10, font: boldFont, color: DARK_GREEN,
        });
        yPos -= 20;
    }

    function drawSectionHeader(text) {
        ensureSpace(35);
        yPos -= SECTION_GAP / 2;
        // Green accent bar
        currentPage.drawRectangle({
            x: MARGIN, y: yPos - 2, width: USABLE_WIDTH, height: 18,
            color: LIGHT_GREEN,
        });
        currentPage.drawRectangle({
            x: MARGIN, y: yPos - 2, width: 4, height: 18,
            color: GREEN,
        });
        currentPage.drawText(text, {
            x: MARGIN + 10, y: yPos + 1, size: 10, font: boldFont, color: DARK_GREEN,
        });
        yPos -= 25;
    }

    function addTextField(fieldName, label, widthRatio = 1) {
        ensureSpace(FIELD_HEIGHT + LINE_GAP + 14);
        const fieldWidth = USABLE_WIDTH * widthRatio - (widthRatio < 1 ? 5 : 0);
        
        // Label
        if (label) {
            currentPage.drawText(label, {
                x: MARGIN, y: yPos, size: 8, font, color: MID_GRAY,
            });
            yPos -= 12;
        }
        
        // Field background
        currentPage.drawRectangle({
            x: MARGIN, y: yPos - FIELD_HEIGHT + 4, width: fieldWidth, height: FIELD_HEIGHT,
            color: LIGHT_GRAY, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5,
        });

        // Create form field
        const textField = form.createTextField(fieldName);
        textField.addToPage(currentPage, {
            x: MARGIN + 2, y: yPos - FIELD_HEIGHT + 5,
            width: fieldWidth - 4, height: FIELD_HEIGHT - 2,
            borderWidth: 0,
        });
        
        yPos -= FIELD_HEIGHT + LINE_GAP;
    }

    function addTextFieldRow(fields, label) {
        // Multiple fields on same row
        ensureSpace(FIELD_HEIGHT + LINE_GAP + 14);
        if (label) {
            currentPage.drawText(label, {
                x: MARGIN, y: yPos, size: 8, font, color: MID_GRAY,
            });
            yPos -= 12;
        }

        const count = fields.length;
        const gap = 8;
        const fieldWidth = (USABLE_WIDTH - gap * (count - 1)) / count;

        for (let i = 0; i < count; i++) {
            const xPos = MARGIN + i * (fieldWidth + gap);
            
            // Mini label above
            if (fields[i].label) {
                currentPage.drawText(fields[i].label, {
                    x: xPos, y: yPos + 2, size: 7, font, color: MID_GRAY,
                });
            }

            currentPage.drawRectangle({
                x: xPos, y: yPos - FIELD_HEIGHT + 4, width: fieldWidth, height: FIELD_HEIGHT,
                color: LIGHT_GRAY, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5,
            });

            const textField = form.createTextField(fields[i].name);
            textField.addToPage(currentPage, {
                x: xPos + 2, y: yPos - FIELD_HEIGHT + 5,
                width: fieldWidth - 4, height: FIELD_HEIGHT - 2,
                borderWidth: 0,
            });
        }

        yPos -= FIELD_HEIGHT + LINE_GAP;
    }

    function addCheckbox(fieldName, label) {
        ensureSpace(CHECKBOX_SIZE + LINE_GAP + 2);
        
        const checkbox = form.createCheckBox(fieldName);
        checkbox.addToPage(currentPage, {
            x: MARGIN + 2, y: yPos - CHECKBOX_SIZE + 2,
            width: CHECKBOX_SIZE, height: CHECKBOX_SIZE,
            borderWidth: 0.5, borderColor: rgb(0.7, 0.7, 0.7),
        });
        
        if (label) {
            currentPage.drawText(label, {
                x: MARGIN + CHECKBOX_SIZE + 6, y: yPos - CHECKBOX_SIZE + 5,
                size: 8, font, color: DARK_GRAY,
            });
        }
        
        yPos -= CHECKBOX_SIZE + LINE_GAP - 2;
    }

    function addCheckboxRow(checkboxes) {
        ensureSpace(CHECKBOX_SIZE + LINE_GAP + 4);
        const count = checkboxes.length;
        const itemWidth = Math.min(USABLE_WIDTH / count, 150);
        
        for (let i = 0; i < count; i++) {
            const xPos = MARGIN + i * itemWidth;
            
            const checkbox = form.createCheckBox(checkboxes[i].name);
            checkbox.addToPage(currentPage, {
                x: xPos, y: yPos - CHECKBOX_SIZE + 2,
                width: CHECKBOX_SIZE, height: CHECKBOX_SIZE,
                borderWidth: 0.5, borderColor: rgb(0.7, 0.7, 0.7),
            });
            
            if (checkboxes[i].label) {
                const labelText = checkboxes[i].label.substring(0, 18);
                currentPage.drawText(labelText, {
                    x: xPos + CHECKBOX_SIZE + 3, y: yPos - CHECKBOX_SIZE + 5,
                    size: 7, font, color: DARK_GRAY,
                });
            }
        }
        
        yPos -= CHECKBOX_SIZE + LINE_GAP;
    }

    function addSignatureField(fieldName, label) {
        ensureSpace(50);
        if (label) {
            currentPage.drawText(label, {
                x: MARGIN, y: yPos, size: 8, font, color: MID_GRAY,
            });
            yPos -= 12;
        }
        // Signature box with dashed border appearance
        currentPage.drawRectangle({
            x: MARGIN, y: yPos - 36, width: USABLE_WIDTH * 0.6, height: 36,
            color: rgb(0.98, 0.98, 0.98),
            borderColor: rgb(0.75, 0.75, 0.75), borderWidth: 1,
        });
        currentPage.drawText("[ Sign here ]", {
            x: MARGIN + 8, y: yPos - 24, size: 9, font, color: rgb(0.7, 0.7, 0.7),
        });

        const sigField = form.createTextField(fieldName);
        sigField.addToPage(currentPage, {
            x: MARGIN + 1, y: yPos - 35, width: USABLE_WIDTH * 0.6 - 2, height: 34,
            borderWidth: 0,
        });

        yPos -= 46;
    }

    function addDropdown(fieldName, label, options) {
        ensureSpace(FIELD_HEIGHT + LINE_GAP + 14);
        if (label) {
            currentPage.drawText(label, {
                x: MARGIN, y: yPos, size: 8, font, color: MID_GRAY,
            });
            yPos -= 12;
        }

        currentPage.drawRectangle({
            x: MARGIN, y: yPos - FIELD_HEIGHT + 4, width: USABLE_WIDTH * 0.4, height: FIELD_HEIGHT,
            color: LIGHT_GRAY, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5,
        });

        const dropdown = form.createDropdown(fieldName);
        dropdown.setOptions(options || ["Select..."]);
        dropdown.addToPage(currentPage, {
            x: MARGIN + 2, y: yPos - FIELD_HEIGHT + 5,
            width: USABLE_WIDTH * 0.4 - 4, height: FIELD_HEIGHT - 2,
            borderWidth: 0,
        });

        yPos -= FIELD_HEIGHT + LINE_GAP;
    }

    function addParagraph(text) {
        ensureSpace(30);
        const words = text.split(" ");
        let line = "";
        const maxWidth = USABLE_WIDTH;
        const fontSize = 8;

        for (const word of words) {
            const testLine = line + (line ? " " : "") + word;
            const width = font.widthOfTextAtSize(testLine, fontSize);
            if (width > maxWidth && line) {
                currentPage.drawText(line, {
                    x: MARGIN, y: yPos, size: fontSize, font, color: DARK_GRAY,
                });
                yPos -= 12;
                ensureSpace(14);
                line = word;
            } else {
                line = testLine;
            }
        }
        if (line) {
            currentPage.drawText(line, {
                x: MARGIN, y: yPos, size: fontSize, font, color: DARK_GRAY,
            });
            yPos -= 14;
        }
    }

    // ─── Build the PDF ───
    addPage();
    drawTitle();

    for (const section of sections) {
        if (section.type === "header") {
            drawSectionHeader(section.text);
        } else if (section.type === "text") {
            addTextField(section.name, section.label);
        } else if (section.type === "textRow") {
            addTextFieldRow(section.fields, section.label);
        } else if (section.type === "checkbox") {
            addCheckbox(section.name, section.label);
        } else if (section.type === "checkboxRow") {
            addCheckboxRow(section.items);
        } else if (section.type === "signature") {
            addSignatureField(section.name, section.label);
        } else if (section.type === "dropdown") {
            addDropdown(section.name, section.label, section.options);
        } else if (section.type === "paragraph") {
            addParagraph(section.text);
        } else if (section.type === "textFields") {
            // Batch of text fields
            for (const f of section.fields) {
                addTextField(f, f);
            }
        } else if (section.type === "checkboxes") {
            // Batch of checkboxes
            for (const f of section.fields) {
                addCheckbox(f, f);
            }
        } else if (section.type === "checkboxGrid") {
            // For skills checklist dynamic grid
            const { sectionId, columns, count } = section;
            for (let skill = 0; skill < count; skill++) {
                const items = [];
                for (let col = 1; col <= columns; col++) {
                    items.push({ name: `${sectionId}.${col}.${skill}`, label: `Col ${col}` });
                }
                addCheckboxRow(items);
            }
        }
    }

    // Save
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`  ✓ ${filename} (${(pdfBytes.length / 1024).toFixed(1)} KB)`);
}

// ─── Form Definitions ───

const FORMS = [
    // 1. Employment Application
    {
        filename: "employment-application.pdf",
        title: "Employment Application",
        subtitle: "Form 1020 — Pre-Hire",
        sections: [
            { type: "header", text: "Personal Information" },
            { type: "textRow", fields: [{ name: "Name", label: "Full Name" }, { name: "Date", label: "Date" }] },
            { type: "text", name: "Address", label: "Address" },
            { type: "textRow", fields: [{ name: "City", label: "City" }, { name: "State", label: "State" }, { name: "Zip", label: "Zip" }] },
            { type: "textRow", fields: [{ name: "Email Address", label: "Email" }, { name: "Phone", label: "Phone" }] },
            { type: "header", text: "Position Information" },
            { type: "textRow", fields: [{ name: "Position", label: "Position Applied For" }, { name: "Location Preference", label: "Location Preference" }] },
            { type: "textRow", fields: [{ name: "Salary Desired", label: "Salary Desired" }, { name: "How many hours can you work weekly", label: "Hours/Week" }] },
            { type: "text", name: "When would you be available to begin work", label: "Available Start Date" },
            { type: "header", text: "Schedule Preference" },
            { type: "checkboxRow", items: [{ name: "No Preference", label: "No Preference" }, { name: "Full Time Only", label: "Full Time" }, { name: "Part Time Only", label: "Part Time" }, { name: "Full or Part Time", label: "Either" }] },
            { type: "checkboxRow", items: [{ name: "Monday", label: "Monday" }, { name: "Tuesday", label: "Tuesday" }, { name: "Wednesday", label: "Wednesday" }, { name: "Thursday", label: "Thursday" }] },
            { type: "checkboxRow", items: [{ name: "Friday", label: "Friday" }, { name: "Saturday", label: "Saturday" }, { name: "Sunday", label: "Sunday" }] },
            { type: "checkboxRow", items: [{ name: "Nights Yes", label: "Nights Yes" }, { name: "Nights No", label: "Nights No" }] },
            { type: "header", text: "Eligibility" },
            { type: "checkboxRow", items: [{ name: "Work US Yes", label: "Work in US: Yes" }, { name: "Work US No", label: "No" }] },
            { type: "checkboxRow", items: [{ name: "Test Yes", label: "Test: Yes" }, { name: "Test No", label: "No" }] },
            { type: "checkboxRow", items: [{ name: "Accommodation Yes", label: "Accommodation: Yes" }, { name: "Accommodation No", label: "No" }] },
            { type: "text", name: "reasonable accommodation If no describe what accommodations you would need 1", label: "Accommodations Needed" },
            { type: "header", text: "Education — High School" },
            { type: "textRow", fields: [{ name: "NAME OF SCHOOLHigh School", label: "School Name" }, { name: "LOCATIONHigh School", label: "Location" }, { name: "NO OF YEARS COMPLETEDHigh School", label: "Years" }, { name: "MAJOR OR DEGREEHigh School", label: "Degree" }] },
            { type: "header", text: "Education — College" },
            { type: "textRow", fields: [{ name: "NAME OF SCHOOLCollege", label: "School" }, { name: "LOCATIONCollege", label: "Location" }, { name: "NO OF YEARS COMPLETEDCollege", label: "Years" }, { name: "MAJOR OR DEGREECollege", label: "Degree" }] },
            { type: "textRow", fields: [{ name: "NAME OF SCHOOLCollege_2", label: "School 2" }, { name: "LOCATIONCollege_2", label: "Location" }, { name: "NO OF YEARS COMPLETEDCollege_2", label: "Years" }, { name: "MAJOR OR DEGREECollege_2", label: "Degree" }] },
            { type: "header", text: "Education — Other" },
            { type: "textRow", fields: [{ name: "NAME OF SCHOOLOther", label: "School" }, { name: "LOCATIONOther", label: "Location" }, { name: "NO OF YEARS COMPLETEDOther", label: "Years" }, { name: "MAJOR OR DEGREEOther", label: "Degree" }] },
            { type: "header", text: "Employment History — Employer 1" },
            { type: "textRow", fields: [{ name: "Name of Employer", label: "Employer" }, { name: "EMPLOYMENT FROM", label: "From" }, { name: "EMPLOYMENT TO", label: "To" }] },
            { type: "textRow", fields: [{ name: "COMPLETE ADDRESS", label: "Address" }, { name: "PHONE NUMBER", label: "Phone" }] },
            { type: "textRow", fields: [{ name: "NAME OF SUPERVISOR", label: "Supervisor" }, { name: "YOUR LAST JOB TITLE", label: "Job Title" }] },
            { type: "text", name: "REASON FOR LEAVING PLEASE BE SPECIFIC", label: "Reason for Leaving" },
            { type: "text", name: "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1", label: "Job Duties" },
            { type: "checkboxRow", items: [{ name: "MAY WE CONTACT FOR REFERENCES", label: "Contact: Yes" }, { name: "NO_5", label: "No" }] },
            { type: "header", text: "Employment History — Employer 2" },
            { type: "textRow", fields: [{ name: "2 NAME OF EMPLOYER", label: "Employer" }, { name: "EMPLOYMENT DATES FROM_2", label: "From" }, { name: "EMPLOYMENT DATES TO_2", label: "To" }] },
            { type: "textRow", fields: [{ name: "COMPLETE ADDRESS_2", label: "Address" }, { name: "PHONE NUMBER_2", label: "Phone" }] },
            { type: "textRow", fields: [{ name: "NAME OF SUPERVISOR_2", label: "Supervisor" }, { name: "YOUR LAST JOB TITLE_2", label: "Job Title" }] },
            { type: "text", name: "REASON FOR LEAVING PLEASE BE SPECIFIC_2", label: "Reason for Leaving" },
            { type: "text", name: "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_2", label: "Job Duties" },
            { type: "checkboxRow", items: [{ name: "MAY WE CONTACT FOR REFERENCES_2", label: "Contact: Yes" }, { name: "NO_6", label: "No" }] },
            { type: "header", text: "Employment History — Employer 3" },
            { type: "textRow", fields: [{ name: "3 NAME OF EMPLOYER", label: "Employer" }, { name: "EMPLOYMENT DATES FROM_3", label: "From" }, { name: "EMPLOYMENT DATES TO_3", label: "To" }] },
            { type: "textRow", fields: [{ name: "COMPLETE ADDRESS_3", label: "Address" }, { name: "PHONE NUMBER_3", label: "Phone" }] },
            { type: "textRow", fields: [{ name: "NAME OF SUPERVISOR_3", label: "Supervisor" }, { name: "YOUR LAST JOB TITLE_3", label: "Job Title" }] },
            { type: "text", name: "REASON FOR LEAVING PLEASE BE SPECIFIC_3", label: "Reason for Leaving" },
            { type: "text", name: "PLEASE LIST THE JOB DUTIES OF YOUR POSITION WITH THIS COMPANYRow1_3", label: "Job Duties" },
            { type: "checkboxRow", items: [{ name: "MAY WE CONTACT FOR REFERENCES_3", label: "Contact: Yes" }, { name: "NO_7", label: "No" }] },
            { type: "header", text: "Professional References" },
            { type: "textRow", fields: [{ name: "Prof Name_1", label: "Name" }, { name: "Prof Company_1", label: "Company" }, { name: "Prof Telephone_1", label: "Phone" }, { name: "Prof Years_1", label: "Years Known" }] },
            { type: "textRow", fields: [{ name: "Prof Name_2", label: "Name" }, { name: "Prof Company_2", label: "Company" }, { name: "Prof Telephone_2", label: "Phone" }, { name: "Prof Years_2", label: "Years Known" }] },
            { type: "textRow", fields: [{ name: "Prof Name_3", label: "Name" }, { name: "Prof Company_3", label: "Company" }, { name: "Prof Telephone_3", label: "Phone" }, { name: "Prof Years_3", label: "Years Known" }] },
            { type: "header", text: "Special Skills" },
            { type: "textFields", fields: ["1", "2", "3", "4", "5", "6"] },
            { type: "text", name: "Please use this space for any additional information you would like to provide that may assist us in the hiring process 1", label: "Additional Information" },
            { type: "header", text: "Signatures" },
            { type: "signature", name: "Signature1_es_:signer:signature", label: "Applicant Signature" },
            { type: "textRow", fields: [{ name: "Date_2", label: "Date" }, { name: "Date_3", label: "Date" }] },
            { type: "signature", name: "Signature2_es_:signer:signature", label: "Witness Signature" },
        ],
    },

    // 2. Equal Employment Opportunity
    {
        filename: "equal-opportunity.pdf",
        title: "Equal Employment Opportunity",
        subtitle: "Form 1021 — Pre-Hire",
        sections: [
            { type: "header", text: "Position Information" },
            { type: "textRow", fields: [{ name: "Position Applied For", label: "Position" }, { name: "Date of Application", label: "Date" }] },
            { type: "header", text: "Personal Information" },
            { type: "textRow", fields: [{ name: "Last Name", label: "Last Name" }, { name: "First Name", label: "First Name" }, { name: "Middle Name", label: "Middle Name" }] },
            { type: "text", name: "Address", label: "Address" },
            { type: "textRow", fields: [{ name: "City", label: "City" }, { name: "State", label: "State" }, { name: "Zip", label: "Zip" }] },
            { type: "text", name: "Date of Birth", label: "Date of Birth" },
            { type: "header", text: "Gender" },
            { type: "checkboxRow", items: [{ name: "Male", label: "Male" }, { name: "Female", label: "Female" }] },
            { type: "header", text: "Veteran Status" },
            { type: "checkboxRow", items: [{ name: "Yes", label: "Yes" }, { name: "No", label: "No" }] },
            { type: "header", text: "Race / Ethnicity" },
            { type: "checkboxRow", items: [{ name: "White", label: "White" }, { name: "Asian", label: "Asian" }, { name: "Black  African American", label: "Black" }] },
            { type: "checkboxRow", items: [{ name: "Hispanic  Latino", label: "Hispanic/Latino" }, { name: "Pacific Islander", label: "Pacific Islander" }, { name: "American Indian", label: "American Indian" }] },
            { type: "checkboxRow", items: [{ name: "2 or more Races", label: "2+ Races" }] },
            { type: "textFields", fields: ["Specify", "Specify_2", "Specify_3", "Specify_4", "Specify_5"] },
            { type: "header", text: "Referral Source" },
            { type: "checkboxRow", items: [{ name: "Newspaper", label: "Newspaper" }, { name: "Employment Agency", label: "Agency" }, { name: "School", label: "School" }, { name: "Internet", label: "Internet" }] },
            { type: "checkboxRow", items: [{ name: "Employee Referral", label: "Referral" }, { name: "Other", label: "Other" }, { name: "Walk-In", label: "Walk-In" }, { name: "Relative-Friend", label: "Relative/Friend" }] },
            { type: "checkboxRow", items: [{ name: "TV-Radio", label: "TV/Radio" }, { name: "Flier", label: "Flier" }, { name: "Mastercare Website", label: "Website" }, { name: "Unsolicited Resume", label: "Unsolicited" }] },
            { type: "text", name: "Name of Employee", label: "Name of Employee (if referral)" },
        ],
    },

    // 3. Skills Checklist
    {
        filename: "skills-checklist.pdf",
        title: "Skills Checklist",
        subtitle: "Form 1050 — Pre-Hire",
        sections: [
            { type: "header", text: "Languages" },
            { type: "textFields", fields: ["Languages other than English that I can speak and understand 1", "Languages other than English that I can speak and understand 2", "Languages other than English that I can speak and understand 3"] },
            { type: "header", text: "Activities of Daily Living (1=No Exp, 2=Some, 3=Competent, 4=Expert)" },
            { type: "checkboxGrid", sectionId: 1, columns: 4, count: 16 },
            { type: "header", text: "Housekeeping" },
            { type: "checkboxGrid", sectionId: 2, columns: 4, count: 6 },
            { type: "header", text: "Body Mechanics / Activity" },
            { type: "checkboxGrid", sectionId: 3, columns: 4, count: 6 },
            { type: "header", text: "General" },
            { type: "checkboxGrid", sectionId: 4, columns: 4, count: 8 },
            { type: "header", text: "Diabetic Care" },
            { type: "checkboxGrid", sectionId: 5, columns: 4, count: 3 },
            { type: "header", text: "Gastrointestinal" },
            { type: "checkboxGrid", sectionId: 6, columns: 4, count: 15 },
            { type: "header", text: "Vital Signs" },
            { type: "checkboxGrid", sectionId: 7, columns: 4, count: 4 },
            { type: "header", text: "Genitourinary / Elimination" },
            { type: "checkboxGrid", sectionId: 8, columns: 4, count: 7 },
            { type: "header", text: "Medical Administration" },
            { type: "checkboxGrid", sectionId: 9, columns: 4, count: 5 },
            { type: "header", text: "Medical Equipment" },
            { type: "checkboxGrid", sectionId: 10, columns: 4, count: 12 },
            { type: "header", text: "Neurological" },
            { type: "checkboxGrid", sectionId: 11, columns: 4, count: 3 },
            { type: "header", text: "Respiratory" },
            { type: "checkboxGrid", sectionId: 12, columns: 4, count: 3 },
            { type: "header", text: "Vascular" },
            { type: "checkboxGrid", sectionId: 13, columns: 4, count: 3 },
            { type: "header", text: "Certification" },
            { type: "textRow", fields: [{ name: "Print Name", label: "Print Name" }, { name: "Date", label: "Date" }] },
            { type: "signature", name: "Signature131_es_:signer:signature", label: "Signature" },
        ],
    },

    // 4. Request for Reference
    {
        filename: "request-for-reference.pdf",
        title: "Request for Reference",
        subtitle: "Form 1060 — Pre-Hire",
        sections: [
            { type: "header", text: "Reference Request Details" },
            { type: "textRow", fields: [{ name: "Please reply by", label: "Reply By" }, { name: "Company Name 1", label: "Company Name" }] },
            { type: "textRow", fields: [{ name: "Phone Number", label: "Phone" }, { name: "Employee Name", label: "Employee Name" }] },
            { type: "textRow", fields: [{ name: "Date of Birth", label: "DOB" }, { name: "Address 1", label: "Address" }] },
            { type: "header", text: "Authorization" },
            { type: "textRow", fields: [{ name: "I", label: "I (Employee Name) authorize..." }, { name: "Date", label: "Date" }] },
            { type: "textRow", fields: [{ name: "From", label: "Employment From" }, { name: "To", label: "Employment To" }] },
            { type: "text", name: "Reason for Leaving", label: "Reason for Leaving" },
            { type: "text", name: "Salary", label: "Salary" },
            { type: "header", text: "Reference Questions" },
            { type: "checkboxRow", items: [{ name: "Notice Yes", label: "Notice: Yes" }, { name: "Notice No", label: "No" }] },
            { type: "checkboxRow", items: [{ name: "Knowledgeable Yes", label: "Knowledgeable: Yes" }, { name: "Knowledgeable No", label: "No" }] },
            { type: "checkboxRow", items: [{ name: "Dependable Yes", label: "Dependable: Yes" }, { name: "Dependable No", label: "No" }] },
            { type: "checkboxRow", items: [{ name: "Rehire Yes", label: "Rehire: Yes" }, { name: "Rehire No", label: "No" }] },
            { type: "checkboxRow", items: [{ name: "Recommend Yes", label: "Recommend: Yes" }, { name: "Recommend No", label: "No" }] },
            { type: "text", name: "Additional InformationRow1", label: "Additional Information" },
            { type: "header", text: "Signatures" },
            { type: "textRow", fields: [{ name: "Name", label: "Reference Name" }, { name: "Date_2", label: "Date" }, { name: "Title", label: "Title" }] },
            { type: "signature", name: "Signature202_es_:signer:signature", label: "Signature" },
            { type: "textRow", fields: [{ name: "Mastercare Representative", label: "Mastercare Rep" }, { name: "Date_3", label: "Date" }] },
            { type: "text", name: "Mastercare Office Address", label: "Office Address" },
        ],
    },

    // 5. Background Check Authorization
    {
        filename: "background-check.pdf",
        title: "Background Check Authorization",
        subtitle: "Form 1070 — Pre-Hire",
        sections: [
            { type: "paragraph", text: "I hereby authorize the company to conduct a background check including criminal history, employment verification, and other relevant inquiries." },
            { type: "header", text: "Personal Information" },
            { type: "textRow", fields: [{ name: "Last First Middle", label: "Full Name" }, { name: "Maiden", label: "Maiden Name" }] },
            { type: "text", name: "Other Names Used", label: "Other Names Used" },
            { type: "textRow", fields: [{ name: "Social Security", label: "SSN" }, { name: "DOB", label: "Date of Birth" }] },
            { type: "textRow", fields: [{ name: "Phone", label: "Phone" }, { name: "Driver's License", label: "Driver's License #" }, { name: "State", label: "State" }] },
            { type: "header", text: "Current Address" },
            { type: "textRow", fields: [{ name: "Street", label: "Street" }, { name: "CityStateZip", label: "City/State/Zip" }, { name: "Years", label: "Years" }] },
            { type: "header", text: "Previous Address 1" },
            { type: "textRow", fields: [{ name: "Street_2", label: "Street" }, { name: "CityStateZip_2", label: "City/State/Zip" }, { name: "Years_2", label: "Years" }] },
            { type: "header", text: "Previous Address 2" },
            { type: "textRow", fields: [{ name: "Street_3", label: "Street" }, { name: "CityStateZip_3", label: "City/State/Zip" }, { name: "Years_3", label: "Years" }] },
            { type: "header", text: "Authorization" },
            { type: "textRow", fields: [{ name: "Print Name", label: "Print Name" }, { name: "Date", label: "Date" }] },
            { type: "signature", name: "Signature103_es_:signer:signature", label: "Applicant Signature" },
        ],
    },

    // 6. Care Associate Availability
    {
        filename: "care-availability.pdf",
        title: "Care Associate Availability",
        subtitle: "Form 1204 — Pre-Hire",
        sections: [
            { type: "header", text: "Personal Information" },
            { type: "textRow", fields: [{ name: "Name", label: "Name" }, { name: "Position", label: "Position" }] },
            { type: "text", name: "Address", label: "Address" },
            { type: "textRow", fields: [{ name: "Cell Phone", label: "Cell Phone" }, { name: "Home Phone", label: "Home Phone" }] },
            { type: "text", name: "Email", label: "Email" },
            { type: "header", text: "Areas Available to Work" },
            { type: "textFields", fields: ["Areas I can workRow1", "Areas I can workRow2", "Areas I can workRow3", "Areas I can workRow4", "Areas I can workRow5", "Areas I can workRow6"] },
            { type: "header", text: "Additional Notes" },
            { type: "textFields", fields: ["1", "2", "3", "4", "5"] },
            { type: "header", text: "Weekly Availability (AM/PM)" },
            { type: "textRow", fields: [{ name: "SundayAM", label: "Sun AM" }, { name: "SundayPM", label: "Sun PM" }, { name: "MondayAM", label: "Mon AM" }, { name: "MondayPM", label: "Mon PM" }] },
            { type: "textRow", fields: [{ name: "TuesdayAM", label: "Tue AM" }, { name: "TuesdayPM", label: "Tue PM" }, { name: "WedAM", label: "Wed AM" }, { name: "WedPM", label: "Wed PM" }] },
            { type: "textRow", fields: [{ name: "ThuAM", label: "Thu AM" }, { name: "ThuPM", label: "Thu PM" }, { name: "FridayAM", label: "Fri AM" }, { name: "FridayPM", label: "Fri PM" }] },
            { type: "textRow", fields: [{ name: "SatAM", label: "Sat AM" }, { name: "SatPM", label: "Sat PM" }] },
        ],
    },

    // 7. Employee Personal Action
    {
        filename: "employee-personal-action.pdf",
        title: "Employee Personal Action",
        subtitle: "Form 1010 — Onboarding",
        sections: [
            { type: "header", text: "Employee Information" },
            { type: "textRow", fields: [{ name: "Last Name", label: "Last Name" }, { name: "First Name", label: "First Name" }] },
            { type: "textRow", fields: [{ name: "Mail", label: "Email" }, { name: "ssn", label: "SSN" }] },
            { type: "textRow", fields: [{ name: "Date of Hire", label: "Hire Date" }, { name: "Date of Birth", label: "DOB" }] },
            { type: "textRow", fields: [{ name: "Gender identified as", label: "Gender" }, { name: "State", label: "State" }, { name: "zipcode", label: "Zip" }] },
            { type: "textRow", fields: [{ name: "Position", label: "Position" }, { name: "Pay Rate", label: "Pay Rate" }, { name: "Hours Per Week", label: "Hours/Week" }] },
            { type: "text", name: "Reports To", label: "Reports To" },
            { type: "text", name: "Resident of", label: "Resident of" },
            { type: "header", text: "Marital Status" },
            { type: "checkboxRow", items: [{ name: "checkbox_married", label: "Married" }, { name: "checkbox_divorced", label: "Divorced" }, { name: "checkbox_single", label: "Single" }] },
            { type: "header", text: "W-4 & Banking" },
            { type: "text", name: "W-4 Status", label: "W-4 Status" },
            { type: "text", name: "Date", label: "Date" },
            { type: "checkboxRow", items: [{ name: "checkbox_PickupatOffice", label: "Pickup at Office" }, { name: "checkbox_DirectDeposit", label: "Direct Deposit" }] },
            { type: "textRow", fields: [{ name: "Bank Name", label: "Bank Name" }, { name: "Account", label: "Account #" }, { name: "Routing", label: "Routing #" }] },
            { type: "checkboxRow", items: [{ name: "checkbox_savings", label: "Savings" }, { name: "checkbox_checking", label: "Checking" }] },
            { type: "header", text: "Employment Status / Separation" },
            { type: "text", name: "Employee Name", label: "Employee Name" },
            { type: "text", name: "ESIPosition", label: "Position" },
            { type: "checkboxRow", items: [{ name: "checkbox_QuitWNotice", label: "Quit w/ Notice" }, { name: "checkbox_QuitNONotice", label: "Quit No Notice" }, { name: "checkbox_Terminated", label: "Terminated" }, { name: "checkbox_Job Abandonment", label: "Job Abandonment" }] },
            { type: "textRow", fields: [{ name: "Last Day Worked", label: "Last Day" }, { name: "Immediate Supervisor", label: "Supervisor" }] },
            { type: "text", name: "ESIReason", label: "Reason" },
            { type: "text", name: "If Terminated Who Was the Witness", label: "Witness (if terminated)" },
            { type: "checkboxRow", items: [{ name: "checkbox_Eligible RehireYes", label: "Eligible Rehire: Yes" }, { name: "checkbox_EligibleRehireNo", label: "No" }] },
            { type: "checkbox", name: "Verify I-9", label: "I-9 Verified" },
            { type: "header", text: "Administrative" },
            { type: "textRow", fields: [{ name: "Inactive Date Entered", label: "Inactive Date" }, { name: "Completed By", label: "Completed By" }] },
            { type: "text", name: "Total Number of Hours Employee is Owed at Termination", label: "Hours Owed" },
            { type: "textRow", fields: [{ name: "ManagerHR", label: "Manager/HR" }, { name: "payrolldate", label: "Payroll Date" }] },
            { type: "checkbox", name: "checkbox_ReceivedbyPayroll", label: "Received by Payroll" },
            { type: "header", text: "Signature" },
            { type: "signature", name: "Signature", label: "Employee Signature" },
            { type: "text", name: "signature_date", label: "Date" },
        ],
    },

    // 8. Handbook Acknowledgment
    {
        filename: "handbook-acknowledgment.pdf",
        title: "Handbook Acknowledgment",
        subtitle: "Form 1201 — Onboarding",
        sections: [
            { type: "paragraph", text: "I acknowledge that I have received a copy of the Employee Handbook and that I understand the policies and procedures contained therein. I agree to comply with all company policies and procedures." },
            { type: "header", text: "Employee Information" },
            { type: "text", name: "Print Name", label: "Print Name" },
            { type: "text", name: "Position with Company", label: "Position with Company" },
            { type: "text", name: "Date", label: "Date" },
            { type: "signature", name: "Signature30_es_:signer:signature", label: "Employee Signature" },
            { type: "header", text: "Verification" },
            { type: "textRow", fields: [{ name: "Verified by", label: "Verified By" }, { name: "Date_2", label: "Date" }] },
        ],
    },

    // 9. Orientation Acknowledgements
    {
        filename: "orientation-acknowledgements.pdf",
        title: "Orientation Acknowledgements",
        subtitle: "Form 1202 — Onboarding",
        sections: [
            { type: "header", text: "Employee Information" },
            { type: "textRow", fields: [{ name: "Todays Date", label: "Today's Date" }, { name: "Position with Company", label: "Position" }] },
            { type: "textRow", fields: [{ name: "Start Date", label: "Start Date" }, { name: "Printed Name", label: "Printed Name" }] },
            { type: "header", text: "Orientation Items — Set 1 (Initials)" },
            ...Array.from({ length: 23 }, (_, i) => ({
                type: "text", name: `Initials ${i + 1}`, label: `Item ${i + 1} Initials`
            })),
            { type: "header", text: "Orientation Items — Set 2 (Initials)" },
            ...Array.from({ length: 23 }, (_, i) => ({
                type: "text", name: `Initials ${i + 1}_2`, label: `Item ${i + 1} Initials`
            })),
            { type: "header", text: "Signature" },
            { type: "signature", name: "Signature31_es_:signer:signature", label: "Employee Signature" },
        ],
    },

    // 10. Orientation Curriculum
    {
        filename: "orientation-curriculum.pdf",
        title: "Orientation Curriculum",
        subtitle: "Form 1203 — Onboarding",
        sections: [
            { type: "header", text: "Topics Training" },
            ...Array.from({ length: 8 }, (_, i) => ({
                type: "textRow", fields: [
                    { name: `DateRow${i + 1}`, label: `Date ${i + 1}` },
                    { name: `Trainer InitialsRow${i + 1}`, label: "Trainer Initials" },
                    { name: `Employee InitialsRow${i + 1}`, label: "Employee Initials" },
                ]
            })),
            { type: "header", text: "Videos Training" },
            ...Array.from({ length: 8 }, (_, i) => ({
                type: "textRow", fields: [
                    { name: `DateRow${i + 1}_2`, label: `Date ${i + 1}` },
                    { name: `Trainer InitialsRow${i + 1}_2`, label: "Trainer Initials" },
                    { name: `Employee InitialsRow${i + 1}_2`, label: "Employee Initials" },
                ]
            })),
            { type: "textRow", fields: [
                { name: "DateRow9", label: "Date 9" },
                { name: "Trainer InitialsRow9", label: "Trainer Initials" },
                { name: "Employee InitialsRow9", label: "Employee Initials" },
            ] },
            { type: "header", text: "Certification" },
            { type: "textRow", fields: [{ name: "Print Name", label: "Print Name" }, { name: "Date", label: "Date" }] },
            { type: "textRow", fields: [{ name: "Position with Company", label: "Position" }, { name: "Start Date", label: "Start Date" }] },
            { type: "signature", name: "Signature1_es_:signer:signature", label: "Employee Signature" },
        ],
    },

    // 11. Abuse & Neglect Policy
    {
        filename: "abuse-neglect-policy.pdf",
        title: "Abuse & Neglect Policy Acknowledgment",
        subtitle: "Form 1220 — Onboarding",
        sections: [
            { type: "paragraph", text: "I have received and reviewed the company policy on Abuse and Neglect. I understand my obligations to report any suspected abuse or neglect immediately and that failure to do so may result in disciplinary action up to and including termination." },
            { type: "header", text: "Acknowledgment" },
            { type: "text", name: "I", label: "I (Employee Name) acknowledge..." },
            { type: "text", name: "Date", label: "Date" },
            { type: "signature", name: "Signature107_es_:signer:signature", label: "Employee Signature" },
        ],
    },

    // 12. Care Associate Schedule Acknowledgement
    {
        filename: "care-schedule-acknowledgement.pdf",
        title: "Care Associate Schedule Acknowledgement",
        subtitle: "Form 1530 — Onboarding",
        sections: [
            { type: "paragraph", text: "I acknowledge the scheduling policies and agree to follow the assigned schedule. I understand that changes must be communicated and approved in advance." },
            { type: "header", text: "Acknowledgment" },
            { type: "text", name: "Care Associate Print Name", label: "Care Associate Print Name" },
            { type: "textRow", fields: [{ name: "Date", label: "Employee Date" }, { name: "Date_2", label: "Manager Date" }] },
            { type: "header", text: "Signatures" },
            { type: "signature", name: "Signature41_es_:signer:signature", label: "Care Associate Signature" },
            { type: "signature", name: "Signature42_es_:signer:signature", label: "Mastercare Signature" },
        ],
    },

    // 13. Emergency Contact Information
    {
        filename: "emergency-contact.pdf",
        title: "Emergency Contact Information",
        subtitle: "Form 1600 — Onboarding",
        sections: [
            { type: "header", text: "Employee Information" },
            { type: "textRow", fields: [{ name: "First Name", label: "First Name" }, { name: "Middle Name", label: "Middle Name" }, { name: "Last Name", label: "Last Name" }] },
            { type: "text", name: "Nickname", label: "Nickname" },
            { type: "text", name: "Address", label: "Address" },
            { type: "textRow", fields: [{ name: "Home Phone", label: "Home Phone" }, { name: "Cellular Phone", label: "Cell Phone" }] },
            { type: "text", name: "Email Address", label: "Email" },
            { type: "text", name: "Drivers LicenseState ID Number", label: "Driver's License / State ID" },
            { type: "header", text: "Emergency Contact 1" },
            { type: "textRow", fields: [{ name: "Emergency Contact Name", label: "Name" }, { name: "Relationship", label: "Relationship" }] },
            { type: "textRow", fields: [{ name: "Address_2", label: "Address" }, { name: "Phone Numbers", label: "Phone" }] },
            { type: "header", text: "Emergency Contact 2" },
            { type: "textRow", fields: [{ name: "Emergency Contact Name_2", label: "Name" }, { name: "Relationship_2", label: "Relationship" }] },
            { type: "textRow", fields: [{ name: "Address_3", label: "Address" }, { name: "Phone Numbers_2", label: "Phone" }] },
            { type: "header", text: "Emergency Contact 3" },
            { type: "textRow", fields: [{ name: "Emergency Contact Name_3", label: "Name" }, { name: "Relationship_3", label: "Relationship" }] },
            { type: "textRow", fields: [{ name: "Address_4", label: "Address" }, { name: "Phone Numbers_3", label: "Phone" }] },
        ],
    },

    // 14. Hepatitis B Consent
    {
        filename: "hepatitis-b-consent.pdf",
        title: "Hepatitis B Consent / Declination",
        subtitle: "Form 1720 — Onboarding",
        sections: [
            { type: "paragraph", text: "Under OSHA standards, employees with occupational exposure to blood or other potentially infectious materials must be offered the Hepatitis B vaccination series at no cost." },
            { type: "header", text: "Vaccination Choice" },
            { type: "checkbox", name: "I elect to receive the Hepatitis B vaccine", label: "I elect to receive the Hepatitis B vaccine" },
            { type: "checkbox", name: "I have received the Hepatitis B Vaccine Series", label: "I have already received the vaccine series" },
            { type: "checkbox", name: "Medical proof of vaccination", label: "Medical proof / Proof of immunity attached" },
            { type: "checkbox", name: "I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future", label: "I decline the vaccine" },
            { type: "header", text: "Vaccination Dates (if applicable)" },
            { type: "textRow", fields: [{ name: "Dates1", label: "Dose 1 Date" }, { name: "Dates2", label: "Dose 2 Date" }, { name: "Dates3", label: "Dose 3 Date" }] },
            { type: "header", text: "Consent Signature" },
            { type: "text", name: "Date", label: "Date" },
            { type: "signature", name: "Signature124_es_:signer:signature", label: "Employee Signature (Consent)" },
            { type: "header", text: "Declination Signature" },
            { type: "text", name: "Date_2", label: "Date" },
            { type: "signature", name: "Signature125_es_:signer:signature", label: "Employee Signature (Declination)" },
        ],
    },

    // 15. Pre-Employment Drug Consent
    {
        filename: "drug-consent.pdf",
        title: "Pre-Employment Drug Consent",
        subtitle: "Form 1740 — Onboarding",
        sections: [
            { type: "paragraph", text: "I consent to a pre-employment drug screening test as a condition of employment. I understand that a positive result may disqualify me from employment consideration." },
            { type: "header", text: "Applicant Information" },
            { type: "textRow", fields: [{ name: "Print Name", label: "Applicant Name" }, { name: "Date", label: "Date" }] },
            { type: "signature", name: "Signature134_es_:signer:signature", label: "Applicant Signature" },
            { type: "header", text: "Witness" },
            { type: "textRow", fields: [{ name: "Print Name_2", label: "Witness Name" }, { name: "Date_2", label: "Date" }] },
            { type: "signature", name: "Signature135_es_:signer:signature", label: "Witness Signature" },
            { type: "header", text: "Results" },
            { type: "text", name: "Results", label: "Test Results" },
        ],
    },

    // 16. ID Badge Agreement
    {
        filename: "id-agreement.pdf",
        title: "ID Badge Agreement",
        subtitle: "Form 2900 — Onboarding",
        sections: [
            { type: "paragraph", text: "I agree to maintain my ID badge in a well-kept condition. I also agree that in the event of separation from the company, I will return my ID badge and other company property." },
            { type: "header", text: "Badge Information" },
            { type: "text", name: "by Mastercare I agree to maintain my ID badge in a wellkept condition I also agree that in the event", label: "Agreement acknowledgment text" },
            { type: "textRow", fields: [{ name: "Date IssuedID Badge", label: "Date Issued" }, { name: "Quantity IssuedID Badge", label: "Qty Issued" }] },
            { type: "header", text: "Employee Acknowledgment" },
            { type: "textRow", fields: [{ name: "Employee Name", label: "Employee Name" }, { name: "Date", label: "Date" }] },
            { type: "signature", name: "Signature136_es_:signer:signature", label: "Employee Signature" },
            { type: "header", text: "Manager Acknowledgment" },
            { type: "textRow", fields: [{ name: "Manager Name", label: "Manager Name" }, { name: "Date_2", label: "Date" }] },
            { type: "signature", name: "Signature137_es_:signer:signature", label: "Manager Signature" },
            { type: "header", text: "Return Section" },
            { type: "textRow", fields: [{ name: "Date ReturnedRow1", label: "Date Returned" }, { name: "Items ReturnedRow1", label: "Items Returned" }, { name: "Items Not ReturnedRow1", label: "Items Not Returned" }] },
            { type: "textRow", fields: [{ name: "fill_12", label: "Notes" }, { name: "Date_3", label: "Date" }] },
            { type: "signature", name: "Signature138_es_:signer:signature", label: "Return Manager Signature" },
        ],
    },

    // 17. Nondisclosure / Noncompete
    {
        filename: "nondisclosure-noncompete.pdf",
        title: "Nondisclosure / Noncompete Agreement",
        subtitle: "Form 4000 — Onboarding",
        sections: [
            { type: "paragraph", text: "This agreement is entered into between the Employee and the Company to protect confidential information and prevent competitive activities during and after employment." },
            { type: "header", text: "Agreement Details" },
            { type: "textRow", fields: [{ name: "Effective Date", label: "Effective Date" }, { name: "Date", label: "Date Signed" }] },
            { type: "textRow", fields: [{ name: "Employee", label: "Employee" }, { name: "Employee Address", label: "Employee Address" }] },
            { type: "header", text: "Employee Information" },
            { type: "text", name: "Print Name", label: "Print Name" },
            { type: "text", name: "Address", label: "Address" },
            { type: "textRow", fields: [{ name: "City", label: "City" }, { name: "State", label: "State" }] },
            { type: "text", name: "Telephone", label: "Telephone" },
            { type: "header", text: "Signatures" },
            { type: "textRow", fields: [{ name: "Print Name and Title", label: "Company Rep Name/Title" }, { name: "Print Name and Title_2", label: "Witness Name/Title" }] },
            { type: "signature", name: "Signature144_es_:signer:signature", label: "Company Representative" },
            { type: "signature", name: "Signature145_es_:signer:signature", label: "Witness Signature" },
            { type: "signature", name: "Signature146_es_:signer:signature", label: "Employee Signature" },
        ],
    },

    // 18. I-9 Employment Eligibility
    {
        filename: "i9-form.pdf",
        title: "Form I-9 Employment Eligibility Verification",
        subtitle: "Department of Homeland Security — USCIS",
        sections: [
            { type: "header", text: "Section 1 — Employee Information" },
            { type: "textRow", fields: [{ name: "Last Name (Family Name)", label: "Last Name" }, { name: "First Name (Given Name)", label: "First Name" }, { name: "Employee Middle Initial (if any)", label: "MI" }] },
            { type: "text", name: "Employee Other Last Names Used (if any)", label: "Other Last Names" },
            { type: "text", name: "Address Street Number and Name", label: "Address" },
            { type: "textRow", fields: [{ name: "Apt Number (if any)", label: "Apt #" }, { name: "City or Town", label: "City" }, { name: "ZIP Code", label: "ZIP" }] },
            { type: "dropdown", name: "State", label: "State", options: ["", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"] },
            { type: "textRow", fields: [{ name: "Date of Birth mmddyyyy", label: "DOB" }, { name: "US Social Security Number", label: "SSN" }] },
            { type: "textRow", fields: [{ name: "Employees E-mail Address", label: "Email" }, { name: "Telephone Number", label: "Phone" }] },
            { type: "header", text: "Immigration Status" },
            { type: "checkboxRow", items: [{ name: "CB_1", label: "US Citizen" }, { name: "CB_2", label: "Noncitizen National" }, { name: "CB_3", label: "Lawful Permanent Resident" }, { name: "CB_4", label: "Alien Authorized" }] },
            { type: "text", name: "3 A lawful permanent resident Enter USCIS or ANumber", label: "USCIS/A-Number" },
            { type: "text", name: "USCIS ANumber", label: "USCIS A-Number" },
            { type: "text", name: "Form I94 Admission Number", label: "I-94 Admission #" },
            { type: "text", name: "Foreign Passport Number and Country of IssuanceRow1", label: "Foreign Passport # / Country" },
            { type: "text", name: "Exp Date mmddyyyy", label: "Expiration Date" },
            { type: "text", name: "Expiration Date if any", label: "Expiration Date (alt)" },
            { type: "header", text: "Section 1 — Signature" },
            { type: "signature", name: "Signature of Employee", label: "Employee Signature" },
            { type: "text", name: "Today's Date mmddyyy", label: "Today's Date" },
            { type: "header", text: "Section 2 — Employer Review" },
            { type: "text", name: "FirstDayEmployed mmddyyyy", label: "First Day of Employment" },
            { type: "header", text: "List A Documents" },
            { type: "textRow", fields: [{ name: "Document Title 1", label: "Doc Title" }, { name: "Issuing Authority 1", label: "Issuing Authority" }] },
            { type: "textRow", fields: [{ name: "Document Number 0 (if any)", label: "Doc Number" }, { name: "List A. Document 2. Expiration Date (if any)", label: "Exp Date" }] },
            { type: "textRow", fields: [{ name: "List A.   Document Title 3.  If any", label: "Doc 3 Title" }, { name: "List A. Document 3.  Enter Issuing Authority", label: "Issuing Auth" }, { name: "List A.  Document 3 Number.  If any", label: "Doc 3 Number" }] },
            { type: "header", text: "List B Documents" },
            { type: "textRow", fields: [{ name: "List B Document 1 Title", label: "Doc Title" }, { name: "List B Issuing Authority 1", label: "Issuing Authority" }] },
            { type: "textRow", fields: [{ name: "List B Document Number 1", label: "Doc Number" }, { name: "List B Expiration Date 1", label: "Exp Date" }] },
            { type: "header", text: "List C Documents" },
            { type: "textRow", fields: [{ name: "List C Document Title 1", label: "Doc Title" }, { name: "List C Issuing Authority 1", label: "Issuing Authority" }] },
            { type: "textRow", fields: [{ name: "List C Document Number 1", label: "Doc Number" }, { name: "List C Expiration Date 1", label: "Exp Date" }] },
            { type: "header", text: "Additional Documents" },
            { type: "textRow", fields: [{ name: "Document Title 2 If any", label: "Doc Title 2" }, { name: "Issuing Authority_2", label: "Authority" }] },
            { type: "textRow", fields: [{ name: "Document Number If any_2", label: "Doc # 2" }, { name: "Document Number if any_3", label: "Doc # 3" }] },
            { type: "text", name: "Additional Information", label: "Additional Information" },
            { type: "header", text: "Employer Certification" },
            { type: "text", name: "Last Name First Name and Title of Employer or Authorized Representative", label: "Employer Name/Title" },
            { type: "signature", name: "Signature of Employer or AR", label: "Employer Signature" },
            { type: "text", name: "Employers Business or Org Name", label: "Business/Org Name" },
            { type: "text", name: "Employers Business or Org Address", label: "Business Address" },
            { type: "text", name: "S2 Todays Date mmddyyyy", label: "Date" },
            { type: "header", text: "Supplement A — Preparer/Translator (Preparer 0)" },
            { type: "textRow", fields: [{ name: "Preparer or Translator First Name (Given Name) 0", label: "First Name" }, { name: "Preparer or Translator Last Name (Family Name) 0", label: "Last Name" }, { name: "PT Middle Initial 0", label: "MI" }] },
            { type: "text", name: "Preparer or Translator Address (Street Number and Name) 0", label: "Address" },
            { type: "text", name: "Preparer or Translator City or Town 0", label: "City" },
            { type: "dropdown", name: "Preparer State 0", label: "State", options: ["", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"] },
            { type: "text", name: "Zip Code 0", label: "Zip" },
            { type: "signature", name: "Signature of Preparer or Translator 0", label: "Preparer Signature" },
            { type: "text", name: "Sig Date mmddyyyy 0", label: "Date" },
            { type: "checkboxRow", items: [{ name: "CB_Alt", label: "Check if applicable" }] },
            // Supplemental Preparers 1-3
            ...([1, 2, 3].flatMap(n => [
                { type: "header", text: `Supplement A — Preparer ${n}` },
                { type: "textRow", fields: [{ name: `Preparer or Translator First Name (Given Name) ${n}`, label: "First Name" }, { name: `Preparer or Translator Last Name (Family Name) ${n}`, label: "Last Name" }, { name: `PT Middle Initial ${n}`, label: "MI" }] },
                { type: "text", name: `Preparer or Translator Address (Street Number and Name) ${n}`, label: "Address" },
                { type: "text", name: `Preparer or Translator City or Town ${n}`, label: "City" },
                { type: "dropdown", name: `Preparer State ${n}`, label: "State", options: ["", "AL", "AK", "AZ", "CA", "CO", "NY", "TX", "FL"] },
                { type: "text", name: `Zip Code ${n}`, label: "Zip" },
                { type: "signature", name: `Signature of Preparer or Translator ${n}`, label: "Signature" },
                { type: "text", name: `Sig Date mmddyyyy ${n}`, label: "Date" },
                { type: "checkboxRow", items: [{ name: `CB_Alt_${n - 1}`, label: "Check if applicable" }] },
            ])),
            { type: "header", text: "Supplement A — Employee Name References" },
            { type: "textRow", fields: [{ name: "Last Name Family Name from Section 1", label: "Last Name" }, { name: "First Name Given Name from Section 1", label: "First Name" }, { name: "Middle initial if any from Section 1", label: "MI" }] },
            { type: "textRow", fields: [{ name: "Last Name Family Name from Section 1-2", label: "Last Name (2)" }, { name: "First Name Given Name from Section 1-2", label: "First Name (2)" }, { name: "Middle initial if any from Section 1-2", label: "MI (2)" }] },
            // Supplement B — Rehire
            ...([0, 1, 2].flatMap(n => [
                { type: "header", text: `Supplement B — Rehire ${n}` },
                { type: "textRow", fields: [{ name: `Date of Rehire ${n}`, label: "Rehire Date" }, { name: `Last Name ${n}`, label: "Last Name" }, { name: `First Name ${n}`, label: "First Name" }, { name: `Middle Initial ${n}`, label: "MI" }] },
                { type: "textRow", fields: [{ name: n === 0 ? `Document Title ${n}` : `${n}_rehire`, label: "Doc Title" }, { name: `Document Number ${n}`, label: "Doc Number" }, { name: `Expiration Date ${n}`, label: "Exp Date" }] },
                { type: "textRow", fields: [{ name: `Name of Emp or Auth Rep ${n}`, label: "Employer/Rep" }, { name: `Todays Date ${n}`, label: "Date" }] },
                { type: "signature", name: `Signature of Emp Rep ${n}`, label: "Employer Signature" },
                { type: "text", name: `Addtl Info ${n}`, label: "Additional Info" },
            ])),
        ],
    },

    // 19. W-4 Tax Form (2023)
    {
        filename: "w4-form-2023.pdf",
        title: "Form W-4 (2023) — Employee's Withholding Certificate",
        subtitle: "Department of the Treasury — Internal Revenue Service",
        sections: [
            { type: "header", text: "Step 1 — Personal Information" },
            { type: "textRow", fields: [{ name: "text_ First name and middle initial", label: "First Name & MI" }, { name: "text_last name", label: "Last Name" }] },
            { type: "text", name: "text_social security number", label: "Social Security Number" },
            { type: "text", name: "text_address", label: "Address" },
            { type: "text", name: "text_City or town", label: "City or Town, State, ZIP" },
            { type: "header", text: "Filing Status" },
            { type: "checkboxRow", items: [{ name: "checkbox_single", label: "Single / HOH" }, { name: "checkbox_married", label: "Married Filing Jointly" }, { name: "checkbox_head of household", label: "Head of Household" }] },
            { type: "header", text: "Step 2 — Multiple Jobs or Spouse Works" },
            { type: "checkbox", name: "checkbox_If there are only two jobs total, you may check this box", label: "Check here if only two jobs total" },
            { type: "text", name: "text_two jobs", label: "Two jobs amount" },
            { type: "textRow", fields: [{ name: "text_three jobs_2a", label: "3+ Jobs (2a)" }, { name: "text_three jobs_2b", label: "3+ Jobs (2b)" }, { name: "text_three jobs_2c", label: "3+ Jobs (2c)" }] },
            { type: "textRow", fields: [
                { name: "text_Enter the number of pay periods per year for the highest paying job", label: "Pay periods/yr" },
                { name: "text_Divide the annual amount on line 1 or line 2c by the number of pay periods on line 3", label: "Per-period amount" },
            ] },
            { type: "header", text: "Step 3 — Claim Dependents" },
            { type: "text", name: "text_Multiply the number of qualifying children under age 17", label: "Qualifying children × $2,000" },
            { type: "text", name: "text_Multiply the number of other dependents b", label: "Other dependents × $500" },
            { type: "text", name: "text_Add the amounts above for qualifying children and other dependents", label: "Total dependents" },
            { type: "header", text: "Step 4 — Other Adjustments" },
            { type: "text", name: "text_Other income not from jobs", label: "Other income (4a)" },
            { type: "text", name: "text_Deductions", label: "Deductions (4b)" },
            { type: "text", name: "text_Extra withholding", label: "Extra withholding (4c)" },
            { type: "header", text: "Step 4(b) — Deductions Worksheet" },
            { type: "text", name: "text_Enter an estimate of your 2023 itemized deductions", label: "Estimated itemized deductions" },
            { type: "text", name: "text_Enter:", label: "Standard deduction amount" },
            { type: "text", name: "text_If line 1 is greater than line 2", label: "If line 1 > line 2" },
            { type: "text", name: "text_Enter an estimate of your student loan interest", label: "Student loan interest" },
            { type: "text", name: "text_Add lines 3 and 4", label: "Total adjustments" },
            { type: "header", text: "Step 5 — Employer" },
            { type: "text", name: "text_First date of employment", label: "First date of employment" },
            { type: "text", name: "text_Employer identification number", label: "Employer EIN" },
            { type: "text", name: "textarea_Employer's name", label: "Employer's name" },
            { type: "text", name: "text_Employer's address", label: "Employer's address" },
            { type: "text", name: "text_employer's signature date", label: "Employer signature date" },
        ],
    },
];

// ─── Main ───
async function main() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log("╔═══════════════════════════════════════════════════╗");
    console.log("║  ShiftNPay PDF Template Generator                ║");
    console.log("║  Generating 19 fillable PDF templates...         ║");
    console.log("╚═══════════════════════════════════════════════════╝\n");

    for (let i = 0; i < FORMS.length; i++) {
        const formDef = FORMS[i];
        try {
            console.log(`[${i + 1}/19] Generating ${formDef.title}...`);
            await createTemplate(formDef);
        } catch (err) {
            console.error(`  ✗ FAILED: ${formDef.filename}: ${err.message}`);
        }
    }

    console.log("\n✅ All templates generated in: public/forms/");
    console.log("These templates have proper named form fields matching PdfForms/*.jsx components.");
}

main().catch(console.error);
