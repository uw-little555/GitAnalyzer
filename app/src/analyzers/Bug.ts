export interface IBug {
  type: string,
  message: string,
  analyzer: string
}

export class Bug implements IBug {
  type: string;
  message: string;
  analyzer: string;

  public constructor(message: string, analyzer: string){
    this.type = this.constructor.name;
    this.message = message;
    this.analyzer = analyzer;
  }

  public toString = () : string => {
    return `${this.analyzer} :${this.message}`;
  }
}