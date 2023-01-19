class Block {
    game;
    type = "dirt";
    occupied = false;

    constructor({game, type = "dirt", occupied = false}){
        this.game = game;
        this.type = type;
        this.occupied = occupied;
    }

    handleClick(){
        // if(this.type != "dirt"){
            this.game.inventory[this.type] += 1;

            // console.log(this.game);
        // }

        game.deselectFactory();
    }
}

class GameGrid {
    gridWidth = 10;
    gridHeight = 10;
    blockSize;
    blocks; 
    blockContainer; 
    
    gridMap1 = [
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "C", "D", "D", "I", "I", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "I", "I", "D", "D", "C", "D", "D"],
        ["D", "D", "I", "D", "D", "I", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "C", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "C", "D", "D"],
        ["D", "D", "I", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "C", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"]
    ];

    constructor({game, gridWidth = 10, gridHeight = 10, gameWindowSize = Math.min(window.innerWidth / 2, window.innerHeight)}){
        this.game = game;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.gameWindowSize = gameWindowSize;
        this.blockSize = gameWindowSize / gridWidth; 

        this.blockContainer = new PIXI.Container();
        this.blockContainer.x = 0;
        this.blockContainer.y = 0;
        this.game.pixiApp.stage.addChild(this.blockContainer);

        this.blocks = new Array(gridHeight); 
        for (var i = 0; i < gridHeight; i++) {
            this.blocks[i] = new Array(gridWidth); 
        }
    }

    setupNewGameWithMap(gridMap){
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // console.log(gridMap[y]);
                if(gridMap[y][x] == "D"){
                    this.blocks[y][x] = new Block({game: this.game, type: "dirt", occupied:false});
                }
                if(gridMap[y][x] == "I"){
                    this.blocks[y][x] = new Block({game: this.game, type: "ironOre", occupied:false});
                }
                if(gridMap[y][x] == "C"){
                    this.blocks[y][x] = new Block({game: this.game, type: "copperOre", occupied:false});
                }
            }
        }
    }

    setupNewBasicGame(){
    
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                this.blocks[y][x] = new Block({game: this.game, type: "dirt", occupied:false});
            }
        }
        this.blocks[this.gridHeight / 2][this.gridWidth / 2].type = "ironOre";
    }
    
    drawGrid(){
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let block = this.blocks[x][y];
    
                block.sprite = PIXI.Sprite.from('graphics/' + block.type + "Tile" + '.png');
                block.sprite.cursor = 'pointer';
    
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

    findRandomEmptySpot(){  
        let emptySpots = [];
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let block = this.blocks[x][y];
                if(block.occupied == false){
                    emptySpots.push(block);
                }
            }
        }
        if(emptySpots.length > 0){
            return emptySpots[Math.floor(Math.random() * emptySpots.length)]
        }
    }

}

class Dragable {
    level;    

    constructor({game, level, placingBlock}){
        this.sprite = PIXI.Sprite.from("graphics/mine.png");

        this.levelWhenStartedCrafting = level;
        this.onBlock = placingBlock;
        this.level = level;


        this.sprite.x = placingBlock.x * game.gameGrid.blockSize + (game.gameGrid.blockSize / 2);
        this.sprite.y = placingBlock.y * game.gameGrid.blockSize + (game.gameGrid.blockSize / 2);
        this.sprite.width = game.gameGrid.blockSize;
        this.sprite.height = game.gameGrid.blockSize;
    
        placingBlock.occupied = true;
    
        this.sprite.interactive = true; 
        this.sprite.cursor = 'pointer';
        this.sprite.anchor.set(0.5);
        this.sprite.on('pointerdown', game.onDragStart, this);
    
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#ff0000', 
        });
        this.levelText = new PIXI.Text(level, style);
        this.levelText.y = -1 * (game.gameGrid.blockSize / 1.5);
        this.levelText.x = 10

        this.sprite.addChild(this.levelText);
        
        
        game.gameGrid.blockContainer.addChild(this.sprite);

    }


}

