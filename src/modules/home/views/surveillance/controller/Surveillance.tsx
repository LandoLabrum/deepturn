// Relative Path: ./Surveillance.tsx
import React, { useRef, useState } from 'react';
import styles from './Surveillance.scss';
import UiMedia from '@webstack/components/UiMedia/controller/UiMedia';
import environment from '~/src/core/environment';
import AdaptGrid from '@webstack/components/AdaptGrid/AdaptGrid';
import { useEffect } from 'react';
import { getService } from '@webstack/common';
import IHomeService from '~/src/core/services/HomeService/IHomeService';
import { UiIcon } from '@webstack/components/UiIcon/UiIcon';
import { dateFormat } from '@webstack/helpers/userExperienceFormats';
import SurveillanceItem from '../views/SurveillanceItem/SurveillanceItem';
import UiDev from '@webstack/components/UiDev/UiDev';
import SurveillanceDetails from '../views/SurveillanceDetails/SurveillanceDetails';
interface ICameraInfo {
  apartalarmParm: {
    heightY: string;
    longX: string;
    startX: string;
    startY: string;
    type: string;
  };
  audioParm: {
    sampleRate: string;
  };
  basicInfo: {
    firmware: string;
    hardware: string;
    mac: string;
    model: string;
    type: string;
    wifidb: string;
  };
  channelResquestResult: {
    audio: string;
    video: string;
  };
  recordType: {
    type: string;
  };
  sdParm: {
    capacity: string;
    detail: string;
    free: string;
    status: string;
  };
  settingParm: {
    logSd: string;
    logUdisk: string;
    nightVision: string;
    osd: string;
    stateVision: string;
    telnet: string;
    tz: string;
  };
  uDiskParm: {
    capacity: string;
    free: string;
    status: string;
  };
  videoParm: {
    bitRate: string;
    fps: string;
    horizontalFlip: string;
    logo: string;
    resolution: string;
    time: string;
    type: string;
    verticalFlip: string;
  };
}

interface ICamera {
  audio: boolean;
  camera_info: ICameraInfo | null;
  connected: boolean;
  dtls: number;
  enabled: boolean;
  firmware_ver: string;
  hls_url: string;
  img_time: number | null;
  img_url: string | null;
  ip: string;
  is_2k: boolean;
  is_battery: boolean;
  mac: string;
  model_name: string;
  motion: boolean;
  motion_ts: number;
  name_uri: string;
  nickname: string;
  on_demand: boolean;
  p2p_type: number;
  parent_dtls: number;
  parent_mac: string;
  product_model: string;
  record: boolean;
  req_bitrate: number;
  req_frame_size: number;
  rtmp_url: string;
  rtsp_fw: boolean;
  rtsp_fw_enabled: boolean;
  rtsp_url: string;
  snapshot_url: string;
  start_time: number;
  status: number;
  stream_auth: boolean;
  substream: boolean;
  thumbnail: string;
  thumbnail_url: string;
  timezone_name: string;
  webrtc: boolean;
  webrtc_url: string;
}

interface ISurveillanceCam {
  available: number;
  cameras: ICamera[];
  enabled: number;
  total: number;
}




const Surveillance: React.FC = () => {
  const homeService = getService<IHomeService>("IHomeService");
  const [camData, setCamData] = useState<any>();
  const [main, setMain] = useState<string| undefined>();
  const handleMain = (id: string) => {
    const camName = id.toLowerCase();
    if(camData.cameras?.[camName] && !main) return setMain(camName);
    setMain(undefined);
    // if (!main)
    // 
  }
  const getCameras = async () => {
    if (camData) return;
    const response: any = await homeService.wbListCameras();
    try {
      setCamData(response)
    } catch (error) {
      console.error('[ SURVEILLANCE ]', error)
    }
  }

  useEffect(() => { getCameras();

  }, [camData]);
  if(main)return <SurveillanceDetails id={main}/>;
  return (
    <>
      <style jsx>{styles}</style>
      
      <div className='surveillance'>
        {camData?.available && (<>
          {/* <small><h4>CamData: </h4>{JSON.stringify(Object.keys(camData))}</small> */}
          <div className='surveillance__header'>
            <AdaptGrid xs={2} md={3} variant='card' gap={10}>
              {['available', 'enabled', 'total'].map((d: any) =>
                <div key={d}>
                  {d}: {camData[d]}
                </div>
              )}
            </AdaptGrid>
          </div>
        </>

        )||"still loading..."
        }
        {camData?.cameras && <AdaptGrid xs={2} md={3} variant='card' gap={10}>
          {Object.values(camData.cameras).map(
            (cameraData: any, idx: number) => {
              return <div key={idx} className='s-w-100'>
                {/* {JSON.stringify(cameraData)}<hr/> */}
                <SurveillanceItem camera={cameraData} onSelect={handleMain} />
              </div>
            })}
        </AdaptGrid>
        }
      </div>
    </>
  );
};

export default Surveillance;