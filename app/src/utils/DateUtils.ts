export class DateUtils {
  static trimTime(date: Date): Date {
    // console.log(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static getSpan(from: Date, until: Date): number {
    return (DateUtils.trimTime(from).getTime() - DateUtils.trimTime(until).getTime()) / 86400000;
  }
}