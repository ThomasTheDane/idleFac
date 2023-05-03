class Block {
    game;
    type = "dirt";
    occupied = false;

    constructor({ game, type = "dirt", occupied = false }) {
        this.game = game;
        this.type = type;
        this.occupied = occupied;
    }

    handleClick() {
        if (this.type != "dirt") {
            this.game.inventory[this.type] += 1;
        }

        game.deselect();
    }
}

class GameGrid {
    gridWidth;
    gridHeight;
    blockSize;
    blocks;
    blockContainer;

    rateRanges = {
        dirt: 0.8,
        ironOre: 0.9,
        copperOre: 1.0,
    }

    gridMap1 = [
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "I", "I", "I", "D", "D", "D", "D", "D", "D"],
        ["D", "I", "D", "D", "D", "I", "I", "D", "D", "D", "D"],
        ["D", "I", "D", "D", "C", "C", "I", "D", "C", "D", "D"],
        ["D", "D", "C", "D", "D", "C", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "A", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "C", "O", "D", "C", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "C", "D", "D"],
        ["D", "D", "I", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "C", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"]
    ];

    constructor({ game, gridWidth, gridHeight, gameWindowSize = Math.min(window.innerWidth / 2, window.innerHeight) }) {
        this.game = game;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.gameWindowSize = gameWindowSize;
        this.blockSize = this.gameWindowSize / this.gridWidth;

        this.blockContainer = new PIXI.Container();
        this.blockContainer.x = 0;
        this.blockContainer.y = 0;
        this.blockContainer.sortableChildren = true;
        this.game.pixiApp.stage.addChild(this.blockContainer);

        this.blocks = new Array(gridHeight);
        for (var i = 0; i < gridHeight; i++) {
            this.blocks[i] = new Array(gridWidth);
        }
    }

    setupNewGameWithMap(gridMap) {
        if(!gridMap){gridMap = this.gridMap1}
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // console.log(gridMap[y]);
                if (gridMap[y][x] == "D") {
                    this.blocks[y][x] = new Block({ game: this.game, type: "dirt", occupied: false });
                }
                if (gridMap[y][x] == "I") {
                    this.blocks[y][x] = new Block({ game: this.game, type: "ironOre", occupied: false });
                }
                if (gridMap[y][x] == "C") {
                    this.blocks[y][x] = new Block({ game: this.game, type: "copperOre", occupied: false });
                }
                if (gridMap[y][x] == "O") {
                    this.blocks[y][x] = new Block({ game: this.game, type: "oil", occupied: false });
                }
                if (gridMap[y][x] == "A") {
                    this.blocks[y][x] = new Block({ game: this.game, type: "coal", occupied: false });
                }

            }
        }
    }

    setupNewEmptyGame() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                this.blocks[y][x] = new Block({ game: this.game, type: "dirt", occupied: false });
            }
        }
    }

    setupNewRandomGame() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let randomNum = Math.random();
                let pickedType;
                for(let aType in this.rateRanges){
                    if(randomNum < this.rateRanges[aType]){
                        pickedType = aType;
                        // console.log("picked block type: ", pickedType)
                        break;
                    }
                }
                this.blocks[y][x] = new Block({ game: this.game, type: pickedType, occupied: false });
            }
        }
    }

    clearSprites() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let block = this.blocks[x][y];
                if (block.sprite && block.sprite.parent) {
                    block.sprite.parent.removeChild(block.sprite);
                }
            }
        }
    }

    drawGrid() {
        this.clearSprites();
        this.blockSize = this.gameWindowSize / this.gridWidth;

        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let block = this.blocks[x][y];

                block.sprite = PIXI.Sprite.from('graphics/' + block.type + "Tile" + '.png');
                block.sprite.cursor = 'pointer';
                block.sprite.zIndex = 1;

                block.x = x;
                block.y = y;
                block.sprite.x = this.blockSize * x;
                block.sprite.y = this.blockSize * y;
                block.sprite.width = this.blockSize;
                block.sprite.height = this.blockSize;

                block.sprite.interactive = true;
                block.sprite.on('pointerdown', block.handleClick, block);

                this.blockContainer.addChild(block.sprite);
            }
        }
    }

    findRandomEmptySpot() {
        let emptySpots = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let block = this.blocks[x][y];
                if (block.occupied == false) {
                    emptySpots.push(block);
                }
            }
        }
        if (emptySpots.length > 0) {
            return emptySpots[Math.floor(Math.random() * emptySpots.length)]
        }
    }

    expandGridDownRight1(method, gridMap) {
        if(!gridMap){gridMap = this.gridMap1}
        
        for (let y = 0; y < this.gridHeight; y++) {
            let randomNum = Math.random();
            let pickedType;
            if(method == "random"){
                for(let aType in this.rateRanges){
                    if(randomNum < this.rateRanges[aType]){
                        pickedType = aType;
                        // console.log("picked block type: ", pickedType)
                        break;
                    }
                }
            }else if(method == "map"){
                if (gridMap[y][this.gridWidth] == "D") {
                    pickedType = "dirt"
                }
                if (gridMap[y][this.gridWidth] == "I") {
                    pickedType = "ironOre"
                }
                if (gridMap[y][this.gridWidth] == "C") {
                    pickedType = "copperOre"
                }
                if (gridMap[y][this.gridWidth] == "O") {
                    pickedType = "oil"
                }
                if (gridMap[y][this.gridWidth] == "A") {
                    pickedType = "coal"
                }
            }else{
                alert("fuckup in expandGrid")
            }
            this.blocks[y].push(new Block({ game: this.game, type: pickedType, occupied: false }))
        }
        this.gridWidth += 1;

        let newRow = new Array(this.gridWidth);
        for (let x = 0; x < this.gridWidth; x++) {
            let randomNum = Math.random();
            let pickedType;
            if(method == "random"){
                for(let aType in this.rateRanges){
                    if(randomNum < this.rateRanges[aType]){
                        pickedType = aType;
                        // console.log("picked block type: ", pickedType)
                        break;
                    }
                }
            }else if(method == "map"){
                if (gridMap[this.gridHeight][x] == "D") {
                    pickedType = "dirt"
                }
                if (gridMap[this.gridHeight][x] == "I") {
                    pickedType = "ironOre"
                }
                if (gridMap[this.gridHeight][x] == "C") {
                    pickedType = "copperOre"
                }
                if (gridMap[this.gridHeight][x] == "O") {
                    pickedType = "oil"
                }
                if (gridMap[this.gridHeight][x] == "A") {
                    pickedType = "coal"
                }
            }else{
                alert("fuckup in expandGrid")
            }

            newRow[x] = new Block({ game: this.game, type: pickedType, occupied: false });
        }
        this.blocks.push(newRow);

        this.gridHeight += 1;

        this.clearSprites();
        this.drawGrid();

        //update sprites size and position 
        game.updateSizeOfDragables();
        
    }

}

class Dragable {
    level;
    recipe;
    storeName;

    constructor({ game, level, placingBlock, storeName}) {
        
        this.sprite = PIXI.Sprite.from("graphics/mine.png");
        
        this.levelWhenStartedCrafting = level;
        this.onBlock = placingBlock;
        this.level = level;
        this.storeName = storeName;
        
        this.sprite.x = placingBlock.x * game.gameGrid.blockSize + (game.gameGrid.blockSize / 2);
        this.sprite.y = placingBlock.y * game.gameGrid.blockSize + (game.gameGrid.blockSize / 2);
        this.sprite.width = game.gameGrid.blockSize;
        this.sprite.height = game.gameGrid.blockSize;

        placingBlock.occupied = true;

        this.sprite.interactive = true;
        this.sprite.cursor = 'pointer';
        this.sprite.anchor.set(0.5);
        this.sprite.zIndex = 3;
        this.sprite.on('pointerdown', game.onDragStart, this);

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#ff0000',
        });
        this.levelText = new PIXI.Text(level, style);
        this.levelText.anchor.set(0.5)
        // this.levelText.y = -1 * (game.gameGrid.blockSize / 3);
        // this.levelText.x = 10

        this.sprite.addChild(this.levelText);

        this.sprite.texture = PIXI.Texture.from('graphics/' + this.storeName + '.png');

        game.gameGrid.blockContainer.addChild(this.sprite);
    }

    delete(){
        this.sprite.parent.removeChild(this.sprite);

        if (this.type == "mine") {
            removeItem(game.mines, this);
        }else if (this.type == "factory") {
            this.reset();
            removeItem(game.factories, this);
        }else if (this.type == "storage"){
            
            removeItem(game.storages, this);
        }
    }
}

class Mine extends Dragable {
    paused;
    mining; 
    powerUse;


