


/**
 * fonction qui permet de creer une fenetre contenant la description d'un restaurant et ses avis de consommateurs lorsque l'utilisateur clique sur un restaurant
 * @param {String} id {String}
 * @param {String} idModal {String}
 * @param {String} title {String}
 * @param {any} content
 * @param {String} buttons
 */
class Fenetre {
    constructor(id, idModal, title, content, buttons) {
        [this.id, this.idModal, this.title, this.content, this.buttons] = [id, idModal, title, content, buttons];
        this.render();
    }

    /**
     * @returns {void}
     */
    render() {
        let idElement = document.querySelector(`#${this.id}`);
        let content = `
        <div class="modal fade" id="${this.idModal}" tabindex="-1" aria-labelledby="${this.idModal}" aria-hidden="true">
            <div class="modal-dialog modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">${this.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                    ${this.content}
                    </div>
                    <div class="modal-footer">
                    ${this.buttons}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>`;
        idElement.innerHTML = content;
    }
}