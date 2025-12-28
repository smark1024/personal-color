import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, ChevronRight, Palette } from 'lucide-react';
import './Home.scss';

const Home = memo(() => {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Blob 애니메이션 */}
      <div className="home__blob home__blob--1 animate-blob"></div>
      <div className="home__blob home__blob--2 animate-blob animation-delay-2000"></div>
      <div className="home__blob home__blob--3 animate-blob animation-delay-4000"></div>

      {/* 콘텐츠 영역 */}
      <div className="home__content">
        <div className="home__icon-wrapper">
          <Palette size={40} className="home__icon" />
        </div>

        <div className="home__badge">
          <Sparkles size={14} className="home__badge-icon" />
          <span>Personal Color Analysis</span>
        </div>

        <h1 className="home__title">
          나만의 <span className="home__title-highlight">컬러</span>를
          <br />
          찾아보세요
        </h1>

        <p className="home__description">
          당신의 피부톤을 정밀하게 분석하여
          <br />
          가장 잘 어울리는 색상을 추천해 드립니다.
        </p>

        <button className="home__button" onClick={() => navigate('/upload')}>
          <div className="home__button-icon-wrapper">
            <Camera size={20} />
          </div>
          <span>무료 진단 시작하기</span>
          <ChevronRight size={20} className="home__button-arrow" />
        </button>
      </div>

      {/* 하단 안내 문구 */}
      <p className="home__notice">
        * 사진은 서버에 저장되지 않으며 분석 후 즉시 삭제됩니다.
      </p>
    </div>
  );
});

export default Home;
