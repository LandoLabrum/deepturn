// Relative Path: ./AdminCustomer.tsx
import React, { useEffect, useState } from 'react';
import styles from './AdminProducts.scss';
import { getService } from '@webstack/common';
import IProductService, { IGetProduct } from '~/src/core/services/ProductService/IProductService';
import { dateFormat, numberToUsd } from '@webstack/helpers/userExperienceFormats';
import { useModal } from '@webstack/components/modal/contexts/modalContext';
import AdminProduct from '../views/AdminProduct/AdminProduct';
import AdapTable from '@webstack/components/AdapTable/views/AdapTable';
import { IProduct } from '~/src/models/Shopping/IProduct';
import UiLoader from '@webstack/components/UiLoader/view/UiLoader';
import UiButton from '@webstack/components/UiButton/UiButton';
import { useAdminLevel, useClearance } from '~/src/core/authentication/hooks/useUser';
import environment from '~/src/core/environment';
import useDeleteProduct from '../hooks/useDeleteProduct';
import { useLoader } from '@webstack/components/Loader/Loader';

const AdminProducts: React.FC = () => {
  const MID_LEVEL = 10;
  const { openModal, closeModal } = useModal();

  const [products, setProducts] = useState<IProduct[] | undefined>();
  const [modified, setModified] = useState<any[] | undefined>();
  const [product, setProduct] = useState<IProduct>();
  const [responseExtras, setExtras] = useState<object | undefined>();
  const [select, setSelect] = useState<boolean>(false);
  const [view, setView] = useState<string>('list');
  const selected = select && products?.filter(p => p?.selected)?.length;
  const { user } = useAdminLevel();
  const onRowClick = (product: IProduct) => {
    if (!product.id) return;
    setProduct(product);
    setView('product');
  }
  const [loader, setLoader] = useLoader();
  const handleDeselect = () => {
    const deselected = products?.map((product: IProduct) => {
      if (product?.selected == true) {
        delete product.selected;
      }
      return product;
    });
    setProducts(deselected);
    setSelect(false);
  };
  const { deletedProduct, initiateDelete, setProduct: setDeleted } = useDeleteProduct();
  const confirmDelete = () => {
    const toDelete = products
    ?.filter((product) => product?.selected)
    ?.map((product: any) => ({
        ...product,
        label: product.name,
        status: 'incomplete',
    })) ?? []; // Ensure 'toDelete' is never undefined

    setModified(toDelete);

    const confirmDeleteModal = {
      title: `Delete ${selected} Products?`,
      statements: [
        {
          label: 'Delete',
          onClick: async () => {
            setLoader({ active: true, body: `Deleting products...` });

            // Inside your for-loop
            for (let i = 0; i < toDelete.length; i++) {
              try {
                const currentProduct = toDelete[i];
                await initiateDelete(currentProduct);
                toDelete[i].status = deletedProduct ? 'complete' : 'error';
              } catch (error) {
                toDelete[i].status = 'error';
                console.error(`Error deleting product ${toDelete[i].id}:`, error);
              }
            }

            // After all deletions are completed
            setLoader({ active: false });
            // for (let i = 0; i < toDelete.length; i++) {
            //   try {
            //     // Set loader for each product being deleted
            //     const currentProduct = toDelete[i];
            //     setLoader({ active: true, body: `Deleting: ${currentProduct.name}` });

            //     // Call the deleteProduct function
            //     const isDel = await initiateDelete(currentProduct);
            //     console.log({isDel})
            //     // Update status to 'complete' upon successful deletion
            //     toDelete[i].status = 'complete';
            //   } catch (error) {
            //     // Update status to 'error' if deletion fails
            //     toDelete[i].status = 'error';
            //     console.error(`Error deleting product ${toDelete[i].id}:`, error);
            //   } finally {
            //     // Ensure loader is turned off after each deletion attempt
            //     setLoader({ active: false });
            //   }
            // }

            // After all deletions, update the modal to reflect the result
            openModal({
              title: 'Delete Completed',
              children: (
                <ol>
                  {toDelete?.map((p) => (
                    <li key={p.id}>
                      {p.name} - {p.status}
                    </li>
                  ))}
                </ol>
              ),
            });
          },
        },
        { label: 'Cancel', onClick: handleDeselect, closeModal },
      ],
      body: (
        <ol>
          {toDelete?.map((p) => (
            <li key={p.id}>
              {p.name} - {p.id}
            </li>
          ))}
        </ol>
      ),
    };

    openModal({ confirm: confirmDeleteModal });
  };

  const onSelect = (product: IProduct) => {
    if (!product.id) return;
    const updated = products?.map((item: any) => {
      if (item.name == product.name && item.price_id == product.price_id) {
        if (!item?.selected) item.selected = true;
        else item.selected = false;
      }
      return item;
    })

    // console.log({ updated })
    setProducts(updated);
    // setProduct(product);
    // setView('product');
  }

  const pageContext: any = {
    list: {
      actions: ['add', 'edit'],
      view: <AdapTable
        onSelect={select ? onSelect : undefined}
        options={{ tableTitle: 'admin products', hideColumns: ['id', 'selected', 'price_id'] }}
        data={products}
        onRowClick={onRowClick}
      />
    },
    add: {
      actions: ['list'],
      view: <AdminProduct />
    },
    product: {
      actions: ['list'],
      view: <AdminProduct setView={() => setView('list')} product={product} />
    }
  }

  const ProductService = getService<IProductService>('IProductService');
  const { mid } = environment.merchant;
  async function getProducts() {
    if (products || Boolean(products && view == 'list')) return;
    try {
      const productsResponse = await ProductService.getProducts();
      setExtras({
        total: productsResponse.data?.length,
        livemode: productsResponse?.data[0]?.livemode,
        has_more: productsResponse.has_more
      })
      const formattedProducts = productsResponse?.data.map((field: any) => {
        // WEED OUT PRODUCTS NOT RELAVENT TO MERCHANT
        const notActive = field.active == false;
        const notAllowed = Boolean(field.metadata.mid !== mid && user.type !== 'admin-3');
        if (notAllowed && notActive) return;
        let context: any = {
          id: field.id,
          // active: field.active.toString(),
          image: field.images,
          name: field.name,
          type: field.type,
          price_id: field.price.id,
          // PRICE = UNIT_AMOUNT
          price: numberToUsd(field.price.unit_amount),
          // default_price: field.default_price,
          livemode: JSON.stringify(field.livemode),
          // updated: dateFormat(field.updated, { isTimestamp: true }),
          timeline: <div className='heiarchy'>
            <div className='heiarchy-item'>
              <div>created</div>
              <div>{dateFormat(field.created, { isTimestamp: true })}</div>
            </div>
            <div className='heiarchy-item'>
              <div>updated</div>
              <div>{dateFormat(field.updated, { isTimestamp: true })}</div>
            </div>
          </div>,
        };
        // ADD ADMIN STUFF
        if (user.type === 'admin-3') {
          context.mid = field.metadata.mid;
          context.active = field.active.toString()
        }
        return context;
      })
      setProducts(formattedProducts.filter((y: any) => y));
    } catch (e: any) {
      console.log('[ ADMIN PRODUCTS ( ERROR ) ]', e)
    } finally {
      setView('list')
    }
  };
  const handleAction = (actionName: string) => {
    switch (actionName) {
      case 'edit':
        setSelect(!select);
        break;
      // case 'add':
      //   setView(actionName)
      //   break;
      // case 'list':
      //   setView(actionName)
      //   break;

      default:
        setView(actionName)
        break;
    }
    setSelect(!select);
  }
  useEffect(() => { getProducts() }, [setProducts]);

  if (products) return (
    <>
      <style jsx>{styles}</style>
      <div className='admin-products'>
        <div className='admin-products__header'>
          <div className='admin-products__header--left'>
            <div className='heiarchy'>
              {responseExtras && Object.entries(responseExtras)?.map(([k, v]) => {
                return <div key={k} className='heiarchy__item'>
                  <div className='heiarchy-key'>{k}</div>
                  <div className='heiarchy-value'>{v?.toString()}</div>
                </div>
              })}
            </div>
          </div>
          <div className='admin-products__header--right'>
            {
              pageContext[view].actions.map(
                (action: string) => {
                  return <div key={action}><UiButton onClick={() => handleAction(action)}>{action}</UiButton></div>
                }
              )}
            {selected != false && <div>
              <UiButton label='coming soon' onClick={confirmDelete} variant='primary'>{selected} items</UiButton>
            </div> || ''}
          </div>
        </div>
        {pageContext[view].view}
        {/* <UiDev data={modified}/> */}
      </div>
    </>
  );
  return <UiLoader />
};

export default AdminProducts;
