# GitHub Languages CLI

A CLI tool to fetch the top languages used in a GitHub profile. This tool allows you to retrieve language statistics based on repositories owned by a specified user.

## Features
- Fetch top 5 languages used in a GitHub profile.
- Displays the number of lines of code and the percentage of each language used.

## Prerequisites
- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/github-languages-cli.git
   cd github-languages-cli
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build

## Running the CLI Tool
To run the CLI tool locally, use the following command:
```bash
node dist/index.js languages https://github.com/username
```
Replace https://github.com/username with the actual GitHub profile URL.
