# 🎨 Personal Color Diagnosis

퍼스널 컬러를 진단하고 어울리는 컬러 팔레트를 추천하는 웹 애플리케이션입니다.

---

## ✨ 주요 기능

-   **사진 업로드**: 갤러리 선택 또는 카메라 촬영
-   **얼굴 인식**: face-api.js 기반 자동 얼굴 검출
-   **피부톤 분석**: RGB 기반 웜/쿨톤 판별 및 4계절 분류
-   **컬러 추천**: 어울리는 색상 팔레트 및 스타일링 팁 제공
-   **시각화**: 분석된 컬러를 실시간으로 이미지에 오버레이
-   **이미지 저장**: 결과 이미지 다운로드 기능

---

## 🛠️ 기술 스택

-   **Frontend**: React, Vite
-   **Styling**: SCSS (BEM)
-   **Routing**: React Router DOM
-   **AI/ML**: face-api.js (TensorFlow.js)
-   **Icons**: Lucide React

---

## 🚀 실행 방법

```bash
# 패키지 설치
npm install

# Face-API 모델 다운로드
mkdir -p public/models
cd public/models
curl -LO https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json
curl -LO https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1
curl -LO https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json
curl -LO https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1
cd ../..

# 개발 서버 실행
npm run dev
```

---

## 📝 License

MIT License
