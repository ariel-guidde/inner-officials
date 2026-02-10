import { ELEMENT, TierDefinition } from '../types/game';

export interface JudgeTheme {
    backgrounds: string[];   // CSS class names for bg styles
    musicTracks: string[];   // Audio file paths
}

export interface JudgeTemplate {
    name: string;
    patienceThreshold: number;
    judgeActions: JudgeAction[];
    tierStructure: TierDefinition[];
    theme: JudgeTheme;
}

export interface JudgeAction {
    name: string;
    description: string;
    patienceThreshold: number; // Patience spent until this effect triggers
    apply: (effects: import('../types/game').JudgeEffects) => import('../types/game').JudgeEffects;
}

export const JUDGES: JudgeTemplate[] = [
    {
        name: "The Emperor",
        patienceThreshold: 50,
        theme: {
            backgrounds: ['bg-emperor-1', 'bg-emperor-2'],
            musicTracks: ['/audio/combat-music-1.mp3', '/audio/boss-music-1.mp3'],
        },
        tierStructure: [
            { tierNumber: 0, favorRequired: 25, tierName: "Skeptical" },
            { tierNumber: 1, favorRequired: 30, tierName: "Listening" },
            { tierNumber: 2, favorRequired: 35, tierName: "Interested" },
            { tierNumber: 3, favorRequired: 40, tierName: "Convinced" },
        ],
        judgeActions: [
            {
                name: "Growing Impatience",
                description: "End turn costs +1 patience",
                patienceThreshold: 6,
                apply: (effects) => ({ ...effects, endTurnPatienceCost: effects.endTurnPatienceCost + 1 }),
            },
            {
                name: "Imperial Demands",
                description: "End turn costs +1 patience",
                patienceThreshold: 7,
                apply: (effects) => ({ ...effects, endTurnPatienceCost: effects.endTurnPatienceCost + 1 }),
            },
            {
                name: "Royal Displeasure",
                description: "End turn costs +2 patience",
                patienceThreshold: 10,
                apply: (effects) => ({ ...effects, endTurnPatienceCost: effects.endTurnPatienceCost + 2 }),
            },
            {
                name: "Exhausting Ceremony",
                description: "End turn costs +1 patience",
                patienceThreshold: 5,
                apply: (effects) => ({ ...effects, endTurnPatienceCost: effects.endTurnPatienceCost + 1 }),
            },
            {
                name: "Demanding Protocol",
                description: "All cards cost +1 patience",
                patienceThreshold: 9,
                apply: (effects) => ({
                    ...effects,
                    elementCostModifier: {
                        ...effects.elementCostModifier,
                        [ELEMENT.WOOD]: (effects.elementCostModifier[ELEMENT.WOOD] ?? 0) + 1,
                        [ELEMENT.FIRE]: (effects.elementCostModifier[ELEMENT.FIRE] ?? 0) + 1,
                        [ELEMENT.EARTH]: (effects.elementCostModifier[ELEMENT.EARTH] ?? 0) + 1,
                        [ELEMENT.METAL]: (effects.elementCostModifier[ELEMENT.METAL] ?? 0) + 1,
                        [ELEMENT.WATER]: (effects.elementCostModifier[ELEMENT.WATER] ?? 0) + 1,
                    }
                }),
            },
        ],
    },
    {
        name: "The Scholar",
        patienceThreshold: 50,
        theme: {
            backgrounds: ['bg-scholar-1', 'bg-scholar-2'],
            musicTracks: ['/audio/combat-music-2.mp3', '/audio/combat-music-1.mp3'],
        },
        tierStructure: [
            { tierNumber: 0, favorRequired: 20, tierName: "Dubious" },
            { tierNumber: 1, favorRequired: 25, tierName: "Curious" },
            { tierNumber: 2, favorRequired: 30, tierName: "Intrigued" },
            { tierNumber: 3, favorRequired: 35, tierName: "Impressed" },
            { tierNumber: 4, favorRequired: 40, tierName: "Persuaded" },
        ],
        judgeActions: [
            {
                name: "Element Tax: Fire",
                description: "Fire cards cost +2 patience",
                patienceThreshold: 5,
                apply: (effects) => ({
                    ...effects,
                    elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.FIRE]: (effects.elementCostModifier[ELEMENT.FIRE] ?? 0) + 2 }
                }),
            },
            {
                name: "Element Tax: Water",
                description: "Water cards cost +2 patience",
                patienceThreshold: 5,
                apply: (effects) => ({
                    ...effects,
                    elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.WATER]: (effects.elementCostModifier[ELEMENT.WATER] ?? 0) + 2 }
                }),
            },
            {
                name: "Element Tax: Wood",
                description: "Wood cards cost +2 patience",
                patienceThreshold: 6,
                apply: (effects) => ({
                    ...effects,
                    elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.WOOD]: (effects.elementCostModifier[ELEMENT.WOOD] ?? 0) + 2 }
                }),
            },
            {
                name: "Element Tax: Earth",
                description: "Earth cards cost +2 patience",
                patienceThreshold: 6,
                apply: (effects) => ({
                    ...effects,
                    elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.EARTH]: (effects.elementCostModifier[ELEMENT.EARTH] ?? 0) + 2 }
                }),
            },
            {
                name: "Element Tax: Metal",
                description: "Metal cards cost +2 patience",
                patienceThreshold: 7,
                apply: (effects) => ({
                    ...effects,
                    elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.METAL]: (effects.elementCostModifier[ELEMENT.METAL] ?? 0) + 2 }
                }),
            },
        ],
    },
    {
        name: "The Merchant",
        patienceThreshold: 50,
        theme: {
            backgrounds: ['bg-merchant-1', 'bg-merchant-2'],
            musicTracks: ['/audio/combat-music-1.mp3', '/audio/combat-music-2.mp3'],
        },
        tierStructure: [
            { tierNumber: 0, favorRequired: 30, tierName: "Unimpressed" },
            { tierNumber: 1, favorRequired: 35, tierName: "Considering" },
            { tierNumber: 2, favorRequired: 40, tierName: "Invested" },
        ],
        judgeActions: [
            {
                name: "Favor the Bold",
                description: "Favor gains increased by 50%",
                patienceThreshold: 5,
                apply: (effects) => ({ ...effects, favorGainModifier: effects.favorGainModifier * 1.5 }),
            },
            {
                name: "Generous Patronage",
                description: "Favor gains increased by 75%",
                patienceThreshold: 7,
                apply: (effects) => ({ ...effects, favorGainModifier: effects.favorGainModifier * 1.75 }),
            },
            {
                name: "Favor Market",
                description: "Favor gains increased by 25%",
                patienceThreshold: 4,
                apply: (effects) => ({ ...effects, favorGainModifier: effects.favorGainModifier * 1.25 }),
            },
            {
                name: "Economic Advantage",
                description: "Favor gains increased by 100%",
                patienceThreshold: 10,
                apply: (effects) => ({ ...effects, favorGainModifier: effects.favorGainModifier * 2.0 }),
            },
            {
                name: "Trade Disruption",
                description: "Favor gains decreased by 25%",
                patienceThreshold: 6,
                apply: (effects) => ({ ...effects, favorGainModifier: effects.favorGainModifier * 0.75 }),
            },
        ],
    },
    {
        name: "The Warlord",
        patienceThreshold: 50,
        theme: {
            backgrounds: ['bg-warlord-1', 'bg-warlord-2'],
            musicTracks: ['/audio/boss-music-1.mp3', '/audio/combat-music-2.mp3'],
        },
        tierStructure: [
            { tierNumber: 0, favorRequired: 35, tierName: "Dismissive" },
            { tierNumber: 1, favorRequired: 45, tierName: "Attentive" },
            { tierNumber: 2, favorRequired: 55, tierName: "Respected" },
        ],
        judgeActions: [
            {
                name: "Harsh Judgment",
                description: "All damage increased by 50%",
                patienceThreshold: 7,
                apply: (effects) => ({ ...effects, damageModifier: effects.damageModifier * 1.5 }),
            },
            {
                name: "Brutal Verdict",
                description: "All damage increased by 75%",
                patienceThreshold: 9,
                apply: (effects) => ({ ...effects, damageModifier: effects.damageModifier * 1.75 }),
            },
            {
                name: "Merciless Punishment",
                description: "All damage increased by 100%",
                patienceThreshold: 11,
                apply: (effects) => ({ ...effects, damageModifier: effects.damageModifier * 2.0 }),
            },
            {
                name: "Combat Focus",
                description: "All damage increased by 25%",
                patienceThreshold: 6,
                apply: (effects) => ({ ...effects, damageModifier: effects.damageModifier * 1.25 }),
            },
            {
                name: "Warrior's Code",
                description: "All damage increased by 30%",
                patienceThreshold: 5,
                apply: (effects) => ({ ...effects, damageModifier: effects.damageModifier * 1.3 }),
            },
        ],
    },
]

