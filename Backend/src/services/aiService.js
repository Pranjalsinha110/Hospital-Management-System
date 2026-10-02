const path = require("path");
const { spawn } = require("child_process");

const PYTHON_PATH = path.join(
    __dirname,
    "..",
    "..",
    "ai",
    "venv",
    "Scripts",
    "python.exe"
);

const PYTHON_SCRIPT = path.join(
    __dirname,
    "..",
    "..",
    "ai",
    "graph.py"
);


const getChatbotResponse = (message) => {
    return new Promise((resolve, reject) => {

        const pythonProcess = spawn(
            PYTHON_PATH,
            [PYTHON_SCRIPT],
            {
                cwd: path.dirname(PYTHON_SCRIPT),
                windowsHide: true
            }
        );

        let output = "";
        let errorOutput = "";


        pythonProcess.stdout.setEncoding("utf8");
        pythonProcess.stderr.setEncoding("utf8");


        // -----------------------------
        // Python stdout
        // -----------------------------

        pythonProcess.stdout.on("data", (data) => {
            output += data;
        });


        // -----------------------------
        // Python stderr
        // -----------------------------

        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data;
        });


        // -----------------------------
        // Process start error
        // -----------------------------

        pythonProcess.on("error", (error) => {

            reject(
                new Error(
                    `Failed to start AI chatbot: ${error.message}`
                )
            );

        });


        // -----------------------------
        // Process completed
        // -----------------------------

        pythonProcess.on("close", (code) => {

            const trimmedOutput = output.trim();
            const trimmedError = errorOutput.trim();


            // Python process failed
            if (code !== 0) {

                console.error(
                    "[AI Python Error]",
                    trimmedError || "No Python error output"
                );

                console.error(
                    "[AI Python Output]",
                    trimmedOutput || "No Python output"
                );


                // Try to extract structured error
                if (trimmedOutput) {

                    try {

                        const result = JSON.parse(
                            trimmedOutput
                        );

                        if (result.error) {
                            return reject(
                                new Error(result.error)
                            );
                        }

                    } catch (error) {
                        // Ignore JSON parsing error here
                    }

                }


                return reject(
                    new Error(
                        trimmedError ||
                        `AI chatbot process exited with code ${code}`
                    )
                );
            }


            // No output
            if (!trimmedOutput) {

                return reject(
                    new Error(
                        "AI chatbot returned an empty response"
                    )
                );

            }


            // Parse JSON
            try {

                const result = JSON.parse(
                    trimmedOutput
                );


                if (result.error) {

                    return reject(
                        new Error(result.error)
                    );

                }


                if (
                    typeof result.response !== "string" ||
                    !result.response.trim()
                ) {

                    return reject(
                        new Error(
                            "AI chatbot returned an invalid response"
                        )
                    );

                }


                resolve(
                    result.response.trim()
                );

            } catch (error) {

                return reject(
                    new Error(
                        `Invalid JSON received from AI chatbot: ${error.message}`
                    )
                );

            }

        });


        // -----------------------------
        // Send message to Python
        // -----------------------------

        pythonProcess.stdin.write(
            JSON.stringify({
                message: message.trim()
            })
        );

        pythonProcess.stdin.end();

    });
};


module.exports = {
    getChatbotResponse 
};