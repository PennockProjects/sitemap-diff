import { pathsDiff } from './index'; // Import library functions
import { program } from 'commander'; // Use Commander.js for CLI argument parsing

program
  .name('sitemap-diff')
  .description('Compare two sitemap.xml files and find differences')
  .usage('<sitemap1> <sitemap2> [options]')
  .helpOption('-h, --help', 'display help for command')
  .version('[VI]{version}[/VI]', '-v, --version', 'output the current version');

program
  .argument('<sitemap1>', 'Path or URL to the first sitemap')
  .argument('<sitemap2>', 'Path or URL to the second sitemap')
  .option('-e, --exclude <paths>', 'Paths to exclude from comparison', (value) => value.split(','), [])
  .action(async (sitemap1, sitemap2, options) => {
    try {
      const result = await pathsDiff(sitemap1, sitemap2, options.exclude);
      console.log('Comparison Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

program.parse(process.argv);