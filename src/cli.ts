import { pathsDiff } from './index'; // Import library functions
import { writeJsonToFile } from './utils/fileUtils';
import { program } from 'commander'; // Use Commander.js for CLI argument parsing
import logger from "./utils/logger";

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
      s3://bucket-name/new_site.xml
      s3://bucket-name/keyname/sitemap.xml:region://us-west-2`)
  .option('-o, --output <file>', 'Output file to save the comparison result', '')
  .option('-d, --debug', 'Enable verbose debug output', false)
  .option("-q, --quiet", 'Enable quiet mode, which only shows warnings, errors, and command output. Overrides debug mode', false)

  .action(async (sitemap1, sitemap2, options) => {
    try {
      let options = program.opts();
      if(options.quiet) {
        logger.setLogLevel('quiet');
      } else {
        logger.setDebug(options.debug);
      }
      logger.debug('options', options);

      const result = await pathsDiff(sitemap1, sitemap2);
      logger.debug('Comparison result common paths:', result.commonPaths);

      // Save the result to the specified output file
      if (options.output) {
        if(writeJsonToFile(options.output, result)) {
          logger.log(`Sitemap paths and differences successfully written to ${options.output}`);
        }
      } else {
        if( result.sitemap1PathsNotInSitemap2.length === 0 && result.sitemap2PathsNotInSitemap1.length === 0) {
          logger.log(`No path differences found between "${sitemap1}" and "${sitemap2}".`);
        } else {
          if( result.sitemap1PathsNotInSitemap2.length === 0) {
            logger.info(`sitemap1 "${sitemap1}" paths are all in sitemap2 "${sitemap2}"`);
          } else {
            logger.log(`sitemap1 "${sitemap1}" paths not in sitemap2 "${sitemap2}"`, result.sitemap1PathsNotInSitemap2);
          }
          if( result.sitemap2PathsNotInSitemap1.length === 0) {
            logger.info(`sitemap2 "${sitemap2}" paths are all in sitemap1 "${sitemap1}"`);
          } else {
            logger.log(`sitemap2 "${sitemap2}" paths not in sitemap1 "${sitemap1}"`, result.sitemap2PathsNotInSitemap1);
          }
        }
      }
    
    } catch (error) {
      logger.error('Error:', error.message);
    }
  });

program.parse(process.argv);
