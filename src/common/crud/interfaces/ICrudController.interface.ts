export interface ICrudController<T = any> {
    create(dto: T): Promise<any>
}
