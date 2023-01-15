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
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "C", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "C", "D"],
        ["D", "D", "I", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        ["D", "D", "I", "D", "D", "D", "D", "D", "C", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"]
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
    constructor({game, level, placingBlock}){
        this.sprite = PIXI.Sprite.from("graphics/mine.png");

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
            fill: '#ffffff', 
        });
        this.levelText = new PIXI.Text(level, style);
    
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

        this.recipeIcon = new PIXI.Sprite;
        this.recipeIcon.anchor.set(0.5);
        this.recipeIcon.width = this.sprite.width * .9;
        this.recipeIcon.height = this.sprite.height * .9;

        // this.recipeIcon.texture = PIXI.Texture.from('graphics/ironPlate.png');
        
        this.sprite.removeChild(this.levelText);

        this.sprite.addChild(this.recipeIcon);

        this.sprite.addChild(this.levelText);
    }

    setRecipe(recipeName){
        if(recipeName == "deselect" || !recipeName){
            this.recipe = null;
            this.crafting = false; 
            this.recipeIcon.texture = null;
        }else{
            this.recipe = recipeName;
            this.recipeIcon.texture = PIXI.Texture.from('graphics/' + recipeName + '.png');
        }
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

    ores = ["dirt", "ironOre", "copperOre"]

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

    recipes = this.recipesFactorio;

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

    mineCosts = [
        {ironOre: 10}, 
        {ironPlate: 10},
        {steelPlate: 10}
    ];

    factoryCosts = this.mineCosts;

    dragTarget = null;
    dragEntity = null;
    removedFromBlock;
    self;

    mode = "exponential";
    debug = true;
    
    constructor(){
        self = this;
        this.initializeInventoryAndRates()

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
            this.handleBuyMine();
        };
        document.getElementById("buyFactoryContainer").onmousedown = () => {
            this.handleBuyFactory();
        }


        this.createRecipeUI();
        
        document.getElementById("levelSelectSlider").addEventListener("input", () => {
            let sliderValue = parseInt(document.getElementById("levelSelectSlider").value);
            this.buyMineLevelSet = sliderValue;
            this.buyFactoryLevelSet = sliderValue;
            document.getElementById("buyMineLevelText").innerHTML = sliderValue;
            document.getElementById("buyFactoryLevelText").innerHTML = sliderValue;
            this.renderCostsOnUI();
        });


        this.pixiApp.stage.interactive = true;
        this.pixiApp.stage.hitArea = this.pixiApp.screen;
        this.pixiApp.stage.on('pointerup', this.onDragEnd);
        this.pixiApp.stage.on('pointerupoutside', this.onDragEnd);

        // TODO figure out why the fuck the first factory if built after a mine doesn't show recipe sprite - for now, make one and delete 
        this.addProductsToInventory(this.factoryCosts[0]);
        this.handleBuyFactory();
        this.factories[0].sprite.parent.removeChild(this.factories[0].sprite);
        this.factories.splice(0, 1);

        
        this.renderCostsOnUI();

        if(this.debug){
            this.inventory["ironOre"] = 1000
        }

        this.pixiApp.ticker.add(dt => {
            // console.log(dt);
            // console.log(Date.now() - this.lastTimeProductionHappened);
            let timeSinceLastProduction = Date.now() - this.lastTimeProductionHappened;
            if(Date.now() - this.lastTimeProductionHappened > 1000){
                console.log("more than 1 second since last production step : ", timeSinceLastProduction)
                let timeStep = 100;
                for (let i = 0; i <= timeSinceLastProduction; i += timeStep) {
                    this.productionIncrement(timeStep / 1000);
                }
            }else{
                this.productionIncrement(timeSinceLastProduction / 1000);
            }
            this.updateCountText();
        });
    }

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
    
            //merge check mines 
            if(self.dragEntity.type == "mine"){
                for(const index in self.mines){
                    if(self.mines[index] != self.dragEntity){
                        // console.log("checking ", mines[index], " against ", dragEntity);
                        if(Math.floor(self.mines[index].sprite.x) == Math.floor(self.dragEntity.sprite.x) && Math.floor(self.mines[index].sprite.y) == Math.floor(self.dragEntity.sprite.y)){
                            if(self.mines[index].level == self.dragEntity.level){
                                console.log("merging ", self.mines[index], " with ", self.dragEntity);
                                
                                self.mines[index].sprite.parent.removeChild(self.mines[index].sprite);
                                self.mines.splice(index, 1)
                                // mines[index].sprite.destroy({children:true, texture:true, baseTexture:true});
        
                                self.dragEntity.level += 1;
                                self.dragEntity.levelText.text = self.dragEntity.level;
                                self.dragEntity.onBlock = placedOnBlock;
                                
                                // finish drag event stuff 
                                self.pixiApp.stage.off('pointermove', self.onDragMove);
                                self.dragTarget.alpha = 1;
                                self.dragTarget = null;
                                self.dragEntity = null;
        
                                // console.log("mines: ", mines);
                                self.calcRates();
                                return;
                            }else{ 
                                //move the thing back where it came from 
                                console.log("levels don't match, moving ", self.dragEntity, " back to ", self.removedFromBlock)
                                self.dragTarget.x = self.removedFromBlock.sprite.x + (self.gameGrid.blockSize / 2);
                                self.dragTarget.y = self.removedFromBlock.sprite.y + (self.gameGrid.blockSize / 2);
                                self.pixiApp.stage.off('pointermove', self.onDragMove);
                                self.dragTarget.alpha = 1;
                                self.dragTarget = null;
                                self.dragEntity = null;
                                self.calcRates();
                                return;
                            }
        
                        }
                    }
                }
            }
            if(self.dragEntity.type == "factory"){
                for(const index in self.factories){
                    if(self.factories[index] != self.dragEntity){
                        // console.log("checking ", factories[index], " against ", dragEntity);
                        if(Math.floor(self.factories[index].sprite.x) == Math.floor(self.dragEntity.sprite.x) && Math.floor(self.factories[index].sprite.y) == Math.floor(self.dragEntity.sprite.y)){
                            if(self.factories[index].level == self.dragEntity.level){
                                console.log("merging ", self.factories[index], " with ", self.dragEntity);
                                
                                if(!self.dragEntity.recipe){
                                    self.dragEntity.setRecipe(self.factories[index].recipe);
                                }
                                self.factories[index].sprite.parent.removeChild(self.factories[index].sprite);
                                self.factories.splice(index, 1)
                                // factories[index].sprite.destroy({children:true, texture:true, baseTexture:true});

                                self.dragEntity.level += 1;
                                self.dragEntity.levelText.text = self.dragEntity.level;
                                self.dragEntity.onBlock = placedOnBlock;
        
                                // finish drag event stuff 
                                self.pixiApp.stage.off('pointermove', self.onDragMove);
                                self.dragTarget.alpha = 1;
                                self.dragTarget = null;
                                self.dragEntity = null;
        
                                // console.log("mines: ", mines);
                                self.calcRates();
                                return;
                            }else{
                                //move the thing back where it came from 
                                onsole.log("levels don't match, moving ", self.dragEntity, " back to ", self.removedFromBlock)
                                self.dragTarget.x = self.removedFromBlock.sprite.x + (self.gameGrid.blockSize / 2);
                                self.dragTarget.y = self.removedFromBlock.sprite.y + (self.gameGrid.blockSize / 2);
                                self.pixiApp.stage.off('pointermove', self.onDragMove);
                                self.dragTarget.alpha = 1;
                                self.dragTarget = null;
                                self.dragEntity = null;
                                self.calcRates();
                                return;
                            }
                        }
                    }
                }
            }
            
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

    handleBuyMine(){
        let level = this.buyMineLevelSet;
        if(this.checkIfCanBuy(this.mineCosts[level - 1])){
            this.subtractCostFromInventory(this.mineCosts[level - 1], 1);
        }else{
            alert("you too poor bitch");
            return;
        }

        let placingBlock = this.gameGrid.findRandomEmptySpot();
        if(!placingBlock){
            return;
        }

        let mine = new Mine({game: this, level: level, placingBlock: placingBlock});

        this.mines.push(mine);
    }

    handleBuyFactory(){
        let level = this.buyFactoryLevelSet;
        if(this.checkIfCanBuy(this.factoryCosts[level - 1])){
            this.subtractCostFromInventory(this.factoryCosts[level - 1], 1);
        }else{
            alert("you too poor bitch");
            return;
        }

        let placingBlock = this.gameGrid.findRandomEmptySpot();
        if(!placingBlock){
            return;
        }

        let factory = new Factory({game: this, level: level, placingBlock: placingBlock});

        this.factories.push(factory);
    }
    
    subtractCostFromInventory(costs, multiplier){
        if(!multiplier){multiplier = 1}
        for(const aCost in costs){
            this.inventory[aCost] -= costs[aCost] * multiplier;
        }
    }

    addProductsToInventory(products, multiplier){
        if(!multiplier){multiplier = 1}
        for(const aProduct in products){
            // if(!products[aProduct]){
            //     products[aProduct] = 0;
            // }
            if(this.mode == "linear"){
                this.inventory[aProduct] += products[aProduct] * multiplier;
            }else if(this.mode == "exponential"){
                this.inventory[aProduct] += products[aProduct] * Math.pow(2, multiplier) / 2;
            }
        }
    }
    
    checkIfCanBuy(costs){
        for(const aCost in costs){
            if(this.inventory[aCost] < costs[aCost]){
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

    addRecipeUIElement(recipeName){
        let newRecipeUIElement = document.createElement('img');
        newRecipeUIElement.setAttribute("class", "recipeIcon");
        newRecipeUIElement.setAttribute("src", "graphics/" + recipeName + ".png");
        newRecipeUIElement.onmousedown = () => {
            // set factory recipe 
            if(this.selectedFactory){
                // If recipe changes mid craft, return items and reset crafting 
                if(this.selectedFactory.crafting){
                    this.addProductsToInventory(this.recipes[this.selectedFactory.recipe], this.selectedFactory.levelWhenStartedCrafting);
                }

                console.log("Setting recipe: ", recipeName);
                this.selectedFactory.setRecipe(recipeName);
                self.calcRates();

                
            }
        }

        document.getElementById("recipesGrid").append(newRecipeUIElement);    

    }


    createCountUI(){
        for(const anOre in this.ores){
            this.addCountUIElement(this.ores[anOre]);
        }
        for(const aRecipe in this.recipes){
            this.addCountUIElement(aRecipe);
        }
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
            newUI.innerHTML += costAmount + " "// + aCost;
            newUI.appendChild(newCostImage);
        }
        buyMineCostUI.innerHTML = newUI.innerHTML;
        buyFactoryCostUI.innerHTML = newUI.innerHTML;
    }

    resetRates(){
        for(const aRate in this.rates){
            this.rates[aRate] = 0;
        }
    }

    updateCountText(){
        self.calcRates();
        for (const aType in this.inventory){
            // console.log(aType);
            let aCountText = document.getElementById("countText-" + aType);
            if(aCountText){
                aCountText.innerHTML = Math.floor(this.inventory[aType]);
            }
            let aRateText = document.getElementById("rateText-" + aType);
            if(aRateText){
                aRateText.innerHTML = this.rates[aType].toFixed(2);  + " /s";
            }
        }
    }

    productionIncrement(amountTime) {
        for(const index in this.mines){
            let aMine = this.mines[index]
            if(this.mode == "linear"){
                this.inventory[aMine.onBlock.type] += aMine.level * amountTime;
            }else if(this.mode == "exponential"){
                this.inventory[aMine.onBlock.type] += (Math.pow(2, aMine.level) / 2) * amountTime;
            }
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

                        if(aFactory.timeCrafting >= this.recipes[aFactory.recipe].duration){
                            alert("increment pace > production time");
                        }

                        // this.inventory[aFactory.recipe] += 1;
                        this.addProductsToInventory(this.recipes[aFactory.recipe].products, aFactory.levelWhenStartedCrafting);
                        aFactory.crafting = false;
                    }
                }
                if(!aFactory.crafting){
                    //check if can start a new one 
                    let canCraft = true;
                    let costs = this.recipes[aFactory.recipe].costs; 
                    for(const aCost in costs){
                        if(this.inventory[aCost] < costs[aCost] * aFactory.level){
                            canCraft = false; 
                        }
                    }
                    if(canCraft){
                        aFactory.crafting = true;
                        aFactory.levelWhenStartedCrafting = aFactory.level;
                        this.calcRates()
                        if(this.mode == "linear"){
                            this.subtractCostFromInventory(costs, aFactory.level);
                        }else if(this.mode == "exponential"){
                            this.subtractCostFromInventory(costs, Math.pow(2, aFactory.level) / 2);
                        }
                    }
                }
                
            }
        }
        this.lastTimeProductionHappened = Date.now();
    }

    calcRates(){
        this.resetRates();
        for(const index in this.mines){
            let aMine = this.mines[index]
            if(this.mode == "linear"){
                this.rates[aMine.onBlock.type] += aMine.level;
            }else if(this.mode == "exponential"){
                this.rates[aMine.onBlock.type] += Math.pow(2, aMine.level) / 2;
            }
        }

        for(const index in this.factories){
            let aFactory = this.factories[index];
            if(aFactory.crafting){
                //add products to rates 
                for(const aProduct in this.recipes[aFactory.recipe].products){
                    if(this.mode == "linear"){
                        this.rates[aProduct] += this.recipes[aFactory.recipe].products[aProduct] * aFactory.level / this.recipes[aFactory.recipe].duration;
                    }else if(this.mode == "exponential"){
                        this.rates[aProduct] += this.recipes[aFactory.recipe].products[aProduct] * Math.pow(2, aFactory.level) / 2 / this.recipes[aFactory.recipe].duration;
                    }
                }
                //subtract costs from rates 
                for(const aCost in this.recipes[aFactory.recipe].costs){
                    if(this.mode == "linear"){
                        this.rates[aCost] -= this.recipes[aFactory.recipe].costs[aCost] * aFactory.level / this.recipes[aFactory.recipe].duration;
                    }else if(this.mode == "exponential"){
                        this.rates[aCost] -= this.recipes[aFactory.recipe].costs[aCost] * Math.pow(2, aFactory.level) / 2 / this.recipes[aFactory.recipe].duration;
                    }
                }
            }
        }
    }

    deselectFactory(){
        if(this.selectedFactory){
            this.selectedFactory.sprite.tint = 0xFFFFFF;
            this.selectedFactory = null;      
        }
    }
}

let game = new Game();