// Relative Path: ./Build.tsx
import React, { useEffect, useState } from 'react';
import styles from './ProductBuild.scss';
import ProductsListing from '../../ecommerce/Products/views/ProductListing/controller/ProductsListing';
import UiForm from '@webstack/components/UiForm/controller/UiForm';
import { IFormField } from '@webstack/components/UiForm/models/IFormModel';

// Remember to create a sibling SCSS file with the same name as this component

const ProductBuild: React.FC = () => {
  const [view, setView] = useState<string>('loading');
  const defaultValues = {
    usageOptions: [
      { label: 'Residential', name: "residential" },
      { label: 'Commercial', name: "commercial" },
      { label: 'Off-Grid', name: "offgrid" },
    ]
  }
  const stepOne: IFormField[] = [
    { name: "Usage", type: 'select', options: defaultValues.usageOptions, value: 'select' },
  ];
  const [buildFields, setBuildFields] = useState<IFormField[]>(stepOne);
  const views: any = {
    products: <ProductsListing
      scrollX={true}
      onSelect={console.log}
      hide={'header'}
    />
  };
  const handleFormChange = (e: any) => {
    const { name, value } = e?.target;
    if (!name) return;
  
    const valueAtor = (field: IFormField) => {
      const fieldType = field?.type;
      switch (fieldType) {
        case 'select':
          return value.name;
        case 'text':
          return value;
        default:
          return value;
      }
    };
  
    setBuildFields(prevFields =>
      prevFields.map(field =>
        field.name === name ? { ...field, value: valueAtor(field) } : field
      )
    );
  };
  useEffect(() => { setView('products'); }, [setView]);
  return (
    <>
      <style jsx>{styles}</style>
      <div className='product-build'>
        {/* <UiDev data={buildFields} /> */}
        <div className='product-build--header'>
          Product Build
        </div>
        <div className='product-build__body '>
          <div className='product-build__body--content '>
            {views?.[view]}

          </div>
          <div className='product-build__body--form'>
            <UiForm title='Start here, to Configure your Nirvana' fields={buildFields} variant='lite' onChange={handleFormChange} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductBuild;

// Inverter, Solar Panels, Battery, Generator