    constructor({ game, level, placingBlock, storeName }) {
    
        console.log("buying mine at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)

        super({ game, level, placingBlock, storeName });
        this.recipe = game.storeCosts[storeName].produces;

        this.powerUse = game.storeCosts[storeName].powerUse;
        this.type = "mine";
        this.mining = true;
        this.paused = false;
    }

    power() {
        // return Math.pow(2, this.level) / 2;
        return this.level;
    }
}


class Factory extends Dragable {
    timeCrafting;
    crafting;
    levelWhenStartedCrafting;
    waitingAtFull; 
    paused;
    powerUse; 

    constructor({ game, level, placingBlock, storeName }) {

        console.log("buying factory at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)

        super({ game, level, placingBlock, storeName });

        this.powerUse = game.storeCosts[storeName].powerUse;
        this.recipe = game.storeCosts[storeName].produces;


        this.type = "factory";
        this.timeCrafting = 0;
        this.paused = false;
        this.levelWhenStartedCrafting = level;

        this.progressBarBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.sprite.addChild(this.progressBarBackground);

        this.progressBarBackground.width = game.gameGrid.blockSize * (game.gameGrid.gridWidth / 10);
        this.progressBarBackground.height = (game.gameGrid.blockSize / 8) * (game.gameGrid.gridWidth / 10);
        this.progressBarBackground.x = (game.gameGrid.blockSize / -2) * (game.gameGrid.gridWidth / 10);
        this.progressBarBackground.y = ((game.gameGrid.blockSize / 2) - (game.gameGrid.blockSize / 8)) * (game.gameGrid.gridWidth / 10);

        this.progressBar = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.progressBar.tint = 0xff0000;
        this.progressBar.width = 0;
        this.progressBar.height = ((game.gameGrid.blockSize / 8) - 2) * (game.gameGrid.gridWidth / 10);
        this.progressBar.x = ((game.gameGrid.blockSize / -2) + 1) * (game.gameGrid.gridWidth / 10);
        this.progressBar.y = ((game.gameGrid.blockSize / 2) - (game.gameGrid.blockSize / 8) + 1) * (game.gameGrid.gridWidth / 10);


        this.sprite.addChild(this.progressBar);
    }

    power() {
        // return Math.pow(2, this.levelWhenStartedCrafting) / 2;
        return this.levelWhenStartedCrafting;
    }

    // setRecipe(recipeName){
    //     this.reset();
    //     if(recipeName == "deselect" || !recipeName){
    //         this.recipe = null;
    //         this.crafting = false; 
    //         this.recipeIcon.texture = null;
    //     }else{
    //         this.recipe = recipeName;
    //         this.recipeIcon.texture = PIXI.Texture.from('graphics/' + recipeName + '.png');
    //     }
    // }

    updateProgressBar() {
        if (this.crafting) {
            this.progressBar.width = (game.gameGrid.blockSize - 2) * (this.timeCrafting / game.recipes[this.recipe].duration) * (game.gameGrid.gridWidth / 10);;
        }
    }

    reset() {
        if (this.recipe && this.crafting) {
            game.addProductsToInventory(game.recipes[this.recipe].costs, this.power());
        }
        this.timeCrafting = 0;
        this.updateProgressBar();
        this.crafting = false;
    }
}

class Storage extends Dragable {
    stores;

    constructor({ game, level, placingBlock, storeName }) {

        console.log("buying factory at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)

        super({ game, level, placingBlock, storeName });


        this.stores = game.storeCosts[storeName].stores;

        this.type = "storage"

    }

    power() {
        switch (this.level) {
            case 1:
                return 50
            case 2:
                return 100
            case 3:
                return 200
            case 4:
                return 500
            case 5:
                return 1000
            case 6:
                return 2000
            case 7:
                return 5000
            case 8:
                return 10000
            case 9:
                return 20000
            case 10:
                return 50000
            default:
                return Math.pow(2, this.level) / 2;

        }

    }
}

class CommandCenter extends Dragable {
    constructor({ game, level, placingBlock}) {
        console.log("placing command center at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)

        super({ game, level, placingBlock, storeName: "commandCenter" });

        this.levelText.parent.removeChild(this.levelText);

        this.type = "command";
    }


}

class Game {
    pixiApp;
    gameGrid;

    lastTimeProductionHappened;

    commandCenter;
    mines = [];
    factories = [];
    storages = [];
    researchedTech = [];

    countIconSize = 50;

    inventory = {};
    rates = {};
    storage = {};
    energy;

    buyMineLevelSet = 1;
    buyFactoryLevelSet = 1;

    selectedObject;

