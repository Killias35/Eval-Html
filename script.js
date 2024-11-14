//fonction generale
async function loadJSON() {
    try {
        const response = await fetch('https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json'); // Assurez-vous que 'data.json' est dans le même dossier
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Erreur lors du chargement du JSON:", error);
    }
}

//fonction données

/*
    Ces fonctions vont recuperer toutes les données a mettres dans les filtres
*/
function GetIngredientsFromJSON(data, filter="")
{
    var lst = [];
    data.forEach(recette => {
        recette['ingredients'].forEach(ingredient_data => {
            var ingredient = ingredient_data['ingredient']
            var skip = false;
            filter.split(' ').forEach(mot => {
                if (!ingredient.toLowerCase().includes(mot.toLocaleLowerCase()))
                    {
                         skip = true;
                    }
            });
            if (!lst.includes(ingredient) && !skip)
            {
                lst.push(ingredient); 
            }
        });
    });

    return lst;
}

function GetAppareilFromJSON(data, filter="")
{
    var lst = [];
    data.forEach(recette => {
        var appliance = recette["appliance"];
        var skip = false;
        filter.split(' ').forEach(mot => {
            if (!appliance.toLocaleLowerCase().includes(mot.toLocaleLowerCase()))
                {
                     skip = true;
                }
        });
        if (!lst.includes(appliance) && !skip)
        {
            lst.push(appliance);             
        }
    });

    return lst;
}

function GetUstensilsFromJSON(data, filter="")
{
    var lst = [];
    data.forEach(recette => {
        var ustensils = recette["ustensils"];
        ustensils.forEach(ustensil => {
            var skip = false;
            filter.split(' ').forEach(mot => {
                if (!ustensil.toLocaleLowerCase().includes(mot.toLocaleLowerCase()))
                    {
                         skip = true;
                    }
            });
            if (!lst.includes(ustensil) && !skip)
            {
                lst.push(ustensil); 
            }
        });
    });

    return lst;
}

function GetDataWithFilter(data)
{
    /*
        Cette fonction vas retourner toutes les recettes correspondant au filtre choisis (tags)
    */

    var lst = [];
    data.forEach(recette => {

        var shouldSkip = false;
        tags.Ingredients.forEach(ingredientTag => {
            var inside = false;
            recette['ingredients'].forEach(ingredient => {
                if(ingredient['ingredient'].toLocaleLowerCase() == ingredientTag.toLocaleLowerCase())
                {
                    inside = true;
                }
            });
            if(!inside)
            {
                shouldSkip = true;
            }
        });

        tags.Appareils.forEach(appareilTag => {
            if(recette['appliance'] != appareilTag)
            {
                shouldSkip = true;
            }
        });

        tags.Ustensiles.forEach(ustensilTag => {
            var inside = false;
            recette['ustensils'].forEach(ustensil => {
                if(ustensil == ustensilTag)
                {
                    inside = true;
                }
            });
            if(!inside)
            {
                shouldSkip = true;
            }
        });

        if(!shouldSkip)
        {
            lst.push(recette);
        }
    });   

    return lst;
}

function GetRecette(data, description)
{
    /*
        Cette fonction vas retourner toutes les recettes qui correspond a la recherche de la barre principale + aux filtres
    */

    var items = [];
    if(description.length >= 3 || description.length == 0)
    {
        description = description.toLowerCase();
        const newData = GetDataWithFilter(data);

        newData.forEach(recette => {
            var infos = [];
            infos = [...new Set([...infos, ...recette['name'].split(' ')])];
            infos = [...new Set([...infos, ...recette['description'].split(' ')])];

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
                if(!shouldSkip && !infos.some(item => item.includes(mot)))
                {
                    shouldSkip = true;
                }
            });

            if(!shouldSkip)
            {
                items.push(recette);
            }
        });
    }

    return items;
}

function addFilter(type, name)
{
    /*
        Cette fonction vas ajouter et retirer un filtre qui servira pour la recherche d'element
    */
    for(const key in tags)
        {
            if(type.includes(key))
            {
                var truc = []
                if(tags[key].includes(name))
                {
                    var indice = tags[key].indexOf(name);
                    tags[key].splice(indice, 1);
                }
                else
                {
                    tags[key].push(name);
                }
            }
        }
}

//fonction reliant back-front
function search(data)
{
    /*
        Cette fonction est la methode complete pour effectuer la recherche puis afficher les recettes et changer les filtres graces aux recettes restentes
    */

    const searchBar = document.getElementById('search-barre');
    var description = searchBar.value

    deleteCards();

    var infos = GetRecette(data, description);
    showCards(infos, infos, description);
    setFilters()
}

function setFilters()
{
    /*
        Cette fonction est la methode complete pour afficher tout les filtres avec les recettes restentes
    */
    const searchBar = document.getElementById('search-barre');

    newdata = GetRecette(Data, searchBar.value);
    
    const ingredient_filter = document.getElementById('ingredients-filter').value;
    const appareil_filter = document.getElementById('appareils-filter').value;
    const ustensil_filter = document.getElementById('ustensils-filter').value;


    var ingredients = GetIngredientsFromJSON(newdata, ingredient_filter);
    var appareils = GetAppareilFromJSON(newdata, appareil_filter);
    var ustensils = GetUstensilsFromJSON(newdata, ustensil_filter);


    setFilter(ingredients, "Ingredients-ul");
    setFilter(appareils, "Appareils-ul");
    setFilter(ustensils, "Ustensiles-ul");
}

