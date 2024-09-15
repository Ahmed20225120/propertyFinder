
export interface CompanyRegisterRequest
{
    email: string,
    password: string,
    name: {
        first: string,
        second: string
    },
    phone: string,
    address: string,
    job: string
    image?: string
}