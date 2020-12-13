import {
    Info,
    InfoAddress,
    Session,
} from '../framework/model';
import { ExtractionResult } from '../framework/plugin';
import { HTTPRequest } from './service';

/*
    @parameters customerInfo: object holding the information received from the setting page
    returns an address Object in the form of InfoAddress interface
*/
const buildAddress = (
    customerInfo: { address: Array<string> },
): InfoAddress => {
    const street = customerInfo.address[0];
    const cityStateZip = customerInfo.address[1].split(', ');
    const city = cityStateZip[0];
    const state = cityStateZip[1].split(' ')[0];
    const zip = cityStateZip[1].split(' ')[1];

    return {
        street,
        city,
        state,
        zip,
    };
}

/*
    @parameters customerInfo: cleaned customer info object
                addressInfo: object in the form of a InfoAddress interface
    returns object in the form of a Info interface
*/
const buildCustomerInfo = (
    customerInfo: { name: string, email: string, phone: string },
    addressInfo: InfoAddress,
): Info => {
    return {
        addresses: [addressInfo],
        phoneNumbers: [customerInfo.phone.replace('+', '')],
        emails: [customerInfo.email],
        names: [customerInfo.name],
    }
}

export const extractInfo = async (
    session: Session,
): Promise<ExtractionResult<Info>> => {
    const infoResponse = await HTTPRequest('http://firstplaidypus.herokuapp.com/settings/user', 'GET', session.jar);

    const customerInfo = JSON.parse(infoResponse.body);
    const address: InfoAddress = buildAddress(customerInfo);

    return { data: buildCustomerInfo(customerInfo, address) };
};