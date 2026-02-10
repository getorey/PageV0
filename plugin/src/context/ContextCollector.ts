import * as fs from 'fs/promises';
import * as path from 'path';
import { DebugLogger } from '../audit/debug-logger';

export interface ProjectContext {
  files: {
    name: string;
    path: string;
    content: string;
    size: number;
  }[];
  directories: string[];
  metadata: {
    root: string;
    totalFiles: number;
    lastScanned: Date;
  };
}

export class ContextCollector {
  private debugLogger: DebugLogger;
  private projectRoot: string;

  constructor(projectRoot: string, debugLogger: DebugLogger) {
    this.projectRoot = projectRoot;
    this.debugLogger = debugLogger;
  }

  public async collectContext(): Promise<ProjectContext> {
    this.debugLogger.log('Starting context collection', { projectRoot: this.projectRoot });

    const context: ProjectContext = {
      files: [],
      directories: [],
      metadata: {
        root: this.projectRoot,
        totalFiles: 0,
        lastScanned: new Date()
      }
    };

    try {
      await this.scanDirectory(this.projectRoot, context);
      
      context.metadata.totalFiles = context.files.length;
      
      this.debugLogger.log('Context collection completed', {
        totalFiles: context.files.length,
        totalDirectories: context.directories.length
      });

      return context;
    } catch (error) {
      this.debugLogger.log('Context collection failed', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  private async scanDirectory(dirPath: string, context: ProjectContext, depth: number = 0): Promise<void> {
    if (depth > 3) {
      this.debugLogger.log('Max depth reached, skipping directory', { dirPath, depth });
      return;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.projectRoot, fullPath);

        if (entry.isDirectory()) {
          context.directories.push(relativePath);
          
          if (this.shouldScanDirectory(entry.name, relativePath)) {
            await this.scanDirectory(fullPath, context, depth + 1);
          }
        } else if (entry.isFile()) {
          if (this.shouldReadFile(entry.name, relativePath)) {
            const fileData = await this.readFile(fullPath, relativePath);
            if (fileData) {
              context.files.push(fileData);
            }
          }
        }
      }
    } catch (error) {
      this.debugLogger.log('Failed to scan directory', { dirPath, error: error instanceof Error ? error.message : String(error) });
    }
  }

  private shouldScanDirectory(dirName: string, relativePath: string): boolean {
    const excludeDirs = [
      'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
      'coverage', '.nyc_output', '.pytest_cache', '__pycache__',
      '.venv', 'venv', 'env', '.env', 'logs', 'tmp', 'temp'
    ];

    const excludePatterns = [
      /^\./,
      /node_modules/,
      /coverage/,
      /dist/,
      /build/
    ];

    return !excludeDirs.includes(dirName) && 
           !excludePatterns.some(pattern => pattern.test(dirName)) &&
           !excludePatterns.some(pattern => pattern.test(relativePath));
  }

  private shouldReadFile(fileName: string, relativePath: string): boolean {
    const importantExtensions = [
      '.md', '.txt', '.json', '.yaml', '.yml', '.toml', '.ini',
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c',
      '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift',
      '.kt', '.scala', '.r', '.sql', '.sh', '.bash', '.zsh',
      '.dockerfile', '.env', '.gitignore', '.eslintrc', '.prettierrc'
    ];

    const importantFiles = [
      'README', 'CHANGELOG', 'LICENSE', 'CONTRIBUTING',
      'package.json', 'tsconfig.json', 'jest.config.js', 'webpack.config.js',
      'Dockerfile', 'docker-compose.yml', 'requirements.txt', 'Cargo.toml',
      'pom.xml', 'build.gradle', 'Makefile', 'CMakeLists.txt'
    ];

    const maxFileSize = 1024 * 1024;
    const excludePatterns = [
      /node_modules/,
      /coverage/,
      /dist/,
      /build/,
      /\.min\./,
      /\.lock/,
      /package-lock\.json/,
      /yarn\.lock/
    ];

    const fileExt = path.extname(fileName);
    const baseName = path.basename(fileName, fileExt);

    return importantExtensions.includes(fileExt) ||
           importantFiles.includes(baseName) ||
           importantFiles.includes(fileName) ||
           fileName.toLowerCase().includes('readme') ||
           fileName.toLowerCase().includes('agents') ||
           fileName.toLowerCase().includes('config') ||
           fileName.toLowerCase().includes('architecture') ||
           fileName.toLowerCase().includes('workflow') ||
           fileName.toLowerCase().includes('prd') ||
           fileName.toLowerCase().includes('설계');
  }

  private async readFile(filePath: string, relativePath: string): Promise<{
    name: string;
    path: string;
    content: string;
    size: number;
  } | null> {
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size > 1024 * 1024) {
        this.debugLogger.log('Skipping large file', { relativePath, size: stats.size });
        return null;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      
      return {
        name: path.basename(filePath),
        path: relativePath,
        content: content.substring(0, 5000),
        size: stats.size
      };
    } catch (error) {
      this.debugLogger.log('Failed to read file', { relativePath, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  public async getProjectSummary(): Promise<string> {
    const context = await this.collectContext();
    
    const summary = `
# Project Context Summary

## Project Structure
- **Root**: ${context.metadata.root}
- **Total Files**: ${context.metadata.totalFiles}
- **Directories**: ${context.directories.length}
- **Last Scanned**: ${context.metadata.lastScanned.toISOString()}

## Key Files Found

### Documentation
${context.files
  .filter(f => f.name.toLowerCase().includes('readme') || f.name.endsWith('.md'))
  .slice(0, 5)
  .map(f => `- **${f.name}**: ${f.path.substring(0, 50)}${f.path.length > 50 ? '...' : ''}`)
  .join('\n')}

### Configuration
${context.files
  .filter(f => f.name.includes('config') || f.name.includes('.json') || f.name.includes('.yaml'))
  .slice(0, 5)
  .map(f => `- **${f.name}**: ${f.path.substring(0, 50)}${f.path.length > 50 ? '...' : ''}`)
  .join('\n')}

### Source Code
${context.files
  .filter(f => ['.js', '.ts', '.py', '.java', '.cpp', '.c'].includes(path.extname(f.name)))
  .slice(0, 5)
  .map(f => `- **${f.name}**: ${f.path.substring(0, 50)}${f.path.length > 50 ? '...' : ''}`)
  .join('\n')}

## Project Type Analysis
${this.analyzeProjectType(context.files)}

This context is available for work automation tasks. Use this information to provide more accurate and contextual assistance.
    `.trim();

    return summary;
  }

  private analyzeProjectType(files: any[]): string {
    const extensions = files.map(f => path.extname(f.name).toLowerCase());
    const fileNames = files.map(f => f.name.toLowerCase());

    if (fileNames.includes('package.json') && extensions.includes('.ts')) {
      return '**TypeScript/Node.js Project** - Modern JavaScript/TypeScript application';
    }
    
    if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) {
      return '**Python Project** - Python-based application or library';
    }
    
    if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) {
      return '**Java Project** - Java-based enterprise application';
    }
    
    if (fileNames.includes('cargo.toml')) {
      return '**Rust Project** - Rust-based system or application';
    }
    
    if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml')) {
      return '**Containerized Project** - Application with Docker support';
    }
    
    return '**General Project** - Mixed or custom project structure';
  }
}