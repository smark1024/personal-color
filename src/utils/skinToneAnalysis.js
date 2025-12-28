/**
 * 피부톤 분석 유틸리티
 * RGB 기반 퍼스널 컬러 분석
 */

/**
 * RGB를 HSV로 변환
 */
const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;

    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
            h = ((b - r) / delta + 2) / 6;
        } else {
            h = ((r - g) / delta + 4) / 6;
        }
    }

    return {
        h: h * 360,
        s: s * 100,
        v: v * 100,
    };
};

/**
 * 이미지에서 특정 영역의 평균 RGB 추출
 */
const getSkinSample = (imageData, x, y, size = 10) => {
    const { data, width } = imageData;
    let sumR = 0,
        sumG = 0,
        sumB = 0,
        count = 0;

    for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
            const px = Math.floor(x + dx);
            const py = Math.floor(y + dy);

            if (px >= 0 && px < width && py >= 0) {
                const idx = (py * width + px) * 4;
                sumR += data[idx];
                sumG += data[idx + 1];
                sumB += data[idx + 2];
                count++;
            }
        }
    }

    return {
        r: sumR / count,
        g: sumG / count,
        b: sumB / count,
    };
};

/**
 * 얼굴 영역에서 피부톤 샘플링
 */
export const analyzeSkinTone = (imageElement, faceBox) => {
    // Canvas에 이미지 그리기
    const canvas = document.createElement("canvas");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0);

    // 이미지 데이터 추출
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 얼굴 박스에서 피부 샘플링 포인트 계산
    const { x, y, width, height } = faceBox;

    const samplePoints = [
        { x: x + width * 0.5, y: y + height * 0.25 }, // 이마 중앙
        { x: x + width * 0.3, y: y + height * 0.5 }, // 왼쪽 볼
        { x: x + width * 0.7, y: y + height * 0.5 }, // 오른쪽 볼
        { x: x + width * 0.5, y: y + height * 0.7 }, // 턱
    ];

    // 각 포인트에서 RGB 샘플링
    const samples = samplePoints.map((point) => getSkinSample(imageData, point.x, point.y, 15));

    // 평균 RGB 계산
    const avgR = samples.reduce((sum, s) => sum + s.r, 0) / samples.length;
    const avgG = samples.reduce((sum, s) => sum + s.g, 0) / samples.length;
    const avgB = samples.reduce((sum, s) => sum + s.b, 0) / samples.length;

    console.log("🎨 피부톤 RGB:", { r: avgR.toFixed(1), g: avgG.toFixed(1), b: avgB.toFixed(1) });

    return { r: avgR, g: avgG, b: avgB };
};

/**
 * 언더톤 판별 (웜톤/쿨톤)
 */
export const determineUndertone = (rgb) => {
    // 방법 1: R/B 비율
    const warmCoolRatio = rgb.r / rgb.b;

    // 방법 2: Yellow Base vs Blue Base
    const yellowBase = (rgb.r + rgb.g) / 2;
    const blueBase = rgb.b;

    // HSV로 변환하여 색상(Hue) 확인
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    console.log("📊 언더톤 분석:", {
        warmCoolRatio: warmCoolRatio.toFixed(2),
        yellowBase: yellowBase.toFixed(1),
        blueBase: blueBase.toFixed(1),
        hue: hsv.h.toFixed(1),
    });

    // 웜톤 조건: R이 B보다 크거나, Yellow Base가 Blue Base보다 큼
    // 피부톤 특성상 약간 더 관대한 기준 적용
    if (warmCoolRatio > 1.03 || yellowBase > blueBase * 1.05) {
        return "WARM";
    } else {
        return "COOL";
    }
};

/**
 * 명도 판별 (밝음/어두움)
 */
export const determineBrightness = (rgb) => {
    // HSV의 V(Value) 값 사용
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    // 또는 간단하게 RGB 평균
    const avgBrightness = (rgb.r + rgb.g + rgb.b) / 3;

    console.log("💡 명도 분석:", {
        hsvValue: hsv.v.toFixed(1),
        avgBrightness: avgBrightness.toFixed(1),
    });

    // 한국인 피부톤 기준으로 조정된 임계값
    return avgBrightness > 170 ? "LIGHT" : "DARK";
};

/**
 * 최종 퍼스널 컬러 분류
 */
export const classifyPersonalColor = (rgb) => {
    const undertone = determineUndertone(rgb);
    const brightness = determineBrightness(rgb);

    let colorType;

    if (undertone === "WARM") {
        colorType = brightness === "LIGHT" ? "spring_warm" : "autumn_warm";
    } else {
        colorType = brightness === "LIGHT" ? "summer_cool" : "winter_cool";
    }

    console.log("✨ 최종 분류:", {
        undertone,
        brightness,
        result: colorType,
    });

    return colorType;
};
