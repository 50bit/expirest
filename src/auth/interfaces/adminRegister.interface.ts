export interface AdminRegister {
    pharmacyName: string
    pharmacyPhoneNumber: string,
    governorate_id: string,
    cityId: string,
    address: string,
    userFullName: string,
    email: string,
    userPhoneNumber: string,
    password: string,
    isAdmin: boolean,
    activatedByEmail: boolean
    files:[]
}