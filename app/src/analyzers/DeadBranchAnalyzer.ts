import { BaseAnalyzer } from "./Analyzer";
import { IBug, Bug } from "./Bug";
import { GitClient } from "../utils/GitClient";
import { DateUtils } from "../utils/DateUtils";

interface IParams {
  targetBranches: string[],
  deadline: number,
  toDay: Date
}

export class DeadBranchAnalyzer extends BaseAnalyzer {
  constructor(gitClient: GitClient, private params: IParams) {
    super(gitClient);
  }

  async analyze(): Promise<IBug[]> {
    console.log(`run ${this.constructor.name}`);
    console.log(this.params);

    const branches = await this.gitClient.branch();
    const targetRegex = new RegExp(this.params.targetBranches.join('|'));
    return branches
      .filter(b => targetRegex.test(b.name))
      .map<any>(b => {
        return {
          ...b,
          age: DateUtils.getSpan(this.params.toDay, b.commitDateTime)
        }
      })
      .filter(b => b.age > this.params.deadline)
      .map<IBug>(b => new Bug(`${b.name} is Dead. ${b.name} is not active for ${b.age} days.`, this.constructor.name));
  }
}