class GestionRestaurant {
    ajoutRestaurantData = {
        coords: {
            lat: null,
            lng: null
        },
        nom: null,
        adresse: null,
        placeId: null,
        formatted_phone_number: null,
        avis: {
            note: null,
            commentaire: null,
            auteur: null
        },
        user_ratings_total: 0
    }


    /**
   * permet de récupérer les données depuis le formulaire d'ajout de restaurant : nom du restaurant et le téléphone du restaurant
   * @param {String} event (id)
   * @returns {void} 
   */
    enterAddformPlace(event) {
        let saisie = event.target.value;
        switch (event.target.id) {
            case "nomDuRestaurant":
                this.ajoutRestaurantData.nom = saisie;
                break;

            case "telephoneDuRestaurant":
                this.ajoutRestaurantData.formatted_phone_number = saisie;
                break;

            default:
                break;
        }
    }

    /**
     * permet de récupérer les coordonnées gps lors d'un clique sur la map
     * @returns {void}
     */
    handlerClickPlaceLatLng() {
        const map = main.mapi.map;
        map.addListener("click", (mapsMouseEvent) => {
            this.ajoutRestaurantData.coords.lat = mapsMouseEvent.latLng.lat();
            this.ajoutRestaurantData.coords.lng = mapsMouseEvent.latLng.lng();

            let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.ajoutRestaurantData.coords.lat},${this.ajoutRestaurantData.coords.lng}&location_type=ROOFTOP&result_type=street_address&key=${main.mapi.KEY}`
            let details = Promise.resolve(main.mapi.getDetailPlace(url));

            details.then((value) => {
                this.ajoutRestaurantData.adresse = value.formatted_address;
                this.ajoutRestaurantData.placeId = value.place_id;
                let content = this.formAddPlace();
                main.createWindow("windowContainer", "modal_ajoutRestaurant", "Ajout d'un restaurant", content);
            });
        });
    }


    /**
     * permet d'ajout un restaurant
     * @param {*} event 
     * @returns {void}
     */
    addPlace(event) {
        if (this.ajoutRestaurantData.nom && this.ajoutRestaurantData.adresse !== null && this.ajoutRestaurantData.formatted_phone_number) {
            event.preventDefault();
            let restaurant = {
                "restaurantName": this.ajoutRestaurantData.nom,
                "address": this.ajoutRestaurantData.adresse,
                "position": { lat: this.ajoutRestaurantData.coords.lat, lng: this.ajoutRestaurantData.coords.lng },
                "note_moyenne": -1,
                "placeId": this.ajoutRestaurantData.placeId,
                "formatted_phone_number": this.ajoutRestaurantData.formatted_phone_number,
                "types": ["restaurants", "food"],
                "ratings": [{
                    "auteur": null,
                    "time": null,
                    "stars": "pas de notation",
                    "comment": "pas de commentaire"
                }],
                "user_ratings_total": this.ajoutRestaurantData.user_ratings_total,
                "image": main.mapi.searchPicture(this.ajoutRestaurantData.coords.lat, this.ajoutRestaurantData.coords.lng),
                "id":main.DATA.length

            }

            main.DATA.push(restaurant);
            $('#modal_ajoutRestaurant').modal('hide');
            main.mapi.addMarker(restaurant, false);
            main.mapi.displayPlaces(restaurant);
            main.mapi.doBounds();
            $('#places').animate({scrollTop: 9999});

            new Message("Votre restaurant a été ajouté", "#addPlacesSuccess", "success", 2000);
            this.effacerSaisieAjoutRestaurant();
        } else {
            new Message("Merci de remplir tous les champs", ".modal-body", "danger", 2000);
            this.effacerSaisieAjoutRestaurant();
        }
    }

    /**
     * effacer saisie ajoutRestaurant
     * @returns {void}
     */
    effacerSaisieAjoutRestaurant() {
        this.ajoutRestaurantData.nom = null;
        this.ajoutRestaurantData.formatted_phone_number = null;
    }

    /**
     * Création du formulaire de restaurant 
     * @returns {String}
     */
    formAddPlace() {
        let content = "";
        content = `
        <form>
            <div class="input-group mb-3">
                <span class="input-group-text">Nom du restaurant</span>
                <input 
                    type="text" 
                    class="form-control" 
                    id="nomDuRestaurant" 
                    placeholder="nom du restaurant" 
                    aria-label="nomDuRestaurant" 
                    aria-describedby="nomDuRestaurant"  
                    oninput="main.gestionRestaurant.enterAddformPlace(event)" required
                />
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text">Téléphone</span>
                <input 
                    type="tel" 
                    class="form-control" 
                    pattern="\([0-9]{3}\) [0-9]{3}[ -][0-9]{4}" 
                    id="telephoneDuRestaurant"
                    placeholder="Téléphone" 
                    aria-label="telephoneDuRestaurant" 
                    aria-describedby="telephoneDuRestaurant"  
                    oninput="main.gestionRestaurant.enterAddformPlace(event)" required
                />
            </div>
            <div class="mb-3">
                <p>Adresse du restaurant : </p>
                <span id="adresseResultat">${this.ajoutRestaurantData.adresse}</span>
            </div>
            <div id="boutonAjoutRestaurant">
                <button type="button" class="btn btn-primary" onclick="main.gestionRestaurant.addPlace(event)">
                    Enregistrer
                </button>
            </div>
        </form>
        `
        return content;
    }
}