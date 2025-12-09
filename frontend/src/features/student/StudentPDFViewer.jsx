import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const changeScale = (delta) => {
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 3.0));
    };

    return (
        <div className="pdf-viewer-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            padding: '20px',
            overflow: 'auto'
        }}>
            {/* Controls */}
            <div className="controls" style={{
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <span style={{ marginRight: '10px', fontWeight: 'bold', color: '#555' }}>
                    {numPages ? `${numPages} Pages` : 'Loading...'}
                </span>

                <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 10px' }}></div>

                <button onClick={() => changeScale(-0.1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>-</button>
                <span>{Math.round(scale * 100)}%</span>
                <button onClick={() => changeScale(0.1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>+</button>
            </div>

            {/* Document */}
            <div style={{ paddingBottom: '50px' }}>
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div style={{ padding: '20px' }}>Loading PDF...</div>}
                    error={<div style={{ padding: '20px', color: 'red' }}>Failed to load PDF. Please try again.</div>}
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        <div key={`page_${index + 1}`} style={{ marginBottom: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                            <Page
                                pageNumber={index + 1}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PDFViewer;
