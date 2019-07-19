export class StringUtils {
  static isEmpty(str: string): boolean {
    return str === null || str === undefined || str === '';
  }
  static isExist(str: string): boolean {
    return !StringUtils.isEmpty(str);
  }
}