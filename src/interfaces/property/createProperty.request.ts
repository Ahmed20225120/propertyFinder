import { PropertyRealeses, PropertyType } from "../../types/property.types";


export interface CreatePropertyRequest
{
    name: string,
    images: string[],
    description: string,
    price: number,
    location: string,
    isFree: boolean,
    release_for : PropertyRealeses,
    type : PropertyType,
    payment_method : string,
    bed_room : number,
    bath_room : number
}