    techTree = {
        expansion4: {
            name: "expansion4", costs: { science1: 10 }, prerequisites: [], enact: () => {
                this.gameGrid.expandGridDownRight1("map");
            }
        },
        expansion5: {
            name: "expansion5", costs: { science1: 100 }, prerequisites: ["expansion4"], enact: () => {
                this.gameGrid.expandGridDownRight1("map")
            }
        },
        expansion6: {
            name: "expansion6", costs: { science1: 500, science2: 25 }, prerequisites: ["science2Lab1", "expansion5"], enact: () => {
                this.gameGrid.expandGridDownRight1("map")
            }
        },
        expansion7: {
            name: "expansion7", costs: { science1: 1000, science2: 200 }, prerequisites: ["expansion6"], enact: () => {
                this.gameGrid.expandGridDownRight1("map")
            }
        },
        expansion8: {
            name: "expansion8", costs: { science1: 2000, science2: 500, science3: 10 }, prerequisites: ["expansion7", "science3Lab1"], enact: () => {
                this.gameGrid.expandGridDownRight1("map")
            }
        },

        copperOreMine1: {
            name: "copperOreMine1", costs: { science1: 50 }, prerequisites: ["expansion5"], enact: () => {
                this.buyingLevels["copperOreMine1"] = 1;
                this.addStoreItem("copperOreMine1");
            }
        },
        copperPlateFactory1: {
            name: "copperPlateFactory1", costs: { science1: 75 }, prerequisites: ["copperOreMine1"], enact: () => {
                this.buyingLevels["copperPlateFactory1"] = 1;
                this.addStoreItem("copperPlateFactory1");
            }
        },
        copperCableFactory1: {
            name: "copperCableFactory1", costs: { science1: 100 }, prerequisites: ["copperPlateFactory1"], enact: () => {
                this.buyingLevels["copperCableFactory1"] = 1;
                this.addStoreItem("copperCableFactory1");
            }
        },
        greenCircuitFactory1: {
            name: "greenCircuitFactory1", costs: { science1: 150 }, prerequisites: ["copperCableFactory1"], enact: () => {
                this.buyingLevels["greenCircuitFactory1"] = 1;
                this.addStoreItem("greenCircuitFactory1");
            }
        },
        engineFactory1: {
            name: "engineFactory1", costs: { science1: 50 }, prerequisites: [], enact: () => {
                this.buyingLevels["engineFactory1"] = 1;
                this.addStoreItem("engineFactory1");
            }
        },
        science2Lab1: {
            name: "science2Lab1", costs: { science1: 150 }, prerequisites: ["engineFactory1", "greenCircuitFactory1"], enact: () => {
                this.buyingLevels["science2Lab1"] = 1;
                this.addStoreItem("science2Lab1");
            }
        },

        // windEnergyFactory1: {
        //     name: "windEnergyFactory1", costs: { science1: 50 }, prerequisites: [], enact: () => {
        //         this.buyingLevels["windEnergyFactory1"] = 1;
        //         this.addStoreItem("windEnergyFactory1");
        //     }
        // },
        coalMine1: {
            name: "coalMine1", costs: { science2: 20 }, prerequisites: ["science2Lab1", "expansion6"], enact: () => {
                this.buyingLevels["coalMine1"] = 1;
                this.addStoreItem("coalMine1");
            }
        },
        steelFactory1: {
            name: "steelFactory1", costs: { science2: 50 }, prerequisites: ["coalMine1"], enact: () => {
                this.buyingLevels["steelFactory1"] = 1;
                this.addStoreItem("steelFactory1");
            }
        },
        oilMine1: {
            name: "oilMine1", costs: { science2: 20 }, prerequisites: ["expansion7", "science2Lab1"], enact: () => {
                this.buyingLevels["oilMine1"] = 1;
                this.addStoreItem("oilMine1");
            }
        },
        oilProcessing1Factory1: {
            name: "oilProcessing1Factory1", costs: { science2: 50 }, prerequisites: ["oilMine1"], enact: () => {
                this.buyingLevels["oilProcessing1Factory1"] = 1;
                this.addStoreItem("oilProcessing1Factory1");
            }
        },
        plasticFactory1: {
            name: "plasticFactory1", costs: { science2: 100 }, prerequisites: ["oilProcessing1Factory1"], enact: () => {
                this.buyingLevels["plasticFactory1"] = 1;
                this.addStoreItem("plasticFactory1");
            }
        },
        redCircuitFactory1: {
            name: "redCircuitFactory1", costs: { science2: 100 }, prerequisites: ["plasticFactory1"], enact: () => {
                this.buyingLevels["redCircuitFactory1"] = 1;
                this.addStoreItem("redCircuitFactory1");
            }
        },
        science3Lab1: {
            name: "science3Lab1", costs: { science2: 200 }, prerequisites: ["plasticFactory1", "greenCircuitFactory1"], enact: () => {
                this.buyingLevels["science3Lab1"] = 1;
                this.addStoreItem("science3Lab1");
            }
        },

        //tier 3 

        oilProcessing2Factory1: {
            name: "oilProcessing2Factory1", costs: { science3: 10 }, prerequisites: ["science3Lab1"], enact: () => {
                this.buyingLevels["oilProcessing2Factory1"] = 1;
                this.addStoreItem("oilProcessing2Factory1");
            }
        },
        heavyOilBreakdownFactory1: {
            name: "heavyOilBreakdownFactory1", costs: { science3: 20 }, prerequisites: ["oilProcessing2Factory1"], enact: () => {
                this.buyingLevels["heavyOilBreakdownFactory1"] = 1;
                this.addStoreItem("heavyOilBreakdownFactory1");
            }
        },
        lightOilBreakdownFactory1: {
            name: "lightOilBreakdownFactory1", costs: { science3: 20 }, prerequisites: ["oilProcessing2Factory1"], enact: () => {
                this.buyingLevels["lightOilBreakdownFactory1"] = 1;
                this.addStoreItem("lightOilBreakdownFactory1");
            }
        },
        
        solidFuel1Factory1: {
            name: "solidFuel1Factory1", costs: { science3: 30 }, prerequisites: ["oilProcessing2Factory1"], enact: () => {
                this.buyingLevels["solidFuel1Factory1"] = 1;
                this.addStoreItem("solidFuel1Factory1");
            }
        },
        solidFuel2Factory1: {
            name: "solidFuel2Factory1", costs: { science3: 30 }, prerequisites: ["oilProcessing2Factory1"], enact: () => {
                this.buyingLevels["solidFuel2Factory1"] = 1;
                this.addStoreItem("solidFuel2Factory1");
            }
        },
        solidFuel3Factory1: {
            name: "solidFuel3Factory1", costs: { science3: 30 }, prerequisites: ["oilProcessing2Factory1"], enact: () => {
                this.buyingLevels["solidFuel3Factory1"] = 1;
                this.addStoreItem("solidFuel3Factory1");
            }
        },
        rocketFuelFactory1: {
            name: "rocketFuelFactory1", costs: { science3: 50 }, prerequisites: ["oilProcessing2Factory1"], enact: () => {
                this.buyingLevels["rocketFuelFactory1"] = 1;
                this.addStoreItem("rocketFuelFactory1");
            }
        },

        purpleCircuitFactory1:{
            name: "purpleCircuitFactory1", costs: { science3: 100 }, prerequisites: ["science3Lab1"], enact: () => {
                this.buyingLevels["purpleCircuitFactory1"] = 1;
                this.addStoreItem("purpleCircuitFactory1");
            }
        },
        lowDensityStructureFactory1:{
            name: "lowDensityStructureFactory1", costs: { science3: 100 }, prerequisites: ["science3Lab1"], enact: () => {
                this.buyingLevels["lowDensityStructureFactory1"] = 1;
                this.addStoreItem("lowDensityStructureFactory1");
            }
        },

        rocketPartFactory1: {
            name: "rocketPartFactory1", costs: { science3: 200 }, prerequisites: ["purpleCircuitFactory1", "lowDensityStructureFactory1", "rocketFuelFactory1"], enact: () => {
                this.buyingLevels["rocketPartFactory1"] = 1;
                this.addStoreItem("rocketPartFactory1");
            }
        },

        // : {
        //     name: "", costs: { science1: 5 }, prerequisites: [""], enact: () => {
        //         this.buyingLevels[""] = 1;
        //         this.addStoreItem("");
        //     }
        // },
        ironOreStorage1: {
            name: "ironOreStorage1", costs: { science1: 5 }, prerequisites: [], enact: () => {
                this.buyingLevels["ironOreStorage1"] = 1;
                this.addStoreItem("ironOreStorage1");
            }
        },
        copperOreStorage1: {
            name: "copperOreStorage1", costs: { science1: 5 }, prerequisites: ["copperOreMine1"], enact: () => {
                this.buyingLevels["copperOreStorage1"] = 1;
                this.addStoreItem("copperOreStorage1");
            }
        },
        ironPlateStorage1: {
            name: "ironPlateStorage1", costs: { science1: 10 }, prerequisites: [], enact: () => {
                this.buyingLevels["ironPlateStorage1"] = 1;
                this.addStoreItem("ironPlateStorage1");
            }
        },
        ironGearStorage1: {
            name: "ironGearStorage1", costs: { science1: 20 }, prerequisites: [], enact: () => {
                this.buyingLevels["ironGearStorage1"] = 1;
                this.addStoreItem("ironGearStorage1");
            }
        },
        copperPlateStorage1: {
            name: "copperPlateStorage1", costs: { science1: 20 }, prerequisites: ["copperPlateFactory1"], enact: () => {
                this.buyingLevels["copperPlateStorage1"] = 1;
                this.addStoreItem("copperPlateStorage1");
            }
        },
        copperCableStorage1: {
            name: "copperCableStorage1", costs: { science1: 40 }, prerequisites: ["copperCableFactory1"], enact: () => {
                this.buyingLevels["copperCableStorage1"] = 1;
                this.addStoreItem("copperCableStorage1");
            }
        },
        science1Storage1: {
            name: "science1Storage1", costs: { science1: 5 }, prerequisites: [], enact: () => {
                this.buyingLevels["science1Storage1"] = 1;
                this.addStoreItem("science1Storage1");
            }
        },
        science2Storage1: {
            name: "science2Storage1", costs: { science2: 10, science2: 5 }, prerequisites: ["science2Lab1"], enact: () => {
                this.buyingLevels["science2Storage1"] = 1;
                this.addStoreItem("science2Storage1");
            }
        },
        coalStorage1: {
            name: "coalStorage1", costs: { science2: 50 }, prerequisites: ["coalMine1"], enact: () => {
                this.buyingLevels["coalStorage1"] = 1;
                this.addStoreItem("coalStorage1");
            }
        },
        steelStorage1: {
            name: "steelStorage1", costs: { science2: 10 }, prerequisites: ["steelFactory1"], enact: () => {
                this.buyingLevels["steelStorage1"] = 1;
                this.addStoreItem("steelStorage1");
            }
        },
        oilStorage1: {
            name: "oilStorage1", costs: { science2: 50 }, prerequisites: ["oilMine1"], enact: () => {
                this.buyingLevels["oilStorage1"] = 1;
                this.addStoreItem("oilStorage1");
            }
        },
        science3Storage1: {
            name: "science3Storage1", costs: { science3: 5 }, prerequisites: ["oilMine1"], enact: () => {
                this.buyingLevels["science3Storage1"] = 1;
                this.addStoreItem("science3Storage1");
            }
        },


        //todo storage for tier 3 
        // energyStorage1: {
        //     name: "energyStorage1", costs: { science2: 50 }, prerequisites: ["science2Lab1"], enact: () => {
        //         this.buyingLevels["energyStorage1"] = 1;
        //         this.addStoreItem("energyStorage1");
        //     }
        // },
        // //////
        ironOreMine1Level2: {
            name: "ironOreMine1Level2", costs: { science1: 25 }, prerequisites: ["expansion5"], enact: () => {
                this.buyingLevels["ironOreMine1"] = 2;
                this.createStoreUI()
            }
        },
        ironPlateFactory1Level2: {
            name: "ironPlateFactory1Level2", costs: { science1: 50 }, prerequisites: ["expansion5"], enact: () => {
                this.buyingLevels["ironPlateFactory1"] = 2;
                this.createStoreUI()
            }
        },
    }

    ores = {
        ironOre: { duration: 1 },
        copperOre: { duration: 2 },
        coal: {duration: 4},
        oil: {duration: 0.2},
    }

