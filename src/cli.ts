import { pathsDiff } from './index'; // Import library functions
import { writeJsonToFile } from './utils/fileUtils';
import { program } from 'commander'; // Use Commander.js for CLI argument parsing

let fVerbose = false; // Default verbose flag

program
  .name('sitemap-diff')
  .description('Compare two sitemap.xml files and find differences')
  .usage('<sitemap1> <sitemap2> <options>')
  .helpOption('-h, --help', 'display help for command')
  .version('[VI]{version}[/VI]', '-v, --version', 'output the current version')

program
  .argument('<sitemap1>', 'Path or URL to the first sitemap.')
  .argument('<sitemap2>', `Path or URL to the second sitemap.
sitemap is a file path, URL, or S3 URL to a sitemap file (ends with .xml)
an S3 URL uses credentials inherited from the local configured AWS CLI context.
   Examples:
      ../sitemap.xml
      ./some/dir/local-sitemap.xml
      http://www.example.com/sitemap.xml
      https://www.example.com/sitemap.xml
      s3://bucket-name/newsite.xml
      s3://bucket-name/keyname/sitemap.xml:region://us-west-2`)
  .option('-o, --output <file>', 'Output file to save the comparison result', '')
  .option('-d, --debug', 'Enable verbose debug output', false)
  .action(async (sitemap1, sitemap2, options) => {
    try {
      const result = await pathsDiff(sitemap1, sitemap2);

      // Save the result to the specified output file
      if (options.output) {
        if(writeJsonToFile(options.output, result)) {
          console.log(`Sitemap paths and differences successfully written to ${options.output}`);
        }
      } else {
        vLog(`\nsitemap1 "${sitemap1}" unique paths:`, result.sitemap1PathsNotInSitemap2);
        vLog(`\nsitemap2 "${sitemap2}" unique paths:`, result.sitemap2PathsNotInSitemap1);
        if( result.sitemap1PathsNotInSitemap2.length === 0 && result.sitemap2PathsNotInSitemap1.length === 0) {
          console.log(`\nNo path differences found between "${sitemap1}" and "${sitemap2}".`);
        } else {
          vLog(`\nDifferent paths in sitemaps "${sitemap1}" and "${sitemap2}":`);
          if( result.sitemap1PathsNotInSitemap2.length === 0) {
            vLog(`\nsitemap1 "${sitemap1}" paths are all in sitemap2 "${sitemap2}" paths.`);
          } else {
            console.log(`\nsitemap1 "${sitemap1}" paths not in sitemap2 "${sitemap2}" paths`, result.sitemap1PathsNotInSitemap2);
          }
          if( result.sitemap2PathsNotInSitemap1.length === 0) {
            vLog(`\nsitemap2 "${sitemap2}" paths are all in sitemap1 "${sitemap1}" paths.`);
          } else {
            console.log(`\nsitemap2 "${sitemap2}" paths not in sitemap1 "${sitemap1}" paths`, result.sitemap2PathsNotInSitemap1);
          }
        }
      }
    
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

program.parse(process.argv);
fVerbose = program.opts().verbose; // Set the verbose flag based on CLI option

/**
 * Logger utility function
 * @param message - The message to log
 * @param verbose - A boolean flag to enable or disable logging
 */
export function vLog(...args): void {
  if (fVerbose) {
    console.log(...args);
  }
}

