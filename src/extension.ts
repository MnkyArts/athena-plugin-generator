import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Athena Plugin Generator is now active. Use the command "Athena Plugin Generator: Create Plugin" to create a new plugin.'
  );

  let disposable = vscode.commands.registerCommand(
    "athena-plugin-generator.createPlugin",
    () => {
      vscode.window
        .showInputBox({ prompt: "Enter the Plugin name:" })
        .then((folderName) => {
          if (folderName) {
            vscode.window
              .showQuickPick(["Yes", "No"], {
                placeHolder: "Do you want a webview folder?",
              })
              .then((option) => {
                const hasWebviewFolder = option === "Yes";
                createFolderStructure(folderName, hasWebviewFolder);
              });
          } else {
            vscode.window.showErrorMessage("Please enter a Plugin name.");
          }
        });
    }
  );

  context.subscriptions.push(disposable);
}

function createFolderStructure(folderName: string, hasWebviewFolder: boolean) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders && workspaceFolders.length > 0) {
    const activeWorkspace = workspaceFolders[0];

    const workspacePath = activeWorkspace.uri.fsPath;

    const pluginsFolderPath = path.join(
      workspacePath,
      "src",
      "core",
      "plugins"
    );
    const clientFolderPath = path.join(pluginsFolderPath, folderName, "client");
    const serverFolderPath = path.join(pluginsFolderPath, folderName, "server");
    const webviewFolderPath = path.join(
      pluginsFolderPath,
      folderName,
      "webview"
    );

    const clientSrcPath = path.join(clientFolderPath, "src");
    const serverSrcPath = path.join(serverFolderPath, "src");

    try {
      fs.mkdirSync(path.join(pluginsFolderPath, folderName));
      fs.mkdirSync(clientFolderPath);
      fs.mkdirSync(serverFolderPath);

      if (hasWebviewFolder) {
        fs.mkdirSync(webviewFolderPath);
      }

      fs.mkdirSync(clientSrcPath);
      fs.mkdirSync(serverSrcPath);

      fs.writeFileSync(path.join(clientFolderPath, "index.ts"), "");
      fs.writeFileSync(
        path.join(serverFolderPath, "index.ts"),
        generateServerIndexContent(folderName)
      );

      vscode.window.showInformationMessage(
        `Plugin ${folderName} created successfully.`
      );
    } catch (error: any) {
      if (error.code === "ENOENT") {
        vscode.window.showErrorMessage(
          `Couldn't the Plugins folder. Are you sure you are using Athena?`
        );
      } else {
        vscode.window.showErrorMessage("Error creating folder structure.");
      }
    }
  } else {
    vscode.window.showErrorMessage("No workspace is opened.");
  }
}

function generateServerIndexContent(folderName: string): string {
  return `
import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

const PLUGIN_NAME = '${folderName}';
Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
	
});
`;
}

export function deactivate() {}
