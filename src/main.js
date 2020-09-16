import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		isLive: location.pathname === '/live',
		isDev: location.origin.includes('localhost'),
	}
});

export default app;