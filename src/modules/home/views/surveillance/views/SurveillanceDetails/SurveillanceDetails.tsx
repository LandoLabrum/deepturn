// Relative Path: ./SurveillanceDetails.tsx
import React, { useEffect, useState } from 'react';
import styles from './SurveillanceDetails.scss';
import UiMedia from '@webstack/components/UiMedia/controller/UiMedia';
import SurveillanceControls from '../SurveillanceControl/SurveillanceControl';

// Remember to create a sibling SCSS file with the same name as this component
interface ISurveillanceDetails{
    id?:string;
}
const SurveillanceDetails: React.FC<ISurveillanceDetails> = ({id: id}: ISurveillanceDetails) => {
    const [isSub, setIsSub]=useState(true);
    if(!id)return <>no src</>;
  return (
    <>
      <style jsx>{styles}</style>
      {id}
       <UiMedia src={`https://tiktok.soy/api/stream/rtsp?id=${id}`}/>
        <SurveillanceControls cameraId={id}/>
    </>
  );
};

export default SurveillanceDetails;