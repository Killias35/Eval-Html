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
        const noResult = document.getElementsByClassName('no-results')[0];
        const result = document.getElementsByClassName('results')[0];
        lst = [...new Set([...lst, ...ustensils])];

    });

    return lst;
}

function GetRecetteByDescriptions(data, description)
{
    var items = [];
    if(description.length >= 3)
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

    console.log(items);
    return items;
}

//fonction reliant back-front
function searchWithoutFilter(data, description)
{
    deleteCards();

    var infos = GetRecetteByDescriptions(data, description);
    showCards(data, infos);
}

function searchWithFilter(data, filters)
{

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

function deleteFilters()
{

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
            console.log(recette);

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

function showFilters(filters)
{

}



var Data = {};
var ingredients = [];
var Appareils = [];
var Ustensiles = [];

loadJSON().then(data => {
    Data = data;
    const searchBar = document.getElementById('search-barre');

    searchBar.addEventListener('input', function() {
        searchWithoutFilter(data, searchBar.value)
    });
});


