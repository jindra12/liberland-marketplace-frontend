# Upstream discovery schemas

These fixtures validate generated discovery documents against upstream schemas,
not a locally invented approximation. They are test-only and not fetched at runtime.

- `mcp-server-card.schema.json`: `modelcontextprotocol/ext-server-card`, revision
  `526201bbc80231daa40ffcdecfc9da4e54e5dc93`. The document contains definitions;
  validation targets `#/$defs/ServerCard`, not its unconstrained root.
- `ai-catalog.schema.json`: `ards-project/ard-spec`, revision
  `f073b1ea9b01a5f068d0b0986426f2ea49fa30b2`, catalog schema version 1.0.

MCP server cards and ARD/AI catalogs are evolving proposals. Review upstream
changes before updating fixtures. OpenAPI is validated separately with
`@apidevtools/swagger-parser`; A2A uses the official SDK's typed models.
