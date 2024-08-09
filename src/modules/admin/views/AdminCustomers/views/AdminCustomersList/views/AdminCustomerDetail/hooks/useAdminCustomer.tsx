import { getService } from "@webstack/common";
import { useNotification } from "@webstack/components/Notification/Notification";
import { createField, findField } from "@webstack/components/UiForm/functions/formFieldFunctions";
import { IFormField } from "@webstack/components/UiForm/models/IFormModel";
import { useCallback, useEffect, useState } from "react";
import IAdminService from "~/src/core/services/AdminService/IAdminService";
import { useModal } from "@webstack/components/modal/contexts/modalContext";
import { useRouter } from "next/router";
import { dateFormat } from "@webstack/helpers/userExperienceFormats";

const useAdminCustomer = ({ customer_id, level }: { customer_id?: string, level: number }) => {
  const router = useRouter();
  const adminService = getService<IAdminService>('IAdminService');
  const [customer, setCustomerState] = useState<any>();
  const [initialCustomer, setInitialCustomer] = useState<any>();
  const [displayFields, setDisplayFields] = useState<any>({});
  const [notification, setNotification] = useNotification();
  const { openModal } = useModal();
  const refresh = () => {
    setCustomerState(undefined);
    // getCustomerList();
  };
  const getCustomer = useCallback(async () => {
    if (!customer_id || customer || initialCustomer) return;

    try {
      const response = await adminService.getCustomer(customer_id);
      console.log({ response });
      if (!response?.error) return initForms(response);
      setNotification({ active: true, dismissable: true, apiError: response });
      console.error("Couldn't get customer");
      return;
    } catch (error) {
      setCustomerState(false);
      console.error('[ ADMIN CUSTOMER DETAILS ]', error);
    }
  }, [customer_id, customer, initialCustomer, adminService, setNotification]);

  const initForms = (customerResponse: any, context?: any, parent?: string) => {
    setDisplayFields(customerResponse);
    setCustomerState(customerResponse);
    setInitialCustomer(customerResponse);
  };

  const updateField = (newField: any) => {
    const updatedCustomer = { ...customer };
    let fieldToUpdate = updatedCustomer;

    // Find the field to update in the customer object
    const fieldPath = newField.id.split('-').slice(1); // Remove 'customer' from the path
    fieldPath.forEach((pathSegment:any, index:any) => {
      if (index === fieldPath.length - 1) {
        fieldToUpdate[pathSegment] = newField.value;
      } else {
        fieldToUpdate = fieldToUpdate[pathSegment];
      }
    });

    setCustomerState(updatedCustomer);

    // Update ThreeTree component
    if (newField.type === 'select') {
      newField.options = newField.options.map((option: any) => ({
        ...option,
        selected: false,
      }));
      newField.options.find((option:any) => option.value === newField.value).selected = true;
    }

    setDisplayFields(updatedCustomer);
  };

  const modifyCustomer = async () => {
    const modifyCustomerService = async (request: any) => {
      try {
        const response = await adminService.updateCustomer(request);
        if (response) openModal({ children: JSON.stringify(response) });
      } catch (error: any) {
        console.error({ error });
      }
    };

    let request: any = { metadata: {} };

    Object.entries(customer).forEach(([formName, fields]: any) => {
      fields.forEach((field: any) => {
        let fieldName: string = field.name;
        let fieldValue: any = field.value;
        if (field?.name === "created") fieldValue = Number(dateFormat(fieldValue, { options: { returnType: "timestamp" } }));

        // Join firstName and lastName
        if (formName === 'contact' && (fieldName === 'firstName' || fieldName === 'lastName')) {
          const firstNameField = findField(fields, 'firstName');
          const lastNameField = findField(fields, 'lastName');
          if (firstNameField && lastNameField) {
            request.name = `${firstNameField.value} ${lastNameField.value}`;
            return;
          }
        }

        if (['contact', 'methods', 'address'].includes(formName)) {
          if (formName === 'contact' && fieldName === 'address') {
            request[fieldName] = fieldValue;
          } else {
            request[fieldName] = fieldValue;
          }
        } else {
          if (!request.metadata[formName]) {
            if (!formName.includes("-")) {
              request.metadata[formName] = {};
            } else {
              const formNameParts = formName.split("-");
              formName = formNameParts[0] + "s";
              if (!request.metadata[formName]) {
                request.metadata[formName] = [];
              }
              if (formNameParts[1]) {
                if (!request.metadata.user.devices) {
                  request.metadata.user.devices = [];
                }
                Object.entries(fields).map(([index, field]: any) => {
                  const fpOne = Number(formNameParts[1]);
                  if (!request.metadata.user.devices?.[fpOne]) {
                    request.metadata.user.devices[fpOne] = {};
                  }
                  if (field?.name === "created") field.value = Number(dateFormat(field.value, { options: { returnType: "timestamp" } }));
                  request.metadata.user.devices[fpOne][field.name] = field.value;
                });
              }

              return;
            }
          }
          request.metadata[formName][fieldName] = fieldValue;
        }
      });
    });

    if (Object.keys(request).length > 1 || Object.keys(request.metadata).some(key => Object.keys(request.metadata[key]).length > 0)) {
      await modifyCustomerService(request);
    } else {
      console.error("[ ADMIN CUS DETAILS (NO REQ) ]");
    }
  };

  useEffect(() => {
    if (customer == undefined) getCustomer();
  }, [getCustomer]);

  return {
    customer,
    initialCustomer,
    displayFields,
    updateField,
    modifyCustomer,
    refresh,
  };
};
export default useAdminCustomer;