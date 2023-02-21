
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

    recipesV4 = { // V4
        ironPlate : {products: {ironPlate: 1} , costs:{ironOre: 10}, duration: 2},
        copperPlate : {products: {copperPlate: 1} , costs:{copperOre: 10}, duration: 4},
                
        ironGear : {products: {ironGear: 1} , costs:{ironPlate: 10}, duration: 2},
        copperCable : {products: {copperCable: 2} , costs:{copperPlate: 10}, duration: 4},
        
        engine : {products: {engine: 1} , costs:{ironGear: 10, ironPlate: 20}, duration: 2},
        greenCircuit : {products: {greenCircuit: 1} , costs:{copperCable: 10, copperPlate: 20}, duration: 4},
    }

    recipes = { // V5
        ironPlate : {products: {ironPlate: 1} , costs:{ironOre: 10}, duration: 2},
        copperPlate : {products: {copperPlate: 1} , costs:{copperOre: 10}, duration: 4},
                
        ironGear : {products: {ironGear: 1} , costs:{ironPlate: 10}, duration: 2},
        copperCable : {products: {copperCable: 2} , costs:{copperPlate: 10}, duration: 4},
        
        engine : {products: {engine: 1} , costs:{ironGear: 10, ironPlate: 20}, duration: 2},
        greenCircuit : {products: {greenCircuit: 1} , costs:{copperCable: 10, copperPlate: 20}, duration: 4},
    }