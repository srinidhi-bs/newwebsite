import React, { useState, useRef } from 'react';
import PageWrapper from '../../layout/PageWrapper';

const ImageResizer = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [targetSize, setTargetSize] = useState('');
    const [targetUnit, setTargetUnit] = useState('KB');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resizedImage, setResizedImage] = useState(null);
    const [resizedSize, setResizedSize] = useState(0);
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
                setError('Please select a valid image file (JPG or PNG).');
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResizedImage(null);
            setError('');
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getCanvasBlob = (canvas, mimeType, quality) => {
        return new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
    };

    const processImage = async () => {
        if (!file || !targetSize) {
            setError('Please select a file and specify a target size.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const targetSizeBytes = parseFloat(targetSize) * (targetUnit === 'MB' ? 1024 * 1024 : 1024);
            const tolerance = 0.01; // +/- 1%
            const minTarget = targetSizeBytes * (1 - tolerance);
            const maxTarget = targetSizeBytes * (1 + tolerance);

            // Create an image element to load the file
            const img = new Image();
            img.src = previewUrl;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let currentWidth = img.width;
            let currentHeight = img.height;
            let currentQuality = 0.92;
            let blob = null;

            // Initial estimation based on file size ratio
            // Area ratio ~= Size ratio => Linear dimension ratio ~= sqrt(Size ratio)
            let scaleFactor = Math.sqrt(targetSizeBytes / file.size);

            // Cap initial scale factor to avoid extreme jumps
            if (scaleFactor > 2) scaleFactor = 2;
            if (scaleFactor < 0.1) scaleFactor = 0.1;

            currentWidth = Math.round(img.width * scaleFactor);
            currentHeight = Math.round(img.height * scaleFactor);

            let attempts = 0;
            const maxAttempts = 10;
            let bestBlob = null;
            let bestDiff = Infinity;

            while (attempts < maxAttempts) {
                canvas.width = currentWidth;
                canvas.height = currentHeight;

                // Draw image to canvas
                ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

                // Determine format and quality
                let mimeType = file.type;

                // For PNG, quality argument is ignored by toBlob, so we rely solely on dimensions
                // For JPEG, we can use quality

                blob = await getCanvasBlob(canvas, mimeType, currentQuality);

                const currentSize = blob.size;
                const diff = Math.abs(currentSize - targetSizeBytes);

                // Keep track of the best result so far
                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestBlob = blob;
                }

                // Check if within tolerance
                if (currentSize >= minTarget && currentSize <= maxTarget) {
                    break;
                }

                // Adjust for next iteration
                // We use a dampening factor to avoid oscillation
                const dampening = 0.5;
                const ratio = targetSizeBytes / currentSize;
                const adjustment = 1 + (Math.sqrt(ratio) - 1) * dampening;

                currentWidth = Math.round(currentWidth * adjustment);
                currentHeight = Math.round(currentHeight * adjustment);

                // Safety checks for dimensions
                if (currentWidth < 10) currentWidth = 10;
                if (currentHeight < 10) currentHeight = 10;

                // If we are stuck with JPEG and size is still too big even with small dimensions,
                // we might need to lower quality.
                if (mimeType === 'image/jpeg' && currentSize > maxTarget && attempts > 5) {
                    currentQuality = Math.max(0.1, currentQuality - 0.1);
                }

                attempts++;
            }

            setResizedImage(URL.createObjectURL(bestBlob));
            setResizedSize(bestBlob.size);

        } catch (err) {
            console.error('Resize error:', err);
            setError('An error occurred while processing the image.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resizedImage) {
            const link = document.createElement('a');
            link.href = resizedImage;
            // Add _resized suffix to original name
            const nameParts = file.name.split('.');
            const ext = nameParts.pop();
            link.download = `${nameParts.join('.')}_resized.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Image Resizer</h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Image
                        </label>
                        <div
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">{file.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Original Size: {formatSize(file.size)}</p>
                                </div>
                            ) : (
                                <div>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">PNG, JPG up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {file && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Settings</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Target File Size
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="number"
                                            value={targetSize}
                                            onChange={(e) => setTargetSize(e.target.value)}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="e.g. 500"
                                        />
                                        <select
                                            value={targetUnit}
                                            onChange={(e) => setTargetUnit(e.target.value)}
                                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 sm:text-sm"
                                        >
                                            <option value="KB">KB</option>
                                            <option value="MB">MB</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={processImage}
                                    disabled={isProcessing || !targetSize}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(isProcessing || !targetSize) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isProcessing ? 'Processing...' : 'Resize Image'}
                                </button>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview</h3>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50 dark:bg-gray-900/50">
                                    {resizedImage ? (
                                        <>
                                            <img
                                                src={resizedImage}
                                                alt="Resized preview"
                                                className="max-w-full h-auto max-h-64 object-contain mb-4 rounded shadow-sm"
                                            />
                                            <div className="text-center w-full">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                    New Size: {formatSize(resizedSize)}
                                                </p>
                                                <button
                                                    onClick={handleDownload}
                                                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Processed image will appear here
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default ImageResizer;
