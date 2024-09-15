
export interface NewAgentRequest
{
    name:
    {
        first: string,
        second: string
    },
    email: string,
    password: string,
    phone: string,
    role: string
}