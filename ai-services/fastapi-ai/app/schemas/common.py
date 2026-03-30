from pydantic import BaseModel, Field


class Meta(BaseModel):
    model_name: str = Field(default="mock-model")
    version: str = Field(default="0.1")
