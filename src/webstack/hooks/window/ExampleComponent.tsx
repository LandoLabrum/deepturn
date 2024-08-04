// components/ExampleComponent.tsx
import React, { useEffect } from 'react';
// import useTheme from '../hooks/useTheme';
import styles from './ExampleComponent.module.scss';

const ExampleComponent: React.FC = () => {
  const { classes, setClasses } = useTheme();

  useEffect(() => {
    // Example of setting initial classes
    setClasses('dark round');
  }, [setClasses]);

  return (
    <div className={classes}>
      {/* <style jsx>{styles}</style> */}
      {/* Your component content here */}
    </div>
  );
};

export default ExampleComponent;
