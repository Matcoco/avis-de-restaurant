/**
 * classe qui permet de gérer les avis des utilisateurs
 */
class GestionAvis {
    content = null;
    btnAjoutAvis = null;
    avis = {
        "note": null,
        "auteur": null,
        "commentaire": null
    }

    placesSaveOpinion = {

    }

    /**
     * permet d'ajouter un avis
     *  @returns {void}
     */
    addOpinion() {
        if (this.avis.note >= 0 && this.avis.commentaire && this.avis.auteur) {
            if (this.avis.note >= 0 && this.avis.note <= 5) {
                let blocAvis = document.querySelector("#blocAvis");
                let div = document.createElement('div');
                div.setAttribute('class', 'avisClient');
                let date = new Date();
                let avis =
                {
                    "stars": Number(this.avis.note),
                    "comment": this.avis.commentaire,
                    "auteur": this.avis.auteur,
                    "time": `${date / 1000}`
                }
                let nouvelleAvis = this.builderOneOpinion(avis.comment, avis.stars, avis.auteur, main.getDateFromTimestamp(avis.time));
                main.DATA[main.placeSelected].ratings.unshift(avis);
                main.DATA[main.placeSelected].note_moyenne = this.moyenneNote(main.DATA[main.placeSelected], 1);
                if (main.DATA[main.placeSelected].ratings[1].stars === "pas de notation") {
                    main.DATA[main.placeSelected].ratings.splice(1, 1);
                    main.DATA[main.placeSelected].note_moyenne = avis.stars;
                    blocAvis.innerHTML = `<div class="avisClient">${nouvelleAvis}</div>`;
                } else {
                    div.innerHTML = nouvelleAvis;
                    blocAvis.insertBefore(div, blocAvis.childNodes[0]);
                }
                this.closeFormOpinion();
                //vider les champs de saisie
                this.eraseDataFormOpinion();
                //insérer avis pour le sauvegarder
                this.insertOpinion(avis);
                this.blocAvis.style.display = "block";
                this.updateAverageStarsDisplay();
                new Message("Votre avis a été ajouté", ".modal-body", "success", 2000);
            }
        } else {
            new Message("Merci de remplir tous les champs", "#formulaire-avis-ajout", "danger", 2000);
            this.eraseDataFormOpinion();
            this.displayForRate();
        }
    }

    /**
     * permet d'insérer un avis dans la bonne propriété, si elle existe (place_id), c'est à dire dans le bon restaurant
     * si la propriété n'existe pas alors on créé une nouvelle propriété dans laquelle on insère l'avis du restaurant fraichement ajouté.
     * @returns {void} 
     */
    insertOpinion(avis) {
        if (main.DATA[main.placeSelected].placeId) {
            if (this.placesSaveOpinion.hasOwnProperty(`${main.DATA[main.placeSelected].placeId}`)) {
                this.placesSaveOpinion[`${main.DATA[main.placeSelected].placeId}`].ratings.unshift(avis);
                this.placesSaveOpinion[`${main.DATA[main.placeSelected].placeId}`].user_ratings_total = main.DATA[main.placeSelected].user_ratings_total;
                this.placesSaveOpinion[`${main.DATA[main.placeSelected].placeId}`].note_moyenne = main.DATA[main.placeSelected].note_moyenne;
            } else {
                let tableauRating = {
                    ratings: [],
                    user_ratings_total: null,
                    note_moyenne: null
                }
                tableauRating.ratings.unshift(avis);
                tableauRating.note_moyenne = main.DATA[main.placeSelected].note_moyenne;
                tableauRating.user_ratings_total = main.DATA[main.placeSelected].user_ratings_total;
                this.placesSaveOpinion[`${main.DATA[main.placeSelected].placeId}`] = tableauRating;
            }
        }
    }


