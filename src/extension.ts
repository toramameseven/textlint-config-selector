// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, workspace, commands } from 'vscode';
import * as vscode from 'vscode';

import { StatusBar } from "./status";
const statusBar = new StatusBar();

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "textlint-config" is now active!');

  const selectConfigCommand = commands.registerCommand("textlint-config-selector.statusBarMenu", selectConfig);
  const pickConfigsCommands = commands.registerCommand("textlint-config-selector.pickConfigs", pickConfigs);
  context.subscriptions.push(selectConfigCommand, pickConfigsCommands, statusBar);

  const pickedConfig = getConfig<string>("textlint", "configPath", "");
  statusBar.setTooltip(`Selected config: ${pickedConfig}`);
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (statusBar) {
    statusBar.dispose();
  }
}

async function pickConfigs() {
  //select folder
  const folder = await window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select textlint config folder",
  });
  if (!folder || folder.length === 0) {
    // User cancelled the folder selection
    return;
  }
  // select files starting with .textlintrc recursively in the selected folder
  const folderPath = folder[0].fsPath;
  const configFiles = await workspace.findFiles(
    new vscode.RelativePattern(folderPath, "**/.textlintrc*"),
    "**/node_modules/**" // exclude node_modules
  );

  // update textlint-config.optionalConfigPathes
  const configPaths = configFiles.map(file => file.fsPath);
  await workspace.getConfiguration("textlint-config-selector").update(
    "optionalConfigPathes",
    configPaths,
    // for global scope
    true
  );

  // update textlint.nodePath
  const nodePath = folderPath + "\\node_modules";
  // check if node_modules exists
  const fs = require('fs');
  if (!fs.existsSync(nodePath)) {
    window.showErrorMessage("No node_modules found in the selected folder.");
    return;
  }
  await workspace.getConfiguration("textlint").update(
    "nodePath",
    nodePath,
    // for global scope
    true
  );
}


const selectConfig = async () => {
  const pathes = getConfig<string[]>("textlint-config-selector","optionalConfigPathes", []);
  if (pathes.length > 0) {
    const items = pathes.map((path) => {
      return {
        label: path,
        description: path,
      };
    });
    const picked = await window.showQuickPick(items, {
      placeHolder: "select a textlint config file",
    });
    if (picked) {
      await workspace.getConfiguration("textlint").update(
        "configPath",
        picked.label,
        // for global scope
        true
      );
      statusBar.setTooltip(`Selected config: ${picked.label}`);
    }
  }
};


/**
 * get vscode configuration
 * @param section 
 * @param subSection 
 * @param defaults 
 * @returns 
 */
function getConfig<T>(section: string, subSection: string, defaults: T) {
  return vscode.workspace.getConfiguration(section).get<T>(subSection, defaults);
}

