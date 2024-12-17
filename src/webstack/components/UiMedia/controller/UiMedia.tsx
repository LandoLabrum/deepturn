import { useEffect, useRef, useState } from 'react';
import styles from './UiMedia.scss';
import ImageControl,{IImageMediaType,IImageVariant} from '../ImageControl/ImageControl';
import { UiIcon } from '@webstack/components/UiIcon/UiIcon';

export interface IMedia {
  src: string;
  alt?: string;
  variant?: IImageVariant;
  onLoad?: (e: any) => void;
  type?: IImageMediaType;
  loadingText?: string;
  rotate?: number;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  preload?: 'auto' | 'metadata' | 'none';
  width?: number;
  height?: number;
  playbackSpeed?: number;
}

const UiMedia: React.FC<IMedia> = ({
  src,
  variant,
  type = 'image',
  alt,
  loadingText,
  rotate,
  onLoad,
  autoplay,
  controls,
  loop,
  muted,
  poster,
  preload = 'auto',
  width,
  height,
  playbackSpeed = 1,
}) => {
  const [imageControlProps, setImageControlProps] = useState<any>({ variant, type });
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);

  const handleReload = () => {
    setImageControlProps({ ...imageControlProps, error: null });
    setReloadTrigger((prev) => prev + 1);
  };

  const RefreshLoadingText = () => (
    <>
      <div style={{ color: "#f90" }}>{loadingText}, Failed</div>
      <div>
        <UiIcon icon="fa-arrows-rotate" onClick={handleReload} />
      </div>
    </>
  );

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(imageControlProps);
    }
  };

  const handleError = (event: any) => {
    event.preventDefault();
    setIsLoading(false);
    if (!imageControlProps.error) {
      setImageControlProps({ ...imageControlProps, error: <RefreshLoadingText /> });
    }
  };


  useEffect(() => {
    if (type === 'video' && mediaRef.current && playbackSpeed) {
      (mediaRef.current as HTMLVideoElement).playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, type]);

  useEffect(() => {

    if (rotate && mediaRef.current) {
      mediaRef.current.style.transform = `rotate(${rotate}deg)`;
    } else if (mediaRef.current && mediaRef.current.style.transform) {
      mediaRef.current.style.transform = '';
    }
    if(height && mediaRef?.current){
      mediaRef.current.style.height = `${height}px`
    }
  }, [rotate, ]);

  return (
    <>
      <style jsx>{styles}</style>
      <ImageControl {...imageControlProps} onComplete={handleLoad}>
        {isLoading && <div className="loading">{loadingText || "Loading..."}</div>}
        {!imageControlProps.error && (
          type === 'video' ? (
            <video
              ref={mediaRef as React.Ref<HTMLVideoElement>}
              src={src}
              className={`${variant?`ui-media--${variant}`:''}`}
              autoPlay={autoplay}
              controls={controls}
              loop={loop}
              muted={muted}
              poster={poster}
              preload={preload}
              width={width}
              height={height}
              onLoadStart={() => setIsLoading(true)}
              onCanPlayThrough={handleLoad}
              onError={handleError}
              key={reloadTrigger}
              ><h1>loading</h1></video>
            ) : (
              <img
              ref={mediaRef as React.Ref<HTMLImageElement>}
              src={src}
              className={`${variant?`ui-media--${variant}`:''}`}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              key={reloadTrigger}
              
            />
          )
        )}
      </ImageControl>
    </>
  );
};

export default UiMedia;
