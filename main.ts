import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault } from 'obsidian';
import { simpleGit, SimpleGit, CleanOptions, SimpleGitOptions } from 'simple-git';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';

let simpleGitOptions: Partial<SimpleGitOptions>;
let git: SimpleGit;


interface GHSyncSettings {
	remoteURL: string;
	gitLocation: string;
	gitDirectory: string;
	additionalPath: string;
	syncinterval: number;
	isSyncOnLoad: boolean;
	checkStatusOnLoad: boolean;
	commitMessageTemplate: string;
	branch: string;
	disableGpgSigning: boolean;
}

const DEFAULT_SETTINGS: GHSyncSettings = {
	remoteURL: '',
	gitLocation: '',
	gitDirectory: '',
	additionalPath: '',
	syncinterval: 0,
	isSyncOnLoad: false,
	checkStatusOnLoad: true,
	commitMessageTemplate: '{{hostname}} {{date}} {{time}}',
	branch: 'main',
	disableGpgSigning: false,
}

/**
 * Format a commit message using the template and available variables
 */
function formatCommitMessage(template: string, hostname: string, date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	const dateStr = `${year}-${month}-${day}`;
	const timeStr = `${hours}:${minutes}:${seconds}`;
	const datetimeStr = `${dateStr} ${timeStr}`;
	const iso8601 = date.toISOString();

	return template
		.replace(/\{\{hostname\}\}/g, hostname)
		.replace(/\{\{date\}\}/g, dateStr)
		.replace(/\{\{time\}\}/g, timeStr)
		.replace(/\{\{datetime\}\}/g, datetimeStr)
		.replace(/\{\{iso8601\}\}/g, iso8601)
		.replace(/\{\{year\}\}/g, String(year))
		.replace(/\{\{month\}\}/g, month)
		.replace(/\{\{day\}\}/g, day);
}


export default class GHSyncPlugin extends Plugin {

	settings: GHSyncSettings;

	/**
	 * Get the base path for git operations
	 * Returns either the configured git directory or the vault root
	 */
	getGitBasePath(): string {
		//@ts-ignore
		const vaultPath = this.app.vault.adapter.getBasePath();
		if (this.settings.gitDirectory && this.settings.gitDirectory.trim()) {
			const path = require('path');
			return path.join(vaultPath, this.settings.gitDirectory.trim());
		}
		return vaultPath;
	}

	/**
	 * Get environment with additional PATH directories
	 */
	getGitEnv(): { [key: string]: string } | undefined {
		if (!this.settings.additionalPath || !this.settings.additionalPath.trim()) {
			return undefined;
		}

		const additionalPaths = this.settings.additionalPath.trim();
		const currentPath = process.env.PATH || '';
		const pathSeparator = process.platform === 'win32' ? ';' : ':';

		return {
			...process.env,
			PATH: additionalPaths + pathSeparator + currentPath
		} as { [key: string]: string };
	}

	/**
	 * Create a configured SimpleGit instance
	 */
	createGit(): SimpleGit {
		const basePath = this.getGitBasePath();
		const gitBinary = this.settings.gitLocation ? this.settings.gitLocation + "git" : "git";
		const customEnv = this.getGitEnv();

		const gitInstance = simpleGit({
			baseDir: basePath,
			binary: gitBinary,
			maxConcurrentProcesses: 6,
			trimmed: false,
		});

		if (customEnv) {
			gitInstance.env(customEnv);
		}

		return gitInstance;
	}

