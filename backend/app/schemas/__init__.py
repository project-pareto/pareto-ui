"""Payload contracts shared with electron/ui/src/types.

These models describe existing JSON, independently of the mutable dictionaries
used by persistence. The table_save models are adopted by /update_excel; other
routes still require an explicit compatibility migration before using these
models for runtime validation/serialization.
"""
