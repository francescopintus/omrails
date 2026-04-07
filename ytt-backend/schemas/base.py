import uuid
from pydantic import BaseModel, model_validator
from typing import Any

class BaseOut(BaseModel):
    @model_validator(mode='before')
    @classmethod
    def convert_uuids(cls, data: Any) -> Any:
        if hasattr(data, '__dict__'):
            result = {}
            for key, value in data.__dict__.items():
                if key.startswith('_'):
                    continue
                if isinstance(value, uuid.UUID):
                    result[key] = str(value)
                else:
                    result[key] = value
            return result
        if isinstance(data, dict):
            return {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in data.items()}
        return data

    class Config:
        from_attributes = True