	async SyncNotes()
	{
		new Notice("Syncing to GitHub remote");

		const remote = this.settings.remoteURL.trim();

		// Validate remote URL is configured
		if (!remote) {
			new Notice("GitHub Sync: No remote URL configured.\nGo to Settings > GitHub Sync to set your repository URL.", 10000);
			return;
		}

		const basePath = this.getGitBasePath();
		const gitBinary = this.settings.gitLocation ? this.settings.gitLocation + "git" : "git";
		const customEnv = this.getGitEnv();

		simpleGitOptions = {
			baseDir: basePath,
			binary: gitBinary,
			maxConcurrentProcesses: 6,
			trimmed: false,
		};
		git = simpleGit(simpleGitOptions);

		// Set custom environment if additional PATH is configured
		if (customEnv) {
			git.env(customEnv);
		}

		let os = require("os");
		let hostname = os.hostname();

		// Check if vault is a git repo and git binary works
		let statusResult;
		try {
			statusResult = await git.status();
		} catch (e: any) {
			const errorMsg = e?.message || String(e);

			if (errorMsg.includes("not a git repository")) {
				new Notice("GitHub Sync: Vault is not a Git repository.\n\nRun 'git init' in your vault folder first.", 10000);
			} else if (errorMsg.includes("ENOENT") || errorMsg.includes("spawn") || errorMsg.includes("not found")) {
				const binaryInfo = this.settings.gitLocation
					? `Git binary not found at: ${gitBinary}`
					: "Git binary not found in system PATH.";
				new Notice(`GitHub Sync: ${binaryInfo}\n\nInstall Git or set the binary location in settings.`, 10000);
			} else {
				new Notice(`GitHub Sync: Git error - ${errorMsg}`, 10000);
			}
			return;
		}

		if (!statusResult) {
			new Notice("GitHub Sync: Failed to get repository status.", 10000);
			return;
		}

		let clean = statusResult.isClean();

		// Generate commit message from template
		const date = new Date();
		const template = this.settings.commitMessageTemplate || DEFAULT_SETTINGS.commitMessageTemplate;
		const msg = formatCommitMessage(template, hostname, date);

		// git add . && git commit
		if (!clean) {
			try {
				await git.add("./*");
				// Optionally disable GPG signing for users who have it enabled globally
				if (this.settings.disableGpgSigning) {
					await git.raw(['commit', '-m', msg, '-c', 'commit.gpgsign=false']);
				} else {
					await git.commit(msg);
				}
			} catch (e: any) {
				const errorMsg = e?.message || String(e);
				// Provide helpful message for GPG signing errors
				if (errorMsg.includes('gpg') || errorMsg.includes('signing')) {
					new Notice("GitHub Sync: Commit failed due to GPG signing.\n\nEnable 'Disable GPG signing' in settings, or configure GPG.", 15000);
				} else {
					new Notice("GitHub Sync: Commit failed - " + errorMsg, 10000);
				}
				return;
			}
		} else {
			new Notice("Working branch clean");
		}

		// configure remote - use set-url to preserve upstream tracking
		try {
			const remotes = await git.getRemotes(true);
			const originRemote = remotes.find(r => r.name === 'origin');

			if (originRemote) {
				// Only update if URL has changed
				if (originRemote.refs.fetch !== remote && originRemote.refs.push !== remote) {
					await git.remote(['set-url', 'origin', remote]);
					new Notice("GitHub Sync: Updated remote origin URL");
				}
			} else {
				// No origin remote exists, add it
				await git.addRemote('origin', remote);
				new Notice("GitHub Sync: Added remote origin URL");
			}
		} catch (e) {
			new Notice("GitHub Sync: Failed to configure remote - " + e, 10000);
			return;
		}

		// check if remote url valid by fetching
		try {
			await git.fetch();
		} catch (e) {
			new Notice("GitHub Sync: Invalid remote URL or network error.\n" + e, 10000);
			return;
		}


		// git pull origin <branch>
		const branch = this.settings.branch || DEFAULT_SETTINGS.branch;
		try {
			//@ts-ignore
			await git.pull('origin', branch, { '--no-rebase': null }, (err, update) => {
				if (update) {
					new Notice("GitHub Sync: Pulled " + update.summary.changes + " changes");
				}
			})
		} catch (e) {
			// Check for merge conflicts
			let conflictStatus;
			try {
				conflictStatus = await git.status();
			} catch (statusError) {
				new Notice("GitHub Sync: Pull failed - " + e, 10000);
				return;
			}

			const conflictedFiles = conflictStatus?.conflicted || [];

			if (conflictedFiles.length > 0) {
				let conflictMsg = "GitHub Sync: Merge conflicts in:";
				for (const file of conflictedFiles) {
					conflictMsg += "\n  • " + file;
				}
				conflictMsg += "\n\nResolve conflicts and sync again.";
				new Notice(conflictMsg, 15000);

				// Open conflicted files
				for (const file of conflictedFiles) {
					this.app.workspace.openLinkText("", file, true);
				}
			} else {
				// Pull failed but no conflicts detected - show the error
				new Notice("GitHub Sync: Pull failed - " + e, 10000);
			}
			return;
		}

		// resolve merge conflicts
		// git push origin <branch>
	    if (!clean) {
		    try {
		    	git.push('origin', branch, ['-u']);
		    	new Notice("GitHub Sync: Pushed on " + msg);
		    } catch (e) {
		    	new Notice(e, 10000);
			}
	    }
	}

