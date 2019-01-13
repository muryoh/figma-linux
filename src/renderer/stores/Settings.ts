import * as E from 'electron';
import * as S from 'electron-settings';
import { observable, action, toJS, autorun } from 'mobx';

import * as Const from 'Const';

export class Settings {
	@observable settings: ISettings;

	constructor() {
		this.settings = S.getAll() as any;

		this.events();
	}

	@action
	public updateFigmaUiScale = (delta: number) => {
		const d = +(delta / 100).toFixed(2);

		if (d) {
			this.settings.ui.scaleFigmaUI = d;
		} else {
			this.settings.ui.scaleFigmaUI = 1;
		}

		E.remote.app.emit('updateFigmaUiScale', d);
	}
	@action
	public updatePanelScale = (delta: number) => {
		const d = +(delta / 100).toFixed(2);

		if (d) {
			this.settings.ui.scalePanel = d;
		} else {
			this.settings.ui.scalePanel = 1;
		}

		E.remote.app.emit('updatePanelScale', d);
	}

	@action
	public updateShowMainMenu = (show: boolean) => {
		this.settings.app.showMainMenu = show;
	}
	@action
	public updateWindowFrame = (show: boolean) => {
		this.settings.app.windowFrame = show;
	}

	@action
	public selectExportDir = () => {
		const dirs = E.remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

		this.settings.app.exportDir = dirs[0];
	}
	@action
	public inputExportDir = (dir: string) => {
		this.settings.app.exportDir = dir;
	}

	@action
	public addDir = () => {
		const dirs = E.remote.dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] });

		this.settings.app.fontDirs = [
			...this.settings.app.fontDirs,
			...dirs
		];
	}
	@action
	public removeDir = (index: number) => {
		if (this.settings.app.fontDirs.length <= 1) {
			return;
		}

		this.settings.app.fontDirs = this.settings.app.fontDirs.filter((e, i) => i !== index);
	}

	private events = () => {
		E.ipcRenderer.on(Const.UPDATEUISCALE, (sender: Event, scale: number) => {
			this.settings.ui.scaleFigmaUI = scale;
		});
		E.ipcRenderer.on(Const.UPDATEPANELSCALE, (sender: Event, scale: number) => {
			this.settings.ui.scalePanel = scale;
		});
	}
}

export const settings = new Settings();

autorun(() => {
	console.log('settings.settings: ', toJS(settings.settings));
	S.setAll(toJS(settings.settings));
});

