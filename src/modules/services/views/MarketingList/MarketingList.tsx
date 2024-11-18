// Relative Path: ./MarketingDetails.tsx
import React, { useEffect, useState } from 'react';
import styles from './MarketingList.scss';
import AdaptGrid from '@webstack/components/AdaptGrid/AdaptGrid';
import { UiIcon } from '@webstack/components/UiIcon/UiIcon';
import UiButton from '@webstack/components/UiButton/UiButton';
import environment from '~/src/core/environment';
import { capitalize } from 'lodash';
import { getService } from '@webstack/common';
import IProductService from '~/src/core/services/ProductService/IProductService';
import { IProduct } from '~/src/models/Shopping/IProduct';
import { numberToUsd } from '@webstack/helpers/userExperienceFormats';

// Remember to create a sibling SCSS file with the same name as this component
interface IMarketingList {
  setDetails: (e: any) => void
}
const MarketingList = ({ setDetails }: IMarketingList) => {
  const productService = getService<IProductService>("IProductService");
  const [marketingProducts, setMarketingProducts] = useState<any | undefined>();
  const getMarketingProducts = async () => {
    try {
      const response = await productService.getProducts();
      const products = response.data;
      if (products) {
        const category = products.filter((a: any) => a.metadata.category);
        if (category?.length){
          console.log({category})
           setMarketingProducts(category)
          }
      }
    } catch (error) {
      setMarketingProducts(error)
    }
  }
  const AdminMarketingProgram = (details: any) => {
    return <>
      <style jsx>{styles}</style>

      <div className='marketing-program-card' onClick={() => setDetails(details)}>
        <UiIcon icon={`fa-${details.name.split("-"[0])}`} />
        <p>{details.name}</p>
        <UiButton onClick={() => setDetails('method')}>{
          details?.price?.unit_amount ? `${numberToUsd(details?.price?.unit_amount)} / lead`: "unavailable"
        }</UiButton>
        <UiButton variant='link' onClick={() => setDetails(`${details.name}-details`)}>More Info</UiButton>
      </div>
    </>
  }


  useEffect(() => {
    if (!marketingProducts) {
      getMarketingProducts();

    }
  }, []);
  return (
    <>
      <style jsx>{styles}</style>
      <div className='marketing-details'>
        <div className='marketing-details__header'>
          <div className='marketing-details__header--title'>Sign up for marketing lists</div>
          <div className='marketing-details__header--body'>Target your audience using informed media buying across states and the whole country by using Deepturn data analytics and audience groups to identify the people who will be most receptive to your message, create tailored content, and deliver impactful and cost effective campaigns across DMAs.</div>
        </div>
        <div className='marketing-details__create-account'>
          <div className='marketing-details__create-account--header'>
            {capitalize(environment.merchant.name)} Free Tier
          </div>
          <div className='marketing-details__create-account--body'>
            {`Gain free, knowledge of ${capitalize(environment.merchant.name)}'s products & services`}
          </div>
          <div className='marketing-details__create-account--action'>
            <UiButton variant="lite round">create a free account</UiButton>
          </div>
        </div>
        {marketingProducts && <AdaptGrid gapY={20} xs={1} md={3} gap={10} variant='card'>
          {marketingProducts.map((marketProduct: IProduct) => AdminMarketingProgram(marketProduct))}
          {/* {AdminMarketingProgram({name:'google'})}
            {AdminMarketingProgram({name:'tiktok'})}
            {AdminMarketingProgram({name:'instagram'})} */}
        </AdaptGrid>}
      </div>
    </>
  );
};

export default MarketingList;