class Mine extends Dragable {
    constructor({game, level, placingBlock}){
        
        console.log("buying mine at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)
        
        super({game, level, placingBlock});

        this.sprite.texture = PIXI.Texture.from('graphics/mine.png');
        this.type = "mine"
    }

    power(){
        return Math.pow(2, this.level) / 2;
    }
}


class Factory extends Dragable {
    recipe; 
    timeCrafting;
    crafting;
    levelWhenStartedCrafting;

    constructor({game, level, placingBlock}){
        
        console.log("buying factory at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)
        
        super({game, level, placingBlock});

        this.sprite.texture = PIXI.Texture.from('graphics/factory.png');

        this.type = "factory";
        this.recipe = null;
        this.timeCrafting = 0;
        this.levelWhenStartedCrafting = level;

        this.recipeIcon = new PIXI.Sprite;
        this.recipeIcon.anchor.set(0.5);
        this.recipeIcon.width = this.sprite.width * .9;
        this.recipeIcon.height = this.sprite.height * .9;

        this.progressBarBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.progressBarBackground.width = game.gameGrid.blockSize;
        this.progressBarBackground.height = game.gameGrid.blockSize / 8;
        this.progressBarBackground.x = game.gameGrid.blockSize / -2;
        this.progressBarBackground.y = (game.gameGrid.blockSize / 2) - (game.gameGrid.blockSize / 8);

        this.progressBar = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.progressBar.tint = 0xff0000;
        this.progressBar.width = 0;// game.gameGrid.blockSize - 2;
        this.progressBar.height = (game.gameGrid.blockSize / 8) - 2;
        this.progressBar.x = (game.gameGrid.blockSize / -2) + 1;
        this.progressBar.y = (game.gameGrid.blockSize / 2) - (game.gameGrid.blockSize / 8) + 1;
        
        this.sprite.addChild(this.progressBarBackground);
        this.sprite.addChild(this.progressBar);


        // this.recipeIcon.texture = PIXI.Texture.from('graphics/ironPlate.png');
        
        this.sprite.removeChild(this.levelText);

        this.sprite.addChild(this.recipeIcon);

        this.sprite.addChild(this.levelText);
    }

    power(){
        return Math.pow(2, this.levelWhenStartedCrafting) / 2;
    }

    setRecipe(recipeName){
        this.reset();
        if(recipeName == "deselect" || !recipeName){
            this.recipe = null;
            this.crafting = false; 
            this.recipeIcon.texture = null;
        }else{
            this.recipe = recipeName;
            this.recipeIcon.texture = PIXI.Texture.from('graphics/' + recipeName + '.png');
        }
    }

    updateProgressBar(){
        if(this.crafting){
            this.progressBar.width = (game.gameGrid.blockSize - 2) * (this.timeCrafting / game.recipes[this.recipe].duration);
        }
    }

    reset(){
        if(this.recipe){
            game.addProductsToInventory(game.recipes[this.recipe].costs, this.power());
        }
        this.timeCrafting = 0;
        this.updateProgressBar();
        this.crafting = false;
    }
}


class Inventory {

}

class Game {
    pixiApp;
    gameGrid;

    lastTimeProductionHappened;
    
    mines = [];
    factories = [];
    
    countIconSize = 50;
    
    inventory = {
        dirt: 10,
        ironOre: 100,
        ironPlate: 0
    };
    rates = {
        ironOre : 0, 
        ironPlate : 0
    }
    
    buyMineLevelSet = 1;
    buyFactoryLevelSet = 1;
    
    selectedFactory;
    
    mineCosts;
    factoryCosts = Array();
    
    ores = ["dirt", "ironOre", "copperOre"]

    techTree = {
        expansion3: {cost: {dirt: 10}, prerequisites: []},
        expansion5: {cost: {dirt: 1000}, prerequisites: ["expansion3"]},
        expansion7: {cost: {dirt: 1000000}, prerequisites: ["expansion5"]},
        expansion9: {cost: {dirt: 10000000000}, prerequisites: ["expansion5"]}
    }