    recipes = { // V5
        ironPlate: { products: { ironPlate: 1 }, costs: { ironOre: 1 }, duration: 1 },
        ironGear: { products: { ironGear: 1 }, costs: { ironPlate: 2 }, duration:  2},

        copperPlate: { products: { copperPlate: 1 }, costs: { copperOre: 2 }, duration: 2 },
        copperCable: { products: { copperCable: 1 }, costs: { copperPlate: 2 }, duration: 4 },

        engine: { products: { engine: 1 }, costs: { ironPlate: 4, ironGear: 2}, duration: 8 },
        greenCircuit: { products: { greenCircuit: 1 }, costs: { copperPlate: 2, copperCable: 1 }, duration: 5 },

        oilProcessing1: { products: { petroleum: 15 }, costs: { oil: 50 }, duration: 5 },
        // steel: { products: { steel: 1 }, costs: { ironPlate:  20, coal: 5}, duration: 5 },
        // plastic: { products: { plastic: 1 }, costs: { petroleum:  50, coal: 4}, duration: 5 },
        // redCircuit: { products: { redCircuit: 1 }, costs: { greenCircuit:  20, plastic: 5}, duration: 5 },

        steel: { products: { steel: 1 }, costs: { ironPlate:  2, coal: 4}, duration: 5 },
        plastic: { products: { plastic: 1 }, costs: { petroleum:  10, coal: 2}, duration: 5 },
        redCircuit: { products: { redCircuit: 1 }, costs: { greenCircuit:  5, plastic: 2}, duration: 5 },

        oilProcessing2: { products: { petroleum: 5, lightOil: 10, heavyOil: 15 }, costs: { oil: 50 }, duration: 6 },
        heavyOilBreakdown: { products: { petroleum: 20, lightOil: 40 }, costs: { heavyOil: 30 }, duration: 3 },
        lightOilBreakdown: { products: { petroleum: 60 }, costs: { lightOil: 40 }, duration: 3 },
        
        solidFuel1: { products: { solidFuel: 1 }, costs: { petroleum: 80 }, duration: 4 },
        solidFuel2: { products: { solidFuel: 1 }, costs: { lightOil: 40 }, duration: 4 },
        solidFuel3: { products: { solidFuel: 1 }, costs: { heavyOil: 30 }, duration: 4 },
        rocketFuel: { products: { solidFuel: 1 }, costs: { lightOil: 40, solidFuel: 10 }, duration: 6 },

        purpleCircuit: { products: { purpleCircuit: 1 }, costs: { redCircuit: 2, greenCircuit: 10 }, duration: 10 },
        lowDensityStructure: { products: { lowDensityStructure: 1 }, costs: { steel: 5, plastic: 10, copperPlate: 20 }, duration: 10 },

        rocketPart: { products: { rocketPart: 1 }, costs: { rocketFuel: 1, lowDensityStructure: 1,  purpleCircuit: 1}, duration: 20 },
        
        science1: { products: { science1: 1 }, costs: { ironGear: 2, ironPlate: 5 }, duration: 5},
        science2: { products: { science2: 1 }, costs: { engine: 2, greenCircuit: 1 }, duration: 10},
        science3: { products: { science3: 1 }, costs: { steel: 5, redCircuit: 2 }, duration: 20},
        science4: { products: { science4: 1 }, costs: { rocketFuel: 5, purpleCircuit: 2,  }, duration: 20},

        // windEnergy1: { products: { energy: 5 }, costs: {  }, duration: 1},
    }

   //exponential recipes  
   /*
    recipes = { // exponential 
        ironPlate: { products: { ironPlate: 1 }, costs: { ironOre: 2 }, duration: 1 },
        ironGear: { products: { ironGear: 1 }, costs: { ironPlate: 4 }, duration:  2},

        copperPlate: { products: { copperPlate: 1 }, costs: { copperOre: 4 }, duration: 2 },
        copperCable: { products: { copperCable: 1 }, costs: { copperPlate: 8 }, duration: 4 },

        engine: { products: { engine: 1 }, costs: { ironPlate: 8, ironGear: 4 }, duration: 8 },
        greenCircuit: { products: { greenCircuit: 1 }, costs: { copperPlate: 4, copperCable: 2 }, duration: 8 },

        oilProcessing1: { products: { petroleum: 50, lightOil: 40, heavyOil: 10 }, costs: { oil: 100 }, duration: 10 },

        science1: { products: { science1: 1 }, costs: { ironGear: 8, ironPlate: 16 }, duration: 5},
        science2: { products: { science2: 1 }, costs: { engine: 16, greenCircuit: 16 }, duration: 10},
    }
    */ 

    // storeCosts = {
    //     ironOreMine1: { type: "mine", costs: { ironOre: 1 }, produces: "ironOre" },
    //     copperOreMine1: { type: "mine", costs: { ironOre: 1 }, produces: "copperOre" },

    //     ironPlateFactory1: { type: "factory", costs: { ironOre: 10 }, produces: "ironPlate" },
    //     copperPlateFactory1: { type: "factory", costs: { ironOre: 10 }, produces: "copperPlate" },

    //     ironGearFactory: { type: "factory", costs: { ironPlate: 10 }, produces: "ironGear" },

    //     science1Lab1: { type: "factory", costs: { ironOre: 1 }, produces: "science1" },
        
    //     ironOreStorage1: { type: "storage", costs: { ironOre: 1 }, stores: "ironOre" },
    //     copperOreStorage1: { type: "storage", costs: { ironOre: 1 }, stores: "copperOre" },

    //     ironPlateStorage1: { type: "storage", costs: { ironOre: 1 }, stores: "ironPlate" },
    // }

    storeCosts = {
        //science 1 stuff 
        ironOreMine1: { type: "mine", costs: { ironOre: 10 }, produces: "ironOre", multiplier: 1, powerUse: 6},
        ironPlateFactory1: { type: "factory", costs: { ironOre: 20 }, produces: "ironPlate", multiplier: 1, powerUse: .4 },
        ironGearFactory1: { type: "factory", costs: { ironPlate: 10 }, produces: "ironGear", multiplier: 1, powerUse: .5},
        science1Lab1: { type: "factory", costs: { ironGear: 10 }, produces: "science1", multiplier: 1, powerUse: 1 },
        
        //tier 2 stuff 
        engineFactory1: { type: "factory", costs: {ironGear: 10 }, produces: "engine", multiplier: 1, powerUse: 1},

        copperOreMine1: { type: "mine", costs: { copperOre: 10 }, produces: "copperOre", multiplier: 1, powerUse: .5 },
        copperPlateFactory1: { type: "factory", costs: { copperOre: 20 }, produces: "copperPlate", multiplier: 1, powerUse: 1 },
        copperCableFactory1: { type: "factory", costs: { copperPlate: 10 }, produces: "copperCable", multiplier: 1, powerUse: 2 },

        greenCircuitFactory1: { type: "factory", costs: { copperCable: 10 }, produces: "greenCircuit", multiplier: 1, powerUse: 3 },

        science2Lab1: { type: "factory", costs: { greenCircuit: 10 }, produces: "science2", multiplier: 1, powerUse: 3 },

        //science 3 stuff  
        coalMine1: { type: "mine", costs: { ironGear: 5 }, produces: "coal", multiplier: 1, powerUse: 1 }, 
        steelFactory1: { type: "factory", costs: { engine: 5 }, produces: "steel", multiplier: 1, powerUse: 5 },
        
        oilMine1: { type: "mine", costs: { engine: 5 }, produces: "oil", multiplier: 1, powerUse: 3 },
        oilProcessing1Factory1: { type: "factory", costs: { engine: 10 }, produces: "oilProcessing1", multiplier: 1, powerUse: 5 },
        plasticFactory1: { type: "factory", costs: { steel: 2 }, produces: "plastic", multiplier: 1, powerUse: 2 },
        
        redCircuitFactory1: { type: "factory", costs: { plastic: 5 }, produces: "redCircuit", multiplier: 1, powerUse: 5 },
        
        science3Lab1: { type: "factory", costs: { steel: 10 }, produces: "science3", multiplier: 1, powerUse: 10 },

        //tier 2 buildings 
        // ironOreMine2: { type: "mine", costs: { ironOre: 10 }, produces: "ironOre", multiplier: 1, powerUse: 6},
        // ironPlateFactory2: { type: "factory", costs: { ironOre: 20 }, produces: "ironPlate", multiplier: 1, powerUse: .4 },
        // ironGearFactory2: { type: "factory", costs: { ironPlate: 10 }, produces: "ironGear", multiplier: 1, powerUse: .5},
        
        oilProcessing2Factory1: { type: "factory", costs: { plastic: 5 }, produces: "oilProcessing2", multiplier: 1, powerUse: 1 },
        heavyOilBreakdownFactory1: { type: "factory", costs: { plastic: 5 }, produces: "heavyOilBreakdown", multiplier: 1, powerUse: 1 },
        lightOilBreakdownFactory1: { type: "factory", costs: { plastic: 5 }, produces: "lightOilBreakdown", multiplier: 1, powerUse: 1 },
        
        solidFuel1Factory1: { type: "factory", costs: { steel: 10 }, produces: "solidFuel1", multiplier: 1, powerUse: 1 },
        solidFuel2Factory1: { type: "factory", costs: { steel: 10 }, produces: "solidFuel2", multiplier: 1, powerUse: 1 },
        solidFuel3Factory1: { type: "factory", costs: { steel: 10 }, produces: "solidFuel3", multiplier: 1, powerUse: 1 },
        rocketFuelFactory1: { type: "factory", costs: { steel: 20 }, produces: "rocketFuel", multiplier: 1, powerUse: 1 },

        purpleCircuitFactory1:{ type: "factory", costs: { steel: 20 }, produces: "purpleCircuit", multiplier: 1, powerUse: 1 },
        lowDensityStructureFactory1: { type: "factory", costs: { steel: 20 }, produces: "lowDensityStructure", multiplier: 1, powerUse: 1 },

        rocketPartFactory1: { type: "factory", costs: { steel: 100 }, produces: "rocketPart", multiplier: 1, powerUse: 1 },
        
        //storage 
        ironOreStorage1: { type: "storage", costs: { ironOre: 20}, stores: "ironOre" },
        ironPlateStorage1: { type: "storage", costs: { ironPlate: 20 }, stores: "ironPlate" },
        ironGearStorage1: { type: "storage", costs: { ironGear: 10 }, stores: "ironGear" },
        engineStorage1: { type: "storage", costs: { engine: 10 }, stores: "engine" },
        
        copperOreStorage1: { type: "storage", costs: { copperOre: 20 }, stores: "copperOre" },
        copperPlateStorage1: { type: "storage", costs: { copperPlate: 10 }, stores: "copperPlate" },
        copperCableStorage1: { type: "storage", costs: { copperCable: 20 }, stores: "copperCable" },
        greenCircuitStorage1: { type: "storage", costs: { greenCircuit: 10 }, stores: "greenCircuit" },
        
        oilStorage1: { type: "storage", costs: { greenCircuit: 10 }, stores: "oil" },
        
        science1Storage1: { type: "storage", costs: { ironPlate: 50 }, stores: "science1" },
        science2Storage1: { type: "storage", costs: { copperPlate: 50 }, stores: "science2" },
        science3Storage1: { type: "storage", costs: { steel: 50 }, stores: "science3" },
        
        // energyStorage1: { type: "storage", costs: { greenCircuit: 10 }, stores: "energy" },
        //windEnergyFactory1: { type: "factory", costs: { ironGear: 5 }, produces: "windEnergy1", powerUse: 0 },
    }

