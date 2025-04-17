
type Alpha =
    | 'Tools_Graphs'
    | 'Graphs_Tools'
    | 'Graphs_Clients'
    | 'Clients_Graphs'

type Beta =
    | 'Tools_ToolsPrivate'
    | 'ToolsPrivate_Tools'
    | 'Graphs_GraphsPrivate'
    | 'GraphsPrivate_Graphs'
    | 'Clients_ClientsPrivate'
    | 'ClientsPrivate_Clients'

type Gamma =
    | 'Tools_ResourcesLeft'
    | 'ResourcesLeft_Tools'
    | 'Graphs_Resources'
    | 'Resources_Graphs'
    | 'Clients_ResourcesRight'
    | 'ResourcesRight_Clients'


type Edge = Alpha | Beta | Gamma;

type Resource = 'employment' | 'anchor' | 'candidate' | 'target' | 'result';

type ResourceTuple<T extends Resource[]> = T;

type ChannelInternal = ResourceTuple<['employment']>;

type ChannelDocking =
    | ResourceTuple<['anchor', 'target']>
    | ResourceTuple<['candidate', 'target']>
    | ResourceTuple<['candidate']>
    | ResourceTuple<['result']>;

type Channel = ChannelInternal | ChannelDocking;

type GammaChannelsSpec = Record<Gamma, Channel[]>;
const gammaChannelsSpec = {
    'Tools_ResourcesLeft': [['result']],
    'ResourcesLeft_Tools': [['candidate', 'target']],
    'Graphs_Resources': [['candidate']],
    'Resources_Graphs': [],
    'Clients_ResourcesRight': [['employment'], ['anchor', 'target']],
    'ResourcesRight_Clients': [],
} satisfies GammaChannelsSpec;


type GammaChannels<T extends Gamma> = typeof gammaChannelsSpec[T][number];

const channelsOne: GammaChannels<'Tools_ResourcesLeft'> = ['result'];
// @ts-expect-error: ['candidate', 'target'] is not assignable a valid channel for 'Tools_ResourcesLeft'
const channelsTwo: GammaChannels<'Tools_ResourcesLeft'> = ['candidate', 'target'];


type GammaChannel<T extends Gamma> = {
    gamma: T;
    channel: GammaChannels<T>;
};


const gammaChannelsForNode: (
    | GammaChannel<'Tools_ResourcesLeft'>
    | GammaChannel<'ResourcesLeft_Tools'>
    | GammaChannel<'Graphs_Resources'>
    | GammaChannel<'Resources_Graphs'>
    | GammaChannel<'Clients_ResourcesRight'>
    | GammaChannel<'ResourcesRight_Clients'>
)[] = [
        {
            gamma: 'Tools_ResourcesLeft',
            channel: ['result'],
        },
        {
            gamma: 'ResourcesLeft_Tools',
            channel: ['candidate', 'target'],
        },
        {
            gamma: 'Clients_ResourcesRight',
            channel: ['anchor', 'target'],
        },
        {
            gamma: 'Clients_ResourcesRight',
            channel: ['employment'],
        },
        // @ts-expect-error: 'employment' is not a valid channel for 'ResourcesLeft_Tools'
        {
            gamma: 'ResourcesLeft_Tools',
            channel: ['employment'],
        },
    ];






type FileFormatType = 'json' | 'smi' | 'cif' | 'mae';

type Resource_Format = Record<Resource, FileFormatType[]>;

const resource_format: Resource_Format = {
    employment: ['json'],
    anchor: ['smi', 'mae'],
    candidate: ['smi', 'mae'],
    target: ['cif', 'mae'],
    result: ['mae'],
}