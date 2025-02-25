import ollama from 'ollama';
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {


	const disposable = vscode.commands.registerCommand('deepseek-offline.start', () => {

		const panel = vscode.window.createWebviewPanel(
			'deepChat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{ enableScripts: true}
		);

		panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';

                try {
                    const streamResponse = await ollama.chat({
                        model: 'deepseek-r1:1.5b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });

                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
                } catch (err) {
                    panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(err)}` });
                }
            }
            });
        });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return /*html*/`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            <style>
                body {
                    font-family: sans-serif;
                    margin: 2rem;
                    background-color: #1e1e1e;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                textarea, #response {
                    width: 100%;
                    max-width: 800px;
                    box-sizing: border-box;
                    padding: 10px;
                    border-radius: 8px;
                    margin-top: 10px;
                    font-size: 16px;
                }
                textarea {
                    height: 80px;
                    background-color: #2c2f33;
                    color: white;
                    border: none;
                }
                #response {
                    border: 1px solid #444;
                    min-height: 100px;
                    white-space: pre-wrap;
                    background-color: #282c34;
                    color: #abb2bf;
                    font-family: "Courier New", monospace;
                    padding: 15px;
                }
                pre {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 10px;
                    border-radius: 5px;
                    overflow-x: auto;
                }
                code {
                    font-family: "Courier New", monospace;
                }
                #askBtn {
                    display: inline-block;
                    background: linear-gradient(135deg, #a8ff78, #78ffd6);
                    border: none;
                    padding: 12px 24px;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 25px;
                    cursor: pointer;
                    transition: 0.3s ease-in-out;
                }
                #askBtn:hover {
                    background: linear-gradient(135deg, #78ffd6, #a8ff78);
                    transform: scale(1.05);
                }
                #modifyStyleBtn {
                    background: none;
                    border: none;
                    font-size: 14px;
                    color: #bbb;
                    cursor: pointer;
                    text-decoration: underline;
                    margin-top: 10px;
                    transition: color 0.3s ease-in-out;
                }
                #modifyStyleBtn:hover {
                    color: white;
                }
                .settings {
                    display: none;
                    flex-direction: row;
                    gap: 15px;
                    margin-top: 15px;
                    align-items: center;
                    border-top: 1px solid #444;
                    padding-top: 15px;
                }
                .setting-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .setting-label {
                    font-size: 14px;
                    font-weight: bold;
                    color: #ddd;
                }
                .custom-select {
                    padding: 8px 15px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    outline: none;
                    transition: 0.3s ease-in-out;
                    border: none;
                    color: black;
                    background: linear-gradient(135deg, #a8ff78, #78ffd6);
                }
                .custom-select:hover {
                    background: linear-gradient(135deg, #78ffd6, #a8ff78);
                    transform: scale(1.05);
                }
                .custom-select option {
                    font-size: 14px;
                    background: #1e1e1e;
                    color: white;
                    padding: 8px;
                }
                .custom-select option:hover,
                .custom-select option:focus {
                    background: linear-gradient(135deg, #78ffd6, #a8ff78);
                    color: black;
                }
            </style>
        </head>
        <body>
            <h2>Sovereign GPT</h2>
            
            <button id="modifyStyleBtn">Modify Style</button>
            <div class="settings" id="settings">
                <div class="setting-group">
                    <span class="setting-label">Font:</span>
                    <select id="fontSelect" class="custom-select">
                        <option value="Courier New">Courier New</option>
                        <option value="Arial">Arial</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Monospace">Monospace</option>
                    </select>
                </div>
                <div class="setting-group">
                    <span class="setting-label">Font Size:</span>
                    <select id="fontSizeSelect" class="custom-select">
                        <option value="14px">14px</option>
                        <option value="16px" selected>16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                    </select>
                </div>
                <div class="setting-group">
                    <span class="setting-label">Background:</span>
                    <select id="bgSelect" class="custom-select">
                        <option value="#282c34" selected>Dark</option>
                        <option value="white">Light</option>
                        <option value="#f4f4f4">Gray</option>
                    </select>
                </div>
            </div>

            <textarea id="prompt" placeholder="Ask something..."></textarea><br />
            <button id="askBtn">Ask</button>
            <div id="response"></div>
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('askBtn').addEventListener('click', () => {
                    const text = document.getElementById('prompt').value;
                    vscode.postMessage({ command: 'chat', text });
                });

                window.addEventListener('message', event => {
                    const { command, text } = event.data;
                    if (command === 'chatResponse') {
                        document.getElementById('response').innerHTML = marked.parse(text);
                    }
                });

                function applyStyles() {
                    const font = document.getElementById('fontSelect').value;
                    const fontSize = document.getElementById('fontSizeSelect').value;
                    const bgColor = document.getElementById('bgSelect').value;

                    document.getElementById('prompt').style.fontFamily = font;
                    document.getElementById('prompt').style.fontSize = fontSize;
                    document.getElementById('prompt').style.backgroundColor = bgColor;
                    document.getElementById('prompt').style.color = bgColor === "white" ? "black" : "white";

                    document.getElementById('response').style.fontFamily = font;
                    document.getElementById('response').style.fontSize = fontSize;
                    document.getElementById('response').style.backgroundColor = bgColor;
                    document.getElementById('response').style.color = bgColor === "white" ? "black" : "#abb2bf";
                }

                document.getElementById('fontSelect').addEventListener('change', applyStyles);
                document.getElementById('fontSizeSelect').addEventListener('change', applyStyles);
                document.getElementById('bgSelect').addEventListener('change', applyStyles);

                document.getElementById('modifyStyleBtn').addEventListener('click', () => {
                    const settingsMenu = document.getElementById('settings');
                    settingsMenu.style.display = settingsMenu.style.display === 'flex' ? 'none' : 'flex';
                });
            </script>
        </body>
        </html>
    `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
