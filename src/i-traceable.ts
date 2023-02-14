export interface ITraceable<T> {
    withTrace(parentSpan: any): T;
}