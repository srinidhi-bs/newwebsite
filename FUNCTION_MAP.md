# Function Map

## src/config/
- seoConfig -> { [routeKey: string]: { title, description, canonical, ogType?, ogImage?, jsonLd? } }
- defaults -> { title, description, siteUrl, siteName, ogImage }

## src/components/common/
- SEO({ routeKey: string }) -> React.Element
- Breadcrumbs() -> React.Element|null

## src/
- reportWebVitals(onPerfEntry: Function) -> void
- logMetric({ name, value, rating }) -> void
- App() -> React.Element

## src/context/
- ThemeProvider({ children }) -> React.Element
- useTheme() -> { theme, toggleTheme, isDark }
- LoadingProvider({ children }) -> React.Element
- useLoading() -> { isLoading, loadingMessage, showLoading, hideLoading }

## src/components/layout/
- Header({ currentPage, setCurrentPage, menuOpen, setMenuOpen }) -> React.Element
- Navigation({ currentPage, setCurrentPage, menuOpen, setMenuOpen }) -> React.Element
- PageWrapper({ children }) -> React.Element
- Footer() -> React.Element
- ThemeToggle() -> React.Element
- GlobalLoader() -> React.Element
- AnimatedRoutes({ setCurrentPage }) -> React.Element

## src/components/pages/
- Home() -> React.Element
- Finance({ setCurrentPage }) -> React.Element
- NotFound() -> React.Element
- EMICalculatorPage({ setCurrentPage }) -> React.Element
- IncomeTaxCalculatorPage({ setCurrentPage }) -> React.Element
- CapitalGainsCalculatorPage({ setCurrentPage }) -> React.Element
- Contact() -> React.Element
- Tools({ setCurrentPage }) -> React.Element



## src/components/tools/pdf-merger/
- PDFMerger() -> React.Element
- loadPreview(pdfFile, pageNumber) -> Promise<string>
- PagePreview({ pageNum, pdfFile, selected, onClick, dragHandleProps, onThumbnailLoad }) -> React.Element
- SortablePagePreview({ id, pageNum, pdfFile, selected, onClick, onThumbnailLoad }) -> React.Element
- SortableItem({ id, name, index, pageCount, selectedPages, onRemove, onPageSelectionChange, onPagesReorder, file }) -> React.Element

## src/components/tools/pdf-splitter/
- PDFSplitter() -> React.Element

## src/components/tools/pdf-to-jpg/
- PDFToJPG() -> React.Element

## src/components/finance/
- EMICalculator() -> React.Element
- DEDUCTION_SECTIONS -> Array<{ key, label, description, max, step, defaultValue, sliderMax? }>
- computeTaxForRegime(regime, grossIncome, oldRegimeDeductions) -> { tax, cess, totalTax, breakdown, taxableIncome, standardDeduction, rebateApplied }
- IncomeTaxCalculator() -> React.Element
  - updateDeduction(key, value) -> void (auto-caps to statutory max)
  - totalDeductions -> number (useMemo, sum of all deduction sections)
  - formatCurrency(amount) -> string (₹ symbol, UI display)
  - formatCurrencyPDF(amount) -> string (Rs. prefix, PDF-safe)
  - generatePDF() -> Promise<void> (downloads comparison PDF)
- HRACalculator() -> React.Element
- CapitalGainsCalculator() -> React.Element (6-step wizard, Steps 1-3 implemented)
  - CII_TABLE -> { [fyString]: number } (FY 2001-02 to 2025-26, base year 100)
  - getFYFromDate(dateStr) -> string|null (returns 'YYYY-YY' FY string)
  - formatCurrency(amount) -> string (Indian lakh/crore grouping, ₹ prefix)
  - calculateMonthsBetween(startDateStr, endDateStr) -> number
  - formatDuration(months) -> string
  - InfoBox({ title, children, variant }) -> React.Element
  - SelectionCard({ icon, label, description, selected, onClick }) -> React.Element
  - StepIndicator({ currentStep, totalSteps, labels }) -> React.Element
  - CurrencyInput({ label, hint, value, onChange, placeholder, disabled }) -> React.Element
  - Step1AssetDetails({ formData, updateField }) -> React.Element
  - Step2DatesHolding({ formData, updateField }) -> React.Element
  - Step3CostComputation({ formData, updateField }) -> React.Element
  - StepPlaceholder({ stepNumber, title, description }) -> React.Element

## src/components/tools/image-resizer/
- ImageResizer() -> React.Element

## src/components/tools/pdf-resizer/
- PDFResizer() -> React.Element
- formatSize(bytes) -> string
- renderPageToJpegBlob(pdfDoc, pageNumber, scale, quality) -> Promise<{blob, originalWidth, originalHeight}>
- buildPdfFromJpegBlobs(pages) -> Promise<Uint8Array>
- processPdf() -> Promise<void>
- handleDownload() -> void

## src/components/tools/jpg-to-pdf/
- JPGToPDF() -> React.Element

## src/components/tools/pdf-lock/
- PDFLock() -> React.Element
- loadQpdfModule() -> Promise<QpdfInstance>
- onDrop(acceptedFiles: File[]) -> void
- handleLock() -> Promise<void>
- handleDownload() -> void
- resetTool() -> void
- formatSize(bytes: number) -> string

## src/components/tools/pdf-unlock/
- PDFUnlock() -> React.Element
- loadQpdfModule() -> Promise<QpdfInstance>
- onDrop(acceptedFiles: File[]) -> void
- handleUnlock() -> Promise<void>
- handleDownload() -> void
- resetTool() -> void
- formatSize(bytes: number) -> string

## src/components/tools/pdf-ocr/
- PDFOcr() -> React.Element
- formatSize(bytes: number) -> string
- renderPageToCanvas(pdfDoc, pageNum) -> Promise<{canvas, width, height}>
- checkForExistingText(pdfDoc) -> Promise<boolean>
- mergeOcrTextLayer(originalPdfBytes, pagePdfBuffers) -> Promise<Blob>
- onDrop(acceptedFiles: File[]) -> Promise<void>
- handleProcess() -> Promise<void>
- handleCancel() -> Promise<void>
- handleDownloadPdf() -> void
- handleDownloadText() -> void
- handleCopyText() -> Promise<void>
- resetTool() -> void

## src/components/tools/pdf-rearrange/
- PDFRearrange() -> React.Element
- PageThumbnail({ id, pageNum, position, thumbnailUrl, isSelected, rotation, onDelete, onRotate, onClick, onThumbnailNeeded }) -> React.Element [memo]
- SortablePageThumbnail({ id, pageNum, position, thumbnailUrl, isSelected, rotation, onDelete, onRotate, onClick, onThumbnailNeeded }) -> React.Element
- DragOverlayThumbnail({ pageNum, thumbnailUrl, rotation }) -> React.Element [memo]
- parsePageInput(input: string, totalPageCount: number) -> { pages: number[], error: string|null }
- formatSize(bytes: number) -> string
- onDrop(acceptedFiles: File[]) -> Promise<void>
- generateThumbnail(pageNum: number) -> Promise<void>
- handleDragStart(event) -> void
- handleDragEnd(event) -> void
- handleDragCancel() -> void
- handlePageClick(id: string, index: number, event) -> void
- handleSelectAll() -> void
- handleDeselectAll() -> void
- handleDeletePage(id: string) -> void
- handleDeleteSelected() -> void
- handleRotatePage(id: string) -> void
- handleRotateSelected() -> void
- handleManualInputChange(value: string) -> void
- applyManualInput() -> void
- generateReorderedPDF() -> Promise<void>
- resetTool() -> void
