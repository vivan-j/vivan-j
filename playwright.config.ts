import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		// Use dev server for local e2e to avoid Windows symlink issues from adapter-vercel
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: true
	},
	testDir: 'e2e'
});
