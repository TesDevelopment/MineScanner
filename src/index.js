const scanner = require("evilscan");
const { MinecraftServerListPing } = require("minecraft-status");
const monk = require("monk")

const arguments = process.argv
arguments.shift()
arguments.shift()

const exit = (message) => { 
    console.log(`[MineScanner] ${message}`)
    process.exit(1)
}

let imported_options = {
    scope: "0.0.0.0/0",
    mongo: {
        enabled: false
    }
}

if(arguments.length > 0){
    if(arguments.length % 2 != 0){
        exit(`Invalid argument range: ${arguments.length} argument(s) found`)
    }

    for(let i=0; i < arguments.length;i++){
        const option = arguments[i]

        switch(option){
            case "--scope":
                imported_options.scope = arguments[i+1]
            break;

            case "--search":
                imported_options.search = arguments[i+1].toLowerCase()
            break;

            case "--mongo":
                imported_options.mongo.enabled = arguments[i+1] == "enabled"
            break;

            case "--verbose":
                imported_options.verbose = arguments[i+1] == "enabled"
            break;

            case "--uri":
                console.log(`COn ${arguments[i+1]}`)
                const db = monk(arguments[i+1])

                db.then( () => {
                    console.log(`[MineScanner] Successfully connected to databse.`)
                    imported_options.mongo.db = db;
                    imported_options.mongo.server_collection = db.get(`servers`)
                    imported_options.mongo.player_collection = db.get(`players`)
                })

            break;

            default:
                exit(`Option ${option} not found`)
        }

        i++
    }
}

const scanner_options = {
    target: imported_options.scope,
    port: "25565",
    status: "TROU",
    banner: true
}


const active_scan = new scanner(scanner_options)


active_scan.on("result", async response_data => {
    const ping_response = await MinecraftServerListPing.ping(4, response_data.ip)

    if(imported_options.verbose){
        console.log(ping_response)
    }
    if(!ping_response) return;

    try {
        const profile = {
            version: ping_response.version.name,
            players: ping_response.players,
            description: ping_response.description.text,
            ip: response_data.ip,
            searched: imported_options.search ? profile.description.toLowerCase().includes(imported_options.search) : false
        }

        if(imported_options.search ? profile.description.toLowerCase().includes(imported_options.search) : false){
            console.log(`[MineScanner] Found priority server, ${imported_options.search} : ${response_data.ip}`)
        }

        const mongo = imported_options.mongo
        if(mongo.enabled){
            if(!mongo.db){
                exit(`Received hit before database initialization.`)
            }

            const server_collection = imported_options.mongo.server_collection
            const player_collection = imported_options.mongo.player_collection

            server_collection.insert(profile)
            player_collection.insert(profile.players.sample)
        }

        console.log(`[MineScanner] Hit found, ${profile.players.online} players online, version ${profile.version} (${ping_response.ip})`)
    }

    catch(e){
        console.log(`[MineScanner] Failed accessing ${response_data.ip} after identification.`)
    }
})

active_scan.on(`done`, () =>{
    console.log(`[MineScanner] Search completed!`)
})

active_scan.run();