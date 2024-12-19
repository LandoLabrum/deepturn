import React, { Children, cloneElement, useEffect, useRef, useState, isValidElement } from 'react';
import styles from './ImageControl.scss';
import UiLoader from '@webstack/components/UiLoader/view/UiLoader';
import useClass from '@webstack/hooks/useClass';
import { UiIcon } from '@webstack/components/UiIcon/controller/UiIcon';
import { useModal } from '@webstack/components/Containers/modal/contexts/modalContext';

export type IImageVariant = 'center' | string | 'background';
export type IImageMediaType = 'image' | 'video';

interface IImageControl {
  variant?: IImageVariant;
  mediaType?: IImageMediaType;
  children?: React.ReactNode;
  refreshInterval?: number;
  error?: string | React.ReactElement;
  fixedLoad?: boolean;
  loadingText?: string;
  onComplete?: (e: any) => void;
}

const ImageControl: React.FC<IImageControl> = ({ children, variant, mediaType = 'image', refreshInterval = 1000, error, loadingText, fixedLoad = false, onComplete }) => {
  const childRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const clzz: string = useClass({ cls: 'image-control__element', type: mediaType, variant });
  const { openModal, closeModal, isModalOpen } = useModal();

  const handleExpand = () => {
    !isModalOpen ? openModal(
      {
        children: <ImageControl fixedLoad variant={variant} mediaType={mediaType} refreshInterval={refreshInterval} error={error}>
          {children}
        </ImageControl>,
        variant: 'fullscreen',
      }
    ) : closeModal();
  };

  useEffect(() => {
    const mediaHeight = childRef?.current?.offsetHeight;
    if (childRef.current && !loading) {
      onComplete?.({ src: Boolean(mediaHeight && mediaHeight > 10), loading });
    }
  }, [childRef.current, loading, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      const mediaHeight = childRef?.current?.offsetHeight;
      const mediaWidth = childRef?.current?.offsetWidth;
      const imageSrc = Boolean(mediaHeight && mediaHeight > 30 )|| Boolean(mediaWidth && mediaWidth > 10);
      if (childRef.current && imageSrc && loading === true) {
        setLoading(false);
      } else {
        if (error && !loading) setLoading(true);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, setLoading, error]);

  return (
    <>
      <style jsx>{styles}</style>
      <div className={`image-control${loading ? ' image-control__loading' : ""}${variant?` image-control--${variant}`:''}`}>
        {loading && <UiLoader position={!fixedLoad ? 'relative' : undefined} text={error || loadingText || undefined} dots={['string', 'object'].includes(typeof error) ? false : undefined} />}
        <div id='image-control__element' className={`${clzz}`} ref={childRef}>
          {Children.map(children, child => isValidElement(child) ? cloneElement(child) : child)}
        </div>
        <div className='image-control__controls'>
          <div className='image-control__controls__control'>
            <UiIcon icon='fa-play-pause' />
          </div>
          <div className='image-control__controls__control'>
            <UiIcon icon='fa-expand' onClick={handleExpand} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageControl;
