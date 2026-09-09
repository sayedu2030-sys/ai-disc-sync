import React from 'react';

interface FooterProps {
  lang?: string;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full bg-surface-container-low mt-auto border-t border-surface-container py-6">
      <div className="max-w-7xl mx-auto px-margin-desktop text-center">
        <p className="text-xs text-on-surface-variant font-medium">
          ©2026 SAY EDU. All Rights Reserved. 본 교육 플랫폼 및 프로파일링 알고리즘은 교육 목적으로만 사용합니다.
        </p>
      </div>
    </footer>
  );
};

