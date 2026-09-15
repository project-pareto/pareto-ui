"""Map payloads; mirrored by electron/ui/src/types/map.ts.

Coordinates use longitude/latitude order. KML retains string coordinates and
altitude; JSON from shapefiles may contain numbers. Neither representation is
normalized here, and arbitrary source attributes remain attached to each record.
"""
from pydantic import Field

from .base import PayloadModel

CoordinateValue = int | float | str
MapCoordinates = list[CoordinateValue]


class MapFacilityFields(PayloadModel):
    """Facility form values mirrored by MapFacilityFields in TypeScript."""
    TreatmentTechnology: str | None = None
    Capacity: CoordinateValue | None = None
    PadWaterQuality: CoordinateValue | None = None
    PadStorageInitialWaterQuality: CoordinateValue | None = None
    StorageInitialWaterQuality: CoordinateValue | None = None
    ExternalWaterQuality: CoordinateValue | None = None
    InitialDisposalCapacity: CoordinateValue | None = None
    InitialStorageCapacity: CoordinateValue | None = None
    CompletionsPadStorage: CoordinateValue | None = None
    PadOffloadingCapacity: CoordinateValue | None = None
    NodeCapacities: CoordinateValue | None = None
    DisposalOperationalCost: CoordinateValue | None = None
    ReuseOperationalCost: CoordinateValue | None = None
    ExternalSourcingCost: CoordinateValue | None = None
    TruckingHourlyCost: CoordinateValue | None = None
    DesalinationSites: CoordinateValue | None = None
    BeneficialReuseCost: CoordinateValue | None = None
    BeneficialReuseCredit: CoordinateValue | None = None
    CompletionsPadOutsideSystem: CoordinateValue | None = None
    Elevation: CoordinateValue | None = None
    SWDDeep: CoordinateValue | None = None
    SWDAveragePressure: CoordinateValue | None = None
    SWDProxPAWell: CoordinateValue | None = None
    SWDProxInactiveWell: CoordinateValue | None = None
    SWDProxEQ: CoordinateValue | None = None
    SWDProxFault: CoordinateValue | None = None
    SWDProxHpOrLpWell: CoordinateValue | None = None


class MapNode(MapFacilityFields):
    node_type: str
    name: str | None = None
    nodeType: str | None = None
    coordinates: MapCoordinates | None = None
    longitude: CoordinateValue | None = None
    latitude: CoordinateValue | None = None
    altitude: CoordinateValue | None = None


class ArcNodeRef(PayloadModel):
    name: str
    incoming: bool | None = None
    outgoing: bool | None = None
    coordinates: MapCoordinates | None = None
    incoming_nodes: list[str] | None = None
    outgoing_nodes: list[str] | None = None
    # Geometry between this node and the next; flow comes from outgoing_nodes.
    segment_coordinates: list[MapCoordinates] | None = None


class MapArc(PayloadModel):
    name: str | None = None
    node_type: str | None = None
    coordinates: list[MapCoordinates] | None = None
    nodes: list[ArcNodeRef] | None = None
    lengths: list[int | float] | None = None
    # Older map editors persisted the aggregate length as text.
    length: CoordinateValue | None = None
    diameter: CoordinateValue | None = None


class ConnectionMetadata(PayloadModel):
    pipeline_capacity: CoordinateValue | None = None
    pipeline_length: CoordinateValue | None = None
    pipeline_diameter: CoordinateValue | None = None


class MapConnections(PayloadModel):
    all_connections: dict[str, list[str]] = Field(default_factory=dict)
    connection_metadata: dict[str, ConnectionMetadata] | None = None


class MapData(PayloadModel):
    all_nodes: dict[str, MapNode] = Field(default_factory=dict)
    arcs: dict[str, MapArc] = Field(default_factory=dict)
    connections: MapConnections = Field(default_factory=MapConnections)
    ProductionPads: dict[str, MapNode] = Field(default_factory=dict)
    CompletionsPads: dict[str, MapNode] = Field(default_factory=dict)
    NetworkNodes: dict[str, MapNode] = Field(default_factory=dict)
    SWDSites: dict[str, MapNode] = Field(default_factory=dict)
    TreatmentSites: dict[str, MapNode] = Field(default_factory=dict)
    StorageSites: dict[str, MapNode] = Field(default_factory=dict)
    ExternalWaterSources: dict[str, MapNode] = Field(default_factory=dict)
    ReuseOptions: dict[str, MapNode] = Field(default_factory=dict)
    other_nodes: dict[str, MapNode] = Field(default_factory=dict)
    # Map form keys use decision_period; workbook units use "decision period".
    units: dict[str, str] | None = None
    defaultNode: str | None = None
    time_periods: list[str] | None = None
    node_renames: dict[str, str] | None = Field(default=None, alias='_node_renames')
