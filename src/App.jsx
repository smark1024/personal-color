import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import './App.scss';

// Code Splitting (지연 로딩)
const Home = lazy(() => import('./pages/Home'));
const Upload = lazy(() => import('./pages/Upload'));
const Result = lazy(() => import('./pages/Result'));

// 로딩 중 보여줄 스피너 컴포넌트
const LoadingFallback = () => (
  <div className="app__loading">
    <Loader2 size={40} className="app__loading-spinner animate-spin" />
    <p className="app__loading-text animate-pulse">Loading...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="app__container">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/result" element={<Result />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
