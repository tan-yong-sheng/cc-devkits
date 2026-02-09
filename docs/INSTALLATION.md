# Installation Guide

This document covers how to install and set up `cc-devkits` packages.

## 📦 Published Packages

All packages are available on **GitHub Packages**. Install globally for CLI usage:

| Package | Description | Version |
|---------|-------------|---------|
| [@tan-yong-sheng/core](https://github.com/tan-yong-sheng?tab=packages&repo_name=cc-devkits) | Core utilities (HTTP, retry, CLI parsing) | 1.0.0 |
| [@tan-yong-sheng/serper](https://github.com/tan-yong-sheng?tab=packages&repo_name=cc-devkits) | Google Search & web scraping | 1.0.0 |
| [@tan-yong-sheng/ntfy](https://github.com/tan-yong-sheng?tab=packages&repo_name=cc-devkits) | Push notifications via ntfy | 1.0.0 |

## 🚀 Install from GitHub Packages

**⚠️ Note:** GitHub Packages requires authentication even for public packages. This is a one-time setup.

```bash
# 1. Configure npm for @tan-yong-sheng scope
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com

# 2. Login with GitHub credentials
#    Username: your GitHub username
#    Password: Personal Access Token with 'read:packages' scope
#    Create token at: https://github.com/settings/tokens/new
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng

# 3. Install globally
npm install -g @tan-yong-sheng/serper
npm install -g @tan-yong-sheng/ntfy

# 4. Verify installation
serper --help
ntfy --help
```

**First time?** Get your Personal Access Token:
1. Visit: https://github.com/settings/tokens/new
2. Name it: `npm-packages`
3. Select: ☑️ `read:packages`
4. Click "Generate token" and copy it
5. Use as password when running `npm login`

## 🛠️ Build from Source (No Authentication Required)

For personal setup without GitHub authentication:

```bash
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits
npm install
npm run build:all

# Link packages globally
cd packages/serper && npm link && cd ../..
cd packages/ntfy && npm link && cd ../..
```
