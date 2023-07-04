# obsidian daily note script + demo vault with templates
- `./scripts`: script source code
- `./vault`: demo vault

# script build
```sh
cd scripts
pnpm install
cp .env-sample .env
vi .env # put the path to vault accordingly
pnpm build
pnpm postbuild # this copies the script files to designated vault path
```