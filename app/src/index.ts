import { IAnalyzer } from './analyzers/Analyzer';
import { IBug } from './analyzers/Bug';
import { ConfigParser, Config } from './utils/configParser';
import { GitClient, Ibranch } from './utils/GitClient';
import { AnalyzerFactory } from './analyzers/AnalyzerFactory';

// setting.jsonに移植する予定の奴ら
const MAIN_BRANCH = 'origin/master';
const FEATURE_BRANCH_REGEX = 'origin/feature/.*';

(async () => {

  console.log(`## load config`);
  const config: Config = ConfigParser.loadConfig('./conf/config.yml');
  if (config === null) {
    console.log(`config load faild`);
    process.exit(1);
  }

  console.log(`## init GitClient`);
  const gitClient: GitClient = new GitClient(config.repository);
  await gitClient.init();

  // 解析処理
  console.log(`## create Analyzer`);
  const analyzers: IAnalyzer[] = AnalyzerFactory.createAnalyzers(gitClient, config.analyzer);

  console.log(`## analyze`);
  let bugs: IBug[] = [];
  for (const analyzer of analyzers) {
    bugs = bugs.concat(await analyzer.analyze());
  }
  console.log(`## result`);
  for (const bug of bugs) {
    console.log(bug.toString());
  }

})();


