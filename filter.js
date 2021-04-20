/**
 * //classe qui permet d'instancier un nouveau bouton de filtrage
 * @returns {void}
 */
class Filter {
    /**
     * @param {Number} min 
     * @param {Number} max 
     * @param {Number} step 
     */
    constructor(min, max, step) {
        [this.min, this.max, this.step] = [min, max, step];
        this.controleFiltre();
    }

    controleFiltre() {
        new rSlider({
            target: '#slider3',
            values: { min: this.min, max: this.max },
            step: this.step,
            range: true,
            set: [main.sliderNum.set1, main.sliderNum.set2],
            scale: false,
            labels: false,
            onChange: function (vals) {
                let  values = vals.split(',');
                [main.sliderNum.set1, main.sliderNum.set2] = [values[0], values[1]];
                main.filtreNote = values;
                main.DEBUT && main.filter();
                main.DEBUT = true;
            }
        });
    }
}