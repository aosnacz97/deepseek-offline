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
                const selectedModel = message.model || 'deepseek-r1:1.5b'; // Default model
                let responseText = '';
        
                try {
                    const streamResponse = await ollama.chat({
                        model: selectedModel,
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
            <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/monokai.min.css">
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
                textarea {
                    width: 100%;
                    max-width: 800px;
                    height: 80px;
                    background-color: #2c2f33;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px;
                    font-size: 16px;
                    resize: none;
                }
                #response {
                    width: 100%;
                    max-width: 800px;
                    border-radius: 8px;
                    background-color: #282c34;
                    color: #abb2bf;
                    font-family: "Courier New", monospace;
                    padding: 15px;
                    margin-top: 10px;
                    overflow-x: auto;
                    word-wrap: break-word;
                }
                pre {
                    background: #282c34;
                    color: #f8f8f2;
                    padding: 10px;
                    border-radius: 5px;
                    overflow-x: auto;
                }
                code {
                    font-family: "Courier New", monospace;
                    background-color: #282c34;
                    padding: 2px 5px;
                    border-radius: 4px;
                    color: #f8f8f2;
                }
                .button-container {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    max-width: 800px;
                    margin-top: 15px;
                    gap: 10px;
                }
                .styled-button, .model-select {
                    flex: 1;
                    text-align: center;
                    padding: 10px 20px;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 25px;
                    cursor: pointer;
                    border: none;
                    transition: 0.3s ease-in-out;
                    background: linear-gradient(135deg, #a8ff78, #78ffd6);
                    color: black;
                }
                .styled-button:hover, .model-select:hover {
                    background: linear-gradient(135deg, #78ffd6, #a8ff78);
                    transform: scale(1.05);
                }
                .model-select {
                    appearance: none;
                    text-align: center;
                    cursor: pointer;
                }
                .model-select option {
                    font-size: 14px;
                    background: #1e1e1e;
                    color: white;
                    padding: 8px;
                }
                .model-select option:hover {
                    background: linear-gradient(135deg, #78ffd6, #a8ff78);
                    color: black;
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
            </style>
        </head>
        <body>
            <h2>Sovereign GPT</h2>

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

            <div class="button-container">
                <select id="modelSelect" class="model-select">
                    <option value="deepseek-r1:1.5b" selected>DeepSeek R1 (1.5B)</option>
                    <option value="qwen2.5:1.5b">Qwen 2.5 (1.5B)</option>
                    <option value="llama3.2:1b">LLaMA 3.2 (1B)</option>
                </select>
                <button id="askBtn" class="styled-button">Ask</button>
            </div>

            <div id="response"></div>

            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('askBtn').addEventListener('click', () => {
                    const text = document.getElementById('prompt').value;
                    const selectedModel = document.getElementById('modelSelect').value;

                    vscode.postMessage({
                        command: 'chat',
                        text: text,
                        model: selectedModel
                    });
                });

                window.addEventListener('message', event => {
                    const { command, text } = event.data;
                    if (command === 'chatResponse') {
                        document.getElementById('response').innerHTML = marked.parse(text);
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });
                    }
                });

            </script>
        </body>
        </html>
    `;
}


// This method is called when your extension is deactivated
export function deactivate() {}