---
title: '@bangle.dev/collab-client'
sidebar_label: '(wip) @bangle.dev/collab-client'
packageName: '@bangle.dev/collab-client'
id: 'collab_client'
---

Docs coming soon

### Installation

```
{{npmInstallation "@bangle.dev/collab-client"}}
```


### State chart


```mermaid
stateDiagram-v2
    [*] --> InitState
    [*] --> InitState: HardResetEvent
    InitState --> InitDocState: InitDocEvent
    InitState --> InitErrorState: InitErrorEvent
    InitDocState --> ReadyState: ReadyEvent
    InitDocState --> FatalState: FatalEvent
    InitErrorState --> InitState: RestartEvent
    InitErrorState --> FatalState: FatalEvent
    ReadyState --> PushState: PushEvent
    ReadyState --> PullState: PullEvent
    PushState --> ReadyState: ReadyEvent
    PushState --> PullState: PullEvent
    PushState --> PushPullErrorState: PushPullErrorEvent
    PullState --> ReadyState: ReadyEvent
    PullState --> PushPullErrorState: PushPullErrorEvent
    PushPullErrorState --> InitState: RestartEvent
    PushPullErrorState --> PullState: PullEvent
    PushPullErrorState --> FatalState: FatalEvent
    FatalState --> [*]
```