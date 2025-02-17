import React from 'react';
import { Button } from '../ui-components/button';

export default function ResumePlayModal({
  resumeTime,
  onResume,
  onRestart,
  onClose,
}) {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs > 0 ? hrs + ':' : ''}${
      hrs > 0 ? mins.toString().padStart(2, '0') : mins
    }:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-dark-gray p-6">
        <h3 className="mb-4 text-lg font-medium text-white">
          Resume Playback?
        </h3>
        <p className="mb-4 text-light-gray">
          Would you like to resume from {formatTime(resumeTime)} or start from
          the beginning?
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onResume}
            className="bg-fabstir-primary hover:bg-primary-dark rounded px-4 py-2 text-white"
          >
            Resume
          </Button>
          <Button
            onClick={onRestart}
            className="rounded bg-fabstir-gray px-4 py-2 text-white hover:bg-medium-dark-gray"
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}
