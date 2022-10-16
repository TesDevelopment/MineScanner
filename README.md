# MineScanner

Mine scanner is a simple utility for scanning the internet for minecraft servers.

Ouputs are sent to a mongodb database if provided, or printed out to console.

## Usage

### Installing

Run the following commands to install and run MineScanner

`git clone https://github.com/TesDevelopment/MineScanner.git\n
cd MineScanner\n
npm i\n
node .\n`


### Options

`--verbose enabled`: logs all data received

`--mongo enabled`: enabled mongo db

`--uri {uri}`: Provide mongodb uri

`--search {text}`: Search for specific text in MOTD (will set searched to true in db)

`--scope {range}`: Provide an ip range to search, default is 0.0.0.0/0 (Entire internet)
