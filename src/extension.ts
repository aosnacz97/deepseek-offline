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
                const selectedModel = message.model || 'deepseek-r1:1.5b';
                let responseText = '';
        
                try {

                    panel.webview.postMessage({ command: 'showLoader' });

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
                } finally {
                    panel.webview.postMessage({ command: 'hideLoader' });
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
                .loader {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 50px;
                    height: 50px;
                    border: 4px solid transparent;
                    border-top: 4px solid #a8ff78;
                    border-right: 4px solid #78ffd6;
                    border-bottom: 4px solid #a8ff78;
                    border-left: 4px solid #78ffd6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    display: none;
                }
                @keyframes spin {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
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

            <textarea id="prompt" placeholder="Ask something..." rows="1"></textarea><br />

            <div class="button-container">
                <select id="modelSelect" class="model-select">
                    <option value="deepseek-r1:1.5b" selected>DeepSeek R1 (1.5B)</option>
                    <option value="qwen2.5:1.5b">Qwen 2.5 (1.5B)</option>
                    <option value="llama3.2:1b">LLaMA 3.2 (1B)</option>
                </select>
                <button id="askBtn" class="styled-button">Ask</button>
            </div>

            <div id="response">
                <div id="loader" class="loader"></div>
                <div id="responseContent"></div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const promptTextarea = document.getElementById('prompt');
                const responseContent = document.getElementById('responseContent');
                const loader = document.getElementById('loader');

                promptTextarea.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });

                document.getElementById('askBtn').addEventListener('click', () => {
                    const text = promptTextarea.value;
                    const selectedModel = document.getElementById('modelSelect').value;

                    vscode.postMessage({
                        command: 'chat',
                        text: text,
                        model: selectedModel
                    });
                });

                window.addEventListener('message', event => {
                    const { command, text } = event.data;
                    if (command === 'showLoader') {
                        loader.style.display = 'block';
                        responseContent.innerHTML = '';
                    } else if (command === 'hideLoader') {
                        loader.style.display = 'none';
                    } else if (command === 'chatResponse') {
                        responseContent.innerHTML = marked.parse(text);
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