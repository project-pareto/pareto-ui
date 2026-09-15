"""Preserve imported fields and scalar representations when checking contracts."""
from pydantic import BaseModel, ConfigDict


class PayloadModel(BaseModel):
    # Vendor metadata and older scenario fields must survive a round trip. Strict
    # types keep strings such as "0" and "false" from becoming numbers/booleans.
    model_config = ConfigDict(extra='allow', strict=True)

    def to_payload(self) -> dict:
        """Return JSON fields that were supplied, including explicit nulls and blanks."""
        return self.model_dump(mode='json', by_alias=True, exclude_unset=True)
