import React, { useEffect, useState, memo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RotateCcw, Palette, AlertCircle, Camera, Download } from "lucide-react";
import { analyzeColor } from "../utils/colorAnalysis";
import { loadModels, applyColorOverlay } from "../utils/faceDetection";
import "./Result.scss";

// 컬러 칩 컴포넌트
const ColorChip = memo(({ color, isActive, onClick }) => (
    <div
        className={`result__color-chip ${isActive ? "result__color-chip--active" : ""}`}
        style={{ backgroundColor: color }}
        onClick={onClick}
    />
));

const Result = memo(() => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [overlayImage, setOverlayImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isChangingColor, setIsChangingColor] = useState(false);
    const [faceDetectionFailed, setFaceDetectionFailed] = useState(false);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);

    useEffect(() => {
        if (!location.state?.image) {
            navigate("/", { replace: true });
            return;
        }

        const processImage = async () => {
            try {
                // 퍼스널 컬러 분석
                const colorResult = await analyzeColor(location.state.image);
                setResult(colorResult);

                // Face-API 모델 로드 및 컬러 오버레이 적용
                setIsProcessing(true);

                try {
                    await loadModels();

                    // 대표 컬러로 오버레이 (팔레트의 첫 번째 색상)
                    const overlayResult = await applyColorOverlay(
                        location.state.image,
                        colorResult.colors[0]
                    );

                    if (overlayResult.success) {
                        setOverlayImage(overlayResult.image);
                        setFaceDetectionFailed(false);
                    } else {
                        // 얼굴 검출 실패
                        setOverlayImage(location.state.image);
                        setFaceDetectionFailed(true);
                    }
                } catch (overlayError) {
                    console.error("오버레이 적용 실패:", overlayError);
                    // 오버레이 실패해도 원본 이미지 표시
                    setOverlayImage(location.state.image);
                    setFaceDetectionFailed(true);
                } finally {
                    setIsProcessing(false);
                }
            } catch (error) {
                console.error("이미지 처리 실패:", error);
                setIsProcessing(false);
            }
        };

        processImage();

        // 컴포넌트 언마운트 시 브라우저 히스토리의 state 정리
        return () => {
            // 현재 히스토리를 state 없이 교체
            window.history.replaceState({}, document.title);
        };
    }, [location.state, navigate]);

    // 컬러 변경 핸들러
    const handleColorChange = useCallback(
        async (colorIndex) => {
            if (!result || faceDetectionFailed || selectedColorIndex === colorIndex) return;

            setSelectedColorIndex(colorIndex);
            setIsChangingColor(true);

            try {
                await loadModels();
                const overlayResult = await applyColorOverlay(
                    location.state.image,
                    result.colors[colorIndex]
                );

                if (overlayResult.success) {
                    setOverlayImage(overlayResult.image);
                }
            } catch (error) {
                console.error("컬러 변경 실패:", error);
            } finally {
                setIsChangingColor(false);
            }
        },
        [result, faceDetectionFailed, selectedColorIndex, location.state]
    );

    // 이미지 다운로드 핸들러
    const handleDownload = useCallback(() => {
        if (!overlayImage) return;

        const link = document.createElement("a");
        link.href = overlayImage;
        link.download = `personal-color-${result.type}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [overlayImage, result]);

    if (!result) {
        return (
            <div className="result__loading">
                <div className="result__loading-spinner"></div>
                <p className="result__loading-text">당신의 컬러를 분석하고 있어요...</p>
            </div>
        );
    }

    return (
        <div className={`result result--${result.type}`}>
            {/* 이미지 영역 */}
            <div className="result__hero">
                <div className="result__image-container">
                    <div className="result__image-wrapper">
                        <div className="result__processing">
                            <img
                                src={overlayImage || location.state.image}
                                alt="Color Harmony"
                                className="result__image"
                            />
                            {(isProcessing || isChangingColor) && (
                                <div className="result__processing-overlay">
                                    <div className="result__processing-spinner animate-spin"></div>
                                    <p>
                                        {isProcessing ? "컬러 조화 분석 중..." : "컬러 변경 중..."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 다운로드 버튼 */}
                    {!faceDetectionFailed && !isProcessing && (
                        <button
                            className="result__download-button result__download-button--image"
                            onClick={handleDownload}
                            disabled={!overlayImage}
                        >
                            <Download size={18} />
                            이미지 저장
                        </button>
                    )}
                </div>

                {/* 타이틀 정보 (이미지 아래) */}
                {!isProcessing && (
                    <div className="result__title-section">
                        {faceDetectionFailed ? (
                            <h2 className="result__title">
                                얼굴 인식 실패
                                <br />
                                <span className="result__title-highlight result__title-highlight--error">
                                    사진을 다시 등록해주세요
                                </span>
                            </h2>
                        ) : (
                            <h2 className="result__title">
                                당신의 퍼스널 컬러는
                                <br />
                                <span className="result__title-highlight">{result.name}</span>
                            </h2>
                        )}
                    </div>
                )}
            </div>

            {/* 콘텐츠 영역 */}
            <div className="result__content">
                {/* 처리 완료 후에만 콘텐츠 표시 */}
                {!isProcessing && (
                    <>
                        {/* 얼굴 검출 실패 알림 */}
                        {faceDetectionFailed && (
                            <div className="result__alert">
                                <div className="result__alert-icon">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="result__alert-content">
                                    <h3 className="result__alert-title">얼굴을 찾을 수 없습니다</h3>
                                    <p className="result__alert-description">
                                        정면을 바라보는 얼굴이 명확히 보이는 사진으로
                                        <br />
                                        다시 시도해주세요.
                                    </p>
                                    <button
                                        className="result__alert-button"
                                        onClick={() => navigate("/upload", { replace: true })}
                                    >
                                        <Camera size={18} />
                                        사진 다시 등록하기
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 얼굴 검출 성공 시에만 분석 결과 표시 */}
                        {!faceDetectionFailed && (
                            <>
                                {/* 설명 */}
                                <div className="result__section">
                                    <p className="result__description">{result.description}</p>
                                </div>

                                {/* 컬러 팔레트 */}
                                <div className="result__section">
                                    <h3 className="result__section-title">
                                        <Palette size={20} />
                                        Best Color Palette
                                    </h3>
                                    <p className="result__palette-description">
                                        컬러를 클릭하면 해당 색상으로 변경됩니다
                                    </p>
                                    <div className="result__palette">
                                        {result.colors.map((color, idx) => (
                                            <ColorChip
                                                key={idx}
                                                color={color}
                                                isActive={selectedColorIndex === idx}
                                                onClick={() =>
                                                    !isChangingColor && handleColorChange(idx)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Best / Worst */}
                                <div className="result__recommendations">
                                    <div className="result__recommendation result__recommendation--best">
                                        <h4 className="result__recommendation-title">👍 Best</h4>
                                        <ul className="result__recommendation-list">
                                            {result.best.map((item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="result__recommendation-item"
                                                >
                                                    • {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="result__recommendation result__recommendation--worst">
                                        <h4 className="result__recommendation-title">👎 Worst</h4>
                                        <ul className="result__recommendation-list">
                                            {result.worst.map((item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="result__recommendation-item"
                                                >
                                                    • {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="result__actions">
                                    <button
                                        className="result__retry-button"
                                        onClick={() => navigate("/", { replace: true })}
                                    >
                                        <RotateCcw size={20} />
                                        다시 진단하기
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

export default Result;
