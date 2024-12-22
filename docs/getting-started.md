# Getting started guide

### Prerequisites
- Git [download link](https://git-scm.com)
- Node.js v20 [download link](https://nodejs.org/en/download/package-manager)

### Clone the repo
```
git clone https://github.com/nicolaschan/bell.git
cd bell
```

### Install dependencies

We use the `yarn` package manager. Install it if you haven't already:
```bash
sudo npm install -g yarn
```

Install the dependencies
```bash
yarn
```

Common errors:
- If Python is missing, install [Python](https://www.python.org/)
- Check if Node.js is the right version (v20 works). Use `n` to change your version:

```bash
node --version # Expect 20
# If not 20, do the following. Skip this if it's already 20.
sudo npm install -g n
sudo n 20
# Re-run yarn now that you have the correct Node.js version
```

### Build the client bundle
```
yarn build
```

### Set the configuration
```
cp .env.dev .env
```

### Start the server!
```
yarn start
```

If all went well, visit [http://localhost:8080](http://localhost:8080) to view your local instance of bell.

# Making a change

In a new terminal, set up webpack to rebuild every time you save a change:
```
yarn run build --watch
```

Edit a file, then reload the local page at [http://localhost:8080](http://localhost:8080).
