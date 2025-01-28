 // URL tror jag: https://collectionapi.metmuseum.org/public/collection/v1/search?q=sunflowers
 //               https://collectionapi.metmuseum.org/public/collection/v1/objects
 //                                                                                     &perPage=20???

 // eller https://metmuseum.org/api/collection/collectionlisting?q=test ????

const artContainerEl = document.getElementById("art-container");

 
console.log("Vad händer???");

const formEl = document.getElementById("search-form");  //the whole form
const inputEl = document.getElementById("search-input");




//submit search-form
formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("inputten: " + inputEl.value);

    const query = inputEl.value; //ska bli input value
    console.log("Query: " + query);
    fetchArt(query); //call function to get searchResult
});
 



 //function for fetching search-results from API
async function fetchArt(query) {
    const searchResult = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;

    //const searchResultTest = `https://collectionapi.metmuseum.org/public/collection/v1/objects/485308`;

    //console.log(searchResultTest);



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
        //console.log(resultArray);
        // fetch only the 10 first ID:s


        //sending result = ID:s to another function
        for (let i = 0; i < 10; i++) {
            const ID = resultArray[i];
            fetchArtObjects(ID);

        }

        // //sending result = ID:s to another function
        // resultArray.forEach(ID => {

        //     fetchArtObjects(ID);
        
        // });


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
             

                const artArticle = document.createElement('article');
                artArticle.classList.add('art-piece');

                artArticle.innerHTML = `
                <img src="${objData.primaryImageSmall}" alt="Photo of ${objData.title}"/>
                <a href="${objData.objectURL}" target="_blank"><h3>${objData.title}</h3></a>
                
                <button type="submit" id="addToFavs">Lägg till i favoriter</button>
                `;

                

                artContainerEl.appendChild(artArticle); 

            }
            
        }   catch (error) {
            console.error(error);
        }

    };


}

