import React, { useState } from 'react';
import UiJoyStick from '@webstack/components/UiForm/components/UiJoyStick/UiJoyStick';
import IHomeService from '~/src/core/services/HomeService/IHomeService';
import { getService } from '@webstack/common';

interface ISurveillanceControlsProps {
  cameraId: string;
}

const SurveillanceControls: React.FC<ISurveillanceControlsProps> = ({ cameraId }) => {
  const [pos, setPos] = useState<[number, number]>([0, 0]);
    const homeService = getService<IHomeService>("IHomeService");
  const handleJoyStickMove = (x: number, y: number) => {
    setPos([x, y]);

    // Assuming the PTZ control uses normalized positions
    const normalizedX = Number(((x + 100) / 2).toFixed(0));
    const normalizedY = Number(((y + 100) / 2).toFixed(0));


    homeService.ptzPosition(cameraId, normalizedX, normalizedY);
  };

  return (
    <div className='surveillance-controls'>
      {/* <style jsx>{styles}</style> */}
      <UiJoyStick onMove={handleJoyStickMove} />
      <div className='coordinates'>
        {`X: ${pos[0]}, Y: ${pos[1]}`}
      </div>
    </div>
  );
};

export default SurveillanceControls;
