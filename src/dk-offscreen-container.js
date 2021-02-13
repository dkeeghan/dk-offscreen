/**
 * @license
 * Copyright (c) 2020 Deloitte Digital AU. All rights reserved.
 * This code may only be used under the BSD style license found at /LICENSE
 */
import { LitElement } from 'lit-element';
import { CLASSES, EVENTS } from './_options.js';
import DKA11y from '@dkwd/dk-a11y';
import DDBreakpoints from '@deloitte-digital-au/ddbreakpoints/lib/dd.breakpoints.es6';

/**
 * Global offscreen navigation that can be opened and closed by a toggle button.
 *
 * @element dk-offscreen
 *
 * @fires dk-offscreen.update - When a change is made to the state of the container, this event is fired to let any subscribed buttons know to also update.
 * @fires dk-offscreen.has-collapsed - When the container is closed this event is fired to let any subscribed actions that the animation has completed.
 *
 * @attr {String} id - An id is required for the container so it can be targeted by the toggle button
 * @attr {Boolean} [expanded=false] - Sets or unsets the expanded state of the container
 * @attr {Boolean} [from-right=false] - Open from the right hand side
 * @attr {Boolean} [disabled=false] - Disables the component and resets it to open by default and removes functionality
 * @attr {Boolean} [enabledAt=''] - Enables and disables the component at different screen sizes using DDBreakpoints
 */
export default class DKOffscreenContainer extends LitElement {
	static get properties() {
		return {
			id: {
				type: String,
			},
			expanded: {
				type: Boolean,
				reflect: true,
			},
			fromRight: {
				type: Boolean,
				attribute: 'from-right',
			},
			disabled: {
				type: Boolean,
				reflect: true,
			},
			enabledAt: {
				type: String,
				attribute: 'enabled-at',
			},
			disabledByMq: {
				type: Boolean,
				reflect: true,
				attribute: 'disabled-by-mq',
			}
		};
	}