    /**
     * (lors d'un clique sur le détail du restaurant) permet de charger les avis d'un restaurant lorsque le place_id du restaurant est contenu dans la variable placeSaveOpinion
     * @param {String} placeId 
     * @returns {void}
     */
    loadOpinion(placeId) {
        let ratings = [];
        if (this.placesSaveOpinion.hasOwnProperty(`${placeId}`)) {
            for (let rates of this.placesSaveOpinion[`${placeId}`].ratings) {
                ratings.push(rates);
            }
            main.DATA[main.placeSelected].ratings = !(this.placesSaveOpinion[`${placeId}`].user_ratings_total === this.placesSaveOpinion[`${placeId}`].ratings.length) ? [...ratings, ...main.DATA[main.placeSelected].ratings] : ratings;
            main.DATA[main.placeSelected].user_ratings_total = this.placesSaveOpinion[`${placeId}`].user_ratings_total;
            main.DATA[main.placeSelected].note = this.placesSaveOpinion[`${placeId}`].note_moyenne;
        }
    }

    /**
     * permet de mettre a jour l'affichage des étoiles du restaurant depuis la liste
     * @returns {void}
     */
    updateAverageStarsDisplay() {
        let arrayLi = document.querySelectorAll("#places li");
       
        if(arrayLi.length === main.DATA.length){
            arrayLi[main.placeSelected].lastElementChild.innerHTML = (this.etoile(main.DATA[main.placeSelected].note_moyenne)).join("");
        }else{
            let index = 0;
            for(let li of arrayLi){
                if(Number(li.id) === main.placeSelected){
                    arrayLi[index].lastElementChild.innerHTML = (this.etoile(main.DATA[main.placeSelected].note_moyenne)).join("");
                    break;
                }
                index++;
            }
        }
       
    }


    /**
     * permet de calculer la moyenne en fonction du user_ratings_total du restaurant selectionné
     * @param {Object} resto 
     * @returns {Number}
     */
    moyenneNote(resto, numRatings) {
        resto.user_ratings_total = resto.user_ratings_total + numRatings;
        let moyenne = ((((resto.user_ratings_total - numRatings) * resto.note_moyenne) + Number(this.avis.note)) / resto.user_ratings_total).toFixed(1);
        return moyenne;
    }



    /**
     * permet de générer un modèle d'avis et retourne une chaine de caractère
     * @param {String} avis 
     * @param {Number} stars 
     * @param {String} auteur 
     * @param {String} date 
     * @returns {String}
     */
    builderOneOpinion(avis, stars, auteur, date) {
        this.content = `
            <div>
                    <div id="etoiles">${auteur ? this.etoile(stars).join("") : ""}</div>
                    <div class="auteur-date">${auteur ? `<span class="auteur-name">${auteur}</span><span class="date"> - le ${date}</span>` : `pas de notation`}</div>
                    <div class="commentaire">${avis !== "" ? avis : "pas de commentaire"}</div>
            </div>
                `;
        return this.content;
    }

    /**
     * permet de générer les étoiles pour la notation
     * @param {Number} note 
     * @returns {Array}
     */
    etoile(note) {
        let compteur = 0;
        let etoileHtml = `<span class="etoile"><i class="fas fa-star"></i></span>`;
        let etoileVideHtml = `<span class="etoileVide"><i class="far fa-star"></i></span>`;
        let tableauEtoiles = [];

        for (let stars = 0; stars < note; stars++) {
            tableauEtoiles.push(etoileHtml);
            compteur++;
        }

        for (let count = tableauEtoiles.length; count < 5; count++) {
            tableauEtoiles.push(etoileVideHtml);
        }
        return tableauEtoiles;
    }

    /**
* permet de récupérer les données depuis le formulaire d'ajout d'avis : notation / auteur / commentaire
* @param {String} event (id)
* @returns {void} 
*/
    enterFormAddOpinion(event) {
        let saisie = event.target.value;
        switch (event.target.id) {
            case "auteur":
                this.avis.auteur = saisie;
                break;

            case "commentaire":
                this.avis.commentaire = saisie;
                break;

            default:
                break;
        }
    }

    /**
     * permet d'effacer les champs de saisie du formulaire d'avis
     * @returns {void}
     */
    eraseDataFormOpinion() {
        this.avis.note = null;
        this.avis.commentaire = null;
        this.avis.auteur = null;
    }


