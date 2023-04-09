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
        ["D", "D", "I", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "I", "D", "D", "I", "I", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "I", "I", "D", "D", "C", "D", "D"],
        ["D", "D", "I", "D", "D", "I", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "C", "D", "D"],
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

    expandGridDownRight1Random() {
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

            this.blocks[y].push(new Block({ game: this.game, type: pickedType, occupied: false }))
        }
        this.gridWidth += 1;

        let newRow = new Array(this.gridWidth);
        for (let x = 0; x < this.gridWidth; x++) {
            let randomNum = Math.random();
            let pickedType;
            for(let aType in this.rateRanges){
                if(randomNum < this.rateRanges[aType]){
                    pickedType = aType;
                    // console.log("picked block type: ", pickedType)
                    break;
                }
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

    constructor({ game, level, placingBlock, recipe , storeName}) {
        this.sprite = PIXI.Sprite.from("graphics/mine.png");

        this.levelWhenStartedCrafting = level;
        this.onBlock = placingBlock;
        this.level = level;
        this.recipe = recipe;
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
    constructor({ game, level, placingBlock, recipe, storeName }) {

        console.log("buying mine at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)

        super({ game, level, placingBlock, recipe, storeName });

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

    constructor({ game, level, placingBlock, recipe, storeName }) {

        console.log("buying factory at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)

        super({ game, level, placingBlock, recipe, storeName });

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

    constructor({ game, level, placingBlock, recipe, storeName }) {

        console.log("buying factory at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)

        super({ game, level, placingBlock, storeName });

        this.stores = recipe;

        this.type = "storage"

    }

    power() {
        switch (this.level) {
            case 1:
                return 10
            case 2:
                return 25
            case 3:
                return 50
            case 4:
                return 100
            case 5:
                return 250
            case 6:
                return 500
            case 7:
                return 1000
            case 8:
                return 2500
            case 9:
                return 5000
            case 10:
                return 10000
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

    countIconSize = 50;

    inventory = {};
    rates = {}
    storage = {}

    buyMineLevelSet = 1;
    buyFactoryLevelSet = 1;

    selectedObject;

    techTree = {
        expansion4: {
            name: "expansion4", costs: { science1: 10 }, prerequisites: [], enact: () => {
                this.gameGrid.expandGridDownRight1Random();
            }
        },
        expansion5: {
            name: "expansion5", costs: { science1: 100 }, prerequisites: ["expansion4"], enact: () => {
                this.gameGrid.expandGridDownRight1Random();
            }
        },
        expansion6: {
            name: "expansion6", costs: { science1: 1000 }, prerequisites: ["expansion5"], enact: () => {
                this.gameGrid.expandGridDownRight1Random();
            }
        },
        expansion7: {
            name: "expansion7", costs: { science1: 10000 }, prerequisites: ["expansion6"], enact: () => {
                this.gameGrid.expandGridDownRight1Random();
            }
        }
    }


    ores = {
        ironOre: { duration: 1 },
        copperOre: { duration: 2 }
    }

    recipes = { // V5
        ironPlate: { products: { ironPlate: 1 }, costs: { ironOre: 2 }, duration: 2 },
        copperPlate: { products: { copperPlate: 1 }, costs: { copperOre: 10 }, duration: 4 },

        ironGear: { products: { ironGear: 1 }, costs: { ironPlate: 2 }, duration: 5 },
        copperCable: { products: { copperCable: 2 }, costs: { copperPlate: 2 }, duration: 4 },

        engine: { products: { engine: 1 }, costs: { ironGear: 2, ironPlate: 10 }, duration: 8 },
        greenCircuit: { products: { greenCircuit: 1 }, costs: { copperCable: 10, copperPlate: 20 }, duration: 10 },

        science1: { products: { science1: 1 }, costs: { ironGear: 5, ironPlate: 10 }, duration: 8},
    }

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
        ironOreMine1: { type: "mine", costs: { ironOre: 10 }, produces: "ironOre" },
        copperOreMine1: { type: "mine", costs: { copperOre: 10 }, produces: "copperOre" },

        ironPlateFactory1: { type: "factory", costs: { ironOre: 20 }, produces: "ironPlate" },
        copperPlateFactory1: { type: "factory", costs: { copperOre: 20 }, produces: "copperPlate" },

        ironGearFactory: { type: "factory", costs: { ironPlate: 10 }, produces: "ironGear" },

        science1Lab1: { type: "factory", costs: { ironGear: 10 }, produces: "science1" },
        
        ironOreStorage1: { type: "storage", costs: { ironOre: 50}, stores: "ironOre" },
        copperOreStorage1: { type: "storage", costs: { copperOre: 50 }, stores: "copperOre" },
        ironPlateStorage1: { type: "storage", costs: { ironPlate: 50 }, stores: "ironPlate" },
        science1Storage1: { type: "storage", costs: { ironPlate: 100 }, stores: "science1" },
    }

    buyingLevels = {};

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


        let gameWindowSize = Math.min(window.innerWidth / 2, window.innerHeight);
        this.pixiApp = new PIXI.Application({ width: gameWindowSize, height: gameWindowSize, background: '#1099bb' });
        this.gameGrid = new GameGrid({ game: this, gridWidth: 3, gridHeight: 3, gameWindowSize: gameWindowSize })
        document.getElementById("gameContainer").appendChild(this.pixiApp.view);

        // this.gameGrid.setupNewGameWithMap(this.gameGrid.gridMap1);
        this.gameGrid.setupNewGameWithMap();
        this.gameGrid.drawGrid();


        this.createCountUI();
        this.updateCountText();

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

        if (this.debug) {
            this.inventory["ironOre"] = 10000;
            this.inventory["ironPlate"] = 99;

            //Todo make costs nothing 
            for(let aStoreItem in this.storeCosts){
                // this.storeCosts
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
                        if (thing.level != self.dragEntity.level || thing.type != self.dragEntity.type) {
                            //move back to where it came from 
                            console.log("levels or type don't match, moving ", self.dragEntity, " back to ", self.removedFromBlock)
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
                            //TODO: if one is not crafting, destroy that one instead to preserve progress 


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
            this.buyingLevels[aStoreItem] = 1;
        }
        
        for (const anOre in this.ores) {
            this.inventory[anOre] = 0;
            this.rates[anOre] = 0;
        }

        for (const aRecipe in this.recipes) {
            this.inventory[aRecipe] = 0;
            this.rates[aRecipe] = 0;
        }

    }


    handleBuy(item, name) {
        let placingBlock = this.gameGrid.findRandomEmptySpot();
        if (!placingBlock) {
            return;
        }

        let level = this.buyingLevels[name]; //TODO: update to pull from the right level settings based on research 

        if (this.checkIfCanBuy(item.costs, level)) {
            this.subtractCostFromInventory(item.costs, level);
        } else {
            alert("you too poor bitch");
            return;
        }

        if (item.type == "mine") {
            let mine = new Mine({ game: this, level: level, placingBlock: placingBlock, recipe: item.produces, storeName: name });
            this.mines.push(mine);
        } else if (item.type == "factory") {
            let factory = new Factory({ game: this, level: level, placingBlock: placingBlock, recipe: item.produces, storeName: name });
            this.factories.push(factory);
        } else if (item.type == "storage") {
            let storage = new Storage({ game: this, level: level, placingBlock: placingBlock, recipe: item.stores, storeName: name });
            this.storages.push(storage);
        }
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
        for (const index in this.mines) {
            let aMine = this.mines[index]
            if (aMine.onBlock.type != "dirt" && aMine.onBlock.type == aMine.recipe && !aMine.paused) {
                this.inventory[aMine.onBlock.type] += (aMine.power() / this.ores[aMine.onBlock.type].duration) * amountTime;
            }
        }
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


    resetRates() {
        for (const aRate in this.rates) {
            this.rates[aRate] = 0;
        }
    }


    calcRates() {
        this.resetRates();
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
        for (const aType in this.recipes) {
            let aCountContainer = document.getElementById("countContainer-" + aType);
            if (this.inventory[aType] == 0) {
                aCountContainer.style.display = "none";
            } else {
                aCountContainer.style.display = "block";
            }
        }
    }

    createCountUI() {
        for (const anOre in this.ores) {
            this.addCountUIElement(anOre);
        }
        for (const aRecipe in this.recipes) {
            this.addCountUIElement(aRecipe);
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
        for (const aStoreItem in this.storeCosts) {
            this.addStoreItem(aStoreItem);
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
    }

    addTechTreeItem(item) {
        let newItemUIElement = document.createElement('div');
        newItemUIElement.setAttribute("class", "techTreeItemContainer");
        newItemUIElement.setAttribute("id", "techTreeItem-" + item.name);

        let newItemUIElementImage = document.createElement('img');
        newItemUIElementImage.setAttribute('src', "graphics/" + item.name + "Tech.png");
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

        //TODO0: update to actually check cost and subtract 
        newItemUIElement.onmousedown = item.enact;

        document.getElementById("techTreeContainer").appendChild(newItemUIElement);
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
        for (const anItem in this.recipes) {
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