    buyingLevels = {};
    allProducts = [];

    timeSinceLastProduction;
    framerate;

    dragTarget = null;
    dragEntity = null;
    removedFromBlock;
    self;

    debug = true;

    // game start 

    constructor() {
        self = this;
        this.initializeInventoryAndRates();
        // this.inventory["energy"] = 100;

        let gameWindowSize = Math.min(window.innerWidth / 2, window.innerHeight);
        this.pixiApp = new PIXI.Application({ width: gameWindowSize, height: gameWindowSize, background: '#1099bb' });
        this.gameGrid = new GameGrid({ game: this, gridWidth: 3, gridHeight: 3, gameWindowSize: gameWindowSize })
        document.getElementById("gameContainer").appendChild(this.pixiApp.view);

        // this.gameGrid.setupNewGameWithMap(this.gameGrid.gridMap1);
        this.gameGrid.setupNewGameWithMap();
        this.gameGrid.drawGrid();


        this.createCountUI();
        this.updateCountText();

        this.buyingLevels["ironOreMine1"] = 1;
        this.buyingLevels["ironPlateFactory1"] = 1;
        this.buyingLevels["ironGearFactory1"] = 1;
        this.buyingLevels["science1Lab1"] = 1;
        this.createStoreUI();
        // this.createRecipeUI();
        

        this.createTechTree();
        // this.addTechTreeItem(this.techTree.expansion3);

        this.updateRightPanel();
        this.setupUIClickHandlers();

        this.pixiApp.stage.interactive = true;
        this.pixiApp.stage.hitArea = this.pixiApp.screen;
        this.pixiApp.stage.on('pointerup', this.onDragEnd);
        this.pixiApp.stage.on('pointerupoutside', this.onDragEnd);

        this.placeCommandCenter();

        //debug section
        this.debug = false;
        if (this.debug) {
            this.inventory["ironOre"] = 10000;
            this.inventory["ironPlate"] = 99;
            this.inventory["ironGear"] = 99;
            this.inventory["engine"] = 90;
            this.inventory["greenCircuit"] = 90;
            this.inventory.science1 = 100
            this.inventory.science2 = 100
            this.handleBuy(this.storeCosts["science1Lab1"], "science1Lab1")

            //make everything 1 iron 
            for(let aStoreItem in this.storeCosts){
                this.storeCosts[aStoreItem].costs  = {ironOre: 1}
            }

            //make everything buyable 
            for(let aStoreItem in this.storeCosts){
                this.buyingLevels[aStoreItem] = 1;
            } 
            for(let aTechItem in this.techTree){
                this.techTree[aTechItem].costs = {ironOre: 1};
            }   
        }

        this.pixiApp.ticker.add(dt => {
            // console.log(dt);
            // console.log(Date.now() - this.lastTimeProductionHappened);
            this.framerate = 60 / dt;
            this.timeSinceLastProduction = Date.now() - this.lastTimeProductionHappened;
            if (Date.now() - this.lastTimeProductionHappened > 1000) {
                console.log("more than 1 second since last production step : ", this.timeSinceLastProduction)
                let timeStep = 100;
                for (let i = 0; i <= this.timeSinceLastProduction; i += timeStep) {
                    this.productionIncrement(timeStep / 1000);
                }
            } else {
                this.productionIncrement(this.timeSinceLastProduction / 1000);
            }
            if (this.debug) {
                this.updateDebug();
            }
            this.updateStorageTotals();
            this.setInventoryToStorageMax();
            this.updateCountText();
        });
    }

    ///////////////////////////////
    ////////    Dragging    ///////
    ///////////////////////////////

    onDragStart() {
        this.sprite.alpha = 0.5;
        self.dragEntity = this;
        self.dragTarget = this.sprite;
        self.pixiApp.stage.on('pointermove', self.onDragMove);

        if (self.dragEntity.enabled) {
            self.dragEntity.enabled = false;
        }

        self.removedFromBlock = self.gameGrid.blocks[Math.floor(self.dragTarget.x / self.gameGrid.blockSize)][Math.floor(self.dragTarget.y / self.gameGrid.blockSize)];
        self.removedFromBlock.occupied = false;
        self.calcRates();
    }

    onDragMove(event) {
        if (self.dragTarget) {
            self.dragTarget.parent.toLocal(event.global, null, self.dragTarget.position);
        }
    }