    recipesFactorio = {
        ironPlate : {products: {ironPlate: 1} , costs:{ironOre: 1}, duration: 3.2},
        copperPlate : {products: {copperPlate: 1} , costs:{copperOre: 1}, duration: 3.2},
        steelPlate : {products: {steelPlate: 1} , costs:{ironPlate: 5}, duration: 16},

        ironGear : {products: {ironGear: 1} , costs:{ironPlate: 2}, duration: 0.5},
        copperCable : {products: {copperCable: 2} , costs:{copperPlate: 1}, duration: 0.5},
        greenCircuit : {products: {greenCircuit: 1} , costs:{copperCable: 3}, duration: 1.25},

        inserter : {products: {inserter: 1} , costs:{greenCircuit: 1, ironGear: 1}, duration: 0.5},
        transportBelt : {products: {transportBelt: 2} , costs:{ironGear: 1, ironPlate: 1}, duration: 0.5},

        redScience : {products: {redScience: 1} , costs:{copperPlate: 1, ironGear: 1}, duration: 5},
        greenScience : {products: {greenScience: 1} , costs:{inserter: 1, transportBelt: 1}, duration: 5},
    }
    
    recipesV1V2 = {
        ironPlate : {products: {ironPlate: 1} , costs:{ironOre: 1}, duration: 5},
        copperPlate : {products: {copperPlate: 1} , costs:{copperOre: 1}, duration: 5},
        // steelPlate : {products: {steelPlate: 1} , costs:{ironPlate: 100}, duration: 5},

        ironGear : {products: {ironGear: 1} , costs:{ironPlate: 10}, duration: 10},
        copperCable : {products: {copperCable: 2} , costs:{copperPlate: 10}, duration: 10},
        // greenCircuit : {products: {greenCircuit: 1} , costs:{copperCable: 3}, duration: 1.25},        
    }

    recipes = {
        ironPlate : {products: {ironPlate: 1} , costs:{ironOre: 16}, duration: 2},
        steelPlate : {products: {steelPlate: 1} , costs:{ironPlate: 16}, duration: 5},
        ironGear : {products: {ironGear: 1} , costs:{steelPlate: 16}, duration: 10},
        
        // copperPlate : {products: {copperPlate: 1} , costs:{copperOre: 1}, duration: 5},
        // copperCable : {products: {copperCable: 2} , costs:{copperPlate: 10}, duration: 10},
        // greenCircuit : {products: {greenCircuit: 1} , costs:{copperCable: 3}, duration: 1.25},        
        
    }


    
    //doubles up to 5 then has to be processed
    mineCostsV1 = [
        {ironOre: 100},
        {ironOre: 200},
        {ironOre: 400},
        {ironOre: 800},
        {ironOre: 1600},
        {ironPlate: 1600},
        {ironPlate: 3200},
        {ironPlate: 6400},
        {ironPlate: 12800},
        {ironPlate: 25600},
        {ironGear: 5120},
        {ironGear: 10240},
        {ironGear: 20480},
        {ironGear: 40960},
        {ironGear: 81920},
    ];
    mineCostsV2 = [
        {ironOre: 100},
        {ironOre: 200},
        {ironOre: 400},
        {ironOre: 800},
        {ironOre: 1600},
        {ironPlate: 100},
        {ironPlate: 200},
        {ironPlate: 400},
        {ironPlate: 800},
        {ironPlate: 1600},
        {ironGear: 100},
        {ironGear: 200},
        {ironGear: 400},
        {ironGear: 800},
        {ironGear: 1600}
    ];
    mineCosts = [ 
        {ironOre: 100},
        {ironOre: 200},
        {ironOre: 400},
        {ironOre: 800},
        {ironOre: 1600}, // time: 1600
        {ironPlate: 100}, //time: 1600 mine time + 200 processing time 
        {ironPlate: 200},
        {ironPlate: 400},
        {ironPlate: 800},
        {ironPlate: 1600},        
        {steelPlate: 100},
        {steelPlate: 200},
        {steelPlate: 400},
        {steelPlate: 800},
        {steelPlate: 1600},
    ];
    // mineCosts = [
    //     {ironOre: 10}, 
    //     {ironPlate: 10},
    //     {steelPlate: 10}
    // ];

