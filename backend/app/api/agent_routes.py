from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.agent_schema import AgentChatRequest, AgentChatResponse
from app.services.agent_service import (
    run_market_agent,
    stream_market_agent_response,
)


router = APIRouter(prefix="/api/agent", tags=["Market Agent"])


@router.post("/chat", response_model=AgentChatResponse)
def chat_with_market_agent(request: AgentChatRequest):
    try:
        return run_market_agent(
            symbol=request.symbol,
            question=request.question
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error while running market agent: {str(error)}"
        )


@router.post("/chat/stream")
def stream_chat_with_market_agent(request: AgentChatRequest):
    """
    Streaming endpoint for better frontend UX.

    Returns NDJSON:
    {"type":"status","message":"..."}
    {"type":"token","content":"..."}
    {"type":"done","trace":[]}
    """
    return StreamingResponse(
        stream_market_agent_response(
            symbol=request.symbol,
            question=request.question
        ),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )