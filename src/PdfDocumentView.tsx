import { useRef, useState } from "react";
import { Page, Document } from "react-pdf";
import testFile from "./assets/PrdTestFile.pdf"

interface IDocumentPdfProps {
    docUrl?: string
}

export const DocumentPdf = (props: IDocumentPdfProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1);
    const scaleIncrementStep = 0.2;
    const isMobile = /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)

    const pdfViewerRef = useRef<HTMLDivElement>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const handlePdfAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!numPages) return;
        const container = pdfViewerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;

        if (x < rect.width / 2) {
            setPageNumber((prev) => Math.max(prev - 1, 1));
        } else {
            setPageNumber((prev) => Math.min(prev + 1, numPages));
        }
    };

    return (
        <div id="react-pdf-document" className="overflow-hidden d-flex flex-column w-100" style={{
			border: "black 1px solid"
		}}>
            {numPages && (
                <div className="d-flex align-items-center bg-light border-bottom">
                    <div className="me-auto">
                        Страница {pageNumber} из {numPages}
                    </div>
                    {!isMobile &&
                        <>
                            <button
                                disabled={pageNumber == 1}
                                onClick={() => setPageNumber(pageNumber - 1)}
                                className="btn btn-primary btn-sm my-1 me-1"
                                type="button"
                            >
                                -
                            </button>
                            <button
                                disabled={pageNumber == numPages}
                                onClick={() => setPageNumber(pageNumber + 1)}
                                className="btn btn-primary btn-sm my-1 me-1"
                                type="button"
                            >
                               +
                            </button>
                        </>
                    }
                    <button
                        disabled={scale <= 0.4}
                        onClick={() => setScale((x) => x - scaleIncrementStep)}
                        className="btn btn-primary btn-sm my-1 me-1"
                        type="button"
                    >
                        -
                    </button>
                    <button
                        onClick={() => setScale((x) => x + scaleIncrementStep)}
                        className="btn btn-primary btn-sm my-1 me-1"
                        type="button"
                    >
                       +
                    </button>
                </div>
            )}

            <div
                ref={pdfViewerRef}
                onClick={handlePdfAreaClick}
                className="flex-grow-1 overflow-auto bg-light position-relative pdf-viewer-grid"
                style={{ cursor: "pointer" }}
            >
                <Document
                    onLoadSuccess={onDocumentLoadSuccess}
                    file={testFile}
                    renderMode="svg"
                    onLoadError={(e: any) => console.error("Ошибка загрузки PDF:", e)}
                    className="pdf-document-center"
                >
                    <Page scale={scale} pageNumber={pageNumber} />
                </Document>
            </div>
        </div>
    )
}