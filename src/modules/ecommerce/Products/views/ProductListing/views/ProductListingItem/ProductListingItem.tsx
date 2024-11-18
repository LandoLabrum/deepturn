import UiButton from "@webstack/components/UiButton/UiButton";
import styles from "./ProductListingItem.scss";
import { useEffect, useRef, useState } from "react";
import { UiIcon } from "@webstack/components/UiIcon/UiIcon";
import environment from "~/src/core/environment";
import ProductBuyNow from "../../../ProductDescription/views/ProductBuyNow/ProductBuyNow";
import { useRouter } from "next/router";
import keyStringConverter from "@webstack/helpers/keyStringConverter";
import { MerchantSettingsLayout } from "~/src/core/environments/environment.interface";

interface IProductListingItem {
    product: any;
    variant?: 'details' | 'dev';
    layout: MerchantSettingsLayout;
}

const ProductListingItem = ({ product, variant, layout }: IProductListingItem) => {
    const router = useRouter();
    const {push, query, pathname, asPath}  = router;
    const [selectedImage, setSelectedImage] = useState<string | undefined>();
    const [isHoveringBuyNow, setIsHoveringBuyNow] = useState(false);
    const cardRef = useRef<any>(null);
    const handleProductDescription = () => {
        if (isHoveringBuyNow) return;
    
        const newQuery = {
            ...query,
            id: product.id,
            pri: product.price.id
        };
    
        push({
            pathname: '/product',
            query: newQuery,
        }, `/product?id=${product.id}&pri=${product.price.id}`);
    };
    


    const mappedPrice = product?.prices?.length ? product.prices : [product?.price];
    if (!product) return <div>product not loaded</div>;

    const handleBuyNowMouseEnter = () => setIsHoveringBuyNow(true);
    const handleBuyNowMouseLeave = () => setIsHoveringBuyNow(false);
    
    // useEffect(() => {}, [asPath]);
    return (
        <>
            <style jsx>{styles}</style>
            <div
                ref={cardRef}
                className={`product-listing-item product-listing-item__${layout?.layoutStyle || 'grid'} ${layout?.size || ''}`}
                onClick={handleProductDescription}
            >
                <div className="product-listing-item__header">
                    <div className="product-listing-item__images">
                        {product?.images?.length > 0 ? product.images.map((url:string, idx:number) => (
                            <img
                                src={url}
                                className={`product-listing-item__images--item ${selectedImage === url || idx === 0 ? 'main' : ''}`}
                                alt={`${product.name}-${idx}`}
                                key={`${product.label}-${idx}`}
                            />
                        )) : (
                            <div className="product-listing-item__images--item main">
                                <UiIcon icon={`${environment.merchant.name}-logo`} />
                            </div>
                        )}
                        {variant === 'dev' && (
                            <small>
                                {product.id}<br/>
                                Created: {product?.created}<br />
                                Price ID: {product?.price.id}<br />
                                <h6>METAData</h6>
                                Category: {product.metadata?.category}<br />
                                Type: {product.metadata?.type}<br />
                                ImgCount: {product?.images?.length}
                            </small>
                        )}
                    </div>
                </div>

                <div className="product-listing-item__body">
                <div className="product-listing-item__info">
                    <h3>{product.name}</h3>
                    <p>{product.price?.nickname}</p>
                    </div>
                    <div className="product-listing-item__price">
                        {mappedPrice.map((price:any, idx:number) => (
                            <div key={idx} className="product-listing-item__price--item">
                                <div
                                    onMouseEnter={handleBuyNowMouseEnter}
                                    onMouseLeave={handleBuyNowMouseLeave}
                                >
                                    <ProductBuyNow size='lg' product={{ ...product, price }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductListingItem;