/**
 * @license
 * Copyright (c) 2020 Deloitte Digital AU. All rights reserved.
 * This code may only be used under the BSD style license found at /LICENSE
 */
import { LitElement } from 'lit-element';
import { CLASSES, EVENTS } from './_options.js';

/**
 * Toggle Button that controls the <dk-offscreen> container and adds a11y
 * controls like aria- tags and keeps the button in sync with the container.
 *
 * @element dk-offscreen-toggle
 *
 * @slot - An <a> or <button> element that will act as the interactive button for the expandable container.
 *
 * @fires dk-offscreen-toggle.click - On click, fires this event which is listened to by the container.
 *
 * @attr {String} for - The ID of the container that this toggle button controls.
 */
export default class DKOffscreenToggle extends LitElement {
	static get properties() {
		return {
			for: {
				type: String,
			},
		};
	}

	constructor() {
		super();

		// properties default values
		this.for = '';

		// internal references
		this._expanded = true;
		this._button = null;

		// internal functions
		this._onButtonClick = event => {
			event.preventDefault();

			this.dispatchEvent(new CustomEvent(EVENTS.TOGGLE, {
				cancelable: true,
				bubbles: true,
				detail: {
					target: this.for,
					opener: this._button,
				},
			}));
		};

		this._onUpdate = event => {
			const { id, expanded, disabled } = event.detail;

			if (this.for === id) {
				this._expanded = expanded;

				if (this._expanded) {
					this.classList.add(CLASSES.IS_EXPANDED);
				} else {
					this.classList.remove(CLASSES.IS_EXPANDED);
				}

				if (disabled) {
					this._button.setAttribute('disabled', '');
					this._button.removeAttribute('aria-expanded');
				} else {
					this._button.removeAttribute('disabled');
					this._button.setAttribute('aria-expanded', this._expanded);
				}
			}
		};
	}

	connectedCallback() {
		super.connectedCallback();

		if (typeof(this.for) === 'undefined' || this.for === '') {
			throw new Error('`for` attribute is required for <dk-offscreen-toggle>.');
		}

		this._button = this.querySelector('a, button');

		if (this._button === null) {
			this.innerHTML = `<button>${this.innerHTML}</button>`;
			this._button = this.querySelector('button');
		}

		if (this._button.nodeName === 'A') {
			this._button.setAttribute('href', '');
			this._button.setAttribute('role', 'button');
		}

		this._button.setAttribute('aria-controls', this.for);
		this._button.setAttribute('aria-expanded', this._expanded);

		this._button.addEventListener(EVENTS.CLICK, this._onButtonClick);
		window.addEventListener(EVENTS.UPDATE, this._onUpdate);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._button.removeEventListener(EVENTS.CLICK, this._onButtonClick);
		window.removeEventListener(EVENTS.UPDATE, this._onUpdate);
	}

	createRenderRoot() {
		// use Light DOM instead of Shadow DOM.
		return this;
	}
}
