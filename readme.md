# Introduction

-   Fugle backend engineer pretest
-   Implement a proxy to another server, including restful API and socket
-   Part 1:HTTP API
    -   GET http://localhost:3000/data?user=id
    -   proxy for https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty
    -   if success, return { result: data }
    -   if fail, return status code 500
-   Part 2:Rate Limiting
    -   implement middleware for part 1 API
    -   in every minute, every user can access at most 5 times and every ip for 10 times
    -   if excesse limitation, return status code 429 and response body { ip: ipCount, id: userCount }
-   Part 3:WebSocket API
    -   ws://localhost:3000/streaming
    -   proxy for [Bitstamp WebSocket API](https://www.bitstamp.net/websocket/v2/)
    -   subscribe/unsubscribe specific currency pair
    -   broadcast OHLC for subscribers

# System Requirement

## Production

-   [Docker](https://docs.docker.com/get-docker/)

## Development

-   [Docker](https://docs.docker.com/get-docker/)
-   [vscode](https://code.visualstudio.com/download)
-   [vscode docker extention](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
-   Other dependencies will be installed with devcontainer automatically
-   `Important!!` if you use windows, you should `git config --global core.autocrlf false` before you clone this project, otherwise windows will convert LF to CRLF, which lead all shell scripts fail.

# Build & Run

## Production

-   Interpreted mode

    ```
    cd /path/to/project/root/
    docker-compose -p fugle -f .prodcontainer/interpreted.yml up --force-recreate
    ```

-   Binary mode

    -   Compile project to binary code.
    -   In binary mode, it can run more faster, use less disk space and be more anti-reversing.
    -   This mode is not stable on windows. If it build fail on windows, please run it in WSL CLI
    -   Please switch to interpreted mode.

    ```
    cd /path/to/project/root/
    docker-compose -p fugle -f ./.prodcontainer/binary.yml build --parallel --no-cache
    docker-compose -p fugle -f .prodcontainer/binary.yml up --force-recreate
    ```

# Development

-   We use vscode devcontailer for development environment
-   Open vscode in project root directory
-   Press `ctrl + shift + p` enter `Dev Containers: reopen in container` to build devcontainer.
-   It will build docker for development environment and install dependent package for this project automatically.
-   Run the project with the commands blew

    -   yarn run dev: run server in development mode
    -   yarn run prod: run server in production mode
    -   yarn run test: run all testing files
    -   yarn run translate: translate ES6 module in this project to commonjs. The result will be in `build` folder. `Please don't use this command in devcontainer!!`
    -   yarn run build: compile this project to binary executed file. The result will be in `build` folder. `Please don't use this command in devcontainer!!`

-   Use `git cz` in CLI to use formated commit message.
-   pre-commit will run all testing cases automatically before git commit.
-   Developers can run testing with jest extention on the vscode extention bar
-   If jest extention didn't show in extention bar, please reload vscode window manually.
