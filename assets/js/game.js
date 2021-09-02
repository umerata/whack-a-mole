// (function(){

    const holes = document.querySelectorAll('.hole');
    const maxHoles = holes.length;
    const activeHolesObjects = [];
    const holesList = [];
    const hitSound = new Audio('./assets/sounds/hit.wav');

    /* Game Stats */
    const gameScores = {
        hit: 0,
        miss: 0
    }

    /* Game settings */
    const settings = {
        difficulty: 0,
        duration: 30,
        cursor: 0,
    }

    /* Selectors */
    const html = document.getElementsByTagName("html")[0];
    const mainMenu = document.getElementsByClassName("main-options")[0];
    const mainMenuBtnSec = document.getElementsByClassName("game__end")[0];
    const timeInfoSec = document.getElementsByClassName("game__bottom-info")[0];
    const startingCountdownSec = document.getElementsByClassName("game__top-start-timer")[0];
    const gameHitMissSec = document.getElementsByClassName("game__top-stats")[0];
    const gameSection = document.getElementById("game-section");
    const settingsBtn = document.getElementById("js-settings-show");
    const mainMenuBtn = document.getElementById("js-main-menu");
    const startBtn = document.getElementById("js-start");
    const popup = document.getElementById("settings-popup");
    const popupClose = document.getElementById("js-popup-close");
    const hitScore = document.getElementById("js-game-hit-score");
    const missScore = document.getElementById("js-game-miss-score");
    const timeLeft = document.getElementById("js-game-timeleft");
    const gameTable = document.getElementById("game-table");
    const gameStartTimerSpan = document.getElementById("js-game-start-timer");
    const radioDifficultyClass = "js-difficulty-radio";
    const radioDurationClass = "js-duration-radio";
    const radioCursorClass = "js-custom-cursor-radio";
    const defaultAnimationDuration = 300;
    const countDownTimerSecs = 3;
    let savedSettings = localStorage.getItem('wam-game');


    const toggleCursor = () => {
        if(settings.cursor){
            html.classList.add('cursor-enabled');            
        }else{
            html.classList.remove('cursor-enabled');            
        }
    }

    /* Show Effect */
    const showElement = (element, hiddenElement = true, duration = defaultAnimationDuration,  callback) => {
        element.style.transitionDuration = `${duration  / 1000}s`;
        if(hiddenElement){
            element.classList.add('show-start');
            setTimeout(() => {
                element.classList.add('show-end');
            })
            setTimeout(() => {
                callback && callback();
            },duration + 5);
        }else{
            element.classList.remove('hide-end');
            setTimeout(() => {
                element.classList.remove('hide-start');
            })
            setTimeout(() => {
                callback && callback();
            },duration + 5);
        }
    }

    /* Hide Effect */
    const hideElement = (element, hiddenElement = true, duration = defaultAnimationDuration, callback) => {
        element.style.transitionDuration = `${duration  / 1000}s`;
        if(hiddenElement){
            element.classList.remove('show-end');
            setTimeout(() => {
                element.classList.remove('show-start');
                element.style.removeProperty('transition-duration');
                callback && callback()
            },duration + 5);
        }else{
            element.classList.add('hide-start');
            setTimeout(() => {
                element.classList.add('hide-end');
                callback && callback()
            },duration + 5);

        }

    }

    // add radio events and assign value to variable
    const addRadioEvents = (selector,assignTo) => {
        document.querySelectorAll(`.${selector}`).forEach((radio => {
            radio.addEventListener('change', () => {
                const checkedRadio = document.querySelectorAll(`.${selector}:checked`)[0];
                assignTo(parseInt(checkedRadio.value));
            });
        }))
    }

    addRadioEvents(radioDifficultyClass, (value) => {
        settings.difficulty = value;
        localStorage.setItem('wam-game',JSON.stringify(settings));
    }); 

    addRadioEvents(radioDurationClass, (value) => {
        settings.duration = value;
        localStorage.setItem('wam-game',JSON.stringify(settings));
    });

    addRadioEvents(radioCursorClass, (value) => {
        settings.cursor = value;
        toggleCursor();
        localStorage.setItem('wam-game',JSON.stringify(settings));
    });

    if(savedSettings){
        savedSettings = JSON.parse(savedSettings);
        console.log('saved settings: ', savedSettings);
        if(savedSettings.hasOwnProperty('difficulty')){
            if(savedSettings.difficulty === 0 || savedSettings.difficulty === 1 || savedSettings.difficulty === 2){
                // settings.difficulty = savedSettings.difficulty;
                document.querySelectorAll(`.${radioDifficultyClass}[value="${savedSettings.difficulty}"]`)[0].click();
            }
        }
        if(savedSettings.hasOwnProperty('duration')){
            if(savedSettings.duration === 30 || savedSettings.duration === 45 || savedSettings.duration === 60){
                // settings.duration = savedSettings.duration;
                document.querySelectorAll(`.${radioDurationClass}[value="${savedSettings.duration}"]`)[0].click();
            }
        }
        if(savedSettings.hasOwnProperty('cursor')){
            if(savedSettings.cursor === 0 || savedSettings.cursor === 1){
                // settings.cursor = savedSettings.cursor;
                document.querySelectorAll(`.${radioCursorClass}[value="${savedSettings.cursor}"]`)[0].click();
            }
        }
    }

    settingsBtn.addEventListener('click',() => {
        hideElement(mainMenu, false);
        showElement(popup);
    })

    startBtn.addEventListener('click',() => {
        timeLeft.innerText = settings.duration;
        hideElement(mainMenu, false , defaultAnimationDuration, () => {
            setTimeout(() => {
                showElement(gameSection, true,  defaultAnimationDuration, () => {
                    gameInit();
                });
            },50)
        });
    })

    popupClose.addEventListener('click',() => {
        showElement(document.getElementsByClassName("main-options")[0], false);
        hideElement(popup);
    })

    
    mainMenuBtn.addEventListener('click',() => {
        hideElement(gameSection, true , defaultAnimationDuration, () => {
            showElement(mainMenu, false,  defaultAnimationDuration + 150, () => {

                gameStartTimerSpan.innerText = countDownTimerSecs;
                resetGameScores();
                hideElement(gameHitMissSec, true, 0);
                hideElement(mainMenuBtnSec, true, 0);
                showElement(startingCountdownSec, false, 0);
                showElement(timeInfoSec, false, 0);
                showElement(gameTable, false, 0);

            });
        });
    })


    
    
    /*  */

    const gameInit = () => {
        let startTime = countDownTimerSecs;
        gameStartTimerSpan.innerText = startTime;
        startCountDown = setInterval(() => {
            --startTime;
            gameStartTimerSpan.innerHTML = startTime;
            if(startTime === 0) {
                clearInterval(startCountDown);
                hideElement(startingCountdownSec, false, 200, () => {
                    showElement(gameHitMissSec, true, 200, () => {
                        startPlay();
                    });
                });
            }
        }, 1000);
    }

    const startPlay = () => {
        const gameInterval = startPopping();
        let time = settings.duration;
        const timeInterval = setInterval(() => {
            --time;
            timeLeft.innerText = time;
            if(time === 2){
                clearInterval(gameInterval);
            }
            if(time === 0){
                clearInterval(timeInterval);
                popInAll();

                hideElement(timeInfoSec, false);
                hideElement(gameTable, false , defaultAnimationDuration, () => {
                    showElement(mainMenuBtnSec, true,  defaultAnimationDuration + 150);
                })
                
            }
        },1000)
    }

