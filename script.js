//some variables
let favouriteObjects = []; //here we store all our favourite objects from localstorage

const artContainerEl = document.getElementById("art-container");
const favouriteItemsEl = document.getElementById("favourite-container");
const formEl = document.getElementById("search-form");  //the whole form
const inputEl = document.getElementById("search-input");
let deleteBtnClicked = false;

getFavouriteObjects();


//Send all objects in favourite-array (localstorage) to be rendered as the page loads
for (let i = 0; i < favouriteObjects.length; i++) {
    renderObjectToDom(favouriteObjects[i]);
}


//submit search-form
formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = inputEl.value;
    fetchArt(query); //call function to get searchResult
    inputEl.value = "";
});


//Write the HTML for a favourite object
function renderObjectToDom(favObject) {

    let buttonID = "removeFromFavs" + favObject.objectID;
    let prioID = "prio" + favObject.objectID;

    const favouriteArticle = document.createElement('article');
    favouriteArticle.classList.add('art-piece');

    favouriteArticle.innerHTML = `
        <img src="${favObject.primaryImageSmall}" alt="Photo of ${favObject.title}"/>
        <a href="${favObject.objectURL}" target="_blank"><h3>${favObject.title}</h3></a>
        <p>${favObject.artistDisplayName}</p>

        <form>
            <input type="checkbox" class="prioCheckbox" id="${prioID}" name="${prioID}" value="priority">
            <label for="${prioID}" class="prioLabel">Särskilt intressant</label>

            <button type="submit" class="delete-button" id="${buttonID}">Ta bort</button>
        </form>
  
    `;

    if (deleteBtnClicked === false) {
        favouriteItemsEl.appendChild(favouriteArticle);
    }

    const removeFavButton = document.getElementById(buttonID);
    removeFavButton.addEventListener('click', (event) => {
        event.preventDefault();

        deleteBtnClicked = true;

        deleteFromFavouriteList(favObject); //deletes from array

        reWriteFavourites(favouriteObjects);
    });


    const checkbox = document.getElementById(`${prioID}`)
    
    checkbox.addEventListener("change", (event) => {
        event.preventDefault();

        
        
        if(checkbox.checked === true) {
            console.log(`checked, ${prioID}`);
            favObject.priority = true;

            favouriteArticle.classList.add('priority-art');
        }
        else {
            favObject.priority = false;
            favouriteArticle.classList.remove('priority-art');
        }
        console.log(favObject);

    });

}


//render favourites anew after deleting one item
function reWriteFavourites(favouriteObjects) {
    deleteBtnClicked = false;

    favouriteObjects = JSON.parse(localStorage.getItem('favourite_art') || "[]");
    favouriteItemsEl.innerHTML = "";

    for (let i = 0; i < favouriteObjects.length; i++) {
        favObject = favouriteObjects[i];      
        renderObjectToDom(favObject);
    }

}


//get saved favourites
function getFavouriteObjects() {
    favouriteObjects = JSON.parse(localStorage.getItem('favourite_art') || "[]");
}


//Add to favourites and localstorage
function addToFavouriteList(objData) {



    favouriteObjects.push(objData);


    //lägg till priority i alla objekt
    favouriteObjects.forEach(objData => {
        objData.priority = false;
    })

    


    localStorage.setItem("favourite_art", JSON.stringify(favouriteObjects));


    console.log(favouriteObjects);

    renderObjectToDom(objData);
}


//delete an object from favourites
function deleteFromFavouriteList(favObject) {

    
    const index = favouriteObjects.findIndex((fav) => fav.objectID === favObject.objectID);

    favouriteObjects.splice(index, 1);

    //update DOM
    localStorage.setItem("favourite_art", JSON.stringify(favouriteObjects));

    renderObjectToDom(favObject);
}


//function for fetching search-results from API
async function fetchArt(query) {
    const searchResult = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;

    try {
        const response = await fetch(searchResult);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();

        //get IDs from API
        const resultArray = data.objectIDs;

        //sending result = ID:s to another function, fetch only the 10 first ID:s
        for (let i = 0; i < 10; i++) {
            const ID = resultArray[i];
            fetchArtObjects(ID);
        }

    } catch (error) {
        console.error(error);
    }


    //get usable objects out of the ID:s
    async function fetchArtObjects(ID) {

        const objectSearchResult = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ID}`;

        artContainerEl.innerHTML = ""; // empty from before

        try {
            const objResponse = await fetch(objectSearchResult);
            if (!objResponse.ok) {
                throw new Error(`Error: ${objResponse.status}`);
            }
            const objData = await objResponse.json();

            //filter out non-public domain objects (they don't have images in API)
            if (objData.isPublicDomain === true) {

                let buttonID = "addToFavs" + objData.objectID; //Use ID in object to create unique id:s for the button

                //render search results
                const artArticle = document.createElement('article');
                artArticle.classList.add('art-piece');

                artArticle.innerHTML = `
                <img src="${objData.primaryImageSmall}" alt="Photo of ${objData.title}"/>
                <a href="${objData.objectURL}" target="_blank"><h3>${objData.title}</h3></a>
                <p>${objData.artistDisplayName}</p>
                
                <button type="submit" class="item-button" id="${buttonID}">Lägg till i favoriter</button>
                `;
                artContainerEl.appendChild(artArticle);

                //Add to favourites-button
                const addFavButton = document.getElementById(buttonID);
                addFavButton.addEventListener('click', (event) => {
                    event.preventDefault();

                    addToFavouriteList(objData);
                });
            }

        } catch (error) {
            console.error(error);
        }
    };

}

