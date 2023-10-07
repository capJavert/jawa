#!/usr/bin/env node
const yargsInstance = require('yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('fs').promises
const puppeteer = require('puppeteer')
const { scrape } = require('./index')

yargsInstance(hideBin(process.argv))
    .command({
        command: '$0 <configPath>',
        describe: 'scrape the URLs and data from JSON config',
        builder: yargs => {
            yargs.positional('configPath', {
                describe:
                    'path to JSON config file, use visual scraper on https://jawa.kickass.codes or create it yourself'
            })
        },
        handler: async argv => {
            const configData = (await fs.readFile(argv.configPath)).toString()
            const config = JSON.parse(configData)

            await scrape(config, {
                puppeteer,
                outputResults: true,
                verbose: argv.verbose,
                quiet: argv.quiet,
                userAgent: argv.userAgent,
                indentSize: argv.indentSize
            })
        }
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
        default: false
    })
    .option('quiet', {
        alias: 'q',
        type: 'boolean',
        description: 'Do not log any messages except the final scraping results',
        default: false
    })
    .option('user-agent', {
        alias: 'ua',
        type: 'string',
        description: 'Set user agent to be used during scraping',
        default:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 JawaVS'
    })
    .option('indent-size', {
        type: 'number',
        description: 'Set results indent size',
        default: 4
    })
    .parse()
