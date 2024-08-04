
// components/AdminCustomerDetails.tsx
import React, { useCallback, useEffect, useState } from 'react';
import styles from './AdminCustomerDetail.scss';
import UiForm from '@webstack/components/UiForm/controller/UiForm';
import { useRouter } from 'next/router';
import UiButton from '@webstack/components/UiButton/UiButton';
import useAdminCustomer from '../hooks/useAdminCustomer';
import UiLoader from '@webstack/components/UiLoader/view/UiLoader';
import { findField } from '@webstack/components/UiForm/functions/formFieldFunctions';
import { useClearance } from '~/src/core/authentication/hooks/useUser';
import useAdminCustomerDelete from '../hooks/useAdminCustomerDelete';
import ThreeTree from '@webstack/components/ThreeComponents/ThreeTree/controller/ThreeTree';

const AdminCustomerDetails: React.FC<any> = ({ id, setView }: { id?: string, setView: (e: any) => void }) => {
  const router = useRouter();
  const customer_id = router?.query?.cid && String(router?.query?.cid) || id;
  const { level } = useClearance();
  const [field, setField] = useState<any | undefined>();
  const {
    customer,
    displayFields,
    updateField,
    modifyCustomer,
    initialCustomer,
    refresh,
  } = useAdminCustomer({ customer_id, level });

  const customerName = customer?.contact && findField(customer.contact, 'name')?.value || '';

  const handleFields = (e:any)=>{
    let updated = { ...field, value: e.target?.value };
    console.log({updated})
    updateField(updated);
    setField(updated);
  };

  const handleField = (newField: any) => {
    let updated: any = newField;
    updated.label = updated?.id?.split('-')?.join(' > ') || updated.name;
    if (updated.children && !updated.name.includes('address')) {
      updated.type = 'select';
      updated.options = Object.values(newField.children).map((a: any) => ({ label: a.value, value: a.value, selected: false }));
      updated.options.find((option:any) => option.value === updated.value).selected = true;
    } else if (newField.name.includes('address')) {
      updated.type == 'address';
    }
    setField(updated);
  };

  const { deleteCustomer } = useAdminCustomerDelete(customer_id);

  useEffect(() => { 
    console.log({field})
  }, [displayFields, handleField, field]);
  return (
    <>
      <style jsx>{styles}</style>
      <div className='admin-customer-detail'>
        <div className='admin-customer-detail__header'>
          <UiButton busy={customer == undefined} onClick={refresh}>refresh</UiButton>
        </div>
        {field && JSON.stringify(field?.value)}
        {field && <UiForm fields={[field]} onChange={handleFields} />}
        {customer && <ThreeTree
          onClick={(newField) => handleField(newField)}
          data={customer}
          selectedData={customer}
          title={'customer'}
        />}
        {customer == undefined && <UiLoader />}
        {customer == false && <h1>No Customer: ${router.query.cid}</h1>}
      </div>
      <div className='admin-customer-detail__actions'>
        <UiButton onClick={modifyCustomer}>Update {customerName}</UiButton>
      </div>
      <div style={{ marginLeft: "auto" }}>
        <UiButton variant='error' onClick={() => deleteCustomer()}>
          Delete {customerName}
        </UiButton>
      </div>
    </>
  );
};

export default AdminCustomerDetails;