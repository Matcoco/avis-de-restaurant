class Mapi {

    map = null;
    markers = [];
    markerPosition = [];
    bounds = null;
    infowindow = null;
    iconBlue = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    iconRed = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    li = null;
    autocomplete = null;
    KEY ="";
    /**
     * 
     * @param {String} id // id de la map 
     * @param {Object} position // position de l'utilisateur 
     * @param {Object} main // class main 
     */
    constructor(id, position, main) {
        [this.id, this.position, this.main] = [id, position, main];
        this.initMap();
    }

    async initMap() {

        this.bounds = new google.maps.LatLngBounds();
        //création de la map
        this.infowindow = new google.maps.InfoWindow({
            content: "Ma position",
        });

        this.map = new google.maps.Map(document.getElementById("map"), {
            center: this.position,
            zoom: 15
        });

        this.addMarker(this.position, true);
        let promise = Promise.resolve(this.searchPlaces(this.position));

        const options = {
            componentRestrictions: { country: ["fr"] },
        };

        var input =  document.getElementById('pac-input');
        var autocomplete = new google.maps.places.Autocomplete(input, options);

        //autocomplete s'active lorsque l'utilisateur saisie un autre lieu
        autocomplete.addListener('place_changed', () => {
            this.deleteMarkers();
            this.markerPosition.length = 0;
            this.markers.length = 0;
            this.bounds = new google.maps.LatLngBounds();

            const place = autocomplete.getPlace();

            let positionObj = { "lat": place.geometry.location.lat(), "lng": place.geometry.location.lng() };
            input.value = "";

            this.main.DATA.length = 0;
            this.li = document.getElementById('places').innerHTML = "";

            // récupére les restaurants et push dans this.DATA
            this.searchPlaces(positionObj);

            // ajoute le marqueur du centre de la fenetre qui correspond aux coords
            this.addMarker(positionObj, true);
        });

        // on attend d'avoir les données avant d'aller plus loin
        await promise.then(() => {
            //boucle this.DATA pour afficher un marqueur par restaurant
            this.loopAddMarkers();

            this.main.DATA.forEach((item, index) => {
                item.id = index;
                this.displayPlaces(item);
            });
        }) 

        // fonction pour récupérer les coords gps lors d'un clique sur la map
        this.main.gestionRestaurant.handlerClickPlaceLatLng();
    }

    /**
     * permet de boucler la variable Data afin d'ajouter les marqueurs sur la map
     * @returns {void}
     */
    loopAddMarkers() {
        this.main.DATA.forEach(place => {
            this.addMarker(place, false);
        });
    }


    /**
     * permet de récupérer des details d'un restaurant lors d'un clique. Une fenetre s'ouvre pour afficher les détails
     * @return {void}
     */
    handlerClickPlaceDetails() {
        this.li.addEventListener('click', async (event) => {
            this.main.placeSelected = Number(event.target.id);
            if (this.main.DATA[this.main.placeSelected].placeId) {
                let restaurantDetails = await this.placeDetails(this.main.DATA[this.main.placeSelected].placeId);
                this.main.DATA[this.main.placeSelected].address = restaurantDetails.adr_address;
                this.main.DATA[this.main.placeSelected].formatted_phone_number = restaurantDetails.formatted_phone_number !== undefined ? restaurantDetails.formatted_phone_number : this.main.DATA[this.main.placeSelected].formatted_phone_number;

                let avisReconstruction = [];
                if (restaurantDetails.hasOwnProperty('reviews')) {
                    for (let avis of restaurantDetails.reviews) {
                        let review = {
                            "stars": avis.rating,
                            "comment": avis.text,
                            "time": avis.time,
                            "auteur": avis.author_name
                        }
                        avisReconstruction.push(review);
                    }
                    this.main.DATA[this.main.placeSelected].ratings = avisReconstruction;
                }
            }
            this.main.gestionAvis.loadOpinion(this.main.DATA[this.main.placeSelected].placeId);
            this.main.DATA[this.main.placeSelected].image = this.searchPicture(this.main.DATA[this.main.placeSelected].position.lat, this.main.DATA[this.main.placeSelected].position.lng);
            this.main.createWindow("windowContainer", "modal_restaurant", `${this.main.DATA[this.main.placeSelected].restaurantName}`, this.main.gestionAvis.builderOpinions(this.main.DATA[this.main.placeSelected]), !0);
        });
    }


    /**
     * permet de récupérer l'image d'une position gps (lat,lng) via une requête. 
     * @param {*} lat 
     * @param {*} lng 
     * @returns {String}
     */
    searchPicture(lat, lng) {
        return `https://maps.googleapis.com/maps/api/streetview?size=300x150&location=${lat},${lng}&heading=151.78&pitch=-0.76&key=${this.KEY}`;
    }

    /**
     * permet de récupérer des détails sur l'adresse
     * @param {String} url 
     * @returns {String}
     */
    getDetailPlace(url) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    return data.results[0];
                }
            })
            .catch(error => { console.log(error) })
    }

    /**
     * permet de récupérer les détails d'un établissement grâce à son place_id
     * @param {String} placeId 
     * @returns {Object}
     */
    placeDetails(placeId) {
        let map = this.map;
        return new Promise(function (resolve, reject) {
            new google.maps.places.PlacesService(map).getDetails({ placeId: placeId }, function (place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    resolve(place);
                } else {
                    reject(status);
                }
            });
        });
    }

    /**
       * récupération des restaurants et insersion dans main.DATA 
       * traitement sur la moyenne lorsque les donneés sont récupérées
       * @param {Array} places 
       */
    addPlaces(places) {
        let index = this.main.DATA.length > 0 ? this.main.DATA.length : 0;
      
        for (const place of places) {
            if (place.geometry && place.geometry.location) {
                place.rating = place.rating ? Math.round(place.rating) : 0;
                place.user_ratings_total = place.rating ? place.user_ratings_total : 0;

                let restaurantData = {
                    "restaurantName": place.name,
                    "address": place.vicinity,
                    "icon": place.icon,
                    "position": { "lat": place.geometry.location.lat(), "lng": place.geometry.location.lng() },
                    "types": ["restaurants", "food"],
                    "placeId": place.place_id,
                    "note_moyenne": this.main.gestionAvis.placesSaveOpinion.hasOwnProperty(`${place.place_id}`) ? this.main.gestionAvis.placesSaveOpinion[`${place.place_id}`].note_moyenne : place.rating,
                    "user_ratings_total": this.main.gestionAvis.placesSaveOpinion.hasOwnProperty(`${place.place_id}`) ? this.main.gestionAvis.placesSaveOpinion[`${place.place_id}`].user_ratings_total : place.user_ratings_total,
                    "ratings": [{
                        "stars": "pas de notation",
                        "comment": "pas de commentaire"
                    }],
                    "image": "",
                    "id":index
                }
                this.main.DATA.push(restaurantData);
                this.addMarker(restaurantData, false);
                this.main.filter(); 
            }
            index++;
        }
        this.doBounds();
    }
 
    /**
     * Ajoute un marker sur la map et push dans son tableau respectif
     * @param {Object} location 
     * @param {Boolean} bool 
     */
    addMarker(location, bool) {
     
        const marker = new google.maps.Marker({
            position: location.position ? location.position : location,
            map: this.map,
            icon: bool ? this.iconBlue : this.iconRed,
            animation: google.maps.Animation.DROP,
            title: !bool ?`${location.restaurantName}` : "Vous êtes ici !"
        });

        if (bool) {
            this.markerPosition.push(marker)
            marker.addListener("click", () => {
                this.infowindow.open(this.map, marker);
            });
            google.maps.event.trigger(marker, 'click');
        } else {
            this.markers.push(marker);
        }
    }

  
    /**
     * retire les markers de la map, mais sont toujours présents dans le tableau
     * @returns {void}
     */
    clearMarkers() {
        this.setMapOnAll(null);
    }


    /**
     * retire les markers de la map et du tableau
     * @returns {void}
     */
    deleteMarkers() {
        this.clearMarkers();
    }

    /**
     * affiche les markers sur la map depuis le tableau this.markers
     * @returns {void}
     */
    setMapOnAll(map) {
        for (let i = 0; i < this.markers.length; i++) {
            if (i === 0) {
                this.markerPosition[0].setMap(map);
            }
            this.markers[i].setMap(map);
        }
    }

    /**
     * affichage ou efface tous les marqueurs
     * @param {Bolean} bool 
     */
    displayMarkers(bool) {
        let markers = this.markers;
        for (let i = 1; i < markers.length; i++) {
            markers[i].setVisible(bool);
        }
    }

    /**
    * affichage un marqueur
    * @param {Bolean} bool 
    */
    displayOneMarker(bool, index) {
        let markers = this.markers;
        markers[index].setVisible(bool);
    }


    /**
     * permet de recentrer la fenetre sur les marquers actifs
     * @returns {void}
     */
    doBounds() {
        this.markers.forEach(item => {
            this.bounds.extend(item.position);
        });
        this.bounds.extend(this.markerPosition[0].position);

        this.map.fitBounds(this.bounds);
        this.main.affichageNombreResultatRecherche();
    }

    /**
     * permet d'afficher les informations du restaurant dans une liste (li)
     * @returns {void}
     */
    displayPlaces(place) {
        const placesList = document.getElementById("places");
        this.li = document.createElement("li");
        this.li.innerHTML = `
                <p>${place.restaurantName}</p>
                <div class="ratings">${place.user_ratings_total > 0 ? this.main.gestionAvis.etoile(place.note_moyenne).join("") : "pas de notation"}</div>
                `;

        this.li.setAttribute('id', `${place.id}`);
        placesList.appendChild(this.li)
        this.handlerClickPlaceDetails();
    }


    /**
   * recherche des restaurants via la position
   * @param {Object} position 
   */
    searchPlaces(position) {
        // Create the places service.
        const service = new google.maps.places.PlacesService(this.map);
        let getNextPage;
        const plusBouton = document.getElementById("moreResult");

        plusBouton.onclick = function () {
            plusBouton.disabled = true;

            if (getNextPage) {
                getNextPage();
            }
        };

        // Perform a nearby search.
        service.nearbySearch(
            { location: position, radius: 500, type: "restaurant" },
            (results, status, pagination) => {
                if (status !== "OK" || !results) return;
                plusBouton.disabled = !pagination || !pagination.hasNextPage;
                this.addPlaces(results);

                if (pagination && pagination.hasNextPage) {
                    getNextPage = () => {
                        pagination.nextPage();
                    };
                }
            }
        );
    }
}
