# Plugin approach analysis and improved direction

## Current approach (before refactor)

The plugin loading flow in `src/config/config.js` did everything in one function:

- resolve plugin paths
- require plugin modules
- instantiate plugins
- enforce inheritance checks
- execute plugin lifecycle methods
- map plugin output into page objects
- handle runtime errors

This worked, but it mixed responsibilities and made future work harder.

## Main issues

1. **Low cohesion**: configuration parsing and plugin orchestration were coupled.
2. **Harder testing**: one large function with multiple side effects was difficult to validate in isolation.
3. **Error handling scattered**: plugin failures were mixed with mapping logic, making diagnostics less clear.
4. **No output contract guardrails**: plugin config shape validation was minimal.

## Better solution

A dedicated `PluginManager` was introduced to centralize plugin orchestration.

### What changed

- Added `src/models/plugin-manager.js`.
- Kept `src/config/config.js` as an orchestrator that delegates to `PluginManager`.
- Added explicit plugin configuration validation (`id`, `title`, `target`).
- Added predictable defaults for plugin page metadata (`type`, `icon`).
- Removed debug logging from config build path.

## Why this is better

1. **Single responsibility**: config bootstrapping and plugin runtime are separated.
2. **Maintainability**: new plugin lifecycle features can be added in one place.
3. **Safer runtime**: invalid plugin outputs fail fast with clearer messages.
4. **Extensibility path**: future features like hook phases (`beforeBuild`, `afterPageWrite`), metrics, and plugin capability declarations can be added without bloating config code.

## Recommended next step

If the plugin system needs to scale, evolve `PluginManager` into a hook-based architecture:

- `register()` phase for declaring capabilities and dependencies.
- lifecycle hooks (`onConfig`, `onProjectTree`, `onPageRender`, `onBuildComplete`).
- deterministic ordering with explicit `before/after` constraints.
- structured diagnostics (warnings/errors per plugin) surfaced in build reports.

This keeps backward compatibility with existing plugins while enabling more advanced integrations.
