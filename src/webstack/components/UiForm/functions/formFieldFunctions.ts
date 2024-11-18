// servers/frontend/Deepturn/app/src/webstack/components/UiForm/functions/formFieldFunctions.ts

import keyStringConverter from "@webstack/helpers/keyStringConverter";
import { IFormField } from "../models/IFormModel";
import { isNull } from "lodash";
import { dateFormat, numberToUsd } from "@webstack/helpers/userExperienceFormats";



// UPDATE FIELD IN FORM
export const updateField = (fields: IFormField[], name: string, updatedValues: Partial<IFormField>): IFormField[] => {
    return fields.map((field) => {
        if (field.name === name) {
            return {
                ...field,
                ...updatedValues,
            };
        }
        return field;
    });
};

// GET FIELD IN FORM
export const findField = (fields: IFormField[], name: string): IFormField | undefined => {
    const context = fields?.find((field: IFormField) => field?.name == name);
    if (context) return context;
};
// GET FIELD TYPE
export const getFieldType = (value: any): string => {
    let fieldType = 'text';
    switch (typeof value) {
        case 'number':
            fieldType = 'tel';
            break;
        case 'boolean':
            fieldType = 'checkbox';
            break;
        default:
            break;
    }
    return fieldType;
};
export const createField = (newField: any) => {
    const currencyFields = ['balance', 'unit_amount'];
    const { name, value, required, placeholder }: any = newField;
    if (!name) return;
    // throw new Error('[ CREATE FIELD ERROR ]');
    let field: IFormField = {
        ...newField,
        label: keyStringConverter(name),
    };
    const valueType = (field: IFormField) => {
        let type = 'text';
        if (typeof value) type = typeof value;
        else if (field.type) type = field.type;
        else if (value == null) type = 'null';
        return type;
    }
    switch ( valueType(field)) {
        case 'string':
            if (name == 'password') field.type = name;
            else field.type = 'text';
            break;
        case 'boolean':
            field.type = 'checkbox';
        case 'null':
            field.error = `can't be blank`
        case 'number':
            if (field.name == 'created') {
                field.value = dateFormat(field.value, { isTimestamp: true })
            }
            if ( currencyFields.includes(field.name) && 
                field.value != undefined
            )field.value = numberToUsd(Number(field.value));
            field.type = 'tel'
        default:
            console.log("[ UNHANDLED OBJ ]", { field,vt:valueType(field)})
            break;
    }
    return field;
}