	async CheckStatusOnStart()
	{
		// check status
		try {
			const gitBinary = this.settings.gitLocation ? this.settings.gitLocation + "git" : "git";
			const customEnv = this.getGitEnv();
			simpleGitOptions = {
			    baseDir: this.getGitBasePath(),
			    binary: gitBinary,
			    maxConcurrentProcesses: 6,
			    trimmed: false,
			};
			git = simpleGit(simpleGitOptions);
			if (customEnv) {
				git.env(customEnv);
			}

			const branch = this.settings.branch || DEFAULT_SETTINGS.branch;

			//check for remote changes
			// git branch --set-upstream-to=origin/<branch>
			await git.branch({'--set-upstream-to': `origin/${branch}`});
			let statusUponOpening = await git.fetch().status();
			if (statusUponOpening.behind > 0)
			{
				// Automatically sync if needed
				if (this.settings.isSyncOnLoad == true)
				{
					this.SyncNotes();
				}
				else
				{
					new Notice("GitHub Sync: " + statusUponOpening.behind + " commits behind remote.\nClick the GitHub ribbon icon to sync.")
				}
			}
			else
			{
				new Notice("GitHub Sync: up to date with remote.")
			}
		} catch (e) {
			// don't care
			// based
		}
	}

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('github', 'Sync with Remote', (evt: MouseEvent) => {
			this.SyncNotes();
		});
		ribbonIconEl.addClass('gh-sync-ribbon');

