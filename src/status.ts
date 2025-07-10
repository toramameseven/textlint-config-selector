import { window, StatusBarAlignment, TextEditor } from "vscode";

export class StatusBar {
  private _delegate = window.createStatusBarItem(StatusBarAlignment.Right, 0);
  constructor() {
    this._delegate.text = "TLconfig";
    this._delegate.command = "textlint-config.statusBarMenu"; // ステータスバークリックでコマンド実行
    this._delegate.show();
  }

  dispose() {
    this._delegate.dispose();
  }

  setTooltip(tooltip: string) {
    this._delegate.tooltip = tooltip;
  }

  show(show: boolean) {
    if (show) {
      this._delegate.show();
    } else {
      this._delegate.hide();
    }
  }
}