    factoryCosts = this.mineCosts;

    timeSinceLastProduction;
    framerate;

    dragTarget = null;
    dragEntity = null;
    removedFromBlock;
    self;

    debug = true;
    
    constructor(){
        self = this;
        this.initializeInventoryAndRates();

        // for (let i = 0; i < 100; i++) {
        //     this.factoryCosts.push({ironOre: Math.pow(2, i) * 100});
        // }
        // this.mineCosts = this.factoryCosts
        console.log("Factory Costs: ", this.factoryCosts);

        let gameWindowSize = Math.min(window.innerWidth / 2, window.innerHeight);
        this.pixiApp = new PIXI.Application({ width: gameWindowSize, height: gameWindowSize, background: '#1099bb' });
        this.gameGrid = new GameGrid({game: this, gridWidth: 10, gridHeight: 10, gameWindowSize: gameWindowSize})
        document.getElementById("gameContainer").appendChild(this.pixiApp.view);

        // this.gameGrid.setupNewGame();
        this.gameGrid.setupNewGameWithMap(this.gameGrid.gridMap1);
        this.gameGrid.drawGrid(this.gameGrid);

        this.createCountUI();

        this.updateCountText();


        document.getElementById("buyMineContainer").onmousedown = () => {
            this.handleBuy("mine");
        };
        document.getElementById("buyFactoryContainer").onmousedown = () => {
            this.handleBuy("factory");
        }


        this.createRecipeUI();
        
        document.getElementById("levelSelectSlider").addEventListener("input", () => {
            this.renderCostsOnUI();
        });


        this.pixiApp.stage.interactive = true;
        this.pixiApp.stage.hitArea = this.pixiApp.screen;
        this.pixiApp.stage.on('pointerup', this.onDragEnd);
        this.pixiApp.stage.on('pointerupoutside', this.onDragEnd);

        // TODO figure out why the fuck the first factory if built after a mine doesn't show recipe sprite - for now, make one and delete 
        this.addProductsToInventory(this.factoryCosts[0]);
        this.handleBuy("factory");
        this.factories[0].sprite.parent.removeChild(this.factories[0].sprite);
        this.factories.splice(0, 1);

        
        this.renderCostsOnUI();

        if(this.debug){
            this.inventory["ironOre"] = 10000
        }

        this.pixiApp.ticker.add(dt => {
            // console.log(dt);
            // console.log(Date.now() - this.lastTimeProductionHappened);
            this.framerate = 60 / dt;
            this.timeSinceLastProduction = Date.now() - this.lastTimeProductionHappened;
            if(Date.now() - this.lastTimeProductionHappened > 1000){
                console.log("more than 1 second since last production step : ", this.timeSinceLastProduction)
                let timeStep = 100;
                for (let i = 0; i <= this.timeSinceLastProduction; i += timeStep) {
                    this.productionIncrement(timeStep / 1000);
                }
            }else{
                this.productionIncrement(this.timeSinceLastProduction / 1000);
            }
            if(this.debug){
                this.updateDebug();
            }
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
        
        if(self.dragEntity.enabled){
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
            console.log("placing ",  self.dragEntity, " on ", placedOnBlock);

            // select factory 
            if(placedOnBlock == self.removedFromBlock && self.dragEntity.type == "factory"){
                self.deselectFactory();
                self.selectedFactory = self.dragEntity;
                self.selectedFactory.sprite.tint = 0.1 * 0xFFFFFF;
                
                console.log("selecting factory ", self.selectedFactory);
            }
    
            //snap to grid
            self.dragTarget.x = placedOnBlock.sprite.x + (self.gameGrid.blockSize / 2);
            self.dragTarget.y = placedOnBlock.sprite.y + (self.gameGrid.blockSize / 2);

            let minesAndFactories = self.mines.concat(self.factories);
            let normalPlace = true;
            
            minesAndFactories.every((thing) => {
                if(thing != self.dragEntity){
                    if(Math.floor(thing.sprite.x) == Math.floor(self.dragEntity.sprite.x) && Math.floor(thing.sprite.y) == Math.floor(self.dragEntity.sprite.y)){                        
                        if(thing.level != self.dragEntity.level || thing.type != self.dragEntity.type){
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
                        }else{
                            //merge! 
                            // TODO merging can cause a resource to go negative 
                            console.log("merging ", thing, " with ", self.dragEntity);
                            
                            thing.sprite.parent.removeChild(thing.sprite);

                            if(thing.type == "mine"){
                                removeItem(self.mines, thing);
                            }
                            if(thing.type == "factory"){
                                if(!self.dragEntity.recipe){
                                    self.dragEntity.setRecipe(thing.recipe);
                                }
                                thing.reset();

                                removeItem(self.factories, thing);
                            }
    
                            self.dragEntity.level += 1;
                            self.dragEntity.levelText.text = self.dragEntity.level;
                            self.dragEntity.onBlock = placedOnBlock;
                            
                            // finish drag event stuff 
                            self.pixiApp.stage.off('pointermove', self.onDragMove);
                            self.dragTarget.alpha = 1;
                            self.dragTarget = null;
                            self.dragEntity = null;
    
                            // console.log("mines: ", mines);
                            // return materials 
                            if(thing.type == "factory"){
                            }

                            self.calcRates();
                            normalPlace = false;
                            return false;
                        }
                    }
                }
                return true;
            });
            if(normalPlace){
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

    
    initializeInventoryAndRates(){
        for(const anOre in this.ores){
            this.inventory[this.ores[anOre]] = 0;
            this.rates[this.ores[anOre]] = 0;
        }
        
        for(const aRecipe in this.recipes){
            this.inventory[aRecipe] = 0;
            this.rates[aRecipe] = 0;
        }

    }


    handleBuy(type){
        let placingBlock = this.gameGrid.findRandomEmptySpot();
        if(!placingBlock){
            return;
        }

        if(type == "mine"){
            let level = this.buyMineLevelSet;
            if(this.checkIfCanBuy(this.mineCosts[level - 1])){
                this.subtractCostFromInventory(this.mineCosts[level - 1], 1);
            }else{
                alert("you too poor bitch");
                return;
            }

            let mine = new Mine({game: this, level: level, placingBlock: placingBlock});
            this.mines.push(mine);
        }else if(type == "factory"){
            let level = this.buyFactoryLevelSet;
            if(this.checkIfCanBuy(this.factoryCosts[level - 1])){
                this.subtractCostFromInventory(this.factoryCosts[level - 1], 1);
            }else{
                alert("you too poor bitch");
                return;
            }
            
            let factory = new Factory({game: this, level: level, placingBlock: placingBlock});
            this.factories.push(factory);
        }

        this.renderCostsOnUI();
    }
    
    subtractCostFromInventory(costs, multiplier){
        if(!multiplier){multiplier = 1}
        for(const aCost in costs){
            this.inventory[aCost] -= costs[aCost] * multiplier;
        }
        this.updateLevelPicker();
    }

    addProductsToInventory(products, multiplier){
        if(!multiplier){multiplier = 1}
        for(const aProduct in products){
            // if(!products[aProduct]){
            //     products[aProduct] = 0;
            // }
            this.inventory[aProduct] += products[aProduct] * multiplier;

        }
    }
    
    checkIfCanBuy(costs, multiplier){
        if(!multiplier){multiplier = 1}
        for(const aCost in costs){
            if(this.inventory[aCost] < costs[aCost] * multiplier){
                return false; 
            }
        }
        return true;
    }

    createRecipeUI(){
        this.addRecipeUIElement("deselect");

        for(const aRecipe in this.recipes){
            this.addRecipeUIElement(aRecipe);
        }
    }

    
    ///////////////////////////////////////////////
    ////////    Production & Rates    /////////////
    ///////////////////////////////////////////////

    
    productionIncrement(amountTime) {
        for(const index in this.mines){
            let aMine = this.mines[index]
            this.inventory[aMine.onBlock.type] += aMine.power() * amountTime;
        }
        for(const index in this.factories){
            let aFactory = this.factories[index];
            if(aFactory.recipe){
                if(aFactory.crafting){
                    aFactory.timeCrafting += amountTime; 
                    if(aFactory.timeCrafting >= this.recipes[aFactory.recipe].duration){
                        // console.log("Finished crafting, ", aFactory.recipe);
                        // add the excess time to timeCrafting 
                        aFactory.timeCrafting = aFactory.timeCrafting - this.recipes[aFactory.recipe].duration;
                        aFactory.updateProgressBar();

                        if(aFactory.timeCrafting >= this.recipes[aFactory.recipe].duration){
                            alert("increment pace > production time");
                        }

                        // this.inventory[aFactory.recipe] += 1;
                        this.addProductsToInventory(this.recipes[aFactory.recipe].products, aFactory.power());
                        aFactory.crafting = false;
                    }
                    aFactory.updateProgressBar();
                }
                if(!aFactory.crafting){
                    //check if can start a new one 
                    let canCraft = true;

                    if(this.checkIfCanBuy(this.recipes[aFactory.recipe].costs, aFactory.power())){
                        aFactory.crafting = true;
                        aFactory.levelWhenStartedCrafting = aFactory.level;
                        this.calcRates()
                        this.subtractCostFromInventory(this.recipes[aFactory.recipe].costs, aFactory.power());
                    }
                }
                
            }
        }
        this.setCountUIHiddenOrShown()
        this.updateLevelPicker();
        this.lastTimeProductionHappened = Date.now();
    }

    
    resetRates(){
        for(const aRate in this.rates){
            this.rates[aRate] = 0;
        }
    }


    calcRates(){
        this.resetRates();
        for(const index in this.mines){
            let aMine = this.mines[index]
            
            this.rates[aMine.onBlock.type] += aMine.power();
            
        }

        for(const index in this.factories){
            let aFactory = this.factories[index];
            if(aFactory.crafting){
                //add products to rates 
                for(const aProduct in this.recipes[aFactory.recipe].products){
                    this.rates[aProduct] += this.recipes[aFactory.recipe].products[aProduct] * aFactory.power() / this.recipes[aFactory.recipe].duration;
                }
                //subtract costs from rates 
                for(const aCost in this.recipes[aFactory.recipe].costs){
                    this.rates[aCost] -= this.recipes[aFactory.recipe].costs[aCost] * aFactory.power() / this.recipes[aFactory.recipe].duration;
                }
            }
        }
    }

    ///////////////////////////////
    ////////    UI    /////////////
    ///////////////////////////////


    addRecipeUIElement(recipeName){
        let newRecipeUIElement = document.createElement('img');
        newRecipeUIElement.setAttribute("class", "recipeIcon");
        newRecipeUIElement.setAttribute("src", "graphics/" + recipeName + ".png");

        newRecipeUIElement.onmousedown = () => {
            // set factory recipe 
            if(this.selectedFactory){
                // If recipe changes mid craft, return items and reset crafting 
                if(this.selectedFactory.crafting){
                    this.selectedFactory.reset();
                }

                console.log("Setting recipe: ", recipeName);
                this.selectedFactory.setRecipe(recipeName);

                self.calcRates();

                
            }
        }

        document.getElementById("recipesGrid").append(newRecipeUIElement);    

    }

    setCountUIHiddenOrShown(){
        for(const aType in this.ores){
            let aCountContainer = document.getElementById("countContainer-" + this.ores[aType]);
            if(this.inventory[this.ores[aType]] == 0){
                aCountContainer.style.display = "none";
            }else{
                aCountContainer.style.display = "block";
            }
        }
        for(const aType in this.recipes){
            let aCountContainer = document.getElementById("countContainer-" + aType);
            if(this.inventory[aType] == 0){
                aCountContainer.style.display = "none";
            }else{
                aCountContainer.style.display = "block";
            }
        }
    }

    createCountUI(){
        for(const anOre in this.ores){
            this.addCountUIElement(this.ores[anOre]);
        }
        for(const aRecipe in this.recipes){
            this.addCountUIElement(aRecipe);
        }
        this.setCountUIHiddenOrShown()
    }
    
    addCountUIElement(type){
        let newCountUIElement = document.createElement('div');
        newCountUIElement.setAttribute("class", "countContainer")
        newCountUIElement.setAttribute("id", "countContainer-" + type)
        
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

    renderCostsOnUI(){

        let sliderValue = parseInt(document.getElementById("levelSelectSlider").value);
        this.buyMineLevelSet = sliderValue;
        this.buyFactoryLevelSet = sliderValue;
        document.getElementById("buyMineLevelText").innerHTML = sliderValue;
        document.getElementById("buyFactoryLevelText").innerHTML = sliderValue;
        
        let buyMineCostUI = document.getElementById("buyMineCost");
        let buyFactoryCostUI = document.getElementById("buyFactoryCost");

        let newUI = document.createElement('div');
        for(const aCost in this.mineCosts[this.buyMineLevelSet - 1]){
            let costAmount = this.mineCosts[this.buyMineLevelSet - 1][aCost]
            let newCostImage = document.createElement('img');
            newCostImage.setAttribute('src', "graphics/" + aCost + ".png");
            newCostImage.setAttribute('width', 25);
            newCostImage.setAttribute('height', 25);
            newCostImage.setAttribute('class', "costImage")
            newUI.innerHTML += this.formatNumber(costAmount) + " "// + aCost;
            newUI.appendChild(newCostImage);
        }
        buyMineCostUI.innerHTML = newUI.innerHTML;
        buyFactoryCostUI.innerHTML = newUI.innerHTML;
    }

    updateCountText(){
        self.calcRates();
        for (const aType in this.inventory){
            // console.log(aType);
            let aCountText = document.getElementById("countText-" + aType);
            if(aCountText){
                aCountText.innerHTML = this.formatNumber(Math.floor(this.inventory[aType]));
            }
            let aRateText = document.getElementById("rateText-" + aType);
            if(aRateText){
                aRateText.innerHTML = this.formatNumber(this.rates[aType])  + " /s";
            }
        }
    }

    
    updateLevelPicker(){
        //increment up until you can't pay 
        let maxLevel = 0; 
        for(const index in this.mineCosts){
            if(this.checkIfCanBuy(this.mineCosts[index])){
                maxLevel = parseInt(index) + 1;
            }
        }
        if(maxLevel == 0){
            document.getElementById("buyFactoryImage").classList.add("greyedOut");
            document.getElementById("buyMineImage").classList.add("greyedOut");
        }else{
            document.getElementById("buyFactoryImage").classList.remove("greyedOut");
            document.getElementById("buyMineImage").classList.remove("greyedOut");
        }

        // console.log("max level purchasable: ", maxLevel);
        document.getElementById("levelSelectSlider").max = maxLevel
        
    }

    ///////////////////////////////
    ////////    Utility    ////////
    ///////////////////////////////

    formatNumber(inputNum){
        if(inputNum < 10000000){
            return inputNum.toLocaleString("en-US");
        }
        return parseFloat(inputNum).toExponential();
    }

    updateDebug(){
        document.getElementById("framerate").innerHTML = "[] Time since last Production (lower is better): " + this.timeSinceLastProduction + "<br>" + "[] Framerate: " + this.framerate;

    }

    deselectFactory(){
        if(this.selectedFactory){
            this.selectedFactory.sprite.tint = 0xFFFFFF;
            this.selectedFactory = null;      
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