function addTagFilter(type, name)
{
    /*
        Cette fonction est  la methode complete utilisé pour lors d'une pression sur un tag ou un filtre
        elle ajoute un tag puis affiche tout les tags actuelle
    */
    deleteTags();
    addFilter(type, name);

    for(const key in tags)
    {
        tags[key].forEach(tag => {
            addTag(key, tag);
        });
    }

    search(Data)
}

//fonction front
function deleteCards()
{
    /*
        Supprime toutes les recettes affichés
    */
    const noResult = document.getElementsByClassName('no-results')[0];
    const result = document.getElementsByClassName('results')[0];

    const cardContainers = document.getElementsByClassName('card-container');
    const cardContainer = cardContainers[0] 

    Array.from(cardContainers).forEach(container => {
        if(container != cardContainer)
        {
            result.removeChild(container);
        }
    });

    noResult.style.display = 'none';
    result.style.display = 'none';
       
}

function showCards(data)
{
    /*
        Affiche toutes les recettes contenus dans data
    */
    const searchBar = document.getElementById('search-barre');
    var description = searchBar.value

    const noResult = document.getElementsByClassName('no-results')[0];
    const result = document.getElementsByClassName('results')[0];

    const cardContainerTemplate = document.getElementsByClassName('card-container')[0];
    const cardTemplate = document.getElementsByClassName('card')[0];

    if(data.length > 0)
    {
        result.style.display = 'block';
        cardContainerTemplate.style.display = 'flex';

        document.querySelector('.results-number').textContent = data.length + " recettes trouvés";

        var cardContainer = cardContainerTemplate.cloneNode(true);
        result.appendChild(cardContainer);

        data.forEach(datainfo => {
            var card = cardTemplate.cloneNode(true);

            card.querySelector('#card-title').textContent = datainfo['name'];
            card.querySelector('#card-descritpion').textContent = datainfo['description'];

            card.querySelector('.card-image').style.backgroundImage = "url('images/JSON recipes/" + datainfo['image'] + "')";

            const ingredients = card.querySelector('.ingredients');

            datainfo['ingredients'].forEach(ingredient => {
                const htmldata = "<div>" + 
                    (ingredient['ingredient'] || '') + "<br><span>" + 
                    (ingredient['quantity'] || '') + " " + 
                    (ingredient['unit'] || '') + 
                    "</span></div>"; 
                    
                ingredients.innerHTML += htmldata;
            });

            card.querySelector('#card-title').textContent = datainfo['name'];
            card.querySelector('#card-title').textContent = datainfo['name'];

            if(cardContainer.children.length == 4)
            {
                cardContainer = cardContainerTemplate.cloneNode(true);
                result.appendChild(cardContainer);
            }
            card.style.display = 'block';
            cardContainer.appendChild(card);

        });

        cardTemplate.style.display = 'none';
        cardContainerTemplate.style.display = 'none';
    }
    else{
        noResult.style.display = 'block';
        document.getElementById('search-result').textContent = 'Aucune recette correspondant a: ' + description
    }
}

function setFilter(lst, className)
{
    /*
        Affiche tout les filtres de la liste
    */
    const DropDown = document.getElementsByClassName(className)[0];
    deleteFilter(className);

    var i = 0;
    lst.forEach(truc => {
        const line = document.createElement("li");
        line.id = className + i;
        line.textContent = truc;

        line.addEventListener('click', () => {
            addTagFilter(className, line.textContent);
        });
    
        DropDown.appendChild(line);
    
        i += 1;
    });
}

function deleteFilter(className)
{
    /*
        Supprime toutes les filtres affichés
    */
    const DropDown = document.getElementsByClassName(className)[0];
    DropDown.innerHTML = "";
}

function addTag(type, tag)
{
    /*
        Ajoute un tag
    */

    const tagContainer = document.getElementsByClassName('tag-container')[0];
    var newTag = document.getElementsByClassName('tag')[0].cloneNode(true);
    var newTagBtn =  newTag.getElementsByClassName('tag-close')[0]

    newTag.style.display = 'block';
    newTag.getElementsByClassName('tag-text')[0].textContent = tag;
    newTagBtn.addEventListener('click', () => {
        addTagFilter(type, tag);
    });

    tagContainer.appendChild(newTag);
}

function deleteTags()
{
    /*
        Supprime touts les tags affichés
    */
    const tagContainer = document.getElementsByClassName('tag-container')[0];
    const tagTemplate = document.getElementsByClassName('tag')[0];
    
    Array.from(tagContainer.children).forEach(tag => {
        if(tag != tagTemplate)
        {
            tagContainer.removeChild(tag);
        }
    });
}


// variables globales
var Data = {};
var tags = {
    'Ingredients': [], 
    'Appareils': [], 
    'Ustensiles': []
}

// Au chargement du fichier JSON, les données sont mis en place
loadJSON().then(data => {
    Data = data;
    search(data);

    const searchBar = document.getElementById('search-barre');
    const ingredient_filter = document.getElementById('ingredients-filter');
    const appareil_filter = document.getElementById('appareils-filter');
    const ustensil_filter = document.getElementById('ustensils-filter');

    // Ajout de tout les events a tout les boutons

    searchBar.addEventListener('input', function() {
        search(data)
    });

    ingredient_filter.addEventListener('input', function() {
        setFilters();
    });
    
    appareil_filter.addEventListener('input', function() {
        setFilters();
    });

    ustensil_filter.addEventListener('input', function() {
        setFilters();
    });
});


