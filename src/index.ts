const axios = require('axios');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

// Fetch top languages for a given user
async function getTopLanguages(username: string, token?: string) {
    try {
        //config to call GitHub apis
        const config = token ? { headers: { Authorization: `token ${token}` } } : {};

        //URL to get repo url for stats of given user profile
        const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
        //console.log(`Get repos for user: ${username}`);

        //Get repos and urls of each for stats
        const { data: repos } = await axios.get(reposUrl, config);
        //console.log('Fetched repos:', repos);

        //store result
        const languageCount: { [key: string]: number } = {};

        //call languages stats for each repo for given profile
        await Promise.all(
            repos.map(async (repo: any) => {
                const { data: languages } = await axios.get(repo.languages_url, config);
                for (const [language, count] of Object.entries(languages)) {
                    languageCount[language] = (languageCount[language] || 0) + (count as number);
                }
            })
        ); 

        // Calculate total lines of code and percentages and sort languaes based on line count
        const totalLines = Object.values(languageCount).reduce((acc, count) => acc + count, 0);
        const languagePercentages: Array<[string, number, string]> = Object.entries(languageCount)
            .map(([language, count]) => {
                const countNumber = count as number;
                return [language, countNumber, ((countNumber / totalLines) * 100).toFixed(2)] as [string, number, string];
            }) // Ensure correct types are returned
            .sort(([, countA], [, countB]) => countB - countA) // Sort using line count
            .slice(0, 5); // Slice of top 5

        //print result in console
        console.log(`Five most used languages for ${username}:`);
        languagePercentages.forEach(([language, count, percentage]) => {
            console.log(`${language} (${percentage}%)`);
        });
    } catch (error) { // catch any error and log
        if (axios.isAxiosError(error)) {
            console.error('Error fetching languages:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

// Extract username from the GitHub profile URL
function extractUsername(url: string): string | null {
    const match = url.match(/github\.com\/([^\/]+)/);
    return match ? match[1] : null;
}

// Create CLI command
yargs(hideBin(process.argv))
    .command(
        'languages <url>',
        'Get the top 5 languages for a given GitHub profile URL',
        (yargs) => {
            yargs.positional('url', {
                describe: 'GitHub profile URL',
                type: 'string',
            });
        },
        async (argv) => {
            const { url } = argv;
            const username = extractUsername(url);
            if (!username) {
                console.error('Invalid GitHub URL. Please provide a URL in the format: https://github.com/username');
                return;
            }
            // Optional: Set token via env variable
            const token = process.env.GITHUB_TOKEN || undefined;
            await getTopLanguages(username, token);
        }
    )
    .help()
    .argv;
