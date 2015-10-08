(function() {
    $(document).ready(init);

    var WPM_THRESHOLD = 70;
    var MAX_PROBABILITY = .1;
    var WPM_FOR_MAX_PROBABILITY = 150;

    var POLLING_INTERVAL_MS = 200;
    var POLLING_INTERVAL_MIN = POLLING_INTERVAL_MS / 1000 / 60;

    var SMOOTHING_DURATION_MS = 1000;
    var ALPHA = SMOOTHING_DURATION_MS / (SMOOTHING_DURATION_MS + POLLING_INTERVAL_MS);

    var INVALID_KEYCODES = [
        8,  // Backspace
        16, // Shift
        91, // Cmd
        18, // Option
        17, // Control
        9,  // Tab
        20  // Caps Lock
    ];

    var ADJACENCY_MAP = {
        'q': ['w'],
        'w': ['q', 'e'],
        'e': ['w', 'r'],
        'r': ['t'],
        't': ['r', 'y'],
        'y': ['u'],
        'u': ['y'],
        'i': ['u', 'o'],
        'o': ['p', 'i'],
        'p': ['['],
        'a': ['s'],
        's': ['d'],
        'd': ['f'], 
        'f': ['g'],
        'g': ['f'],
        'h': ['j'],
        'j': ['h'],
        'k': ['l'],
        'l': [';'],
        ';': ['\''],
        'z': ['x'],
        'x': ['z', 'c'],
        'c': ['v'],
        'v': ['b', 'c'],
        'b': ['v'],
        'n': ['m'],
        'm': ['n'],
        ',': ['.'],
        '.': ['/'],
        '1': ['2'],
        '2': ['1', '3'],
        '3': ['2', '4'],
        '4': ['3', '5'],
        '5': ['4', '6'],
        '6': ['5', '7'],
        '7': ['6', '8'],
        '8': ['7', '9'],
        '9': ['8', '0'],
        '0': ['9']
    }

    var _wpm = 0;
    var _numKeystrokes = 0;


    function init() {
        window.addEventListener('keypress', onLetterTyped, true);
        startPollingLoop();
    }

    function startPollingLoop() {
        setInterval(function() {
            var numWords = _numKeystrokes / 5;
            var wpm = numWords / POLLING_INTERVAL_MIN;
            
            // _wpm is a moving average
            _wpm = ALPHA * _wpm + (1 - ALPHA) * wpm;

            // Clear number of keystrokes
            _numKeystrokes = 0;

        }, POLLING_INTERVAL_MS);
    }

    function onLetterTyped(e) {
        // Ignore invalid characters
        if (!isValidCharacter(e.keyCode)) {
            return;
        }

        // Ignore events from elements we don't care about
        $element = $(e.target);
        if (!isValidSrcElement($element)) {
            return;
        }

        // Log the keystroke
        _numKeystrokes++;

        // If we are typing fast enough
        if (_wpm >= WPM_THRESHOLD) {
            var percentToMax = Math.min((_wpm - WPM_THRESHOLD) / (WPM_FOR_MAX_PROBABILITY - WPM_THRESHOLD), 1);
            var probabilityOfTypo = percentToMax * MAX_PROBABILITY;

            if (Math.random() <= probabilityOfTypo) {
                createTypo($element, e.keyCode || e.which);
                e.preventDefault();
                return false;
            }
        }
    }

    function createTypo($input, keyCode) {
        var val = isDiv($input) ? $input.text() : $input.val();
        if (val.length < 2) {
            return;
        }

        var typedChar = String.fromCharCode(keyCode);

        // If the character is in our adjacency map, have a 50% chance that we'll replace it with an
        // adjacent letter
        if (ADJACENCY_MAP[typedChar]) {
            if (Math.random() > .5) {
                var newVal = val + chooseRandomFromArray(ADJACENCY_MAP[typedChar]);
                if (isDiv($input)) {
                    $input.text(newVal);
                    moveCursorToEnd($input);
                } else {
                    $input.val(newVal);
                }
            }
        }
        // Note: The other 50% of the time, we'll just skip a letter, since the caller of this function
        // is always preventing default.
    }

    function isDiv($element) {
        return $element.prop('tagName') == 'DIV';
    }

    function isValidCharacter(keyCode) {
        for (var i = 0; i < INVALID_KEYCODES.length; i++) {
            if (keyCode == INVALID_KEYCODES[i]) {
                return false;
            }
        }
        return true;
    }

    function isValidSrcElement($element) {
        var tagName = $element.prop('tagName').toLowerCase();
        if (tagName == 'input' || tagName == 'textarea') {
            return true;
        } else if (tagName == 'div' && $element.attr('contenteditable') == 'true') {
            return true;
        }
        return false;
    }

    function chooseRandomFromArray(array) {
        var index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    function moveCursorToEnd($div) {
        var range = document.createRange(); //Create a range (a range is a like the selection but invisible)
        range.selectNodeContents($div[0]);  //Select the entire contents of the element with the range
        range.collapse(false);              //collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();  //get the selection object (allows you to change selection)
        selection.removeAllRanges();        //remove any selections already made
        selection.addRange(range);          //make the range you have just created the visible selection
    }
})();