    onDragEnd() {
        if (self.dragTarget) {

            let placedOnBlock = self.gameGrid.blocks[Math.floor(self.dragTarget.x / self.gameGrid.blockSize)][Math.floor(self.dragTarget.y / self.gameGrid.blockSize)];
            console.log("placing ", self.dragEntity, " on ", placedOnBlock);

            // select object  
            if (placedOnBlock == self.removedFromBlock) {
                self.deselect();
                self.selectedObject = self.dragEntity;
                self.selectedObject.sprite.tint = 0.1 * 0xFFFFFF;

                self.updateRightPanel();

                console.log("selecting object ", self.selectedObject);
            }

            //snap to grid
            self.dragTarget.x = placedOnBlock.sprite.x + (self.gameGrid.blockSize / 2);
            self.dragTarget.y = placedOnBlock.sprite.y + (self.gameGrid.blockSize / 2);

            let allEntities = self.mines.concat(self.factories).concat(self.storages);
            let normalPlace = true;

            allEntities.every((thing) => {
                if (thing != self.dragEntity) {
                    if (Math.floor(thing.sprite.x) == Math.floor(self.dragEntity.sprite.x) && Math.floor(thing.sprite.y) == Math.floor(self.dragEntity.sprite.y)) {
                        if (thing.level != self.dragEntity.level || thing.type != self.dragEntity.type || thing.recipe != self.dragEntity.recipe) {
                            //move back to where it came from 
                            console.log("levels or type or recipe don't match, moving ", self.dragEntity, " back to ", self.removedFromBlock)
                            self.dragTarget.x = self.removedFromBlock.sprite.x + (self.gameGrid.blockSize / 2);
                            self.dragTarget.y = self.removedFromBlock.sprite.y + (self.gameGrid.blockSize / 2);
                            self.pixiApp.stage.off('pointermove', self.onDragMove);
                            self.dragTarget.alpha = 1;
                            self.dragTarget = null;
                            self.dragEntity = null;
                            self.calcRates();

                            normalPlace = false;
                            return false;
                        } else {
                            //merge! 
                            // TODO merging can cause a resource to go negative
                            console.log("merging ", thing, " with ", self.dragEntity);
                            
                            //TODO P1 : when merging add the crafting times of both together and add the extra for the next level 
                            // if(self.dragEntity.type == "factory"){
                            //     //add them together and if level up add half of leftovers as well 
                            //     // let timeLeftOnCrafting = self.recipes[self.dragEntity.recipe].duration - self.dragEntity.timeCrafting 
                            //     if(self.dragEntity.timeCrafting + thing.timeCrafting > self.recipes[self.dragEntity.recipe].duration){ //if combined finishes recipe 
                            //         if(self.checkIfCanAddToInventory(self.recipes[self.dragEntity.recipe].products, self.dragEntity.power())){
                            //             self.addProductsToInventory(self.recipes[self.dragEntity.recipe].products, self.dragEntity.power());
                            //             self.dragEntity.timeCrafting = ((self.dragEntity.timeCrafting + thing.timeCrafting) - self.recipes[self.dragEntity.recipe].duration) / 2
                            //         }else{
                            //             self.dragEntity.timeCrafting = self.recipes[self.dragEntity.recipe].duration;
                            //             aFactory.waitingAtFull = true;
                            //         }
                            //     }
                            //     self.dragEntity.updateProgressBar();
                            // }

                            thing.delete();

                            self.dragEntity.level += 1;
                            self.dragEntity.levelText.text = self.dragEntity.level;
                            self.dragEntity.onBlock = placedOnBlock;

                            // finish drag event stuff 
                            self.pixiApp.stage.off('pointermove', self.onDragMove);
                            self.dragTarget.alpha = 1;
                            self.dragTarget = null;
                            self.dragEntity = null;

                            self.calcRates();
                            normalPlace = false;
                            return false;
                        }
                    }
                }
                return true;
            });
            if (normalPlace) {
                placedOnBlock.occupied = true;
                self.dragEntity.onBlock = placedOnBlock;

                self.dragEntity.enabled = true;

                self.pixiApp.stage.off('pointermove', self.onDragMove);
                self.dragTarget.alpha = 1;
                self.dragTarget = null;
                self.dragEntity = null;
                self.calcRates();
            }
        }
    }

    /////////////////////////////////////////
    ////////    Inventory & Buying    ///////
    /////////////////////////////////////////


    initializeInventoryAndRates() {        
        for(let aStoreItem in this.storeCosts){
            this.buyingLevels[aStoreItem] = 0;
        }

        for (const anOre in this.ores) {
            this.inventory[anOre] = 0;
            this.rates[anOre] = 0;
        }

        for (const aRecipe in this.recipes) {
            for(const aProduct in this.recipes[aRecipe].products){
                if(!this.allProducts.includes(aProduct)){
                    this.allProducts.push(aProduct);            

                    this.inventory[aProduct] = 0;
                    this.rates[aProduct] = 0;
                    console.log(aProduct);
                }
            }
        }

    }


    handleBuy(item, name) {
        let placingBlock = this.gameGrid.findRandomEmptySpot();
        if (!placingBlock) {
            return;
        }

        let level = this.buyingLevels[name]; 

        if (this.checkIfCanBuy(item.costs, level)) {
            this.subtractCostFromInventory(item.costs, level);
        } else {
            // alert("you too poor bitch");
            return;
        }

        if (item.type == "mine") {
            let mine = new Mine({ game: this, level: level, placingBlock: placingBlock, storeName: name });
            this.mines.push(mine);
        } else if (item.type == "factory") {
            let factory = new Factory({ game: this, level: level, placingBlock: placingBlock, storeName: name });
            this.factories.push(factory);
        } else if (item.type == "storage") {
            let storage = new Storage({ game: this, level: level, placingBlock: placingBlock, storeName: name });
            this.storages.push(storage);
        }
    }

    checkTechPrerequisites(techItem){
        for(let index in techItem.prerequisites){
            if(!this.researchedTech.includes(techItem.prerequisites[index])){
                console.log("tried checking ", techItem, " but lacked ", techItem.prerequisites[index])
                return false;
            }
        }
        return true; 
    }
    
    handleTechTreeBuy(techItem){
        if(!this.checkTechPrerequisites(techItem)){
            return; 
        }

        if(this.checkIfCanBuy(techItem.costs)){
            console.log("successfully buy ", techItem);
            this.subtractCostFromInventory(techItem.costs);
            techItem.enact();
            this.researchedTech.push(techItem.name);
            this.updateTechTreeAvailability();
        }else{
            console.log("tried buying ", techItem, " but couldn't afford")
            return false;
        }
    }

    unlockStoreItem(storeItemName){

    }

    placeCommandCenter() {
        let placingBlock = this.gameGrid.blocks[Math.floor(this.gameGrid.gridHeight / 2)][Math.floor(this.gameGrid.gridWidth / 2)];
        this.commandCenter = new CommandCenter({ game: this, level: 1, placingBlock: placingBlock });

    }

    subtractCostFromInventory(costs, multiplier) {
        if (!multiplier) { multiplier = 1 }
        for (const aCost in costs) {
            this.inventory[aCost] -= costs[aCost] * multiplier;
        }
    }

    addProductsToInventory(products, multiplier) {
        if (!multiplier) { multiplier = 1 }
        for (const aProduct in products) {
            if(!products[aProduct]){
                products[aProduct] = 0;
            }
            this.inventory[aProduct] += products[aProduct] * multiplier;
            // if(aProduct == "energy"){
                // if(!this.energyStarved){
                    // this.inventory[aProduct] += products[aProduct] * multiplier;
                // }
            // }else{
            // }
        }
    }

    checkIfCanAddToInventory(products, multiplier){
        if (!multiplier) { multiplier = 1 }
        for (const aProduct in products) {
            if(this.inventory[aProduct] + products[aProduct] > this.storage[aProduct]){
                return false;
            }
        }
        return true;
    }

    checkIfCanBuy(costs, multiplier) {
        if (!multiplier) { multiplier = 1 }
        for (const aCost in costs) {
            if (this.inventory[aCost] < costs[aCost] * multiplier) {
                return false;
            }
        }
        return true;
    }



    ///////////////////////////////////////////////
    ////////    Production & Rates    /////////////
    ///////////////////////////////////////////////
    
    productionIncrement(amountTime) {
        // this.updateEnergy(amountTime);

        //command 
        // if(!this.inventory["energy"]){
            // this.inventory["energy"] = 0;
        // }
        // this.inventory["energy"] += 20 * amountTime;

        //mines 
        for (const index in this.mines) {
            let aMine = this.mines[index]
            if (aMine.onBlock.type != "dirt" && aMine.onBlock.type == aMine.recipe && !aMine.paused) {
                this.inventory[aMine.onBlock.type] += (aMine.power() / this.ores[aMine.onBlock.type].duration) * amountTime;
            }
        }
        //factories 
        for (const index in this.factories) {
            let aFactory = this.factories[index];
            if (aFactory.recipe && !aFactory.paused) {
                if (aFactory.crafting) {
                    aFactory.timeCrafting += amountTime;

                    if (aFactory.timeCrafting >= this.recipes[aFactory.recipe].duration) {
                        // console.log("Finished crafting, ", aFactory.recipe);

                        if(this.checkIfCanAddToInventory(this.recipes[aFactory.recipe].products, aFactory.power())){
                        
                            // add the excess time to timeCrafting 
                            aFactory.timeCrafting = aFactory.timeCrafting - this.recipes[aFactory.recipe].duration;
                            aFactory.updateProgressBar();

                            if (aFactory.timeCrafting >= this.recipes[aFactory.recipe].duration) {
                                alert("increment pace > production time");
                            }

                            this.addProductsToInventory(this.recipes[aFactory.recipe].products, aFactory.power());
                            aFactory.crafting = false;

                        }else{
                            //pause on finished if no storage for output - this does waste carryover but eh 
                            aFactory.timeCrafting = this.recipes[aFactory.recipe].duration;
                            aFactory.waitingAtFull = true;
                        }
                    }else{
                        aFactory.waitingAtFull = false;
                    }
                    aFactory.updateProgressBar();
                }
                if (!aFactory.crafting) {
                    //check if can start a new one 

                    if (this.checkIfCanBuy(this.recipes[aFactory.recipe].costs, aFactory.power())) {
                        aFactory.crafting = true;
                        aFactory.levelWhenStartedCrafting = aFactory.level;
                        this.calcRates()
                        this.subtractCostFromInventory(this.recipes[aFactory.recipe].costs, aFactory.power());
                    }
                }

            }
        }
        this.setCountUIHiddenOrShown()
        this.lastTimeProductionHappened = Date.now();
    }

