from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AgentChatRequest(BaseModel):
    symbol: Optional[str] = Field(
        default=None,
        description="Stock ticker symbol. Examples: AAPL, TSLA, RELIANCE.NS"
    )
    question: str = Field(
        description="User's stock market question"
    )


class AgentTraceStep(BaseModel):
    step_type: str
    name: Optional[str] = None
    content_preview: Optional[str] = None


class AgentChatResponse(BaseModel):
    symbol: Optional[str]
    question: str
    answer: str
    tools_used: List[str]
    trace: List[AgentTraceStep]
    metadata: Dict[str, Any]