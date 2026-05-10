'use client';

import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AnalysisCheckCardProps {
  title: string;
  status: 'pass' | 'fail' | 'warning';
  reason: string;
  confidence: number; // 0-1
  details?: string[];
}

export default function AnalysisCheckCard({
  title,
  status,
  reason,
  confidence,
  details
}: AnalysisCheckCardProps) {
  const getStatusColor = (s: string) => {
    if (s === 'pass') return { icon: CheckCircle2, color: '#22c55e', bg: '#dcfce7' };
    if (s === 'fail') return { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2' };
    return { icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' };
  };

  const { icon: StatusIcon, color } = getStatusColor(status);

  return (
    <Card className="bg-[#1a1a1a] border-[#2d2d2d] overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <StatusIcon className="w-6 h-6" style={{ color }} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white mb-2">{title}</h4>
            <p className="text-sm text-gray-300 mb-3">{reason}</p>

            {/* Confidence bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className="text-xs font-semibold text-gray-300">{Math.round(confidence * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-[#2d2d2d] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ 
                    width: `${confidence * 100}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>

            {/* Details */}
            {details && details.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#2d2d2d]">
                <p className="text-xs text-gray-400 font-semibold mb-2">Details:</p>
                <ul className="space-y-1">
                  {details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex gap-2">
                      <span className="text-[#d4af37]">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
