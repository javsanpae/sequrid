import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { syncDocument } from './lib/i18n/index.svelte';

syncDocument();

const app = mount(App, { target: document.getElementById('app')! });

export default app;
