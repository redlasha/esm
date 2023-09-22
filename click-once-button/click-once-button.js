/**
 * click once button loading mode
 * @type {{EveryFinished: string, FailToLoad: string}}
 */
export const LOADING_MODE = {
    FailFinished : 'FailFinished',
    EveryFinished : 'EveryFinished'
}

/**
 * click once를 적용하는 custom html element
 * 
 * 1. 문자열로 tag 생성 및 추가
 *    clickonce attribute에 문자열 넣기 가능
 * 
 * 2. document.createElement('click-once-button')
 * 
 * 3. 또는 import ~ 후 let btn = new ClickOnceButton()
 *
 *
 *
 * attributes 설명
 * - clickonce : function
 * - buttonstyle : 내부 버튼의 style
 * - text : 버튼의 텍스트
 * - loading : EveryFinished를 키로 입력하면 매번 다시 호출하게 됨
 */
export class ClickOnceButton extends HTMLElement {
    _clickonce;
    _text;
    _style;
    _button;

    /**
     * MODE.FailToLoad - error 발생시에만 다시 click 가능하게 함. 예: request, regist 등
     * MODE.EveryFinished - error 또는 성공시에 다시 click 가능하게 함. 예: download, text 등
     *
     * @type {string}
     * @private
     */
    _loading = LOADING_MODE.FailToLoad;

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this._button = document.createElement('button');
        // this._button.href = "javascript:;"
        this.shadowRoot.appendChild(this._button)

        if (this._text) {
            this._setText();
        }
        
        if (this._style) {
            this._setStyle();
        }
        
        if (this._clickonce) {
            this._setClickOnce();
        }

    }

    disconnectedCallback() {
        this.shadowRoot.innerHTML = '';   
    }

    static get observedAttributes() {
        return ["clickonce", "text", "buttonstyle", "loading"];
    }

    _setText() {
        if (!this._button) {
            return;
        }
        this._button.textContent = this._text;
    }
    _setStyle() {
        if (!this._button) {
            return;
        }

        if (typeof this._style === 'object') {
            Object.assign(this._button.style, this._style);
        } else if (typeof this._style === 'string') {
            this._button.style = this._style;
        } else {
            console.warn('invalid style? ' + this._style)
        }
    }
    _setClickOnce() {
        if (!this._button) {
            return;
        }
        const funcWrapper = async () => {
            try {
                if (typeof this._clickonce === 'function') {
                    await this._clickonce();
                } else if (typeof this._clickonce === 'string') {
                    await eval(this._clickonce)
                } else {
                    console.warn('click once is not function. input: ' + newValue)
                }
            } catch (e) {
                if (this._loading === LOADING_MODE.FailFinished) {
                    this._button.addEventListener('click', funcWrapper, {once: true});
                }
            } finally {
                if (this._loading === LOADING_MODE.EveryFinished) {
                    this._button.addEventListener('click', funcWrapper, {once: true});
                }
            }
        };

        // init setting
        this._button.addEventListener('click', funcWrapper, {once: true});
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        this[attrName] = newValue;
        console.debug('change attr ', attrName, newValue)
    }

    get clickonce() {
        return this._clickonce;
    }
    set clickonce(val) {
        this._clickonce = val;
        this._setClickOnce();
    }

    get loading() {
        return this._loading;
    }

    set loading(val) {
        this._loading = val;
    }

    get text() {
        return this._text;
    }

    set text(val) {
        this._text = val;
        this._setText();
    }

    get buttonstyle() {
        return this._style;
    }

    set buttonstyle(val) {
        this._style = val;
        this._setStyle();
    }
}

customElements.define('click-once-button', ClickOnceButton)

const SECONDS = 1000;

/**
 * click once를 테스트할 수 있는 delay 함수
 * @param {*} seconds 딜레이 시킬 초 숫자값
 * @returns 
 */
export const delay = (seconds) => {
    return new Promise((resolve, reject) =>{
        setTimeout(() => resolve(), seconds * SECONDS);
    })
}

// 임시로 테스트를 위해서
window.delayFunc = delay;