    updateEnergy(amountTime){
        //calc total energy usage
        this.energyUse = 0;
        for (const index in this.mines) {
            let aMine = this.mines[index]
            if (aMine.onBlock.type != "dirt" && aMine.onBlock.type == aMine.recipe && !aMine.paused) {
                let type = aMine.onBlock.type;
                if(this.checkIfCanAddToInventory({type : 0.01})){
                    // console.log(" mine is running, on a block, and that block can be added to inventory");
                    this.energyUse += aMine.powerUse * aMine.power();
                }
            }
        } 
        for (const index in this.factories) {
            let aFactory = this.factories[index];
            if (aFactory.recipe && !aFactory.paused) {
                if (aFactory.crafting && aFactory.waitingAtFull != true) {
                    this.energyUse += aFactory.powerUse * aFactory.power();
                }
            }
        }
        document.getElementById("powerDemandText").innerHTML = "Usage: " + this.formatNumber(this.energyUse) + "/s ";

        this.inventory["energy"] -= this.energyUse * amountTime;

        let totalProducableEnergy = 20;//for command 
        let currentProducedEnergy = 20; 
        for (const index in this.factories) {
            let aFactory = this.factories[index];
            if(this.recipes[aFactory.recipe].products.energy){
                console.log("a factory is producing energy amount ", this.recipes[aFactory.recipe].products.energy, " with power ", aFactory.power());
                totalProducableEnergy += this.recipes[aFactory.recipe].products.energy * aFactory.power() / this.recipes[aFactory.recipe].duration;
                if (aFactory.crafting && !aFactory.waitingAtFull && !aFactory.paused) {
                    currentProducedEnergy += this.recipes[aFactory.recipe].products.energy * aFactory.power() / this.recipes[aFactory.recipe].duration;
                }    
            }
        }

        document.getElementById("powerProductionText").innerHTML = "Production: " + this.formatNumber(currentProducedEnergy);
        this.rates["energy"] -= this.energyUse;

        //if there is less than zero energy, slow production to be proportional to energy produced / energy used 
        if(this.inventory.energy > 0){
            document.getElementById("powerSatisfactionText").innerHTML = "Satisfaction: 100%"; 
        }else{
            document.getElementById("powerSatisfactionText").innerHTML = " Satisfaction" + this.formatNumber(currentProducedEnergy / this.energyUse * 100) + "%";
            this.energyStarved = true;
            this.inventory.energy = 0;
        }
        if(this.energyStarved && this.rates["energy"] > 0 && this.inventory.energy == 0){ //special case to escape stuck zero energy
            this.inventory.energy = 1; 
        }
        if(this.rates["energy"] > 0){
            this.energyStarved = false;
        }
        // console.log(multiplier)

    }

    resetRates() {
        for (const aRate in this.rates) {
            this.rates[aRate] = 0;
        }
    }

    calcRates() {
        this.resetRates();
        
        //command & energy 
        // this.rates.energy = 20;
        // this.rates.grossEnergy = 20;
        // this.rates.energy -= this.energyUse;

        //mines 
        for (const index in this.mines) {
            let aMine = this.mines[index]

            if (aMine.onBlock.type != "dirt" && aMine.onBlock.type == aMine.recipe && !aMine.paused) {
                this.rates[aMine.onBlock.type] += (aMine.power() / this.ores[aMine.onBlock.type].duration);
            }
        }

        for (const index in this.factories) {
            let aFactory = this.factories[index];
            if (aFactory.crafting && !aFactory.waitingAtFull && !aFactory.paused) {
                //add products to rates 
                for (const aProduct in this.recipes[aFactory.recipe].products) {
                    this.rates[aProduct] += this.recipes[aFactory.recipe].products[aProduct] * aFactory.power() / this.recipes[aFactory.recipe].duration;
                }
                //subtract costs from rates 
                for (const aCost in this.recipes[aFactory.recipe].costs) {
                    this.rates[aCost] -= this.recipes[aFactory.recipe].costs[aCost] * aFactory.power() / this.recipes[aFactory.recipe].duration;
                }
            }
        }


        
    }

    ///////////////////////////////
    ////////    UI    /////////////
    ///////////////////////////////

/*
    addRecipeUIElement(recipeName) {
        let newRecipeUIElement = document.createElement('img');
        newRecipeUIElement.setAttribute("class", "recipeIcon");
        newRecipeUIElement.setAttribute("src", "graphics/" + recipeName + ".png");

        newRecipeUIElement.onmousedown = () => {
            // TODO: implement crafting 
        }

        document.getElementById("recipesGrid").append(newRecipeUIElement);
    }

    createRecipeUI() {
        this.addRecipeUIElement("deselect");

        for (const aRecipe in this.recipes) {
            this.addRecipeUIElement(aRecipe);
        }
    }
    */ 

    setupUIClickHandlers(){
        document.querySelectorAll('.deleteButton').forEach(el => el.addEventListener('click', event => {
            console.log("deleting ", this.selectedObject); 

            if(!this.selectedObject){alert("trying to delete seomething but nothing selected")}
            
            
            //refund the cost of the item per store costs 
            this.addProductsToInventory(this.storeCosts[this.selectedObject.storeName].costs, this.selectedObject.level);
            
            this.selectedObject.delete();
        }));
        document.querySelectorAll('.pauseButton').forEach(el => el.addEventListener('click', event => {
            console.log("pausing / resuming ", this.selectedObject); 

            if(!this.selectedObject){alert("trying to pause/resume seomething but nothing selected")}
            
            this.selectedObject.paused = !this.selectedObject.paused;
            this.updateRightPanel();
            
        }));
    }

    setCountUIHiddenOrShown() {
        for (const aType in this.ores) {
            let aCountContainer = document.getElementById("countContainer-" + aType);
            if (this.inventory[aType] == 0) {
                aCountContainer.style.display = "none";
            } else {
                aCountContainer.style.display = "block";
            }
        }
        for (const index in this.allProducts) {
            const aProduct = this.allProducts[index]
            let aCountContainer = document.getElementById("countContainer-" + aProduct);
            if (this.inventory[aProduct] == 0) {
                aCountContainer.style.display = "none";
            } else {
                aCountContainer.style.display = "block";
            }
        }
    }

    createCountUI() {
        let addedThings = [];
        for (const anOre in this.ores) {
            this.addCountUIElement(anOre);
            addedThings.push(anOre);
        }
        for(const index in this.allProducts){
            
            const aProduct = this.allProducts[index]
            this.addCountUIElement(aProduct);
            addedThings.push(aProduct);
        }
        
        this.setCountUIHiddenOrShown()
    }

    addCountUIElement(type) {
        let newCountUIElement = document.createElement('div');
        newCountUIElement.setAttribute("class", "countContainer");
        newCountUIElement.setAttribute("id", "countContainer-" + type);

        let newCountUIElementImage = document.createElement('img');
        newCountUIElementImage.setAttribute('src', "graphics/" + type + ".png");
        newCountUIElementImage.setAttribute('width', this.countIconSize);
        newCountUIElementImage.setAttribute('height', this.countIconSize);
        newCountUIElementImage.setAttribute('class', "countImage")
        newCountUIElement.appendChild(newCountUIElementImage);

        let newCountUIElementText = document.createElement('div');
        newCountUIElementText.setAttribute("class", "countText");
        newCountUIElementText.setAttribute("id", "countText-" + type);
        newCountUIElement.appendChild(newCountUIElementText);

        let newCountUIElementRateText = document.createElement('div');
        newCountUIElementRateText.setAttribute("class", "rateText");
        newCountUIElementRateText.setAttribute("id", "rateText-" + type);
        newCountUIElement.appendChild(newCountUIElementRateText);


        document.getElementById("countContainer").append(newCountUIElement);
    }

