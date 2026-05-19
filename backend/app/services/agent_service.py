import json
import time
from functools import lru_cache
from typing import Dict, Any, List, Optional, Generator

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition

from app.core.config import settings
from app.services.agent_tools import STOCK_AGENT_TOOLS


SYSTEM_PROMPT = """
You are Market Insight AI, an educational stock market research assistant.

Your job:
Answer stock-market questions by using tools when real data is required.

Important behavior rules:
1. Use tools for stock prices, company information, historical data, financial statements, dividends, and recommendations.
2. Do not invent numbers.
3. Do not give buy/sell/hold financial advice.
4. Do not guarantee future returns.
5. Explain in simple beginner-friendly language.
6. If data is missing, clearly say it is unavailable.
7. Always mention that the response is for education/research, not financial advice.
8. Prefer concise but useful answers.
9. If the user provides a symbol, use that exact symbol.
10. For Indian stocks, symbols usually end with .NS, for example RELIANCE.NS or TCS.NS.

Answer format:
- Direct Answer
- Data Used
- Simple Explanation
- Risks / Limitations
- Educational Note
"""


def message_preview(content: Any, max_chars: int = 400) -> str:
    """
    Creates a short preview of long messages for trace output.
    """
    text = str(content)

    if len(text) <= max_chars:
        return text

    return text[:max_chars] + "...[truncated]"


@lru_cache
def get_agent_llm():
    """
    Creates the Groq chat model and binds tools to it.

    bind_tools means:
    The LLM gets permission to call our stock tools.
    """
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing. Add it inside your .env file.")

    llm = ChatGroq(
        model=settings.GROQ_MODEL,
        temperature=0.2,
        max_tokens=1200,
        timeout=60,
        max_retries=2,
    )

    return llm.bind_tools(STOCK_AGENT_TOOLS)


def call_model(state: MessagesState) -> Dict[str, Any]:
    """
    This is the main agent node.

    It receives current conversation state and asks the LLM:
    - Can you answer now?
    - Or do you need to call a tool?

    If the LLM needs a tool, it returns a tool call.
    If not, it returns final answer.
    """
    llm_with_tools = get_agent_llm()

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        *state["messages"],
    ]

    response = llm_with_tools.invoke(messages)

    return {
        "messages": [response]
    }


@lru_cache
def build_market_agent_graph():
    """
    Builds and compiles the LangGraph workflow.

    Graph flow:

    START
      ↓
    agent node
      ↓
    condition:
      - if tool needed → tools node
      - if no tool needed → END
      ↓
    tools node
      ↓
    back to agent node
      ↓
    final answer
    """

    graph_builder = StateGraph(MessagesState)

    graph_builder.add_node("agent", call_model)

    graph_builder.add_node(
        "tools",
        ToolNode(
            STOCK_AGENT_TOOLS,
            handle_tool_errors=True
        )
    )

    graph_builder.add_edge(START, "agent")

    graph_builder.add_conditional_edges(
        "agent",
        tools_condition,
        {
            "tools": "tools",
            END: END,
        }
    )

    graph_builder.add_edge("tools", "agent")

    return graph_builder.compile()


def extract_tools_used(messages: List[Any]) -> List[str]:
    """
    Extracts tool names from ToolMessage objects.
    """
    tools_used = []

    for message in messages:
        if isinstance(message, ToolMessage):
            tool_name = getattr(message, "name", None)

            if tool_name and tool_name not in tools_used:
                tools_used.append(tool_name)

    return tools_used


def build_trace(messages: List[Any]) -> List[Dict[str, Any]]:
    """
    Creates a simple trace so we can see what happened inside the agent.

    This is useful for:
    - debugging
    - interview demo
    - showing which tool was called
    """
    trace = []

    for message in messages:
        if isinstance(message, HumanMessage):
            trace.append({
                "step_type": "user",
                "name": "user_question",
                "content_preview": message_preview(message.content)
            })

        elif isinstance(message, AIMessage):
            tool_calls = getattr(message, "tool_calls", [])

            if tool_calls:
                tool_names = [
                    tool_call.get("name", "unknown_tool")
                    for tool_call in tool_calls
                ]

                trace.append({
                    "step_type": "agent_tool_decision",
                    "name": ", ".join(tool_names),
                    "content_preview": "Agent decided to call tool(s)."
                })

            else:
                trace.append({
                    "step_type": "agent_answer",
                    "name": "final_answer",
                    "content_preview": message_preview(message.content)
                })

        elif isinstance(message, ToolMessage):
            trace.append({
                "step_type": "tool_result",
                "name": getattr(message, "name", "unknown_tool"),
                "content_preview": message_preview(message.content)
            })

    return trace


