export interface AdminRegister {
    pharmacy: Pharmacy;
    user: User;
    files:[]
}


interface Pharmacy {
    name: string
    phoneNumber: string,
    governorateId: string,
    cityId: string,
    address: string,
}



interface User {
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    isAdmin: boolean,
    activatedByEmail: boolean
}