    updateCountText() {
        self.calcRates();
        for (const aType in this.inventory) {
            // console.log(aType);
            let aCountText = document.getElementById("countText-" + aType);
            if (aCountText) {
                aCountText.innerHTML = this.formatNumber(Math.floor(this.inventory[aType])) + "   /" + this.formatNumber(this.storage[aType])
            }
            let aRateText = document.getElementById("rateText-" + aType);
            if (aRateText) {
                aRateText.innerHTML = this.formatNumber(this.rates[aType]) + " /s";
            }
        }
    }

    updateRightPanel(){
        document.getElementById("commandDetails").style.display = 'none';
        document.getElementById("factoryDetails").style.display = 'none';
        document.getElementById("mineDetails").style.display = 'none';
        document.getElementById("storageDetails").style.display = 'none';
        document.getElementById("energyDetails").style.display = 'none';
        document.getElementById("techTree").style.display = 'none';

        if(this.selectedObject){
            document.getElementById(this.selectedObject.type + "Details").style.display = '';
            if(this.selectedObject.recipe && this.selectedObject.recipe.includes("science")){
                //lab! 
                document.getElementById("techTree").style.display = '';
            }

            //if either mining or crafting, button should offer pause 
            if(this.selectedObject.paused){
                if(this.selectedObject.type == "factory"){
                    document.getElementById("pauseFactoryButton").innerHTML = "Resume";
                }
                if(this.selectedObject.type == "mine"){
                    document.getElementById("pauseMineButton").innerHTML = "Resume";
                }
            }else{
                if(this.selectedObject.type == "factory"){
                    document.getElementById("pauseFactoryButton").innerHTML = "Pause";
                }
                if(this.selectedObject.type == "mine"){
                    document.getElementById("pauseMineButton").innerHTML = "Pause";
                }
            }
        }
    }

    // Store (command) rendering 
    createStoreUI() {
        document.getElementById("storeItemsContainer").innerHTML = "";
        for (const aStoreItem in this.storeCosts) {
            if(this.buyingLevels[aStoreItem] > 0){
                this.addStoreItem(aStoreItem);
            }
        }
    }

    addStoreItem(item) {
        let newStoreUIElement = document.createElement('div');
        newStoreUIElement.setAttribute("class", "storeItemContainer");
        newStoreUIElement.setAttribute("id", "storeItemContainer-" + item);

        newStoreUIElement.onmousedown = () => {
            this.handleBuy(this.storeCosts[item], item);
        }

        let newStoreUIElementImage = document.createElement('img');
        newStoreUIElementImage.setAttribute('src', "graphics/" + item + ".png");
        newStoreUIElementImage.setAttribute('class', "storeImage")
        newStoreUIElement.appendChild(newStoreUIElementImage);

        let newCostUI = document.createElement('div');
        for (const aCost in this.storeCosts[item].costs) {
            let costAmount = this.storeCosts[item].costs[aCost] * this.buyingLevels[item]
            let newCostImage = document.createElement('img');
            newCostImage.setAttribute('src', "graphics/" + aCost + ".png");
            newCostImage.setAttribute('width', 25);
            newCostImage.setAttribute('height', 25);
            newCostImage.setAttribute('class', "costImage")
            newCostUI.innerHTML += this.formatNumber(costAmount) + " "// + aCost;
            newCostUI.appendChild(newCostImage);
        }
        newStoreUIElement.appendChild(newCostUI);
        document.getElementById("storeItemsContainer").appendChild(newStoreUIElement);
    }


    

    /// Tech rendering 
    createTechTree(){
        for(let aTech in this.techTree){
            this.addTechTreeItem(this.techTree[aTech]);
        }
        this.updateTechTreeAvailability();
    }

    addTechTreeItem(item) {
        let newItemUIElement = document.createElement('div');
        newItemUIElement.setAttribute("class", "techTreeItemContainer");
        newItemUIElement.setAttribute("id", "techTreeItem-" + item.name);

        let newItemUIElementImage = document.createElement('img');
        newItemUIElementImage.setAttribute('src', "graphics/" + item.name + ".png");
        newItemUIElementImage.setAttribute('class', "techImage")
        newItemUIElement.appendChild(newItemUIElementImage);

        let newCostUI = document.createElement('div');
        for (const aCost in this.techTree[item.name].costs) {
            let costAmount = this.techTree[item.name].costs[aCost];
            let newCostImage = document.createElement('img');
            newCostImage.setAttribute('src', "graphics/" + aCost + ".png");
            newCostImage.setAttribute('width', 25);
            newCostImage.setAttribute('height', 25);
            newCostImage.setAttribute('class', "costImage")
            newCostUI.innerHTML += this.formatNumber(costAmount) + " "// + aCost;
            newCostUI.appendChild(newCostImage);
        }
        newItemUIElement.appendChild(newCostUI);

        // newItemUIElement.onmousedown = this.handleTechTreeBuy(item);

        newItemUIElement.onmousedown = () => {
            // alert('tech');
            this.handleTechTreeBuy(item);
            // this.handleBuy(this.storeCosts[item], item);
        }

        document.getElementById("techTreeContainer").appendChild(newItemUIElement);
    }

    updateTechTreeAvailability(){
        for(let aTechName in this.techTree){
            let aTech = this.techTree[aTechName];
            if(this.researchedTech.includes(aTechName)){
                document.getElementById("techTreeItem-" + aTechName).style.display = 'none';
            }
            if(this.checkTechPrerequisites(aTech)){
                document.getElementById("techTreeItem-" + aTechName).classList.remove("greyedOut");
            }else{
                console.log(aTechName);
                // if(document.getElementById("techTreeItem-" + aTechName)){
                document.getElementById("techTreeItem-" + aTechName).classList.add("greyedOut");
                // }
            }
        }
    }

    ///////////////////////////////
    ////////    Utility    ////////
    ///////////////////////////////

    updateSizeOfDragables(){
        let allEntities = this.mines.concat(this.factories).concat(this.storages);
        allEntities.push(this.commandCenter);
        
        // allEntities.every((thing) => {
        for(let thingIndex in allEntities){
            let thing = allEntities[thingIndex];
            console.log("updating size and location of ", thing);
            thing.sprite.x = thing.onBlock.sprite.x  + (this.gameGrid.blockSize / 2);
            thing.sprite.y = thing.onBlock.sprite.y  + (this.gameGrid.blockSize / 2);
            thing.sprite.width = this.gameGrid.blockSize;
            thing.sprite.height = this.gameGrid.blockSize;    
        }
        // });
    }

    formatNumber(inputNum) {
        if (inputNum < 1000) { // 1000
            return inputNum.toLocaleString("en-US");
        } else if (inputNum < 1000000) {
            return (inputNum / 1000).toFixed(2).toLocaleString("en-US") + " k";
        } else if (inputNum < 1000000000) {
            return (inputNum / 1000000).toFixed(2).toLocaleString("en-US") + " M";
        } else if (inputNum < 1000000000000) {
            return (inputNum / 1000000000).toFixed(2).toLocaleString("en-US") + " B";
        } else if (inputNum < 1000000000000000) {
            return (inputNum / 1000000000000).toFixed(2).toLocaleString("en-US") + " T";
        }
        return parseFloat(inputNum).toExponential();
    }

    updateDebug() {
        document.getElementById("framerate").innerHTML = "[] Time since last Production (lower is better): " + this.timeSinceLastProduction + "<br>" + "[] Framerate: " + this.framerate;

    }

    deselect() {
        if (this.selectedObject) {
            this.selectedObject.sprite.tint = 0xFFFFFF;
            this.selectedObject = null;
        }
        this.updateRightPanel();
    }

    updateStorageTotals() {
        //add command center storage baselines  
        for (const index in this.allProducts) {
            let anItem = this.allProducts[index]
            this.storage[anItem] = 100;
        }
        for (const anOre in this.ores) {
            this.storage[anOre] = 100;
        }

        for (const index in this.storages) {
            let aStorage = this.storages[index];
            this.storage[aStorage.stores] += aStorage.power();
        }
    }

    setInventoryToStorageMax() {
        for (const aType in this.inventory) {
            if (this.inventory[aType] > this.storage[aType]) {
                this.inventory[aType] = this.storage[aType];
            }
        }
    }

    saveGameState(){
        let gameData = {};
        gameData.inventory = game.inventory;
        gameData.factories = game.factories;
    }

    loadGameState(gameData){
        game.inventory = gameData.inventory;

        
    }

}


function removeItem(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

let game = new Game();



// TODO Make mergable entities highlightable
// TODO Make it expandable
// TODO
// TODO Consider adding storage & electricity 
// todo a setting to have newly placed factories on or off 
// todo set the level value on store 
//// todo oil rig will place on command 
// todo don't use energy when mine is stuck on full 