def get_final_answer(messages: List[Any]) -> str:
    """
    Finds the final AI response from the message list.
    """
    for message in reversed(messages):
        if isinstance(message, AIMessage):
            tool_calls = getattr(message, "tool_calls", [])

            if not tool_calls and message.content:
                return str(message.content)

    return "No final answer generated by the agent."


def run_market_agent(
    question: str,
    symbol: Optional[str] = None
) -> Dict[str, Any]:
    """
    Runs the full LangGraph agent.

    Steps:
    1. Prepare user message
    2. Invoke compiled LangGraph graph
    3. Extract final answer
    4. Extract tools used
    5. Extract trace
    """

    graph = build_market_agent_graph()

    if symbol:
        user_content = f"""
Stock symbol: {symbol}

User question:
{question}
"""
    else:
        user_content = question

    result = graph.invoke(
        {
            "messages": [
                HumanMessage(content=user_content)
            ]
        },
        config={
            "recursion_limit": 10
        }
    )

    messages = result["messages"]

    return {
        "symbol": symbol,
        "question": question,
        "answer": get_final_answer(messages),
        "tools_used": extract_tools_used(messages),
        "trace": build_trace(messages),
        "metadata": {
            "llm_model": settings.GROQ_MODEL,
            "agent_type": "langgraph_tool_calling_agent",
            "total_messages": len(messages),
        }
    }

def make_stream_event(event_type: str, payload: Dict[str, Any]) -> str:
    """
    Converts a Python dictionary into one NDJSON stream line.

    Example output:
    {"type":"token","content":"Hello"}\n

    Frontend will read each line one by one.
    """
    data = {
        "type": event_type,
        **payload,
    }

    return json.dumps(data, default=str) + "\n"


def chunk_text(text: str, chunk_size: int = 18) -> Generator[str, None, None]:
    """
    Splits final answer into small chunks.

    Why?
    If we send the whole answer at once, the frontend cannot show typing effect.
    So we send it piece by piece.

    This is a practical streaming UX layer.
    """
    words = text.split(" ")
    buffer = ""

    for word in words:
        next_part = word + " "

        if len(buffer) + len(next_part) >= chunk_size:
            yield buffer
            buffer = next_part
        else:
            buffer += next_part

    if buffer:
        yield buffer


def stream_market_agent_response(
    question: str,
    symbol: Optional[str] = None
) -> Generator[str, None, None]:
    """
    Streams the market agent response to the frontend.

    Flow:
    1. Send status event: agent started
    2. Run the existing LangGraph agent
    3. Send metadata/tools/trace event
    4. Stream final answer in small chunks
    5. Send done event

    This keeps the existing reliable LangGraph logic
    and adds a streaming layer for better UX.
    """

    try:
        yield make_stream_event(
            "status",
            {
                "message": "Agent started. Understanding your market question..."
            }
        )

        yield make_stream_event(
            "status",
            {
                "message": "Selecting the right financial tools..."
            }
        )

        result = run_market_agent(
            question=question,
            symbol=symbol
        )

        tools_used = result.get("tools_used", [])

        if tools_used:
            yield make_stream_event(
                "tools",
                {
                    "tools_used": tools_used,
                    "message": f"Agent used {len(tools_used)} tool(s)."
                }
            )
        else:
            yield make_stream_event(
                "tools",
                {
                    "tools_used": [],
                    "message": "Agent answered without external tools."
                }
            )

        yield make_stream_event(
            "status",
            {
                "message": "Preparing final market insight..."
            }
        )

        answer = result.get("answer", "")

        for chunk in chunk_text(answer):
            yield make_stream_event(
                "token",
                {
                    "content": chunk
                }
            )

            # Small delay makes streaming visible in local development.
            # Remove or reduce this in production if you want faster output.
            time.sleep(0.025)

        yield make_stream_event(
            "done",
            {
                "symbol": result.get("symbol"),
                "question": result.get("question"),
                "tools_used": result.get("tools_used", []),
                "trace": result.get("trace", []),
                "metadata": result.get("metadata", {}),
            }
        )

    except Exception as error:
        yield make_stream_event(
            "error",
            {
                "message": str(error)
            }
        )