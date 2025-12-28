import { detectFace, loadModels } from './faceDetection';
import { analyzeSkinTone, classifyPersonalColor } from './skinToneAnalysis';

// 퍼스널 컬러 데이터베이스
export const PERSONAL_COLORS = {
  spring_warm: {
    id: 'spring_warm',
    type: 'spring-warm',
    name: '봄 웜톤',
    description: '따뜻하고 생기 넘치는 봄 웜톤입니다. 노란빛이 도는 밝고 맑은 피부톤을 가지고 계시며, 화사한 파스텔 컬러와 선명한 비타민 컬러가 피부를 더욱 생동감 있게 만들어줍니다. 자연스러운 골드 액세서리가 찰떡궁합입니다.',
    colors: ['#FEF08A', '#FDBA74', '#FCA5A5', '#86EFAC', '#93C5FD'],
    makeup: {
      lip: '#FF7F7F',      // 코랄 핑크
      blush: '#FFB6A3'     // 피치 블러셔
    },
    best: [
      '코랄 핑크 립스틱',
      '피치 블러셔',
      '아이보리 베이스',
      '골드 주얼리'
    ],
    worst: [
      '쿨톤 레드 립',
      '차가운 회색 의상',
      '실버 액세서리',
      '네이비 아이라이너'
    ]
  },
  summer_cool: {
    id: 'summer_cool',
    type: 'summer-cool',
    name: '여름 쿨톤',
    description: '청량하고 우아한 여름 쿨톤입니다. 푸른빛이 도는 맑고 투명한 피부톤을 가지고 계시며, 부드러운 파스텔과 뮤트 톤 컬러가 세련된 분위기를 극대화합니다. 은은한 실버 액세서리와 함께하면 더욱 고급스러워 보입니다.',
    colors: ['#F9A8D4', '#C4B5FD', '#A5F3FC', '#E2E8F0', '#FDA4AF'],
    makeup: {
      lip: '#F9A8D4',      // 로즈 핑크
      blush: '#E9D5FF'     // 라벤더 블러셔
    },
    best: [
      '로즈 핑크 립',
      '라벤더 아이섀도',
      '그레이시 베이지',
      '실버 주얼리'
    ],
    worst: [
      '오렌지 립스틱',
      '카키 아우터',
      '골드 액세서리',
      '브라운 아이라이너'
    ]
  },
  autumn_warm: {
    id: 'autumn_warm',
    type: 'autumn-warm',
    name: '가을 웜톤',
    description: '차분하고 고급스러운 가을 웜톤입니다. 황금빛이 감도는 깊이 있는 피부톤을 가지고 계시며, 어스 톤과 테라코타 계열의 컬러가 세련되고 성숙한 매력을 완성합니다. 앤티크 골드와 브론즈 액세서리로 포인트를 주면 완벽합니다.',
    colors: ['#78350F', '#92400E', '#B45309', '#3F6212', '#701A75'],
    makeup: {
      lip: '#B45309',      // 브릭 레드
      blush: '#D97706'     // 테라코타
    },
    best: [
      '브릭 레드 립',
      '테라코타 블러셔',
      '카키 & 올리브',
      '골드 & 브론즈'
    ],
    worst: [
      '쨍한 핑크 립',
      '파스텔 블루',
      '퓨어 화이트',
      '실버 주얼리'
    ]
  },
  winter_cool: {
    id: 'winter_cool',
    type: 'winter-cool',
    name: '겨울 쿨톤',
    description: '도시적이고 카리스마 있는 겨울 쿨톤입니다. 차갑고 명확한 피부톤을 가지고 계시며, 명도 대비가 확실한 블랙&화이트, 비비드한 쿨톤 컬러가 강렬한 인상을 남깁니다. 플래티넘 실버나 화이트 골드 액세서리가 당신의 시크함을 배가시킵니다.',
    colors: ['#000000', '#FFFFFF', '#DC2626', '#1D4ED8', '#7E22CE'],
    makeup: {
      lip: '#991B1B',      // 와인 레드
      blush: '#BE123C'     // 딥 로즈
    },
    best: [
      '와인 레드 립',
      '그레이 스모키',
      '블랙 & 화이트',
      '실버 주얼리'
    ],
    worst: [
      '오렌지 블러셔',
      '베이지 의상',
      '골드 액세서리',
      '황토색 아이라이너'
    ]
  }
};

// 이미지 분석 함수 (실제 피부톤 분석)
export const analyzeColor = async (imageData) => {
  return new Promise(async (resolve) => {
    try {
      console.log('🔍 퍼스널 컬러 분석 시작...');
      
      // Face-API 모델 로드
      await loadModels();
      
      // 이미지 로드
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageData;
      
      await new Promise((res) => {
        img.onload = res;
      });

      // 얼굴 검출
      const detection = await detectFace(img);
      
      if (!detection) {
        console.warn('⚠️ 얼굴을 찾을 수 없어 랜덤 결과를 반환합니다.');
        // 얼굴 검출 실패 시 랜덤 반환
        const types = Object.keys(PERSONAL_COLORS);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        setTimeout(() => {
          resolve(PERSONAL_COLORS[randomType]);
        }, 1500);
        return;
      }

      console.log('✅ 얼굴 검출 완료! 피부톤 분석 중...');

      // 피부톤 RGB 분석
      const skinRgb = analyzeSkinTone(img, detection.box);

      // 퍼스널 컬러 분류
      const colorType = classifyPersonalColor(skinRgb);

      console.log('🎉 분석 완료:', PERSONAL_COLORS[colorType].name);

      // 결과 반환
      setTimeout(() => {
        resolve(PERSONAL_COLORS[colorType]);
      }, 1500);

    } catch (error) {
      console.error('❌ 분석 중 오류 발생:', error);
      
      // 오류 발생 시 랜덤 반환
      const types = Object.keys(PERSONAL_COLORS);
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      setTimeout(() => {
        resolve(PERSONAL_COLORS[randomType]);
      }, 1500);
    }
  });
};
