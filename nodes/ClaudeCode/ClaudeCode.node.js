const { query } = require('@anthropic-ai/claude-code');

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

                    // Create abort controller for timeout
                    const abortController = new AbortController();
                    const timeoutId = setTimeout(() => abortController.abort(), timeout * 1000);

                    const startTime = Date.now();
                    let result = '';
                    const messages = [];

                    try {
                        // Call Claude Code query
                        const stream = query(prompt, {
                            model,
                            maxTurns,
                            abort: abortController.signal,
                        });

                        // Collect messages from stream
                        for await (const message of stream) {
                            messages.push(message);
                            if (message.text) {
                                result += message.text;
                            }
                        }
                    } finally {
                        clearTimeout(timeoutId);
                    }

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
                            messages: messages,
                            result: result,
                            duration: duration,
                            model: model,
                        };
                    } else {
                        output = {
                            result: result,
                            messages: messages,
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
