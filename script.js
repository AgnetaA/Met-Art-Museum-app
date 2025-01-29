//some variables
const artContainerEl = document.getElementById("art-container");
const favourites = [];
const favouriteItems = document.getElementById("favourite-container");


const formEl = document.getElementById("search-form");  //the whole form
const inputEl = document.getElementById("search-input");

renderFavouritesList();


//submit search-form
formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("inputten: " + inputEl.value);
    const query = inputEl.value; 
    fetchArt(query); //call function to get searchResult
});


function seeTheList(favObject){

    console.log(favObject.title);

    const favouriteArticle = document.createElement('article');
    favouriteArticle.classList.add('art-piece');

    favouriteArticle.innerHTML = `
        <img src="${favObject.primaryImageSmall}" alt="Photo of ${favObject.title}"/>
        <a href="${favObject.objectURL}" target="_blank"><h3>${favObject.title}</h3></a>
    `;

    favouriteItems.appendChild(favouriteArticle);
}


//print saved favourites
function renderFavouritesList () {
    const favouritesList = JSON.parse(localStorage.getItem('favourite_art'));
    console.log(favouritesList);
       

    for (let i = 0; i < favouritesList.length; i++) {
        const favObject = favouritesList[i];
        
        seeTheList(favObject);
       
    }

 
}


//Add to favourites and localstorage
function addToFavouriteList (objData) {
    console.log("knappen klickades");

    favourites.push(objData);
    console.log(favourites);

    localStorage.setItem("favourite_art", JSON.stringify(favourites));

    renderFavouritesList();
   
}




 //function for fetching search-results from API
async function fetchArt(query) {
    const searchResult = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;


    try {
        const response = await fetch(searchResult);
        if(!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        //call function that shows result in dom
        console.log(data);

        //get IDs from API
        const resultArray = data.objectIDs;
          
        //sending result = ID:s to another function, fetch only the 10 first ID:s
        for (let i = 0; i < 10; i++) {
            const ID = resultArray[i];
            fetchArtObjects(ID);
        }

    }   catch (error) {
        console.error(error);
    }



    //get usable objects out of the ID:s
    async function fetchArtObjects(ID) {

        const objectSearchResult = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ID}`;


        artContainerEl.innerHTML = ""; // empty from before

        try {
            const objResponse = await fetch(objectSearchResult);
            if(!objResponse.ok) {
                throw new Error(`Error: ${objResponse.status}`);
            }
            const objData = await objResponse.json();



            //filter out non-public domain objects 
           if(objData.isPublicDomain === true) {
        
                console.log(objData);
                let buttonID = "addToFavs" + objData.objectID; //Use ID in object to create unique id:s for the button
             

                const artArticle = document.createElement('article');
                artArticle.classList.add('art-piece');

                artArticle.innerHTML = `
                <img src="${objData.primaryImageSmall}" alt="Photo of ${objData.title}"/>
                <a href="${objData.objectURL}" target="_blank"><h3>${objData.title}</h3></a>
                
                <button type="submit" id="${buttonID}">Lägg till i favoriter</button>
                `;
                artContainerEl.appendChild(artArticle); 

                //Add to favourites-button
                const addFavButton = document.getElementById(buttonID);
                addFavButton.addEventListener('click', (event) => {
                    event.preventDefault();

                    addToFavouriteList(objData);
               
                });
            }
        
        }   catch (error) {
            console.error(error);
        }
    };

}

