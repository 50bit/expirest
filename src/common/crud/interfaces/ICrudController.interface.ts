export interface ICrudController<T> {
    create(dto: T): Promise<any>
}
