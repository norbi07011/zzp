import React from 'react';
import { useTranslation } from 'react-i18next';

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text }) => {
  const { t } = useTranslation();
  const displayText = text || t('auth.divider.or', 'OR');

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500 font-medium">
          {displayText}
        </span>
      </div>
    </div>
  );
};

export default Divider;
