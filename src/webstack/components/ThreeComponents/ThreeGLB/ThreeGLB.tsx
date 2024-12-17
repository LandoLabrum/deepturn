import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import styles from "./ThreeGLB.scss";

interface GLBViewerProps {
  modelPath: string;
  wireframe?: boolean;
  wireframeColor?: string;
  fov?: number;
  width?: number | string;
  height?: number | string;
}

const GLBViewer: React.FC<GLBViewerProps> = ({
  width = 100,
  height = 100,
  modelPath,
  wireframe = false,
  wireframeColor = '#000000',
  fov = 100,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 100, height: 100 });
  const [modelExists, setModelExists] = useState(true);

  const updateContainerSize = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setContainerSize({ width: offsetWidth, height: offsetHeight });
    }
  };

  useEffect(() => {
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  const checkModelPath = async (path: string) => {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Model not found');
      }
    } catch (error) {
      setModelExists(false);
    }
  };

  useEffect(() => {
    checkModelPath(modelPath);
  }, [modelPath]);

  const Model = () => {
    const gltf = useGLTF(modelPath);
    const modelRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useEffect(() => {
      if (modelRef.current && camera) {
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        modelRef.current.position.sub(center);

        const maxDimension = Math.max(size.x, size.y, size.z);
        const aspectRatio = containerSize.width / containerSize.height;
        camera.updateProjectionMatrix();

        const cameraDistance = maxDimension / (2 * Math.tan((fov * Math.PI) / 180 / 2));
        camera.position.set(-cameraDistance, -cameraDistance, cameraDistance + size.z);

        gsap.to(camera.position, {
          x: 0,
          y: 0,
          z: cameraDistance + size.z,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
          },
        });
      }
    }, [gltf, camera, containerSize]);

    useEffect(() => {
      if (wireframe && modelRef.current) {
        modelRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshBasicMaterial({
              color: wireframeColor,
              wireframe: true,
            });
          }
        });
      }
    }, [wireframe, wireframeColor]);

    return <primitive ref={modelRef} object={gltf.scene} />;
  };

  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.style.minWidth = typeof width === 'number' ? `${width}px` : width;
      containerRef.current.style.minHeight = typeof height === 'number' ? `${height}px` : height;
    }
  }, [width, height]);

  return (
    <>
      <style jsx>{styles}</style>
      <div ref={containerRef} className="three-glb">
        <div className="three-glb--content">
          {modelExists ? (
            <Canvas>
              <Environment preset="sunset" />
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 20]} intensity={0.7} />

              <Suspense fallback={null}>
                <Model />
              </Suspense>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={fov} />
            </Canvas>
          ) : (
            <div className="no-glb">No GLB model found at the provided path.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default GLBViewer;
