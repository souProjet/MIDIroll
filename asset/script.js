let nbrKey;
let nbrWhiteKey;
let offset;
let nbrOfOctave;

let rollState = [];
class ReDraw {
    redraw(element, nbrOctave = 4, startOctave = 4) {

        for (let t = 0; t < 10; t++) {
            for (let v = 0; v < document.querySelectorAll('.separator').length; v++) {
                document.querySelectorAll('.separator')[v].remove();

            }
        }
        element.innerHTML = '';

        let whiteNote = ["C", "D", "E", "F", "G", "A", "B"];
        let blackNote = ["C#", "D#", "F#", "G#", "A#"]
        nbrWhiteKey = nbrOctave * 7;
        nbrKey = nbrOctave * 12;
        offset = startOctave * 12;
        nbrOfOctave = nbrOctave;

        for (let t = 0; t < nbrKey; t++) {
            let activeElement;
            let n = (t % 12) + 1;
            if (n == 2 || n == 4 | n == 7 || n == 9 | n == 11) {
                let r = (Math.floor(n - (n / 2)) - 1) + ((Math.floor(t / 12)) * 5);

                let key = document.createElement('div');
                key.classList.add('black-key');
                key.style.width = (100 / nbrWhiteKey) / 2 + "%";
                let name = document.createElement('h3');
                name.innerText = blackNote[r % 5];
                key.appendChild(name);
                key.style.left = ((100 / nbrWhiteKey) * ((r + ((Math.floor(r / 5) + 1) * 2) + (((r % 5) + 1 > 2) ? 1 : 0)) - 1) - (key.style.width.split("%")[0] / 2)) + "%";
                element.appendChild(key)
                activeElement = key;

            } else {
                let r = Math.floor(n - (n / 2)) + ((Math.floor(t / 12)) * 7);

                let key = document.createElement('div');
                key.classList.add('white-key');
                key.style.width = 100 / nbrWhiteKey + "%";
                key.style.left = (100 / nbrWhiteKey) * r + "%";
                let name = document.createElement('h1');
                name.innerText = whiteNote[r % 7];
                key.appendChild(name)
                element.appendChild(key);
                if (r % 7 == 0) {
                    if (r !== 0) {
                        let separator = document.createElement('div');
                        separator.classList.add('separator');
                        separator.style.left = (100 / nbrWhiteKey) * r + "%";
                        document.body.appendChild(separator)
                    }
                }
                activeElement = key;

            }
            activeElement.id = t + startOctave * 12
        }

    }
}
class PianoKey extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        var controls = new ctrls();
        controls.ready();
        this.draw();
    }
    draw(nbrOctave = 4, startOctave = 4) {
        let redraw = new ReDraw();
        redraw.redraw(this, nbrOctave, startOctave);
    }
}

customElements.define('piano-key', PianoKey);

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
        .then(success, failure);
}

function success(midi) {
    var inputs = midi.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
}

function failure() {
    console.error('No access to your midi devices.')
}

function onMIDIMessage(message) {
    let touche = message.data[1];
    let state = message.data[2];

    if (message.data[0] === 128 || message.data[0] === 144) {
        if (!!document.getElementById(touche)) { document.getElementById(touche).style.opacity = message.data[0] == 128 ? "1" : ".7"; }
        if (message.data[0] == 144) {
            let roll = document.createElement('div');
            roll.classList.add('roll');
            roll.id = "roll-" + (touche - offset) + "-" + (document.querySelectorAll('*[id^="roll-' + (touche - offset) + '"]').length + 1);
            roll.style.bottom = "20%";
            roll.style.opacity = state / 127;
            roll.style.background = "linear-gradient(rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + "), rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + "))";
            let n = ((touche - offset) % 12) + 1;
            rollState.push(touche - offset);
            if (n == 2 || n == 4 | n == 7 || n == 9 | n == 11) {
                let r = (Math.floor(n - (n / 2)) - 1) + ((Math.floor((touche - offset) / 12)) * 5);
                roll.style.width = (100 / nbrWhiteKey) / 2 + "%";
                roll.style.left = ((100 / nbrWhiteKey) * ((r + ((Math.floor(r / 5) + 1) * 2) + (((r % 5) + 1 > 2) ? 1 : 0)) - 1) - (roll.style.width.split("%")[0] / 2)) + "%";
            } else {
                let r = Math.floor(n - (n / 2)) + ((Math.floor((touche - offset) / 12)) * 7);
                roll.style.width = 100 / nbrWhiteKey + "%";
                roll.style.left = (100 / nbrWhiteKey) * r + "%";
            }
            document.body.appendChild(roll);

        } else {
            const index = rollState.indexOf(touche - offset);
            if (index > -1) {
                rollState.splice(index, 1);
            }

        }
    }
}
requestAnimationFrame(updateRoll);

