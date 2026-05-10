'use client';

interface RiskScoreGaugeProps {
  score: number; // 0-100
}

export default function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  // Determine color based on score
  const getColor = (s: number) => {
    if (s <= 30) return { main: '#22c55e', bg: '#d1fae5', text: 'Low Risk' };
    if (s <= 60) return { main: '#f59e0b', bg: '#fef3c7', text: 'Medium Risk' };
    return { main: '#ef4444', bg: '#fee2e2', text: 'High Risk' };
  };

  const color = getColor(score);
  const rotation = (score / 100) * 180; // 0-100 maps to 0-180 degrees

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24">
        {/* Background arc */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="8"
            opacity="0.3"
          />
          {/* Progress arc */}
          <path
            d={`M 20 100 A 80 80 0 0 1 ${20 + Math.cos((Math.PI - (score / 100) * Math.PI)) * 80} ${100 - Math.sin((Math.PI - (score / 100) * Math.PI)) * 80}`}
            fill="none"
            stroke={color.main}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <div className="text-4xl font-bold" style={{ color: color.main }}>
            {score}
          </div>
          <div className="text-xs text-gray-400 font-semibold">RISK SCORE</div>
        </div>
      </div>

      {/* Risk level label */}
      <div className="mt-6 px-4 py-2 rounded-full" style={{ backgroundColor: color.bg }}>
        <p className="font-bold text-sm" style={{ color: color.main }}>
          {color.text}
        </p>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
        {score <= 30 && 'This property appears legitimate. No major red flags detected.'}
        {score > 30 && score <= 60 && 'Some concerns detected. Review details carefully before proceeding.'}
        {score > 60 && 'Multiple fraud indicators detected. Exercise extreme caution.'}
      </p>
    </div>
  );
}
