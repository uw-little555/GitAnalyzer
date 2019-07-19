import { BaseAnalyzer } from "./Analyzer";
import { IBug, Bug } from "./Bug";
import { DateUtils } from "../utils/DateUtils";
import { GitClient, Ibranch } from "../utils/GitClient";

interface IParams {
  srcBranch: string
  targetBranches: string[]
  lifespan: number
}

/**
 * ブランチがマージされずに伸びすぎていないかを確認します
 */
export class BranchLifespanAnalyzer extends BaseAnalyzer {
  constructor(gitClient: GitClient, private params: IParams){
    super(gitClient);
  }

  async analyze(): Promise<IBug[]> {
    console.log(`run ${this.constructor.name}`);
    console.log(this.params);

    const branches = await this.gitClient.branch();
    const targetReg = new RegExp(this.params.targetBranches.join('|'));
    let srcBranch: Ibranch | undefined;
    const targetBranches: Ibranch[] = [];
    for (const branch of branches) {
      if (this.params.srcBranch === branch.name) {
        srcBranch = branch;
      } else if (targetReg.test(branch.name)) {
        targetBranches.push(branch);
      }
    }

    let bugs :IBug[]  = [];
    if (srcBranch !== undefined) {
      for (const branch of targetBranches) {
        bugs.concat(await this.analyzeBranch(srcBranch, branch));
      }
    }
    return bugs;
  }

  private async analyzeBranch(srcBranch: Ibranch, branch: Ibranch): Promise<IBug[]> {
    let bugs :IBug[]  = [];
    const branchedDateTime = await this.getBranchedDateTime(srcBranch.name, branch.name);

    if (branchedDateTime !== undefined) {
      const targetAge = DateUtils.getSpan(branch.commitDateTime, branchedDateTime);
      if (targetAge > this.params.lifespan) {
        bugs.push(new Bug(`${branch.name} branched from ${srcBranch.name} is not merged. ${branch.name} has branched ${targetAge} days from the date of derivation.`, this.constructor.name));
      }
      const srcAge = DateUtils.getSpan(srcBranch.commitDateTime, branchedDateTime);
      if (srcAge > this.params.lifespan) {
        bugs.push(new Bug(`${branch.name} branched from ${srcBranch.name} is not merged. ${srcBranch.name} has branched ${srcAge} days from the date of derivation.`, this.constructor.name));
      }
    } else {
      bugs.push(new Bug(`Unable to get the date and time when ${branch.name} branched.`, this.constructor.name));
    }

    return bugs;
  }

  private async getBranchedDateTime(srcBranchName: string, branchName: string) {
    const rootHash = await this.gitClient.searchBranchedHash(srcBranchName, branchName);
    return this.gitClient.getCommitDateTime(rootHash);
  }
}