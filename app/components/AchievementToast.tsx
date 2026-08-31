"use client";

type AchievementToastProps = {
  title: string;
  description: string;
  icon?: string;
  onClose?: () => void;
};

export function AchievementToast({
  title,
  description,
  icon = "★",
  onClose,
}: AchievementToastProps) {
  return (
    <div
      className="achievement-toast"
      role="status"
      aria-live="polite"
    >
      <div className="achievement-titlebar">
        <span>
          MAXOS.EXE
        </span>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close achievement"
          >
            ×
          </button>
        )}
      </div>

      <div className="achievement-body">
        <div className="achievement-icon">
          {icon}
        </div>

        <div className="achievement-copy">
          <span className="achievement-eyebrow">
            ACHIEVEMENT UNLOCKED
          </span>

          <strong>
            {title}
          </strong>

          <p>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
