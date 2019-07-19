import { BaseAnalyzer } from "./Analyzer";
import { IBug, Bug } from "./Bug";
import { GitClient } from "../utils/GitClient";

interface IParams {
  validBranches: string[]
}

export class BranchNameAnalyzer extends BaseAnalyzer {
  constructor(gitClient: GitClient, private params: IParams){
    super(gitClient);
  }

  async analyze(): Promise<IBug[]> {
    console.log(`run ${this.constructor.name}`);
    console.log(this.params);

    const branches = await this.gitClient.branch();
    const validNamesRegex = new RegExp(this.params.validBranches.join('|'));
    return branches
      .filter(b => !validNamesRegex.test(b.name))
      .map<IBug>(b => new Bug(`Name is invalid ${b.name}`, this.constructor.name));
  }
}