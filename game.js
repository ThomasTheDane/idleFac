

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
        if(this.type != "dirt"){
            this.game.inventory[this.type] += 1;

            // console.log(this.game);
        }
    }
}

class GameGrid {
    gridWidth = 10;
    gridHeight = 10;
    blockSize;
    blocks; 
    blockContainer; 
    
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

    setupNewGame(){
    
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
    
                if(block.type == "dirt"){
                    block.sprite = PIXI.Sprite.from('graphics/dirt.png');
                }
                if(block.type == "ironOre"){
                    block.sprite = PIXI.Sprite.from('graphics/ironOre.png');
                    block.sprite.cursor = 'pointer';
                }
    
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

    constructor({game, level, placingBlock}){
        
        console.log("buying mine at location ", placingBlock, placingBlock.x, ", ", placingBlock.y)
        
        super({game, level, placingBlock});

        this.sprite.texture = PIXI.Texture.from('graphics/factory.png');
        this.type = "factory";
        this.recipe = null;
        this.timeCrafting = 0;
    }
}


class Inventory {

}

class Game {
    pixiApp;
    gameGrid;
    

    mines = [];
    factories = [];

    recipes = {
        ironPlate : {products: {ironPlate: 1} , costs:{ironOre: 10}, duration: 3},
        steelPlate: {ironPlate: 5}        
    }

    countIconSize = 50;

    inventory = {
        ironOre: 100,
        ironPlate: 0
    };
    rates = {ironOre : 0}

    buyMineLevelSet;
    buyFactoryLevelSet;

    selectedFactory;

    mineCosts = [
        {ironOre: 10}, 
        {ironOre: 20},
        {ironOre: 40},
        {ironOre: 80}
    ];

    factoryCosts = [
        {ironOre: 10}, 
        {ironOre: 20},
        {ironOre: 40},
        {ironOre: 80}
    ];

    dragTarget = null;
    dragEntity = null;
    removedFromBlock;
    self;
    
    constructor(){
        self = this;

        let gameWindowSize = Math.min(window.innerWidth / 2, window.innerHeight);
        this.pixiApp = new PIXI.Application({ width: gameWindowSize, height: gameWindowSize, background: '#1099bb' });
        this.gameGrid = new GameGrid({game: this, gridWidth: 10, gridHeight: 10, gameWindowSize: gameWindowSize})
        document.getElementById("gameContainer").appendChild(this.pixiApp.view);

        this.gameGrid.setupNewGame();
        this.gameGrid.drawGrid(this.gameGrid);

        this.addCountUIElement("ironOre");
        this.addCountUIElement("ironPlate");
        this.addCountUIElement("steelPlate");
        this.updateCountText();


        document.getElementById("buyMineContainer").onmousedown = () => {
            this.handleBuyMine();
        };
        document.getElementById("buyFactoryContainer").onmousedown = () => {
            this.handleBuyFactory();
        }

        this.addRecipeUIElement("ironPlate");
        this.addRecipeUIElement("steelPlate");


        this.pixiApp.stage.interactive = true;
        this.pixiApp.stage.hitArea = this.pixiApp.screen;
        this.pixiApp.stage.on('pointerup', this.onDragEnd);
        this.pixiApp.stage.on('pointerupoutside', this.onDragEnd);

        this.pixiApp.ticker.add(dt => {
            // console.log(dt);
        
            this.productionIncrement(dt / 60);
            this.updateCountText();
        });
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
    
        self.updateAllRates();
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

            if(placedOnBlock == self.removedFromBlock && self.dragEntity.type == "factory"){
                self.selectedFactory = self.dragEntity;
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
        
                                self.updateAllRates();
                        
                                // finish drag event stuff 
                                self.pixiApp.stage.off('pointermove', self.onDragMove);
                                self.dragTarget.alpha = 1;
                                self.dragTarget = null;
                                self.dragEntity = null;
        
                                // console.log("mines: ", mines);
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
                                
                                self.factories[index].sprite.parent.removeChild(self.factories[index].sprite);
                                self.factories.splice(index, 1)
                                // factories[index].sprite.destroy({children:true, texture:true, baseTexture:true});
        
                                // update level, rates & set enabled of right - TODO 
                                self.dragEntity.level += 1;
                                self.dragEntity.levelText.text = self.dragEntity.level;
                                self.dragEntity.onBlock = placedOnBlock;
        
                        
        
                                // finish drag event stuff 
                                self.pixiApp.stage.off('pointermove', self.onDragMove);
                                self.dragTarget.alpha = 1;
                                self.dragTarget = null;
                                self.dragEntity = null;
        
                                // console.log("mines: ", mines);
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
        }
    }



