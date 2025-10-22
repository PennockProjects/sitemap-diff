import { describe, it, expect, vi } from 'vitest';
import { fetchParsePaths, pathsDiff } from './sitemapUtils';
import * as sitemapFetch from './sitemapFetch';
import * as sitemapParse from './sitemapParse';
import * as arrayUtils from './arrayUtils';
import logger from './logger';

vi.mock('./sitemapFetch');
vi.mock('./sitemapParse');
vi.mock('./arrayUtils');

describe('sitemapUtils', () => {
  describe('fetchParsePaths', () => {
    it('should fetch, parse, and return paths from a sitemap', async () => {
      const mockSitemap = '<urlset><url><loc>https://example.com/page1</loc></url></urlset>';
      const mockPaths = ['https://example.com/page1'];
      vi.spyOn(sitemapFetch, 'fetchSitemap').mockResolvedValue(mockSitemap);
      vi.spyOn(sitemapParse, 'parsePaths').mockReturnValue(mockPaths);

      const result = await fetchParsePaths('https://example.com/sitemap.xml');
      expect(result).toEqual(mockPaths);
    });

    it('should throw an error if the sitemap cannot be fetched', async () => {
      vi.spyOn(sitemapFetch, 'fetchSitemap').mockResolvedValue(null);

      await expect(fetchParsePaths('https://example.com/sitemap.xml')).rejects.toThrow(
        'https://example.com/sitemap.xml - Could not read sitemap file'
      );
    });

    it('should throw an error if paths cannot be extracted', async () => {
      const mockSitemap = '<urlset></urlset>';
      vi.spyOn(sitemapFetch, 'fetchSitemap').mockResolvedValue(mockSitemap);
      vi.spyOn(sitemapParse, 'parsePaths').mockReturnValue(null);

      await expect(fetchParsePaths('https://example.com/sitemap.xml')).rejects.toThrow(
        'https://example.com/sitemap.xml - Could not extract paths from sitemap file'
      );
    });

    it('should temporarily set and reset the log level', async () => {
      const mockSitemap = '<urlset><url><loc>https://example.com/page1</loc></url></urlset>';
      const mockPaths = ['https://example.com/page1'];
      vi.spyOn(sitemapFetch, 'fetchSitemap').mockResolvedValue(mockSitemap);
      vi.spyOn(sitemapParse, 'parsePaths').mockReturnValue(mockPaths);
      const setTempLogLevelSpy = vi.spyOn(logger, 'setTempLogLevel');
      const resetLogLevelSpy = vi.spyOn(logger, 'resetLogLevel');

      await fetchParsePaths('https://example.com/sitemap.xml', { logLevel: 'debug' });

      expect(setTempLogLevelSpy).toHaveBeenCalledWith('debug');
      expect(resetLogLevelSpy).toHaveBeenCalled();
    });
  });

  describe('pathsDiff', () => {
    it('should compare two sitemaps and return the differences with a custom log level', async () => {
      const sitemap1Paths = ['https://example.com/page1', 'https://example.com/page2'];
      const sitemap2Paths = ['https://example.com/page2', 'https://example.com/page3'];
      const mockDiff = {
        commonElements: ['https://example.com/page2'],
        elements1NotIn2: ['https://example.com/page1'],
        elements2NotIn1: ['https://example.com/page3'],
      };

      vi.spyOn(sitemapFetch, 'fetchSitemap').mockResolvedValueOnce('<sitemap1>').mockResolvedValueOnce('<sitemap2>');
      vi.spyOn(sitemapParse, 'parsePaths').mockReturnValueOnce(sitemap1Paths).mockReturnValueOnce(sitemap2Paths);
      vi.spyOn(arrayUtils, 'diffArrays').mockReturnValue(mockDiff);
      const setTempLogLevelSpy = vi.spyOn(logger, 'setTempLogLevel');
      const resetLogLevelSpy = vi.spyOn(logger, 'resetLogLevel');

      const result = await pathsDiff('sitemap1.xml', 'sitemap2.xml', { logLevel: 'debug' });

      expect(result).toEqual({
        sitemap1: 'sitemap1.xml',
        sitemap2: 'sitemap2.xml',
        commonPaths: ['https://example.com/page2'],
        sitemap1PathsNotInSitemap2: ['https://example.com/page1'],
        sitemap2PathsNotInSitemap1: ['https://example.com/page3'],
      });
      expect(setTempLogLevelSpy).toHaveBeenCalledWith('debug');
      expect(resetLogLevelSpy).toHaveBeenCalled();
    });

    it('should throw an error if one of the sitemaps cannot be processed with a custom log level', async () => {
      vi.spyOn(sitemapFetch, 'fetchSitemap').mockResolvedValueOnce(null);
      const setTempLogLevelSpy = vi.spyOn(logger, 'setTempLogLevel');
      const resetLogLevelSpy = vi.spyOn(logger, 'resetLogLevel');

      await expect(pathsDiff('sitemap1.xml', 'sitemap2.xml', { logLevel: 'warn' })).rejects.toThrow(
        'sitemap1.xml - Could not read sitemap file'
      );
      expect(setTempLogLevelSpy).toHaveBeenCalledWith('warn');
      expect(resetLogLevelSpy).toHaveBeenCalled();
    });

    it('should log errors when an exception occurs with a custom log level', async () => {
      const error = new Error('Test error');
      vi.spyOn(sitemapFetch, 'fetchSitemap').mockRejectedValue(error);
      const loggerErrorSpy = vi.spyOn(logger, 'error');
      const setTempLogLevelSpy = vi.spyOn(logger, 'setTempLogLevel');
      const resetLogLevelSpy = vi.spyOn(logger, 'resetLogLevel');

      await expect(pathsDiff('sitemap1.xml', 'sitemap2.xml', { logLevel: 'error' })).rejects.toThrow('Test error');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error processing sitemaps: Test error');
      expect(setTempLogLevelSpy).toHaveBeenCalledWith('error');
      expect(resetLogLevelSpy).toHaveBeenCalled();
    });
  });
});
