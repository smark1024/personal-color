import React, { useState, useRef, memo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, X, ChevronLeft, Camera, Palette, AlertCircle } from "lucide-react";
import "./Upload.scss";

const Upload = memo(() => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    // 이미지 처리 함수 메모이제이션
    const handleFileProcess = useCallback((file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleFileChange = useCallback(
        (e) => {
            handleFileProcess(e.target.files[0]);
        },
        [handleFileProcess]
    );

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            handleFileProcess(e.dataTransfer.files[0]);
        },
        [handleFileProcess]
    );

    // 카메라 버튼 클릭
    const handleCameraClick = useCallback(() => {
        // 웹캠 API 지원 여부 체크
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

        if (hasMediaDevices) {
            // 웹캠 지원: 모달 열기
            console.log("🎥 웹캠 모달 열기");
            setShowCamera(true);
        } else {
            // 웹캠 미지원: 파일 선택
            console.log("📁 파일 선택 열기");
            cameraInputRef.current?.click();
        }
    }, []);

    // 웹캠 시작
    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 1280, height: 720 },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("카메라 접근 실패:", error);

            // 에러 유형별 메시지
            let errorMessage = "";
            if (error.name === "NotAllowedError") {
                errorMessage =
                    "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.";
            } else if (error.name === "NotFoundError") {
                errorMessage = "카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.";
            } else if (error.name === "NotReadableError") {
                errorMessage =
                    "카메라가 다른 앱에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.";
            } else {
                errorMessage =
                    "카메라에 접근할 수 없습니다. 브라우저를 새로고침하거나 갤러리에서 사진을 선택해주세요.";
            }

            setCameraError(errorMessage);
        }
    }, []);

    // 웹캠 중지
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setCameraError(null);
    }, []);

    // 사진 촬영
    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            // 캔버스 크기를 비디오 크기에 맞춤
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // 비디오 프레임을 캔버스에 그림
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // 캔버스를 이미지로 변환
            const imageData = canvas.toDataURL("image/jpeg");
            setImage(imageData);

            // 카메라 종료
            stopCamera();
        }
    }, [stopCamera]);

    // 카메라 모달이 열릴 때 웹캠 시작
    useEffect(() => {
        if (showCamera) {
            startCamera();
        }
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [showCamera, startCamera]);

    const handleAnalyze = useCallback(() => {
        if (!image) return;

        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            navigate("/result", { state: { image } });
        }, 1500);
    }, [image, navigate]);

    return (
        <div className="upload">
            {/* 전체 화면 로딩 오버레이 */}
            {isAnalyzing && (
                <div className="upload__overlay">
                    <div className="upload__spinner">
                        <div className="upload__spinner-ring"></div>
                        <Palette className="upload__spinner-icon" size={32} />
                    </div>
                    <p className="upload__overlay-title animate-pulse">
                        당신의 컬러를 찾고 있어요...
                    </p>
                    <p className="upload__overlay-subtitle">잠시만 기다려 주세요</p>
                </div>
            )}

            {/* 헤더 */}
            <div className="upload__header">
                <button className="upload__back-button" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className="upload__title">사진 업로드</h2>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="upload__content">
                <div className="upload__preview-area">
                    {image ? (
                        <div className="upload__preview">
                            <img
                                src={image}
                                alt="Upload preview"
                                className="upload__preview-image"
                            />
                            <button
                                className="upload__delete-button"
                                onClick={() => setImage(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="upload__dropzone"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <div className="upload__icon-wrapper">
                                <UploadIcon size={48} />
                            </div>
                            <p className="upload__dropzone-title">사진을 업로드하세요</p>
                            <p className="upload__dropzone-subtitle">
                                얼굴이 정면으로 보이는 사진이 가장 정확합니다
                            </p>

                            <div className="upload__button-group">
                                <button
                                    className="upload__select-button"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <UploadIcon size={24} />
                                    <span>갤러리에서 선택</span>
                                </button>

                                <button
                                    className="upload__camera-button"
                                    onClick={handleCameraClick}
                                >
                                    <Camera size={24} />
                                    <span>카메라로 촬영</span>
                                </button>
                            </div>

                            <p className="upload__drop-hint">또는 이곳에 파일을 드래그하세요</p>

                            {/* 갤러리 선택용 input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="upload__file-input"
                            />

                            {/* 카메라 촬영용 input */}
                            <input
                                type="file"
                                ref={cameraInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                capture="user"
                                className="upload__file-input"
                            />
                        </div>
                    )}
                </div>

                <div className="upload__actions">
                    <p className="upload__tip">
                        💡 자연광에서 찍은 얼굴 정면 사진이 가장 정확합니다.
                    </p>
                    <button
                        className={`upload__analyze-button ${
                            !image || isAnalyzing ? "upload__analyze-button--disabled" : ""
                        }`}
                        onClick={handleAnalyze}
                        disabled={!image || isAnalyzing}
                    >
                        <span>분석하기</span>
                    </button>
                </div>
            </div>

            {/* 카메라 모달 (웹캠) */}
            {showCamera && (
                <div className="upload__camera-modal">
                    <div className="upload__camera-container">
                        <div className="upload__camera-header">
                            <h3 className="upload__camera-title">사진 촬영</h3>
                            <button className="upload__camera-close" onClick={stopCamera}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="upload__camera-preview">
                            {cameraError ? (
                                <div className="upload__camera-error">
                                    <AlertCircle size={48} />
                                    <p className="upload__camera-error-title">
                                        카메라를 사용할 수 없습니다
                                    </p>
                                    <p className="upload__camera-error-message">{cameraError}</p>
                                    <button
                                        className="upload__camera-fallback-button"
                                        onClick={() => {
                                            stopCamera();
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        <UploadIcon size={20} />
                                        <span>갤러리에서 선택하기</span>
                                    </button>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="upload__camera-video"
                                />
                            )}
                        </div>

                        {!cameraError && (
                            <div className="upload__camera-actions">
                                <button className="upload__capture-button" onClick={capturePhoto}>
                                    <Camera size={24} />
                                    <span>촬영하기</span>
                                </button>
                            </div>
                        )}

                        {/* 숨겨진 캔버스 (사진 캡처용) */}
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>
                </div>
            )}
        </div>
    );
});

export default Upload;
