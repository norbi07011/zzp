import React from 'react';
import { ReviewForm } from './ReviewForm';

interface ReviewModalProps {
  isOpen: boolean;
  workerId: string;
  employerId: string;
  workerName: string;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  workerId,
  employerId,
  workerName,
  onClose,
  onReviewSubmitted
}) => {
  if (!isOpen) return null;

  const handleReviewSubmitted = () => {
    onReviewSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <ReviewForm
          workerId={workerId}
          employerId={employerId}
          workerName={workerName}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};