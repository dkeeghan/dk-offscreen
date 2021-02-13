export const CONTENT = {
	BACK_TO: 'Back to',
	MAIN_MENU: 'Main menu',
	MENU: 'Menu',
};

export const EVENTS = {
	CLICK: 'click',
	TOGGLE: 'dk-offscreen-toggle.click',
	UPDATE: 'dk-offscreen.update',
	HAS_COLLAPSED: 'dk-offscreen.has-collapsed',
	HAS_EXPANDED: 'dk-offscreen.has-expanded',
};

export const CLASSES = {
	IS_EXPANDED: 'is-expanded',
	IS_DISPLAYED: 'is-displayed',
	HAS_CHILDREN: 'has-children',
	BACK_TO_PARENT: '_back-to-parent',
	PARENT_LINK: '_link-parent',
};

export const SELECTORS = {
	DD_OFFSCREEN: 'dk-offscreen',
	DD_OFFSCREEN_PAGE: 'dk-offscreen-page',
	IS_EXPANDED: `.${CLASSES.IS_EXPANDED}`,
	IS_DISPLAYED: `.${CLASSES.IS_DISPLAYED}`,
	IS_ACTIVE_PAGE: '[aria-current="page"]',
	HAS_CHILDREN: `.${CLASSES.HAS_CHILDREN}`,
	BACK_TO_PARENT: `.${CLASSES.BACK_TO_PARENT}`,
};

export default {
	CONTENT,
	EVENTS,
	CLASSES,
	SELECTORS,
};
