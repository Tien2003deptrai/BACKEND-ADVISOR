from pydantic import BaseModel, ConfigDict, Field


class Meta(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_name: str = Field(default="mock-model")
    version: str = Field(default="0.1")
