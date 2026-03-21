import { saveAs } from 'file-saver'

export type ReportExportType = 'csv' | 'xlsx' | 'pdf'

export function getReportFilename(baseName: string, exportType: ReportExportType) {
  return `${baseName}.${exportType}`
}

export function downloadReportBlob(blob: Blob, baseName: string, exportType: ReportExportType) {
  saveAs(blob, getReportFilename(baseName, exportType))
}