export const JUDGE_ACTIONS: JudgeAction[] = [
    {
        name: "Growing Impatience",
        description: "End turn costs +1 patience",
        patienceThreshold: 6,
        apply: (effects) => ({ ...effects, endTurnPatienceCost: effects.endTurnPatienceCost + 1 }),
    },
    {
        name: "Favor the Bold",
        description: "Favor gains increased by 50%",
        patienceThreshold: 5,
        apply: (effects) => ({ ...effects, favorGainModifier: effects.favorGainModifier * 1.5 }),
    },
    {
        name: "Harsh Judgment",
        description: "All damage increased by 50%",
        patienceThreshold: 7,
        apply: (effects) => ({ ...effects, damageModifier: effects.damageModifier * 1.5 }),
    },
    {
        name: "Element Tax: Fire",
        description: "Fire cards cost +2 patience",
        patienceThreshold: 5,
        apply: (effects) => ({
            ...effects,
            elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.FIRE]: (effects.elementCostModifier[ELEMENT.FIRE] ?? 0) + 2 }
        }),
    },
    {
        name: "Element Tax: Water",
        description: "Water cards cost +2 patience",
        patienceThreshold: 5,
        apply: (effects) => ({
            ...effects,
            elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.WATER]: (effects.elementCostModifier[ELEMENT.WATER] ?? 0) + 2 }
        }),
    },
];
