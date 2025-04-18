
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
    | 'Tools_Resources'
    | 'Resources_Tools'
    | 'Graphs_Resources'
    | 'Resources_Graphs'
    | 'Clients_Resources'
    | 'Resources_Clients'


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

type AlphaChannelsSpec = Record<Alpha, Channel[]>;
const alphaChannelsSpec = {
    'Tools_Graphs': [['candidate']],
    'Graphs_Tools': [['anchor', 'target']],
    'Graphs_Clients': [],
    'Clients_Graphs': [],
} satisfies AlphaChannelsSpec;

type BetaChannelsSpec = Record<Beta, Channel[]>;
const betaChannelsSpec = {
    'Tools_ToolsPrivate': [],
    'ToolsPrivate_Tools': [],
    'Graphs_GraphsPrivate': [['anchor', 'target'], ['candidate']],
    'GraphsPrivate_Graphs': [['anchor', 'target']],
    'Clients_ClientsPrivate': [],
    'ClientsPrivate_Clients': [],
} satisfies BetaChannelsSpec;

type GammaChannelsSpec = Record<Gamma, Channel[]>;
const gammaChannelsSpec = {
    'Tools_Resources': [['result']],
    'Resources_Tools': [['candidate', 'target']],
    'Graphs_Resources': [['candidate']],
    'Resources_Graphs': [['anchor', 'target']],
    'Clients_Resources': [['employment'], ['anchor', 'target']],
    'Resources_Clients': [],
} satisfies GammaChannelsSpec;


type ValidChannelsForAlpha<T extends Alpha> = typeof alphaChannelsSpec[T][number];

type ValidChannelsForBeta<T extends Beta> = typeof betaChannelsSpec[T][number];

type ValidChannelsForGamma<T extends Gamma> = typeof gammaChannelsSpec[T][number];

const testOne: ValidChannelsForGamma<'Tools_Resources'> = ['result'];
// @ts-expect-error: ['candidate', 'target'] is not a valid channel for 'Tools_Resources'
const testTwo: ValidChannelsForGamma<'Tools_Resources'> = ['candidate', 'target'];


type AlphaChannel<T extends Alpha> = {
    alpha: T;
    channel: ValidChannelsForAlpha<T>;
};

type BetaChannel<T extends Beta> = {
    beta: T;
    channel: ValidChannelsForBeta<T>;
};

type GammaChannel<T extends Gamma> = {
    gamma: T;
    channel: ValidChannelsForGamma<T>;
};


// nodeLoadInputs
const channelsForNodeOne: (
    | GammaChannel<'Resources_Graphs'>
    | BetaChannel<'Graphs_GraphsPrivate'>
)[] = [
        {
            gamma: 'Resources_Graphs',
            channel: ['anchor', 'target'],
        },
        {
            beta: 'Graphs_GraphsPrivate',
            channel: ['anchor', 'target'],
        },
    ];


// nodeGenerateCandidate
const channelsForNodeTwo: (
    | BetaChannel<'GraphsPrivate_Graphs'>
    | AlphaChannel<'Graphs_Tools'>
    | AlphaChannel<'Tools_Graphs'>
    | BetaChannel<'Graphs_GraphsPrivate'>
    | GammaChannel<'Graphs_Resources'>
)[] = [
        {
            beta: 'GraphsPrivate_Graphs',
            channel: ['anchor', 'target'],
        },
        {
            alpha: 'Graphs_Tools',
            channel: ['anchor', 'target'], // Sent to the AI-model
        },
        {
            alpha: 'Tools_Graphs',
            channel: ['candidate'], // Returned from the AI-model
        },
        {
            beta: 'Graphs_GraphsPrivate',
            channel: ['candidate'],
        },
        {
            gamma: 'Graphs_Resources',

            channel: ['candidate'],
        },
    ];


// LangGraph nodes as pulse orhestrators



type FileFormatType = 'json' | 'smi' | 'cif' | 'mae';

type Resource_Format = Record<Resource, FileFormatType[]>;

const resource_format: Resource_Format = {
    employment: ['json'],
    anchor: ['smi', 'mae'],
    candidate: ['smi', 'mae'],
    target: ['cif', 'mae'],
    result: ['mae'],
}