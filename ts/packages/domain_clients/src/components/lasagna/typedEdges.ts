
type LogicAndLogic =
    | 'Tools_Graphs'
    | 'Graphs_Tools'
    | 'Graphs_Clients'
    | 'Clients_Graphs'

type LogicAndPrivate =
    | 'Tools_ToolsPrivate'
    | 'ToolsPrivate_Tools'
    | 'Graphs_GraphsPrivate'
    | 'GraphsPrivate_Graphs'
    | 'Clients_ClientsPrivate'
    | 'ClientsPrivate_Clients'

type LogicAndShared =
    | 'Tools_ResourcesLeft'
    | 'ResourcesLeft_Tools'
    | 'Graphs_Resources'
    | 'Resources_Graphs'
    | 'Clients_ResourcesRight'
    | 'ResourcesRight_Clients'


type Edge = LogicAndLogic | LogicAndPrivate | LogicAndShared;

type Resource = 'employment' | 'anchor' | 'candidate' | 'target' | 'result';

type ResourceTuple<T extends Resource[]> = T;

type ChannelInternal = ResourceTuple<['employment']>;

type ChannelDocking =
    | ResourceTuple<['anchor', 'target']>
    | ResourceTuple<['candidate', 'target']>
    | ResourceTuple<['candidate']>
    | ResourceTuple<['result']>;

type Channel = ChannelInternal | ChannelDocking;

type LogicAndShared_Channel = Record<LogicAndShared, Channel[]>;
const logicAndShare_channel: LogicAndShared_Channel = {
    'Tools_ResourcesLeft': [['result']],
    'ResourcesLeft_Tools': [['candidate', 'target']],
    'Graphs_Resources': [['candidate']],
    'Resources_Graphs': [],
    'Clients_ResourcesRight': [['employment'], ['anchor', 'target']],
    'ResourcesRight_Clients': [],
}


type FileFormatType = 'json' | 'smi' | 'cif' | 'mae';

type Resource_Format = Record<Resource, FileFormatType[]>;

const resource_format: Resource_Format = {
    employment: ['json'],
    anchor: ['smi', 'mae'],
    candidate: ['smi', 'mae'],
    target: ['cif', 'mae'],
    result: ['mae'],
}