	constructor() {
		super();

		// props default values
		this.id = '';
		this.expanded = false;
		this.fromRight = false;
		this.noAnimation = false;
		this.disabled = false;
		this.enabledAt = null;
		this.disabledByMq = false;

		// internal references
		this._mediaQuery = null;
		this._hasBeenInitialised = false;
		this._isInitialExpand = (this.getAttribute('expanded'));
		this._opener = null; // button that opens the navigation
		this._escapeId = null;

		// internal functions
		this._hide = (noAnimation = false) => {
			DKA11y.noScroll.unset();
			DKA11y.trapFocus.unset(this);
			DKA11y.hideOthers.unset(this);
			DKA11y.onEscape.unset(this);
			DKA11y.onClickOutside.unset();

			if (this._opener) {
				this._opener.focus();
				this.opener = null;
			}

			this.classList.remove(CLASSES.IS_EXPANDED);

			const _onTransitionEnd = () => {
				if (this.disabledByMq) {
					this.setAttribute('aria-hidden', 'false');
				} else {
					this.setAttribute('aria-hidden', 'true');
				}

				this.removeEventListener('transitionend', _onTransitionEnd);

				this.dispatchEvent(new CustomEvent(EVENTS.HAS_COLLAPSED, {
					cancelable: true,
					bubbles: true,
					detail: {
						id: this.id,
					},
				}));
			}

			if (window.getComputedStyle(this, null).getPropertyValue("transition-duration") === '0s') {
				_onTransitionEnd();
			} else {
				this.addEventListener('transitionend', _onTransitionEnd);
			}
		};

		this._show = (noAnimation = false) => {
			const _showDrawer = () => {
				this.setAttribute('aria-hidden', 'false');

				DKA11y.noScroll.set();
				DKA11y.trapFocus.set(this, 'navigation drawer');
				DKA11y.hideOthers.set(this);
				DKA11y.onClickOutside.set(`#${this.id}`, this._hideSelf);
				DKA11y.onEscape.set(this._hideSelf, this);

				this.classList.add(CLASSES.IS_EXPANDED);

				this.focus();

				this.dispatchEvent(new CustomEvent(EVENTS.HAS_EXPANDED, {
					cancelable: true,
					bubbles: true,
					detail: {
						id: this.id,
					},
				}));
			}

			const currentlyShownDrawer = document.querySelectorAll('dk-offscreen.is-expanded:not([disabled])');
			Array.prototype.slice.call(currentlyShownDrawer).filter(drawer => { return drawer.id !== this.id });

			if (currentlyShownDrawer.length > 0) {
				const drawerToHide = currentlyShownDrawer[0];

				const _showAfterHide = () => {
					drawerToHide.removeEventListener(EVENTS.HAS_COLLAPSED, _showAfterHide);
					_showDrawer();
				}

				drawerToHide.addEventListener(EVENTS.HAS_COLLAPSED, _showAfterHide);
				drawerToHide.removeAttribute('expanded');

				return;
			}

			_showDrawer();
		};

		this._hideSelf = () => {
			this.expanded = false;
		};

		this._updateButtons = () => {
			this.dispatchEvent(new CustomEvent(EVENTS.UPDATE, {
				cancelable: true,
				bubbles: true,
				detail: {
					id: this.id,
					expanded: this.expanded,
					disabled: this.disabled,
				},
			}));
		};

		this._onToggle = event => {
			const { target, opener } = event.detail;

			if (this.id === target) {
				this.expanded = !this.expanded;

				if (this.expanded) {
					this._opener = opener;
				}
			}
		};

		this._enable = () => {
			if (!this._shouldBeEnabled()) {
				this.disabled = true;
				return;
			}

			if (this.expanded) {
				this._isInitialExpand = true;
				this.setAttribute('aria-hidden', 'false');
			} else {
				this.setAttribute('aria-hidden', 'true');
			}

			this._updateButtons();

			window.addEventListener(EVENTS.TOGGLE, this._onToggle);
		};

		this._disable = () => {
			this._hideSelf();
			this._updateButtons();

			if (this.disabledByMq) {
				this.setAttribute('aria-hidden', 'false');
			}

			window.removeEventListener(EVENTS.TOGGLE, this._onToggle);
		};

		this._updateOnMediaQuery = event => {
			this.disabledByMq = false;

			if (event.matches && this.disabled) {
				this.disabled = false;
			} else {
				this.disabledByMq = true;
				this.disabled = true;
			}
		}

		this._shouldBeEnabled = () => {
			if (!this.enabledAt) {
				return true;
			}

			if (this._mediaQuery) {
				this._mediaQuery.removeListener(this._updateOnMediaQuery);
			}

			this._mediaQuery = window.matchMedia(DDBreakpoints.get(this.enabledAt));

			this._mediaQuery.addListener(this._updateOnMediaQuery);

			if (this._mediaQuery.matches) {
				return true;
			}

			this.disabledByMq = true;
			return false;
		}
	}

	connectedCallback() {
		super.connectedCallback();

		if (typeof(this.id) === 'undefined' || this.id === '') {
			throw new Error('`id` attribute is required for <dk-offscreen>.');
		}

		this.setAttribute('role', 'region');
		this.setAttribute('tabindex', '-1');

		this._hasBeenInitialised = true;

		if (this.disabled) {
			this._disable();
		} else {
			this._enable();
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._disable();
	}

	attributeChangedCallback(name, oldVal, newVal) {
		super.attributeChangedCallback(name, oldVal, newVal);

		if (!this._hasBeenInitialised) {
			return;
		}

		if (name === 'disabled') {
			// if the newVal is null the attribute was removed
			if (newVal === null) {
				this._enable();
			} else {
				this._disable();
			}
		} else if (name === 'expanded') {
			// if the newVal is null the attribute was removed
			if (newVal === null) {
				this._hide();
			} else {
				if (this._isInitialExpand) {
					this._show(true);
					this._isInitialExpand = false;
				} else {
					this._show();
				}
			}

			this._updateButtons();
		} else if (name === 'enabled-at') {
			if (newVal === null) {
				if (this._mediaQuery) {
					this._mediaQuery.removeListener(this._updateOnMediaQuery);
				}
			} else {
				if (!this._shouldBeEnabled()) {
					this.disabled = true;
				}
			}
		}
	}

	createRenderRoot() {
		// use Light DOM instead of Shadow DOM.
		return this;
	}
}
