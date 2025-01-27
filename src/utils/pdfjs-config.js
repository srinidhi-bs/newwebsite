import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';

// Use the worker directly from node_modules
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