    /**
    * permet de construire l'ensemble des avis + informations sur le restaurant
    * @param {Object} content 
    * @returns {string}
    */
    builderOpinions(content) {
        let tableauAvis = [];
        if (content.ratings.length > 0) {
            let ratings = content.ratings;
            let contentAvis = "<div id='blocAvis'>"
            for (let avis of ratings) {
                contentAvis += "<div class='avisClient'>"
                contentAvis += this.builderOneOpinion(avis.comment, avis.stars, avis.auteur, main.getDateFromTimestamp(avis.time));
                contentAvis += '</div>';
            }
            contentAvis += "</div>";
            tableauAvis.push(contentAvis);
        }
        tableauAvis.push([`<hr><div id=image_restaurant><img src="${content.image}" alt="${content.restaurantName}"/></div>`]);
        tableauAvis.push([`
        <div id=restaurant-coordonnees>
            <span><i class="fas fa-utensils"></i>  ${content.restaurantName}</span><br>
            <span><i class="fas fa-map-marker-alt"></i>  ${content.address}</span><br>
            <span>${content.formatted_phone_number ? '<i class="fas fa-phone-alt"></i>' + " " + content.formatted_phone_number : ""}</span>
        </div>`]);
        return tableauAvis.length > 0 && tableauAvis.map(element => element).join('');
    }

    /**
    * permet de cacher le formulaire d'ajout avis
    * @returns {void}
    */
    closeFormOpinion() {
        let conteneurFormulaireAjoutAvis = document.querySelector("#conteneurFormulaireAjoutAvis");
        this.blocAvis = document.querySelector("#blocAvis");
        this.blocAvis.style.display = "block";

        this.btnAjoutAvis.style.display = "flex";
        this.btnAjoutAvis.style.display = "flex";
        conteneurFormulaireAjoutAvis.innerHTML = "";
    }

    /**
     * permet l'affichage du formulaire d'avis lorsque l'utilisateur clique le bouton #btnAjoutAvis
     * @returns {void}
     */
    showFormOpinion() {
        this.btnAjoutAvis = document.querySelector("#btnAjoutAvis");
        this.blocAvis = document.querySelector("#blocAvis");

        this.btnAjoutAvis.style.display = "none";
        this.blocAvis.style.display = "none";

        var div = document.createElement("DIV");
        div.innerHTML = this.formAddOpinion();
        this.modalBodyAvis = document.querySelector(".modal-body");
        this.modalBodyAvis.insertBefore(div, this.modalBodyAvis.childNodes[0]);

        this.displayForRate();
    }

    /**
     * permet d'afficher les étoiles lorsqu'un utilisateur souhaite noter le restaurant
     * @return {void}
     */
    displayForRate() {
        const $rateYo = $("#rateYo").rateYo({ rating: 0, fullStar: true, spacing: "10px" });
        this.avis.note = 0;
        $(() => {
            $("#rateYo").click(() => {
                /*obtenir la note */
                this.avis.note = $rateYo.rateYo("rating");
            });
        });
    }

    /**
     * permet de retourner le formulaire html d'ajout avis
     * @returns {String} le formulaire html en chaine de caractère
     */
    formAddOpinion() {
        let content = "";
        content = `
            <div id="conteneurFormulaireAjoutAvis">
                <form id="formulaire-avis-ajout">
                    <div class="input-group mb-3">
                        <span class="input-group-text">Note</span>
                        <div id="rateYo"></div>   
                    </div>
    
                    <div class="input-group mb-3">
                        <span class="input-group-text">Auteur</span>
                        <input type="text" class="form-control" id="auteur" placeholder="votre nom" aria-label="commentaire" aria-describedby="auteur" oninput="main.gestionAvis.enterFormAddOpinion(event)" required></input>
                    </div>
    
                    <div class="input-group mb-3">
                        <span class="input-group-text">Commentaire</span>
                        <textarea type="text" class="form-control" id="commentaire" placeholder="Votre commentaire" aria-label="commentaire" aria-describedby="commentaire" oninput="main.gestionAvis.enterFormAddOpinion(event)" required></textarea>
                    </div>
    
                    <div id="validationAvis">
                        <button type="button" class="btn btn-primary btn-validationAvis" onclick="main.gestionAvis.addOpinion()">Enregistrer</button>
                        <button type="button" class="btn btn-secondary btn-validationAvis"  onclick="main.gestionAvis.closeFormOpinion()">Annuler</button>
                    </div>
                </form>
            </div>
            `
        return content;
    }
}