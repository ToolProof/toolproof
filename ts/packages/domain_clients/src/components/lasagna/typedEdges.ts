import { CodeCodeNameType, CodePrivateNameType, CodeSharedNameType } from './classes';

type ResourceNameType = 'employment' | 'anchor' | 'candidate' | 'target' | 'result';

type FileFormatType = 'smi' | 'cif' | 'mae';

type ResourceFormatRecord = Record<ResourceNameType, FileFormatType[]>;

const resorceFormatRecord: ResourceFormatRecord = {
    employment: ['json'],
    anchor: ['smi', 'mae'],
    candidate: ['smi', 'mae'],
    target: ['cif', 'mae'],
    result: ['mae'],
}

type Test = Record<CodeSharedNameType, ResourceNameType[][]>;
const foo: Test = {
    'Tools_ResourcesLeft': [['result']],
    'ResourcesLeft_Tools': [],
    'Graphs_Resources': [['candidate']],
    'Resources_Graphs': [],
    'Clients_ResourcesRight': [['employment'], ['anchor', 'target']],
    'ResourcesRight_Clients': [],
}

const bar: Record<CodePrivateNameType, ResourceNameType[]> = {
    'Tools_ToolsPrivate': [],
    'ToolsPrivate_Tools': [],
    'Graphs_GraphsPrivate': ['candidate'],
    'GraphsPrivate_Graphs': [],
    'Clients_ClientsPrivate': [],
    'ClientsPrivate_Clients': [],
}

const baz: Record<CodeCodeNameType, ResourceNameType[]> = {
    'Tools_Graphs': [],
    'Graphs_Tools': [],
    'Graphs_Clients': [],
    'Clients_Graphs': [],
}