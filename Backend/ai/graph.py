import json
import sys
import traceback
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
from langgraph.graph import StateGraph, START, END

from state import ChatState
from chat_node import chat_node


# --------------------------------------------------
# LangGraph Workflow
# --------------------------------------------------

workflow = StateGraph(ChatState)

workflow.add_node(
    "chat_node",
    chat_node
)

workflow.add_edge(
    START,
    "chat_node"
)

workflow.add_edge(
    "chat_node",
    END
)

app = workflow.compile()


# --------------------------------------------------
# Main Entry Point
# --------------------------------------------------

def main():
    try:
        # Read JSON input from Node.js
        input_data = sys.stdin.read()

        if not input_data.strip():
            raise ValueError("No input received")

        # Parse JSON
        data = json.loads(input_data)

        message = data.get("message")

        if (
            not isinstance(message, str)
            or not message.strip()
        ):
            raise ValueError("Message is required")

        # Run LangGraph
        result = app.invoke(
            {
                "message": message.strip(),
                "response": ""
            }
        )

        # Get response
        response = result.get("response")

        if (
            not isinstance(response, str)
            or not response.strip()
        ):
            raise ValueError(
                "AI returned an empty response"
            )

        # Send ONLY JSON to Node.js stdout
        print(
            json.dumps(
                {
                    "response": response.strip()
                },
                ensure_ascii=False
            )
        )

        sys.stdout.flush()

    except Exception as error:

        # Send traceback to stderr
        traceback.print_exc(file=sys.stderr)

        # Send structured error to stdout
        print(
            json.dumps(
                {
                    "error": str(error)
                },
                ensure_ascii=False
            )
        )

        sys.stdout.flush()

        sys.exit(1)


if __name__ == "__main__":
    main()