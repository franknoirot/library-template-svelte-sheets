import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		isLive: location.pathname === '/live'
	}
});

export default app;