		this.addCommand({
			id: 'github-sync-command',
			name: 'Sync with Remote',
			callback: () => {
				this.SyncNotes();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GHSyncSettingTab(this.app, this));

		if (!isNaN(this.settings.syncinterval))
		{
			let interval: number = this.settings.syncinterval;
			if (interval >= 1)
			{
				try {
					setIntervalAsync(async () => {
						await this.SyncNotes();
					}, interval * 60 * 1000);
					//this.registerInterval(setInterval(this.SyncNotes, interval * 6 * 1000));
					new Notice("Auto sync enabled");
				} catch (e) {
					
				}
			}
		}

		if (this.settings.checkStatusOnLoad)
		{
			this.CheckStatusOnStart();
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// If remote URL is not set, try to read it from existing git config
		if (!this.settings.remoteURL) {
			await this.readRemoteFromGitConfig();
		}

		// If branch is not set, try to read current branch from git
		if (!this.settings.branch) {
			await this.readBranchFromGit();
		}
	}

	/**
	 * Read current branch from git if available
	 */
	async readBranchFromGit() {
		const currentBranch = await this.getCurrentBranch();
		if (currentBranch) {
			this.settings.branch = currentBranch;
			await this.saveSettings();
		}
	}

	/**
	 * Get the current branch name from git
	 */
	async getCurrentBranch(): Promise<string | null> {
		try {
			const tempGit = this.createGit();
			const branchSummary = await tempGit.branchLocal();
			return branchSummary.current || null;
		} catch (e) {
			return null;
		}
	}

	/**
	 * Get list of available local branches
	 */
	async getLocalBranches(): Promise<string[]> {
		try {
			const tempGit = this.createGit();
			const branchSummary = await tempGit.branchLocal();
			return branchSummary.all || [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Switch to a different branch
	 */
	async switchBranch(branchName: string): Promise<boolean> {
		try {
			const tempGit = this.createGit();

			// Check for uncommitted changes
			const status = await tempGit.status();
			if (!status.isClean()) {
				new Notice("GitHub Sync: Cannot switch branches with uncommitted changes.\n\nCommit or stash your changes first.", 10000);
				return false;
			}

			await tempGit.checkout(branchName);
			this.settings.branch = branchName;
			await this.saveSettings();
			new Notice(`GitHub Sync: Switched to branch '${branchName}'`);
			return true;
		} catch (e: any) {
			new Notice("GitHub Sync: Failed to switch branch - " + (e?.message || e), 10000);
			return false;
		}
	}

	/**
	 * Read existing remote URL from .git/config if available
	 */
	async readRemoteFromGitConfig() {
		try {
			const tempGit = this.createGit();
			const remotes = await tempGit.getRemotes(true);
			const origin = remotes.find(r => r.name === 'origin');

			if (origin && origin.refs.fetch) {
				this.settings.remoteURL = origin.refs.fetch;
				await this.saveSettings();
			}
		} catch (e) {
			// Silently ignore - this just means we couldn't read the git config
			// User will need to configure manually
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class GHSyncSettingTab extends PluginSettingTab {
	plugin: GHSyncPlugin;

	constructor(app: App, plugin: GHSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		const howto = containerEl.createEl("div", { cls: "howto" });
		howto.createEl("div", { text: "How to use this plugin", cls: "howto_title" });
		howto.createEl("small", { text: "Grab your GitHub repository's HTTPS or SSH url and paste it into the settings here. If you're not authenticated, the first sync with this plugin should prompt you to authenticate. If you've already setup SSH on your device with GitHub, you won't need to authenticate - just paste your repo's SSH url into the settings here.", cls: "howto_text" });
		howto.createEl("br");
        const linkEl = howto.createEl('p');
        linkEl.createEl('span', { text: 'See the ' });
        linkEl.createEl('a', { href: 'https://github.com/kevinmkchin/Obsidian-GitHub-Sync/blob/main/README.md', text: 'README' });
        linkEl.createEl('span', { text: ' for more information and troubleshooting.' });

		new Setting(containerEl)
			.setName('Remote URL')
			.setDesc('')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.remoteURL)
				.onChange(async (value) => {
					this.plugin.settings.remoteURL = value;
					await this.plugin.saveSettings();
				})
        	.inputEl.addClass('my-plugin-setting-text'));

		// Branch setting with dropdown
		const branchSetting = new Setting(containerEl)
			.setName('Branch')
			.setDesc('Select the branch to sync with. You can type a branch name or select from available local branches.');

		// Create text input with datalist for branch suggestions
		branchSetting.addText(text => {
			text.setPlaceholder('main')
				.setValue(this.plugin.settings.branch)
				.onChange(async (value) => {
					this.plugin.settings.branch = value;
					await this.plugin.saveSettings();
				});

			// Load branches asynchronously and populate datalist
			const inputEl = text.inputEl;
			const datalistId = 'branch-suggestions';
			inputEl.setAttribute('list', datalistId);

			const datalist = document.createElement('datalist');
			datalist.id = datalistId;
			inputEl.parentElement?.appendChild(datalist);

			// Fetch branches and populate datalist
			this.plugin.getLocalBranches().then(branches => {
				datalist.empty();
				for (const branch of branches) {
					const option = document.createElement('option');
					option.value = branch;
					datalist.appendChild(option);
				}
			});

			return text;
		});

		// Add refresh button to reload branches
		branchSetting.addButton(button => button
			.setButtonText('Refresh')
			.setTooltip('Refresh branch list')
			.onClick(async () => {
				const branches = await this.plugin.getLocalBranches();
				const datalist = containerEl.querySelector('#branch-suggestions');
				if (datalist) {
					datalist.empty();
					for (const branch of branches) {
						const option = document.createElement('option');
						option.value = branch;
						datalist.appendChild(option);
					}
				}
				new Notice(`Found ${branches.length} local branches`);
			}));

		new Setting(containerEl)
			.setName('Git directory')
			.setDesc('Optional subdirectory within the vault where the .git folder is located. Leave empty to use vault root.')
			.addText(text => text
				.setPlaceholder('e.g., notes or subfolder/myrepo')
				.setValue(this.plugin.settings.gitDirectory)
				.onChange(async (value) => {
					this.plugin.settings.gitDirectory = value;
					await this.plugin.saveSettings();
				})
        	.inputEl.addClass('my-plugin-setting-text2'));

		new Setting(containerEl)
			.setName('Git binary location')
			.setDesc('This is optional! Set this only if git is not findable via your system PATH, then provide its location here. See README for more info.')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.gitLocation)
				.onChange(async (value) => {
					this.plugin.settings.gitLocation = value;
					await this.plugin.saveSettings();
				})
        	.inputEl.addClass('my-plugin-setting-text2'));

		new Setting(containerEl)
			.setName('Additional PATH directories')
			.setDesc('Additional directories to add to PATH for git extensions like Git LFS. Separate multiple paths with ; (Windows) or : (Mac/Linux).')
			.addText(text => text
				.setPlaceholder('e.g., /usr/local/bin or C:\\Program Files\\Git LFS')
				.setValue(this.plugin.settings.additionalPath)
				.onChange(async (value) => {
					this.plugin.settings.additionalPath = value;
					await this.plugin.saveSettings();
				})
        	.inputEl.addClass('my-plugin-setting-text2'));

		new Setting(containerEl)
			.setName('Check status on startup')
			.setDesc('Check to see if you are behind remote when you start Obsidian.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.checkStatusOnLoad)
				.onChange(async (value) => {
					this.plugin.settings.checkStatusOnLoad = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto sync on startup')
			.setDesc('Automatically sync with remote when you start Obsidian if there are unsynced changes.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.isSyncOnLoad)
				.onChange(async (value) => {
					this.plugin.settings.isSyncOnLoad = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto sync at interval')
			.setDesc('Set minute interval after which your vault is synced automatically. Auto sync is disabled if this field is left empty or not a positive integer. Restart Obsidan to take effect.')
			.addText(text => text
				.setValue(String(this.plugin.settings.syncinterval))
				.onChange(async (value) => {
					this.plugin.settings.syncinterval = Number(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Commit message template')
			.setDesc('Customise the commit message. Variables: {{hostname}}, {{date}}, {{time}}, {{datetime}}, {{iso8601}}, {{year}}, {{month}}, {{day}}')
			.addText(text => text
				.setPlaceholder('{{hostname}} {{date}} {{time}}')
				.setValue(this.plugin.settings.commitMessageTemplate)
				.onChange(async (value) => {
					this.plugin.settings.commitMessageTemplate = value;
					await this.plugin.saveSettings();
				})
			.inputEl.addClass('my-plugin-setting-text'));

		new Setting(containerEl)
			.setName('Disable GPG signing')
			.setDesc('Disable GPG commit signing for this plugin. Enable this if commits fail with GPG errors.')
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.disableGpgSigning)
				.onChange(async (value) => {
					this.plugin.settings.disableGpgSigning = value;
					await this.plugin.saveSettings();
				}));
	}
}
