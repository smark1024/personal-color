import * as faceapi from "face-api.js";

let modelsLoaded = false;

/**
 * face-api.js 모델 로드
 */
export const loadModels = async () => {
    if (modelsLoaded) return;

    const MODEL_URL = "/models";

    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        modelsLoaded = true;
        console.log("✅ Face-API 모델 로드 완료");
    } catch (error) {
        console.error("❌ Face-API 모델 로드 실패:", error);
        throw error;
    }
};

/**
 * 이미지에서 얼굴 검출
 */
export const detectFace = async (imageElement) => {
    // 옵션을 더 관대하게 설정
    const detection = await faceapi.detectSingleFace(
        imageElement,
        new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.3,
        })
    );

    return detection;
};

/**
 * Hex 컬러를 RGBA로 변환
 */
const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 얼굴 주변에만 컬러 오버레이 적용
 */
export const applyColorOverlay = async (imageSrc, overlayColor) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 이미지 로드
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imageSrc;

            await new Promise((res) => {
                img.onload = res;
            });

            // Canvas 생성
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            // 원본 이미지 그리기
            ctx.drawImage(img, 0, 0);

            // 얼굴 검출
            const detection = await detectFace(img);

            if (!detection) {
                console.warn("⚠️ 얼굴을 찾을 수 없습니다.");
                // 얼굴 검출 실패를 명시적으로 반환
                resolve({
                    success: false,
                    image: canvas.toDataURL("image/png"),
                });
                return;
            }

            console.log("✅ 얼굴 검출 성공! 배경에 컬러 오버레이 적용 중...");

            // 얼굴 영역 정보
            const box = detection.box;

            // 얼굴 하단 Y 좌표 (여기서부터 그라데이션 시작)
            const faceBottom = box.y + box.height;
            const gradientStartY = faceBottom - 30; // 얼굴 하단보다 약간 위에서 시작

            // 블렌딩 모드 설정
            ctx.globalCompositeOperation = "overlay";

            // 1. 그라데이션 영역 (파란색 라인 ~ 초록색 라인)
            const gradient = ctx.createLinearGradient(
                0,
                gradientStartY, // 시작: 파란색 라인
                0,
                faceBottom // 끝: 초록색 라인 (얼굴 하단)
            );

            gradient.addColorStop(0, hexToRgba(overlayColor, 0)); // 시작: 투명한 퍼스널 컬러
            gradient.addColorStop(1, hexToRgba(overlayColor, 0.85)); // 끝: 진한 퍼스널 컬러

            ctx.fillStyle = gradient;
            ctx.fillRect(0, gradientStartY, canvas.width, faceBottom - gradientStartY);

            // 2. 단색 영역 (초록색 라인 ~ 하단)
            ctx.fillStyle = hexToRgba(overlayColor, 0.85); // 거의 단색
            ctx.fillRect(0, faceBottom, canvas.width, canvas.height - faceBottom);

            // 블렌딩 모드 초기화
            ctx.globalCompositeOperation = "source-over";

            console.log("✅ 오버레이 적용 완료!");

            // 결과 이미지 반환 (성공)
            resolve({
                success: true,
                image: canvas.toDataURL("image/png"),
            });
        } catch (error) {
            console.error("❌ 컬러 오버레이 적용 실패:", error);
            reject(error);
        }
    });
};
