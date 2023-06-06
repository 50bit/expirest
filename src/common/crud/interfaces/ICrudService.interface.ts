export interface ICrudService<T = any> {
    create(dto: T): Promise<any>
}
