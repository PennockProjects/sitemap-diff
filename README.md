# sitemap-diff
A set of utilities for fetching sitemap.xml files and comparing the routes and paths between the two. It will output commonalities and differences.

One use case is to validate a change in the sitemap before updating it.

## Fetching Sitemap Files
The three locations it can import a sitemap.xml file from are:
1. Local File System
2. http or https URL
3. AWS S3 Bucket

The sitemap.xml file must have a `.xml` extension in all cases.

### Local File System
Uses the node.js `fs` module to call `readFileSync` and `writeFileSync` functions to read and write local files. A relative file path contains the relative location of file, for example `./some/dir/local-sitemap.xml`.  

### HTTP or HTTPS URL
Uses the node.js `node-fetch` module to call `fetch` function to get a sitemap from an http url.  The url must be resolvable from the context of the call and contain the full url., i.e. `https://pennockprojects.com/sitemap.xml`

### AWS S3 Bucket URL
Uses the node.js `@aws-sdk/client-s3` to call `S3Client`, `GetObjectCommand` functions. 

The AWS S3 bucket URL access credentials are inherited from the local configured AWS CLI context.  Using this method without configured AWS credentials will not work.

The AWS S3 URL has the format of:
  - prefixed with "s3://"
  - contains the bucket name and key: "bucket-name/sitemap.xml"
  - optionally, the end can contain a suffix region: ":region://us-west-2", where "us-west-2" is replaced by your specific region string of the bucket.

Examples:
  - "s3://bucket-name/sitemap.xml"
  - "s3://bucket-name/key-name/sitemap.xml:region://us-west-2"

## Diff of Sitemap Files

### Paths

Ignores the 

### Routes


## TODO
- url diff including `loc`, `lastmode`, and `priority`
- sitemap index diff
- sitemap index with sitemap recursive diff
- CLI handling
- CLI bin
- options parameters to disable/configure things like console.log output and defaults.

