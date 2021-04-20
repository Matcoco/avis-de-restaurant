/**
 * @param {String} message
 * @param {String} selecteur
 * @param {String} couleur
 * @param {Number} time
 * @returns {} ne retourne rien
 */
class Message {
    constructor(message, selecteur, couleur, time) {
        this.info = { message, selecteur, couleur, time };
        this.render();
    }

    /**
     * permet d'afficher le message dans un noeud en particulier
     * @returns {void}
     */
    render() {
        document.querySelector(`${this.info.selecteur}`).innerHTML += `<div class="alert alert-${this.info.couleur}" role="alert">${this.info.message}</div>`;
        setTimeout(() => {
            $(".alert").alert('close');
        }, this.info.time);
    }
}