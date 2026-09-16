"""Payload contracts shared with electron/ui/src/types.

These models describe existing JSON, independently of the mutable dictionaries
used by routes and persistence. They are not FastAPI response models: opting into
runtime validation/serialization requires a separate compatibility migration.
"""
