import { IBug } from "./Bug";
import { GitClient } from "../utils/GitClient";

export interface IAnalyzer {
  analyze(): Promise<IBug[]>;
}

export abstract class BaseAnalyzer implements IAnalyzer {
  constructor(protected gitClient: GitClient) { }
  abstract async analyze(): Promise<IBug[]>;
}