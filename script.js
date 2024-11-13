async function loadJSON() {
    try {
        const response = await fetch('data.json'); // Assurez-vous que 'data.json' est dans le même dossier
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Erreur lors du chargement du JSON:", error);
    }
}

function GetIngredientsFromJSON(data)
{
    var lst = [];
    data.forEach(recette => {
        recette['ingredients'].forEach(ingredient_data => {
            ingredient = ingredient_data['ingredient']
            if (!lst.includes(ingredient))
            {
                lst.push(ingredient); 
            }
        });
    });

    return lst;
}

function GetAppareilFromJSON(data)
{
    var lst = [];
    data.forEach(recette => {
        var appliance = recette["appliance"];
            if (!lst.includes(appliance))
            {
                lst.push(appliance); 
            }
    });

    return lst;
}

function GetUstensilsFromJSON(data)
{
    var lst = [2, 4, ];
    data.forEach(recette => {
        var ustensils = recette["ustensils"];
        lst = [...new Set([...lst, ...ustensils])];

    });

    return lst;
}

function GetRecetteByDescriptions(data, description)
{
    var items = [];
    if(description.length != 0)
    {
        description = description.toLowerCase();
        data.forEach(recette => {
            var infos = [];
            infos = [...new Set([...infos, ...recette['name'].split(' ')])];
            infos = [...new Set([...infos, ...recette['description'].split(' ')])];
            infos = [...new Set([...infos, ...recette['appliance'].split(' ')])];
            infos = [...new Set([...infos, ...recette["ustensils"]])];

            recette['ingredients'].forEach(ingredient_data => {
                ingredient = ingredient_data['ingredient']
                if (!infos.includes(ingredient))
                {
                    infos.push(ingredient); 
                }
            });

            infos = infos.map(item => item.toLowerCase());
            shouldSkip = false;
            description.split(' ').forEach(mot => {
                if(!shouldSkip && !infos.includes(mot))
                {
                    shouldSkip = true;
                }
            });

            if(!shouldSkip)
            {
                items.push(recette['id']);
            }
        });
    }

    return items;
}



var Data = {};
var ingredients = [];
var Appareils = [];
var Ustensiles = [];

loadJSON('data.json').then(data => {
    Data = data;
    console.log(GetRecetteByDescriptions(data, "SU")); // Cette ligne attendra que le JSON soit chargé
});