    handleBuyMine(){
        let level = 1;
        if(this.checkIfCanBuy(this.mineCosts[level - 1])){
            this.subtractCostFromInventory(this.mineCosts[level - 1]);
            // updateCountText();
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
        let level = 1;
        if(this.checkIfCanBuy(this.factoryCosts[level - 1])){
            this.subtractCostFromInventory(this.mineCosts[level - 1]);
            // updateCountText();
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
    
    subtractCostFromInventory(costs){
        for(const aCost in costs){
            this.inventory[aCost] -= costs[aCost];
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

    addRecipeUIElement(recipeName){
        let newRecipeUIElement = document.createElement('img');
        newRecipeUIElement.setAttribute("class", "recipeIcon");
        newRecipeUIElement.setAttribute("src", "graphics/" + recipeName + ".png");
        newRecipeUIElement.onmousedown = () => {
            if(this.selectedFactory){
                console.log("Setting recipe: ", recipeName);
                this.selectedFactory.recipe = recipeName;
            }
        }

        document.getElementById("recipesGrid").append(newRecipeUIElement);    

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

    
    resetRates(){
        for(const aRate in this.rates){
            this.rates[aRate] = 0;
        }
    }


    updateAllRates(){
        this.resetRates();

        for(const aMineIndex in this.mines){
            // rates[mines[aMineIndex].onBlock.type] += Math.pow(mines[aMineIndex].level, 2); // rate rises equal to total mines / factories 

            this.rates[this.mines[aMineIndex].onBlock.type] += this.mines[aMineIndex].level;
        }

        for(const aFactoryIndex in this.factories){
            let aFactory = this.factories[aFactoryIndex];
            if(aFactory.recipe){
                console.log("Setting rate based on recipe: ", aFactory.recipe);
                // ironPlate : {products: {ironPlate: 1} , costs:{ironOre: 10}},
                for(const aCost in this.recipes[aFactory.recipe].costs){
                    this.rates[aCost] -= this.recipes[aFactory.recipe].costs[aCost]
                }
                for(const aProduct in this.recipes[aFactory.recipe].products){
                    this.rates[aProduct] += this.recipes[aFactory.recipe].products[aProduct];
                }
            }
        }

        this.updateCountText();
    }

    updateCountText(){
        for (const aType in this.rates){
            let aCountText = document.getElementById("countText-" + aType);
            if(aCountText){
                aCountText.innerHTML = Math.floor(this.inventory[aType]);

            }
            let aRateText = document.getElementById("rateText-" + aType);
            if(aRateText){
                aRateText.innerHTML = this.rates[aType]  + " /s";
            }

        }
    }

    productionIncrement(amountTime) {
        for(const index in this.mines){
            let aMine = this.mines[index]
            this.inventory[aMine.onBlock.type] += Math.pow(2, aMine.level) * amountTime;
        }
        for(const index in this.factories){
            let aFactory = this.factories[index];
            if(aFactory.recipe){
                if(aFactory.crafting){
                    aFactory.timeCrafting += amountTime; 
                    if(aFactory.timeCrafting >= this.recipes[aFactory.recipe].duration){
                        console.log("Finished crafting, ", aFactory.recipe);
                        aFactory.timeCrafting = 0;
                        this.inventory[aFactory.recipe] += 1;
                        aFactory.crafting = false;
                    }
                }
                if(!aFactory.crafting){
                    //check if can start a new one 
                    let canCraft = true;
                    let costs = this.recipes[aFactory.recipe].costs; 
                    for(const aCost in costs){
                        if(this.inventory[aCost] < costs[aCost]){
                            canCraft = false; 
                        }
                    }
                    if(canCraft){
                        aFactory.crafting = true;
                        for(const aCost in costs){
                            this.inventory[aCost] -= costs[aCost];
                        }
                    }
                }
                
            }
        }
    }
}

let game = new Game();