function updateRoll() {
    for (let i = 0; i < rollState.length; i++) {
        let activeRoll = document.querySelectorAll('*[id^="roll-' + rollState[i] + '"]')[document.querySelectorAll('*[id^="roll-' + rollState[i] + '"]').length - 1]
        if (!!activeRoll) {
            let actualHeight = activeRoll.clientHeight;
            activeRoll.style.height = (actualHeight + 10) + "px";
            activeRoll.style.bottom = "20%";
        }
    }

    for (let n = 0; n < document.querySelectorAll('.roll').length; n++) {
        let actualBottom = parseInt(document.querySelectorAll('.roll')[n].style.bottom.split("%")[0]);
        if (actualBottom <= 100) {
            document.querySelectorAll('.roll')[n].style.bottom = (actualBottom + 1) + "%";
        } else {
            document.body.removeChild(document.querySelectorAll('.roll')[n])
        }
    }

    requestAnimationFrame(updateRoll);

}


function ctrls() {
    var _this = this;

    this.counter = 4;
    this.els = {
        decrement: document.querySelector('.ctrl__button--decrement'),
        counter: {
            container: document.querySelector('.ctrl__counter'),
            num: document.querySelector('.ctrl__counter-num'),
            input: document.querySelector('.ctrl__counter-input')
        },
        increment: document.querySelector('.ctrl__button--increment')
    };

    this.decrement = function() {
        var counter = _this.getCounter();
        var nextCounter = (_this.counter > 2) ? --counter : counter;
        _this.setCounter(nextCounter);
    };

    this.increment = function() {
        var counter = _this.getCounter();
        var nextCounter = (counter < 10) ? ++counter : counter;
        _this.setCounter(nextCounter);
    };

    this.getCounter = function() {
        return _this.counter;
    };

    this.setCounter = function(nextCounter) {
        _this.counter = nextCounter;
    };

    this.debounce = function(callback) {
        setTimeout(callback, 100);
    };

    this.render = function(hideClassName, visibleClassName) {
        _this.els.counter.num.classList.add(hideClassName);

        setTimeout(function() {
            _this.els.counter.num.innerText = _this.getCounter();
            let reBuildPiano = new ReDraw();
            reBuildPiano.redraw(document.querySelector('piano-key'), _this.getCounter())
            _this.els.counter.input.value = _this.getCounter();
            _this.els.counter.num.classList.add(visibleClassName);
        }, 100);

        setTimeout(function() {
            _this.els.counter.num.classList.remove(hideClassName);
            _this.els.counter.num.classList.remove(visibleClassName);
        }, 1100);
    };

    this.ready = function() {
        _this.els.decrement.addEventListener('click', function() {
            _this.debounce(function() {
                _this.decrement();
                _this.render('is-decrement-hide', 'is-decrement-visible');
            });
        });

        _this.els.increment.addEventListener('click', function() {
            _this.debounce(function() {
                _this.increment();
                _this.render('is-increment-hide', 'is-increment-visible');
            });
        });

        _this.els.counter.input.addEventListener('input', function(e) {
            var parseValue = parseInt(e.target.value);
            if (!isNaN(parseValue) && parseValue >= 0) {
                _this.setCounter(parseValue);
                _this.render();
            }
        });

        _this.els.counter.input.addEventListener('focus', function(e) {
            _this.els.counter.container.classList.add('is-input');
        });

        _this.els.counter.input.addEventListener('blur', function(e) {
            _this.els.counter.container.classList.remove('is-input');
            _this.render();
        });
    };
};