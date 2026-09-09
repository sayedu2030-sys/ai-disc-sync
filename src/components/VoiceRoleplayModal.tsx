import React, { useState, useEffect } from 'react';

interface VoiceRoleplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (feedback: string) => void;
}

export const VoiceRoleplayModal: React.FC<VoiceRoleplayModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isRecording, setIsRecording] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(15);
      setIsRecording(true);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinish = () => {
    onSuccess('음성 피드백: 결론 전달 속도 1.8초, 어조 침착성 96점 달성! (우수)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/50 backdrop-blur-sm flex items-center justify-center p-space-md animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-xl shadow-2xl flex flex-col gap-space-md relative border border-surface-container">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-1 rounded-lg hover:bg-surface-container transition-colors"
          title="닫기"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <div className="flex items-center gap-space-xs">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">record_voice_over</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary">
              D형 본부장 모의 음성 대화 롤플레잉
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              실시간 음성 반응 모델 가동 중 · 커뮤니케이션 시뮬레이터
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm text-center py-space-xl border border-surface-container">
          <div className="w-16 h-16 rounded-full bg-secondary text-on-secondary mx-auto flex items-center justify-center shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-[32px]">mic</span>
          </div>

          <span className="text-sm font-bold text-primary mt-space-xs leading-snug">
            &quot;김 수석, 3% 강하면 결함 아닌가? 핵심만 말해봐요.&quot;
          </span>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            지금 마이크로 15초 내에 &apos;A안(스펙 완화 정시출하)&apos;의 정당성을 침착하게 제시하십시오.
          </p>

          <div className="w-48 mx-auto bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-secondary h-full transition-all duration-1000"
              style={{ width: `${((15 - secondsLeft) / 15) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-on-surface-variant font-mono">
            남은 시간: 00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </span>
          <div className="flex items-center gap-space-xs">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-surface-container-high"
            >
              종료
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-sm"
            >
              답변 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
