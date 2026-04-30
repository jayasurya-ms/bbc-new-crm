import * as XLSX from "xlsx";
import * as XLSXStyle from "xlsx-js-style";

/**
 * Export data to Excel with styling
 * @param {Array} data - The array of objects to export
 * @param {Array} columns - Column definitions { header: string, key: string, width: number }
 * @param {string} fileName - Name of the file to download
 * @param {string} sheetName - Name of the sheet
 * @param {string} reportTitle - Title to display at the top of the report
 */
export const exportToExcel = ({
  data,
  columns,
  fileName = "report.xlsx",
  sheetName = "Sheet1",
  reportTitle = "Report",
}) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Prepare header rows
  const headerData = [
    [reportTitle], // Title Row
    [], // Empty Row
    columns.map(col => col.header), // Column Headers
  ];

  // Prepare body data
  const bodyData = data.map(item => 
    columns.map(col => item[col.key] || "")
  );

  // Combine data
  const finalData = [...headerData, ...bodyData];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(finalData);

  // Apply Styles
  const range = XLSX.utils.decode_range(ws["!ref"]);

  // Set column widths
  ws["!cols"] = columns.map(col => ({ wch: col.width || 15 }));

  // Style Title (A1)
  const titleCell = ws["A1"];
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, size: 16, color: { rgb: "000000" } },
      alignment: { horizontal: "center" },
    };
    // Merge title across all columns
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }
    ];
  }

  // Style Headers
  for (let c = 0; c < columns.length; c++) {
    const headerCell = ws[XLSX.utils.encode_cell({ r: 2, c })];
    if (headerCell) {
      headerCell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "0F172A" } }, // Navy Primary from CSS
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }
  }

  // Style Data Cells
  for (let r = 3; r <= range.e.r; r++) {
    for (let c = 0; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell) {
        cell.s = {
          alignment: { 
            horizontal: typeof cell.v === "number" ? "right" : "left",
            vertical: "center" 
          },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };
      }
    }
  }

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Export file
  const wbout = XLSXStyle.write(wb, { type: "binary", bookType: "xlsx" });
  
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
