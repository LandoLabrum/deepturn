import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "./ProductsListing.scss";
import { useProducts } from "../../../hooks/useProducts";
import UiSettingsLayout from "@webstack/layouts/UiSettingsLayout/controller/UiSettingsLayout";
import AdaptGrid from "@webstack/components/AdaptGrid/AdaptGrid";
import ProductListingItem from "../views/ProductListingItem/ProductListingItem";
import { UiIcon } from "@webstack/components/UiIcon/UiIcon";
import UiButton from "@webstack/components/UiButton/UiButton";



interface IProductListing {
  hide?: string[] | 'header';
  variant?: 'full-width' | 'full',
  onSelect?:(e:any)=>void;
}
const ProductsListing = ({ hide, variant, onSelect }: IProductListing) => {
  const router = useRouter();
  const { query, pathname } = router;
  const { products, loading, hasMore } = useProducts();
  const [layout, setLayout] = useState<string>(query.layout && String(query.layout) || "grid");

  const layouts: any = {
    grid: { gap: 10, xs: 2, md: 3, lg: 4, xl: 5 },
    list: { gap: 10, xs: 1 },
  };

  const handleLayoutChange = (newLayout: string) => {
    if(onSelect)return onSelect(newLayout)
    setLayout(newLayout);
    router.push({ pathname, query: { ...query, layout: newLayout } }, undefined, { shallow: true });
  };
const isHideHeader = hide?.includes('header') && hide == undefined;


  return (
    <>
      <style jsx>{styles}</style>
      {/* {JSON.stringify({headeer:Boolean(typeof hide == 'string' && hide != 'header') })} */}
      <div className="products-listing">
        <UiSettingsLayout
          // theme="light"
          variant={variant}
          customMenu={!isHideHeader&&true||undefined}
          title={
            isHideHeader
            && (<div className="products-listing__header">
              <h1>Products ({products?.length || 0})</h1>
              <div className="products-listing__layout-actions">
                {["grid", "list"].map((view: string) => (
                  <span key={view}>
                    <UiIcon
                      color={view == layout&&"var(--primary-10)"||undefined}
                      icon={`fa-${view}`}
                      onClick={() => handleLayoutChange(view)}
                    />
                  </span>
                ))}
              </div>
            </div>)||undefined
          }
          views={{
            products: loading ? (
              <p>Loading...</p>
            ) : (

              <AdaptGrid {...layouts[layout]}>
                {products?.map((product, key) => (product?.active &&
                  <span key={key}>
                    <ProductListingItem key={key} onSelect={onSelect} product={product} layout={layouts[layout]} />
                  </span>
                ))}
              </AdaptGrid>
            ),
          }}
          footer={
            hasMore && (
              <div className="products-listing__footer">
                <UiButton>Load More</UiButton>
              </div>
            )
          }
        />
      </div>
    </>
  );
};

export default ProductsListing;
