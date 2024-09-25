var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const axios = require('axios');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
// Fetch top languages for a given user
function getTopLanguages(username, token) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            //config to call GitHub apis
            const config = token ? { headers: { Authorization: `token ${token}` } } : {};
            //URL to get repo url for stats of given user profile
            const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
            //console.log(`Get repos for user: ${username}`);
            //Get repos and urls of each for stats
            const { data: repos } = yield axios.get(reposUrl, config);
            //console.log('Fetched repos:', repos);
            //store result
            const languageCount = {};
            //call languages stats for each repo for given profile
            yield Promise.all(repos.map((repo) => __awaiter(this, void 0, void 0, function* () {
                const { data: languages } = yield axios.get(repo.languages_url, config);
                for (const [language, count] of Object.entries(languages)) {
                    languageCount[language] = (languageCount[language] || 0) + count;
                }
            })));
            // Calculate total lines of code and percentages and sort languaes based on line count
            const totalLines = Object.values(languageCount).reduce((acc, count) => acc + count, 0);
            const languagePercentages = Object.entries(languageCount)
                .map(([language, count]) => {
                const countNumber = count;
                return [language, countNumber, ((countNumber / totalLines) * 100).toFixed(2)];
            }) // Ensure correct types are returned
                .sort(([, countA], [, countB]) => countB - countA) // Sort using line count
                .slice(0, 5); // Slice of top 5
            //print result in console
            console.log(`Five most used languages for ${username}:`);
            languagePercentages.forEach(([language, count, percentage]) => {
                console.log(`${language} (${percentage}%)`);
            });
        }
        catch (error) { // catch any error and log
            if (axios.isAxiosError(error)) {
                console.error('Error fetching languages:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            else {
                console.error('Unexpected error:', error);
            }
        }
    });
}
// Extract username from the GitHub profile URL
function extractUsername(url) {
    const match = url.match(/github\.com\/([^\/]+)/);
    return match ? match[1] : null;
}
// Create CLI command
yargs(hideBin(process.argv))
    .command('languages <url>', 'Get the top 5 languages for a given GitHub profile URL', (yargs) => {
    yargs.positional('url', {
        describe: 'GitHub profile URL',
        type: 'string',
    });
}, (argv) => __awaiter(this, void 0, void 0, function* () {
    const { url } = argv;
    const username = extractUsername(url);
    if (!username) {
        console.error('Invalid GitHub URL. Please provide a URL in the format: https://github.com/username');
        return;
    }
    // Optional: Set token via env variable
    const token = process.env.GITHUB_TOKEN || undefined;
    yield getTopLanguages(username, token);
}))
    .help()
    .argv;
