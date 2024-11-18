import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import styles from './ProductsListing.scss';
import { getService } from '@webstack/common';
import { useLoader } from '@webstack/components/Loader/Loader';
import { useClearance } from '~/src/core/authentication/hooks/useUser';
import IProductService from '~/src/core/services/ProductService/IProductService';
import UiSelect from '@webstack/components/UiForm/components/UiSelect/UiSelect';
import AdaptGrid from '@webstack/components/AdaptGrid/AdaptGrid';
import ProductListingItem from '../views/ProductListingItem/ProductListingItem';
import { UiIcon } from '@webstack/components/UiIcon/UiIcon';
import useSessionStorage from '@webstack/hooks/storage/useSessionStorage';
import UiSettingsLayout from '@webstack/layouts/UiSettingsLayout/controller/UiSettingsLayout';
import useWindow from '@webstack/hooks/window/useWindow';
import UiButton from '@webstack/components/UiButton/UiButton';
import environment from '~/src/core/environment';
import { IProduct } from '~/src/models/Shopping/IProduct';
import { MerchantSettingsLayout } from '~/src/core/environments/environment.interface';

interface IProductListing {
  group?: boolean;
}

interface FilterOption {
  label: string;
  name: string;
  active: boolean;
}

interface Filter {
  [key: string]: FilterOption[];
}


const ProductsListing: NextPage<IProductListing> = ({ group = false }) => {
  const EXPIRY = 60000;
  const merchant = environment.merchant;
  const { mid } = merchant;
  const merchantLayout = merchant?.settings?.ecommerce?.productListing;
  const [layout, setLayout] = useState<MerchantSettingsLayout>({ layoutStyle: 'grid' });

  const router = useRouter();
  const { query, pathname } = router;
  const queryLayoutStyle = query.layout;

  const { width } = useWindow();
  const [loader, setLoader] = useLoader();
  const level = useClearance();
  const [filters, setFilters] = useState<Filter>({ categories: [], types: [] });
  const [products, setProducts] = useState<any[] | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { sessionData, loading, setSessionItem } = useSessionStorage();

  const productService = getService<IProductService>("IProductService");

  const layouts: any = {
    grid: { gap: 10, xs: 2, md: 3, lg: 4, xl: 5 },
    list: { gap: 10, xs: 1 },
  };
  const layoutStyler = (layoutStyle?:any) =>{
    if(layoutStyle == 'grid' || layoutStyle == 'list')return layoutStyle;
    return;
  }
  const handleLayoutChange = (newLayout: string) => {
    router.push({ pathname, query: { ...query, layout: newLayout } }, undefined, { shallow: true });
  };

  const initializeFilters = (products: any[]) => {
    const categoriesSet: Set<string> = new Set();
    const typesSet: Set<string> = new Set();

    const merchProds = merchantProducts(products);
    if (!merchProds?.[0]) return;
    merchProds.forEach(product => {
      const { category, type } = product.metadata;

      if (category) categoriesSet.add(category);
      if (type) typesSet.add(type);
    });
    // console.log({categoriesSet, typesSet})
    setFilters({
      categories: Array.from(categoriesSet).map(category => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        name: category,
        active: false,
      })),
      types: Array.from(typesSet).map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        name: type,
        active: false,
      })),
    });
  };

  const updateFilters = (filterKey: keyof Filter, field: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: prevFilters[filterKey].map(option =>
        option.name === field.name ? { ...option, active: !option.active } : option
      ),
    }));
  };

  const showItem = (product: any) => {
    const type = product.metadata?.type;
    const category = product.metadata?.category || "Unknown"; // Default to "Unknown" if category is missing
  
    if (!product.active || !category) return;
  
    const categoryActive = filters.categories.some(option => option.active && option.name === category);
    const typeActive = filters.types.some(option => option.active && option.name === type);
  
    return (
      (filters.categories.some(option => option.active) && categoryActive) ||
      (filters.types.some(option => option.active) && typeActive) ||
      (!filters.categories.some(option => option.active) && !filters.types.some(option => option.active))
    );
  };
  
  const merchantProducts = (responseProducts: IProduct[]) => {
    const filtered = responseProducts.filter((product) => {
      // MERCHANT
      if (product.active && product.metadata && product.metadata.mid == mid) return product

    })
    // console.log({filtered})
    return filtered;
  }
  const fetchData = useCallback(async () => {
    if (loading || products) return;
    // console.log("Session Data:", sessionData);
    const productSessionData = sessionData?.products;
    // console.log("Product Session Data:", productSessionData);

    const timeSince = Date.now() - productSessionData?.created;
    // console.log({ sessionData })
    const isRefreshTime = productSessionData && timeSince > EXPIRY;
    // console.log("Is Refresh Time:", isRefreshTime);
    const setUpPage = (productsData: any) => {
      setProducts(merchantProducts(productsData.data));
      initializeFilters(productsData.data);
      setHasMore(productsData.has_more);
    }
    if (productSessionData && !isRefreshTime) {
      // console.log("[Using Cached Products]", productSessionData.data);
      setUpPage(productSessionData);
    } else {
      setLoader({ active: true });
      try {
        const request = { limit: 5, lookup_keys: ['tiktok'] }; // Your actual request logic here
        const response = await productService.getProducts(request);
        // console.log("API Response:", response);

        if (response?.data) {
          const productsData = { ...response, created: Date.now() };
          setSessionItem('products', productsData, { expiry: EXPIRY });
          setUpPage(response);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        // console.log({
        //   isRefreshTime,
        //   usingCookie:productSessionData && !isRefreshTime,
        // })
        setLoader({ active: false });
      }
    }

    // console.log("Products after fetch:", products);
  }, [sessionData, loading, products]);

  const handleLayout = () => {
    if (queryLayoutStyle) {
      setLayout({
        layoutStyle: layoutStyler(query.layout)
      }
      );

    }
    else if(merchantLayout)(
        setLayout(merchantLayout)
    )

  }



  
  useEffect(() => {
 handleLayout();
  }, [query]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <style jsx>{styles}</style>
      <div className='products-listing'>
        <div className='products-listing__body'>
          <UiSettingsLayout
            theme='light'
            variant="full-width"
            title={
              <div className="products-listing__header">
                <h1>Products {products?.length}</h1>
                <div className="products-listing__layout-actions">
                  {Object.keys(layouts).map((a: any, idx: number) => (
                    <span key={idx}>
                      <UiIcon
                        icon={`fa-${a}`}
                        color={layout === a ? 'var(--primary-50)' : 'var(--gray-70)'}
                        onClick={() => handleLayoutChange(a)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            }
            customMenu={
              <div className="products-listing__filters">
                {['categories', 'types'].map(filterKey => (
                  <UiSelect
                    clearable
                    key={filterKey}
                    onSelect={(field) => updateFilters(filterKey as keyof Filter, field)}
                    label={filterKey}
                    options={filters[filterKey]}
                    title={filters[filterKey].filter(option => option.active).map(option => option.label).join(", ") || 'All'}
                  />
                ))}
              </div>
            }
            views={{
              products: (
                <>
                  {products && products?.length > 0 && (
                    <AdaptGrid 
                     {...layouts[layout?.layoutStyle|| 'grid']}
                     >
                      {products.map((product, key) => showItem(product) && (
                        <ProductListingItem key={key} product={product} layout={layout} />
                      ))}
                    </AdaptGrid>
                  )}
                </>
              )
            }}
            footer={hasMore && <div className='products-listing__footer'><UiButton>Next</UiButton></div>}
          />
        </div>


      </div>

    </>
  );
};

export default ProductsListing;
