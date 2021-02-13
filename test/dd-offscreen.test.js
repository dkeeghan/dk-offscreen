import { html, fixture, expect } from '@open-wc/testing';

import '../dk-offscreen.js';

describe('DD Offscreen Navigation', () => {
	describe('Toggle Button <dk-offscreen-toggle>', () => {
		it('successfully converts the for attribute to a property', async () => {
			const el = await fixture(html`
			<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>
			`);

			expect(el.for).to.equal('ex-1');
		});

		it('adds a `<button>` element if no button or link is provided', async () => {
			const el = await fixture(html`
			<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>
			`);

			const button = el.querySelectorAll('button');

			expect(button.length).to.equal(1);
		});

		it('applies `aria-controls` attribute to the internal `<button>` tag', async () => {
			const el = await fixture(html`
			<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>
			`);

			const button = el.querySelector('button');

			expect(button).has.attribute('aria-controls', 'ex-1');
		});

		it('applies `aria-controls` attribute to the internal `<a>` tag', async () => {
			const el = await fixture(html`
			<dk-offscreen-toggle for="ex-1"><a href="#ex-1">Click me</a></dk-offscreen-toggle>
			`);

			const link = el.querySelector('a');

			expect(link).has.attribute('aria-controls', 'ex-1');
		});
	});

	describe('Container <dk-offscreen>', () => {
		it('successfully converts the `id` attribute to a property', async () => {
			const el = await fixture(html`
			<dk-offscreen id="ex-1">Content</dk-offscreen>
			`);

			expect(el.id).to.equal('ex-1');
			expect(el.innerHTML).to.equal('Content');
		});

		it('by default initialises into a collapsed state', async () => {
			const el = await fixture(html`
			<dk-offscreen id="ex-1"></dk-offscreen>
			`);

			expect(el.expanded).to.equal(false);
		});

		it('applies the expanded attribute and class when expanded', async () => {
			const el = await fixture(html`
			<dk-offscreen id="ex-1" expanded></dk-offscreen>
			`);

			expect(el).to.have.class('is-expanded');
			expect(el.expanded).to.equal(true);
		});
	});

	describe('Working together - on load', async () => {
		it('syncs the toggle with the container', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1">Content</dk-offscreen>`);

			expect(button).to.have.attribute('aria-expanded', 'false');
			expect(container.expanded).to.equal(false);
		});

		it('syncs the toggle with the container when expanded', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1" expanded>Content</dk-offscreen>`);

			expect(button).to.have.attribute('aria-expanded', 'true');
			expect(container.expanded).to.equal(true);
		});

		it('syncs the toggle with the container when disabled', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1" disabled>Content</dk-offscreen>`);

			expect(button).to.have.attribute('disabled');
			expect(container.disabled).to.equal(true);
		});
	});

	describe('Working together - after load/on interaction', async () => {
		it('syncs the toggle with the container when the button is clicked and the container is expanded', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1">Content</dk-offscreen>`);

			button.click();

			return new Promise(resolve => {
				setTimeout(() => {
					expect(button).to.have.attribute('aria-expanded', 'true');
					expect(container.expanded).to.equal(true);
					resolve();
				}, 500);
			});
		});

		it('syncs the toggle with the container when the button is clicked and the container is collapsed', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1" expanded>Content</dk-offscreen>`);

			button.click();

			return new Promise(resolve => {
				setTimeout(() => {
					expect(button).to.have.attribute('aria-expanded', 'false');
					expect(container.expanded).to.equal(false);
					resolve();
				}, 500);
			});
		});

		it('syncs the toggle with the container when the container is disabled', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1">Content</dk-offscreen>`);

			expect(container.disabled).to.equal(false);

			container.setAttribute('disabled', '');

			return new Promise(resolve => {
				setTimeout(() => {
					expect(button).to.have.attribute('disabled');
					expect(container.disabled).to.equal(true);
					resolve();
				}, 100);
			});
		});

		it('syncs the toggle with the container when the container is re-enabled', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1" disabled>Content</dk-offscreen>`);

			expect(container.disabled).to.equal(true);

			container.removeAttribute('disabled');

			return new Promise(resolve => {
				setTimeout(() => {
					expect(button).to.not.have.attribute('disabled');
					expect(container.disabled).to.equal(false);
					resolve();
				}, 100);
			});
		});

		it('syncs the toggle with the container when the button is clicked and the container is expanded when animation is disabled', async () => {
			await fixture(html`<style>dk-offscreen { transition: none; }</style>`);

			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button = toggle.querySelector('button');
			const container = await fixture(html`<dk-offscreen id="ex-1" no-animation>Content</dk-offscreen>`);

			button.click();

			return new Promise(resolve => {
				setTimeout(() => {
					expect(button).to.have.attribute('aria-expanded', 'true');
					expect(container.expanded).to.equal(true);
					resolve();
				}, 10);
			});
		});
	});

	describe('Multiple offscreen navs', async () => {
		it('collapses the expanded nav when a different nav is expanded', async () => {
			const toggle1 = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const button1 = toggle1.querySelector('button');
			const container1 = await fixture(html`<dk-offscreen id="ex-1"expanded>Content</dk-offscreen>`);

			const toggle2 = await fixture(html`<dk-offscreen-toggle for="ex-2">Click me</dk-offscreen-toggle>`);
			const button2 = toggle2.querySelector('button');
			const container2 = await fixture(html`<dk-offscreen id="ex-2">Content</dk-offscreen>`);

			expect(button1).to.have.attribute('aria-expanded', 'true');
			expect(container1.expanded).to.equal(true);

			expect(button2).to.have.attribute('aria-expanded', 'false');
			expect(container2.expanded).to.equal(false);

			button2.click();

			return new Promise(resolve => {
				setTimeout(() => {
					expect(button1).to.have.attribute('aria-expanded', 'false');
					expect(container1.expanded).to.equal(false);

					expect(button2).to.have.attribute('aria-expanded', 'true');
					expect(container2.expanded).to.equal(true);

					resolve();
				}, 500);
			});
		});
	});

	describe('Accessibility', async () => {
		it('passes the a11y audit when expanded', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const container = await fixture(html`<dk-offscreen id="ex-1" expanded>Content</dk-offscreen>`);

			await expect(toggle).dom.to.be.accessible();
			await expect(container).dom.to.be.accessible();
		});

		it('passes the a11y audit when collapsed', async () => {
			const toggle = await fixture(html`<dk-offscreen-toggle for="ex-1">Click me</dk-offscreen-toggle>`);
			const container = await fixture(html`<dk-offscreen id="ex-1">Content</dk-offscreen>`);

			await expect(toggle).dom.to.be.accessible();
			await expect(container).dom.to.be.accessible();
		});
	});
});
