const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');

class ClaudeCode {
    constructor() {
        this.description = {
            displayName: 'Claude Code (Custom)',
            name: 'claudeCodeCustom',
            icon: 'fa:robot',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Use Claude Code for AI-powered analysis and troubleshooting',
            defaults: {
                name: 'Claude Code',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Query',
                            value: 'query',
                            description: 'Send a prompt to Claude Code',
                        },
                    ],
                    default: 'query',
                },
                {
                    displayName: 'Prompt',
                    name: 'prompt',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    default: '',
                    description: 'The prompt to send to Claude Code',
                    required: true,
                },
                {
                    displayName: 'Model',
                    name: 'model',
                    type: 'options',
                    options: [
                        {
                            name: 'Sonnet',
                            value: 'sonnet',
                        },
                        {
                            name: 'Opus',
                            value: 'opus',
                        },
                    ],
                    default: 'sonnet',
                    description: 'Claude model to use',
                },
                {
                    displayName: 'Max Turns',
                    name: 'maxTurns',
                    type: 'number',
                    default: 1,
                    description: 'Maximum conversation turns',
                },
                {
                    displayName: 'Timeout (seconds)',
                    name: 'timeout',
                    type: 'number',
                    default: 60,
                    description: 'Maximum time to wait',
                },
                {
                    displayName: 'Output Format',
                    name: 'outputFormat',
                    type: 'options',
                    options: [
                        {
                            name: 'Text',
                            value: 'text',
                        },
                        {
                            name: 'Messages',
                            value: 'messages',
                        },
                        {
                            name: 'Full Response',
                            value: 'full',
                        },
                    ],
                    default: 'text',
                    description: 'Format of the output',
                },
            ],
        };
    }

    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);

        for (let i = 0; i < items.length; i++) {
            try {
                if (operation === 'query') {
                    const prompt = this.getNodeParameter('prompt', i);
                    const model = this.getNodeParameter('model', i);
                    const maxTurns = this.getNodeParameter('maxTurns', i);
                    const timeout = this.getNodeParameter('timeout', i);
                    const outputFormat = this.getNodeParameter('outputFormat', i);

                    const startTime = Date.now();

                    // Actually call Claude Code CLI
                    const result = await new Promise((resolve, reject) => {
                        const args = [
                            '-p', prompt,
                            '--output-format', 'text',
                            '--max-turns', String(maxTurns),
                            '--model', model
                        ];

                        const child = spawn('claude', args, {
                            timeout: timeout * 1000,
                            env: {
                                ...process.env,
                                HOME: process.env.HOME || '/home/node'
                            }
                        });

                        let stdout = '';
                        let stderr = '';

                        child.stdout.on('data', (data) => {
                            stdout += data.toString();
                        });

                        child.stderr.on('data', (data) => {
                            stderr += data.toString();
                        });

                        child.on('close', (code) => {
                            if (code === 0) {
                                resolve(stdout.trim());
                            } else {
                                reject(new Error(`Claude Code exited with code ${code}: ${stderr}`));
                            }
                        });

                        child.on('error', (err) => {
                            reject(new Error(`Failed to spawn Claude Code: ${err.message}. Make sure 'claude' CLI is installed and in PATH.`));
                        });
                    });

                    const duration = Date.now() - startTime;

                    // Format output based on user selection
                    let output;
                    if (outputFormat === 'text') {
                        output = {
                            result: result,
                            duration: duration,
                            model: model,
                        };
                    } else if (outputFormat === 'messages') {
                        output = {
                            result: result,
                            duration: duration,
                            model: model,
                        };
                    } else {
                        output = {
                            result: result,
                            duration: duration,
                            model: model,
                            prompt: prompt,
                            maxTurns: maxTurns,
                        };
                    }

                    returnData.push({
                        json: output,
                        pairedItem: { item: i },
                    });
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                            prompt: this.getNodeParameter('prompt', i),
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}

module.exports = {
    ClaudeCode,
};
