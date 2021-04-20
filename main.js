
class Main {
  DATA = null;
  positionActuelle = null;
  gestionAvis = new GestionAvis();
  gestionRestaurant = new GestionRestaurant();
  sliderNum = {
    set1: 0,
    set2: 5
  }

  placeSelected = null;
  numResultsPlaces = document.getElementById("numResults");
  filtreNote = [this.sliderNum.set1, this.sliderNum.set2];
  sliderFiltre = null;
  filtreNoteDernierEtat = [];
  DEBUT = false;
  mapi = null;


  start() {
    this.mapi = new Mapi("map", this.positionActuelle, main);

  }

  /**
   * fonction qui sert à géolocaliser les coordonnées GPS de l'utilisateur puis les retournent
   * @returns {Object} un objet
   */
  localisation() {
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej);
    });
  }

  /**
   * fonction qui sert à récupérer les données concernant les restaurants sous forme de tableau d'objet
   * @returns {Array} un tableau d'objet
   */
  getData() {
    const result = fetch("./data.json")
      .then(data => {
        return data.json();
      })
      .then(data => {
        return data;
      });
    return result;
  }

  /**
  * permet d'afficher le resultat de recherche (au-dessus de la liste) 
  * @returns {void}
  */
  affichageNombreResultatRecherche() {
    const total = document.querySelectorAll('#places li').length;
    this.numResultsPlaces.innerHTML = `${total} ${total > 1 ? "résultats trouvés" : "résultat trouvé"}`;
  }


  /**
* création d'une fenêtre en y insérant le contenu 
* @param {String} idDiv //selecteur servant à indiquer où insérer la fenêtre
* @param {String} idModal 
* @param {String} titleModal 
* @param {String} content 
* @param {Boolean} showAvis Booléen qui concerne uniquement la fenetre des avis 
* @returns {void}
*/
  createWindow(idDiv, idModal, titleModal, content, showBoutonAjoutAvis) {
    let boutonAjoutAvis = `<div id="btnAjoutAvis"><button type="button" class="btn btn-primary" onclick=main.gestionAvis.showFormOpinion()>Ajouter un avis</button></div>`;
    this.fenetreEnCours = new Fenetre(idDiv, idModal, titleModal, content, showBoutonAjoutAvis ? boutonAjoutAvis : "");
    $(`#${idModal}`).modal('show');
  }

  filter() {
      this.mapi.li = document.getElementById('places').innerHTML = "";
      this.mapi.indexLi = 0;
      this.DATA !== null && this.DATA.forEach((place, index) => {
       if (place.note_moyenne >= Number(this.filtreNote[0]) && place.note_moyenne <= Number(this.filtreNote[1])) {
         this.mapi.displayPlaces(place);
         this.mapi.displayOneMarker(true, index);
       } else {
         this.mapi.displayOneMarker(false, index);
       }
     });
    this.mapi.doBounds();
  }

  /**
  * permet de convertir un timestamp en une date formatée
  * @param {Number} timestamp 
  * @returns {String} retourne la date formatée en chaine de caractere => exemple : 6/8/2020
  */
  getDateFromTimestamp(timestamp) {
    let date = new Date(Math.floor(timestamp * 1000));
    let annee = date.getFullYear();
    let mois = date.getMonth();
    let jour = date.getDate();
    let newDate = `${this.formatageNombreJourMois(jour)}/${this.formatageNombreJourMois(mois + 1)}/${annee}`.toString();
    return newDate;
  }

  /**
  * permet de rajouter un 0 devant un chiffre inférieur à 10
  * @param {Number} number 
  * @returns {Number} exemple 1 => 01 ou 8 => 08
  */
  formatageNombreJourMois(number) {
    return number < 10 ? `0${number}` : `${number}`;
  }
}


let main = new Main();
main.sliderFiltre = new Filter(0, 5, 1);

function init() {
  const promise1 = Promise.resolve(main.getData());
  const promise2 = Promise.resolve(main.localisation());

  Promise.all([promise1, promise2]).then((values) => {
    main.DATA = values[0];
    let position = { "lat": values[1].coords.latitude, "lng":values[1].coords.longitude }
    main.positionActuelle = position;
    main.start();
  });
}







