# Function Map

## src/
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
- Finance() -> React.Element

- Contact() -> React.Element
- Tools() -> React.Element



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
- IncomeTaxCalculator() -> React.Element
- HRACalculator() -> React.Element
- CapitalGainsCalculator() -> React.Element

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
