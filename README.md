# Tool to track FIRE strategy

## Development

### Commit Messages

This project uses [Commitizen](https://commitizen.github.io/cz-cli/) for standardized commit messages. See [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for details.

Use `yarn commit` instead of `git commit` to create properly formatted commit messages.

### Git Hooks

Automated quality checks run before each commit. See [GIT_HOOKS.md](./GIT_HOOKS.md) for details about:

- Pre-commit hooks (TypeScript, ESLint, Tests)
- Commit message validation
- How to bypass hooks in emergencies

### Testing

Run tests with coverage:

```bash
yarn test:coverage
```

## TODO

Add bhavcopy for equities for [nse](https://archives.nseindia.com/content/historical/EQUITIES/2022/APR/cm19APR2022bhav.csv.zip) and [bse](https://www.bseindia.com/download/BhavCopy/Equity/EQ040322_CSV.ZIP)
`https://archives.nseindia.com/content/historical/EQUITIES/{yyyy}/{MMM}/cm{dd}{MMM}{yyyy}bhav.csv.zip`
`https://archives.nseindia.com/products/content/sec_bhavdata_full_{dd}{mm}{yyyy}.csv`
`https://www.bseindia.com/download/BhavCopy/Equity/EQ{dd}{mm}22_CSV.ZIP`

### To Explore

`https://archives.nseindia.com/content/equities/bulk.csv`
`https://archives.nseindia.com/content/historical/DERIVATIVES/{yyyy}/{MMM}/fo{dd}{MMM}{yyyy}bhav.csv.zip`
`https://www.bseindia.com/markets/MarketInfo/BhavCopy.aspx`
`https://www.amfiindia.com/spages/NAVAll.txt`
`https://api.mfapi.in/mf/{schemeID}`
`https://api.mfapi.in/mf`
