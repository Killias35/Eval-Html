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

function GetRecetteByDescriptions(data, description)
{
    var items = [];
    if(description.length >= 3 || description.length == 0)
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
                if(!shouldSkip && !infos.some(item => item.includes(mot)))
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

function addFilter(type, name)
{
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
function searchWithoutFilter(data, description)
{
    deleteCards();

    var infos = GetRecetteByDescriptions(data, description);
    showCards(data, infos);
}

function setFilters(data, ingredient_filter='', appareil_filter='', ustensil_filter='')
{
    var ingredients = GetIngredientsFromJSON(data, ingredient_filter);
    var appareils = GetAppareilFromJSON(data, appareil_filter);
    var ustensils = GetUstensilsFromJSON(data, ustensil_filter);

    setFilter(ingredients, "Ingredients-ul");
    setFilter(appareils, "Appareils-ul");
    setFilter(ustensils, "Ustensiles-ul");
}

function addTagFilter(type, name)
{
    deleteTags();
    addFilter(type, name);

    for(const key in tags)
    {
        tags[key].forEach(tag => {
            addTag(type, tag);
        });
    }
}

//fonction front
function deleteCards()
{
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

function showCards(data, infos)
{
    const noResult = document.getElementsByClassName('no-results')[0];
    const result = document.getElementsByClassName('results')[0];

    const cardContainerTemplate = document.getElementsByClassName('card-container')[0];
    const cardTemplate = document.getElementsByClassName('card')[0];

    if(infos.length > 0)
    {
        result.style.display = 'block';
        cardContainerTemplate.style.display = 'flex';

        document.querySelector('.results-number').textContent = infos.length + " recettes trouvés";

        var cardContainer = cardContainerTemplate.cloneNode(true);
        result.appendChild(cardContainer);

        infos.forEach(id => {
            var card = cardTemplate.cloneNode(true);
            var recette = data[id-1];

            card.querySelector('#card-title').textContent = recette['name'];
            card.querySelector('#card-descritpion').textContent = recette['description'];

            card.querySelector('.card-image').style.backgroundImage = "url('images/JSON recipes/" + recette['image'] + "')";

            const ingredients = card.querySelector('.ingredients');

            recette['ingredients'].forEach(ingredient => {
                const htmldata = "<div>" + ingredient['ingredient'] + "<br><span>" + ingredient['quantity'] + " " + ingredient['unit'] + "</span></div>";                
                ingredients.innerHTML += htmldata;
            });

            card.querySelector('#card-title').textContent = recette['name'];
            card.querySelector('#card-title').textContent = recette['name'];

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
    }
}

function setFilter(lst, className)
{
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
    const DropDown = document.getElementsByClassName(className)[0];
    DropDown.innerHTML = "";
}

function addTag(type, tag)
{
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
    const tagContainer = document.getElementsByClassName('tag-container')[0];
    const tagTemplate = document.getElementsByClassName('tag')[0];
    
    Array.from(tagContainer.children).forEach(tag => {
        if(tag != tagTemplate)
        {
            tagContainer.removeChild(tag);
        }
    });
}



var Data = {};
var ingredients = [];
var Appareils = [];
var Ustensiles = [];

var tags = {
    'Ingredients': [], 
    'Appareils': [], 
    'Ustensiles': []
}

loadJSON().then(data => {
    Data = data;
    setFilters(data);
    searchWithoutFilter(data, '');

    const searchBar = document.getElementById('search-barre');
    const ingredient_filter = document.getElementById('ingredients-filter');
    const appareil_filter = document.getElementById('appareils-filter');
    const ustensil_filter = document.getElementById('ustensils-filter');

    searchBar.addEventListener('input', function() {
        searchWithoutFilter(data, searchBar.value)
    });


    ingredient_filter.addEventListener('input', function() {
        lst = GetIngredientsFromJSON(data, ingredient_filter.value);
        setFilter(lst, "Ingredients-ul");
    });
    
    appareil_filter.addEventListener('input', function() {
        lst = GetAppareilFromJSON(data, appareil_filter.value);
        setFilter(lst, "Appareils-ul");
    });

    ustensil_filter.addEventListener('input', function() {
        lst = GetUstensilsFromJSON(data, ustensil_filter.value);
        setFilter(lst, "Ustensiles-ul");
    });
});


