import {
    Info,
    InfoAddress,
    Session,
} from '../framework/model';
import { ExtractionResult } from '../framework/plugin';
import { asyncRequest } from '../framework/requests';

// interface to define all of the customer's info extracted from the settings page
interface CustomerInfo {
    name: string,
    email: string,
    phone: string,
    street: string,
    city: string,
    state: string,
    zip: string,
}

/*
    @parameters unparsedCustomerInfo: raw string returned from the GET request on url/settings/user
    returns a cleaned object in the form of a CustomerInfo interface
*/
const cleanCustomerInfo = (
    unparsedCustomerInfo: string,
): CustomerInfo => {
    // parsing out important information from raw string returned from the 
    const parsedCustomerInfo = unparsedCustomerInfo.slice(1, -1)
        .replace(/"/g, '')
        .replace('[', '')
        .replace(']', '')
        .split(/\s*,\s*/)
        .map(chunk => chunk.split(": "));

    // building and returning a cleaned customer info object
    return {
        name: parsedCustomerInfo[0][1],
        email: parsedCustomerInfo[1][1],
        phone: parsedCustomerInfo[2][1].replace('+', ''),
        street: parsedCustomerInfo[3][1],
        city: parsedCustomerInfo[4][0],
        state: parsedCustomerInfo[5][0].split(' ')[0],
        zip: parsedCustomerInfo[5][0].split(' ')[1]
    }
}
/*
    @parameters customerInfo: cleaned customer info object in the form of a CustomerInfo interface
    returns an address Object in the form of InfoAddress interface
*/
const buildAddress = (
    customerInfo: CustomerInfo,
): InfoAddress => {
    return {
        country: 'US',
        zip: customerInfo.zip,
        state: customerInfo.state,
        city: customerInfo.city,
        street: customerInfo.street,
    };
}

/*
    @parameters customerInfo: cleaned customer info object in the form of a CustomerInfo interface
                addressInfo: object in the form of a InfoAddress interface
    returns object in the form of a Info interface
*/
const buildCustomerInfo = (
    customerInfo: CustomerInfo,
    addressInfo: InfoAddress,
): Info => {
    return {
        addresses: [addressInfo],
        phoneNumbers: [customerInfo.phone],
        emails: [customerInfo.email],
        names: [customerInfo.name],
    }
}

export const extractInfo = async (
    session: Session,
): Promise<ExtractionResult<Info>> => {
    const infoResponse = await asyncRequest<string>(
        'http://firstplaidypus.herokuapp.com/settings/user',
        {
            method: 'GET',
            jar: session.jar,
        },
    );

    const customerInfo: CustomerInfo = cleanCustomerInfo(infoResponse.body);
    const address: InfoAddress = buildAddress(customerInfo);

    return { data: buildCustomerInfo(customerInfo, address) };
};