// })()

/* Cursor Movement */

const arrow = document.getElementsByClassName('cursor')[0];
const mouseX = (event) => event.clientX;
const mouseY = (event) => event.clientY;
positionElement = (event) => {
    mouse = {
        x: mouseX(event),
        y: mouseY(event)
    }
    arrow.style.top = mouse.y + 'px'
    arrow.style.left = mouse.x + 'px'
}
let timer = false;
window.onmousemove = init = (event) => {
        _event = event
        timer = setTimeout(() => {
            positionElement(_event)
        }, 1)
}


class circleClass {
    elem;
    index;
    active = false;
    timeout;
    constructor(i) {
        this.index = i;
        this.elem = holes[i];
        this.elem.getElementsByClassName('hole__animal')[0].addEventListener('click', () => {
            if(this.active){
                this.hit();
            }
        })
    }
    hit(){
        hitSound.pause()
        hitSound.play()
        this.elem.classList.add('hole--hit');
        this.popIn(true);
    }
    popOut(setPopInTimer = true){
        this.active = true;
        this.elem.classList.remove('hole--hit');
        this.elem.classList.add('hole--active');

        if(setPopInTimer){
            this.timeout = setTimeout(() => {
                this.popIn(false);        
            }, getRandomDuration() * 1000);
        }
    }
    popIn(hit){
        clearTimeout(this.timeout);

        if(hit){
            gameScores.hit++;
        }else{
            gameScores.miss++
        }

        updateGameScores(gameScores);

        this.elem.classList.remove('hole--active');

        setTimeout(() => {
            this.active = false;
        },50);
        
        setTimeout(() => {
            this.elem.classList.remove('hole--hit');
        },60);
        
    }
    
}

const resetGameScores = () => {
    gameScores.hit = 0;
    gameScores.miss = 0;
    updateGameScores(gameScores);
}

const updateGameScores = ({hit,miss}) => {
    hitScore.innerText = hit;
    missScore.innerText = miss;
}

const getRandomCircle = () => {
    return Math.floor(Math.random() * maxHoles)
}

const getRandomDuration = () => {
    let duration = 0;
    if(settings.difficulty === 0){
        duration = Math.random() * 3 + 1.9;
    }else if(settings.difficulty === 1){
        duration = Math.random() * 3 + 1.3;
    }else{
        duration = Math.random() * 3 + 0.7;
    }
    return duration;
}

const popingLoopIntervalTime = () => {
    let duration = 0;
    if(settings.difficulty === 0){
        duration = 600;
    }else if(settings.difficulty === 1){
        duration = 500;
    }else{
        duration = 400;
    }
    return duration;
}

/* randomize holes */

const startPopping = () => {
    const maxHolesATime = getMaxActiveHolesAtATime();
    const popupLoopIntervalTime = popingLoopIntervalTime();
    
    return interval = setInterval(() => {
        let circleFound = false;
        const activeHolesCount = holesList.filter(item => item.active).length
        if (activeHolesCount < maxHolesATime) {
            do {
                const circleNumber = getRandomCircle();
                if (!holesList[circleNumber].active ) {
                    circleFound = true;
                }
                if (circleFound) {
                    holesList[circleNumber].popOut();
                }
            } while (!circleFound)
        }
    }, popupLoopIntervalTime)
}

const getMaxActiveHolesAtATime = () => {
    if(settings.difficulty === 0){
        return 4;
    }else if(settings.difficulty === 1){
        return 6;
    }else{
        return maxHoles;
    }
}

holes.forEach((item,i) => {
    holesList.push(new circleClass(i));
})

const popOutAll = () => {
    holesList.forEach((item, i) => {
        item.popOut(false);
    }) 
}

const popInAll = () => {
    holesList.forEach((item, i) => {
        item.active && item.popIn(false);
    }) 
}