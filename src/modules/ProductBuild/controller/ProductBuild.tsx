// Relative Path: ./Build.tsx
import React, { useEffect, useState } from 'react';
import styles from './ProductBuild.scss';
import UiViewLayout from '@webstack/layouts/UiViewLayout/controller/UiViewLayout';
import ProductsListing from '../../ecommerce/Products/views/ProductListing/controller/ProductsListing';
import UiForm from '@webstack/components/UiForm/controller/UiForm';
import { IFormField } from '@webstack/components/UiForm/models/IFormModel';

// Remember to create a sibling SCSS file with the same name as this component

const ProductBuild: React.FC = () => {
  // const products = useProducts();
  const [view, setView] = useState<string>('loading');
  const defaultValues = {
    usageOptions:[
      {label:'Residential', name:"residential"},
      {label:'Commercial', name:"commercial"},
      {label:'Off-Grid', name:"offgrid"},
    ]
  }
  const stepOne:IFormField[]=[
    {name:"Usage", type: 'select', options:defaultValues.usageOptions, value:'select'},
  ];
  const [buildFields, setBuildFields] = useState<IFormField[]>(stepOne);
  const views:any = {
    products: <ProductsListing
      onSelect={console.log}
      hide={'header'}
    />
  };
  const handleFormChange = (e:any) =>{
    const {name}=e?.target;
    if(!name)return;
    console.log({name:String(name).toLowerCase()})

  }
  useEffect(() => {setView('products');}, [setView]);
  return (
    <>
      <style jsx>{styles}</style>
      <div className='product-build'>
        <div className='product-build--content'>
        {views?.[view]}      

        </div>
        <div className='product-build--form'>
          <UiForm fields={buildFields} onChange={handleFormChange}/>
        </div>
      </div>
    </>
  );
};

export default ProductBuild;

// Inverter, Solar Panels, Battery, Generator
